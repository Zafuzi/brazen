import type { PlayerInventoryEntry } from "../actors/player";

export type SavedAsteroid = {
	ore: string;
	amount: number;
	startAmount: number;
	pos: { x: number; y: number };
	vel: { x: number; y: number };
	angularVelocity: number;
	variation: number;
};

const defaults = {
	options: {
		volume: 50,
	},
	player: {
		fuel: 100,
		pos: {
			x: 0,
			y: 0,
		},
		vel: {
			x: 0,
			y: 0,
		},
		angularVelocity: 0,
		inventory: [] as PlayerInventoryEntry[],
	},
	asteroids: [] as SavedAsteroid[],
	stations: [] as any[],
};

type Defaults = typeof defaults;
type SaveKey = keyof Defaults;
export type SaveEntry = {
	key: string;
	value: unknown;
};

const DB_NAME = "brazen";
const DB_VERSION = 1;
const STORE_NAME = "state";

export class SaveSystem {
	private static dbPromise: Promise<IDBDatabase> | null = null;

	static defaultState<K extends SaveKey>(key: K): Defaults[K] {
		return defaults[key];
	}

	static async getState<K extends SaveKey>(key: K): Promise<Defaults[K]> {
		try {
			const db = await this.getDb();
			const transaction = db.transaction(STORE_NAME, "readonly");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(key) as IDBRequest<Defaults[K] | undefined>;
			const savedData = await this.requestToPromise(request);

			return savedData ?? defaults[key];
		} catch (e) {
			console.error("Failed to load data for:", key, e);
			return defaults[key];
		}
	}

	static async setState<K extends SaveKey>(key: K, data: Defaults[K]): Promise<void> {
		try {
			const db = await this.getDb();
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);
			// Vue refs/reactive values can be proxies and are not cloneable by IDB.
			const serializableData = JSON.parse(JSON.stringify(data)) as Defaults[K];
			const request = store.put(serializableData, key);

			await this.requestToPromise(request);
			await this.waitForTransaction(transaction);
		} catch (e) {
			console.log("Failed to save data for:", key, e);
		}
	}

	static async getAllState(): Promise<SaveEntry[]> {
		try {
			const db = await this.getDb();
			const transaction = db.transaction(STORE_NAME, "readonly");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.openCursor();

			const entries = await new Promise<SaveEntry[]>((resolve, reject) => {
				const rows: SaveEntry[] = [];

				request.onsuccess = () => {
					const cursor = request.result;
					if (!cursor) {
						resolve(rows);
						return;
					}

					rows.push({
						key: String(cursor.key),
						value: cursor.value,
					});
					cursor.continue();
				};

				request.onerror = () => reject(request.error ?? new Error("IndexedDB cursor request failed"));
			});

			await this.waitForTransaction(transaction);
			return entries;
		} catch (e) {
			console.error("Failed to load all state:", e);
			return [];
		}
	}

	private static getDb(): Promise<IDBDatabase> {
		if (this.dbPromise) {
			return this.dbPromise;
		}

		this.dbPromise = new Promise((resolve, reject) => {
			const request = window.indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
		});

		return this.dbPromise;
	}

	private static requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
		});
	}

	private static waitForTransaction(transaction: IDBTransaction): Promise<void> {
		return new Promise((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
			transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
		});
	}
}
