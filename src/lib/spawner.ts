import { Actor, Engine, Scene, Vector, vec, type ActorArgs } from "excalibur";

type SpawnerConfig = {
	interval: number;
	max: number;
	radiusInner: number;
	radiusOuter: number;
	instance: Actor;
	target: Actor;
	placementAttempts: number;
};

export type SpawnerOptions = ActorArgs &
	Partial<{
		interval: number;
		max: number;
		radiusInner: number;
		radiusOuter: number;
		instance: Actor;
		target: Actor;
		placementAttempts: number;
	}>;

export class Spawner extends Actor {
	protected readonly spawns: Set<Actor> = new Set();
	protected config: SpawnerConfig;

	private spawnLoop: ReturnType<typeof setInterval> | undefined;
	private spawnKillHandlers: Map<Actor, () => void> = new Map();
	private isCleaningUp = false;

	constructor(options?: SpawnerOptions) {
		const {
			interval = 1_000,
			max = 1,
			radiusInner = 0,
			radiusOuter = 1,
			instance = new Actor(),
			target = new Actor(),
			placementAttempts = 32,
			...actorArgs
		} = options ?? {};

		super(actorArgs);

		this.config = {
			interval: Math.max(1, interval),
			max: Math.max(0, max),
			radiusInner,
			radiusOuter,
			instance,
			target,
			placementAttempts: Math.max(1, placementAttempts),
		};
	}

	override onInitialize(engine: Engine): void {
		super.onInitialize(engine);
		this.startSpawnLoop();
	}

	override onPreKill(scene: Scene): void {
		super.onPreKill(scene);
		this.cleanup();
	}

	override onRemove(engine: Engine): void {
		super.onRemove(engine);
		this.cleanup();
	}

	protected createSpawnInstance(): Actor {
		return this.config.instance.clone();
	}

	protected getPlacementAttemptLimit(instance: Actor): number {
		void instance;
		return this.config.placementAttempts;
	}

	protected selectSpawnLocation(instance: Actor, attempt: number): Vector {
		void instance;
		void attempt;

		const center = this.config.target.pos;
		const inner = Math.max(0, Math.min(this.config.radiusInner, this.config.radiusOuter));
		const outer = Math.max(inner, Math.max(this.config.radiusInner, this.config.radiusOuter));
		const angle = Math.random() * Math.PI * 2;
		const radius = this.randomRadiusInTorus(inner, outer);
		const direction = vec(Math.cos(angle), Math.sin(angle));

		return center.add(direction.scale(radius));
	}

	protected isSpawnLocationValid(instance: Actor, location: Vector): boolean {
		const instanceRadius = this.getSpawnRadius(instance);

		for (const other of this.spawns) {
			if (other.isKilled()) {
				continue;
			}

			const otherRadius = this.getSpawnRadius(other);
			if (Vector.distance(location, other.pos) < instanceRadius + otherRadius) {
				return false;
			}
		}

		return true;
	}

	protected getSpawnRadius(actor: Actor): number {
		const boundsRadius = Math.max(actor.collider.localBounds.width, actor.collider.localBounds.height) * 0.5;
		if (Number.isFinite(boundsRadius) && boundsRadius > 0) {
			return boundsRadius;
		}

		const dimensionRadius = Math.max(actor.width, actor.height) * 0.5;
		if (Number.isFinite(dimensionRadius) && dimensionRadius > 0) {
			return dimensionRadius;
		}

		return 1;
	}

	protected onSpawned(spawn: Actor): void {
		void spawn;
	}

	protected onSpawnRemoved(spawn: Actor): void {
		void spawn;
	}

	private startSpawnLoop(): void {
		if (this.config.max <= 0) {
			return;
		}

		this.stopSpawnLoop();
		this.spawnLoop = setInterval(() => {
			this.spawnTick();
		}, this.config.interval);
	}

	private stopSpawnLoop(): void {
		if (this.spawnLoop) {
			clearInterval(this.spawnLoop);
			this.spawnLoop = undefined;
		}
	}

	private spawnTick(): void {
		if (this.isCleaningUp || this.isKilled()) {
			this.stopSpawnLoop();
			return;
		}

		const scene = this.scene;
		if (!scene) {
			return;
		}

		this.pruneSpawns();
		if (this.spawns.size >= this.config.max) {
			this.stopSpawnLoop();
			return;
		}

		const spawn = this.createSpawn();
		if (!spawn) {
			return;
		}

		this.trackSpawn(spawn);
		scene.add(spawn);

		if (this.spawns.size >= this.config.max) {
			this.stopSpawnLoop();
		}
	}

	private createSpawn(): Actor | null {
		const spawn = this.createSpawnInstance();
		const maxAttempts = this.getPlacementAttemptLimit(spawn);

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const location = this.selectSpawnLocation(spawn, attempt);
			if (!this.isSpawnLocationValid(spawn, location)) {
				continue;
			}

			spawn.pos = location;
			return spawn;
		}

		return null;
	}

	private trackSpawn(spawn: Actor): void {
		this.spawns.add(spawn);

		const onKill = () => {
			this.untrackSpawn(spawn);
		};

		spawn.on("kill", onKill);
		this.spawnKillHandlers.set(spawn, onKill);
		this.onSpawned(spawn);
	}

	private untrackSpawn(spawn: Actor): void {
		this.spawns.delete(spawn);

		const onKill = this.spawnKillHandlers.get(spawn);
		if (onKill) {
			spawn.off("kill", onKill);
			this.spawnKillHandlers.delete(spawn);
		}

		this.onSpawnRemoved(spawn);
	}

	private pruneSpawns(): void {
		for (const spawn of [...this.spawns]) {
			if (spawn.isKilled() || !spawn.isActive) {
				this.untrackSpawn(spawn);
			}
		}
	}

	private cleanup(): void {
		if (this.isCleaningUp) {
			return;
		}

		this.isCleaningUp = true;
		this.stopSpawnLoop();

		for (const spawn of [...this.spawns]) {
			if (!spawn.isKilled()) {
				spawn.kill();
			}
			this.untrackSpawn(spawn);
		}

		for (const child of [...this.children]) {
			if (child instanceof Actor && !child.isKilled()) {
				child.kill();
			}
		}

		this.removeAllChildren();
		this.isCleaningUp = false;
	}

	private randomRadiusInTorus(inner: number, outer: number): number {
		if (inner === outer) {
			return inner;
		}

		const innerSquared = inner * inner;
		const outerSquared = outer * outer;
		return Math.sqrt(innerSquared + Math.random() * (outerSquared - innerSquared));
	}
}
