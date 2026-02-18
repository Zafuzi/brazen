import { Actor, CollisionType, Engine, Scene, Vector, vec } from "excalibur";

type PauseSnapshot = {
	collisionType: CollisionType;
	vel: Vector;
	acc: Vector;
	angularVelocity: number;
	isVisible: boolean;
};

type MutableActorUpdate = {
	update: (engine: Engine, elapsed: number) => void;
};

export class StreamScene extends Scene {
	public streamRadius = 5_000;
	public streamables = new Set<Actor>();
	public loaded = new Set<Actor>();
	public alwaysLoaded = new Set<Actor>();

	private streamTarget: Actor | undefined;
	private readonly pausedTag = "paused";
	private readonly pauseSnapshots = new Map<Actor, PauseSnapshot>();
	private readonly killHandlers = new Map<Actor, () => void>();

	override update(...args: Parameters<Scene["update"]>): void {
		const [engine, elapsed] = args;
		this.syncPausedActors();

		const pausedActors = this.getPausedActors();
		const originalUpdates = new Map<Actor, (engine: Engine, elapsed: number) => void>();

		for (const actor of pausedActors) {
			originalUpdates.set(actor, actor.update.bind(actor));
			(actor as unknown as MutableActorUpdate).update = () => {
				// Intentionally skip update for paused entities.
			};
		}

		try {
			super.update(engine, elapsed);
		} finally {
			for (const [actor, update] of originalUpdates) {
				(actor as unknown as MutableActorUpdate).update = update;
			}
		}

		this.syncPausedActors();
	}

	override draw(...args: Parameters<Scene["draw"]>): void {
		const [ctx, elapsed] = args;
		this.syncPausedActors();

		const pausedActors = this.getPausedActors();
		const previousVisibility = new Map<Actor, boolean>();

		for (const actor of pausedActors) {
			previousVisibility.set(actor, actor.graphics.isVisible);
			actor.graphics.isVisible = false;
		}

		try {
			super.draw(ctx, elapsed);
		} finally {
			for (const [actor, wasVisible] of previousVisibility) {
				actor.graphics.isVisible = wasVisible;
			}
		}
	}

	override onPostUpdate(engine: Engine, elapsed: number): void {
		void engine;
		void elapsed;
		this.updateStreaming();
	}

	setStreamRadius(radius: number) {
		this.streamRadius = Math.max(0, radius);
		this.updateStreaming();
	}

	setStreamTarget(actor: Actor) {
		this.streamTarget = actor;
		this.updateStreaming();
	}

	registerStreamable(actor: Actor, options?: { alwaysLoaded?: boolean }) {
		if (this.streamables.has(actor)) {
			return;
		}

		this.streamables.add(actor);
		if (options?.alwaysLoaded) {
			this.alwaysLoaded.add(actor);
		}

		const onKill = () => {
			this.unregisterStreamable(actor);
		};

		actor.on("kill", onKill);
		this.killHandlers.set(actor, onKill);

		actor.addTag(this.pausedTag);
		if (actor.scene !== this) {
			this.add(actor);
		}
	}

	unregisterStreamable(actor: Actor) {
		this.streamables.delete(actor);
		this.alwaysLoaded.delete(actor);
		this.loaded.delete(actor);
		actor.removeTag(this.pausedTag);

		const onKill = this.killHandlers.get(actor);
		if (onKill) {
			actor.off("kill", onKill);
			this.killHandlers.delete(actor);
		}

		this.restoreFromPause(actor);
		if (actor.scene === this) {
			this.world.remove(actor, false);
		}
	}

	getActorsInRadius(center: Vector, radius = this.streamRadius) {
		return [...this.streamables].filter((actor) => {
			return actor.pos.distance(center) <= radius;
		});
	}

	protected updateStreaming() {
		const target = this.streamTarget;
		if (!target) {
			return;
		}

		for (const actor of this.streamables) {
			if (actor.isKilled()) {
				this.unregisterStreamable(actor);
				continue;
			}

			const shouldLoad = this.alwaysLoaded.has(actor) || actor.pos.distance(target.pos) <= this.streamRadius;

			if (shouldLoad) {
				actor.removeTag(this.pausedTag);
				this.loaded.add(actor);
			} else {
				actor.addTag(this.pausedTag);
				this.loaded.delete(actor);
			}
		}
	}

	private getPausedActors(): Actor[] {
		return this.actors.filter((actor) => actor.hasTag(this.pausedTag) && !actor.isKilled());
	}

	private syncPausedActors() {
		for (const actor of this.getPausedActors()) {
			const snapshot = this.pauseSnapshots.get(actor);
			if (!snapshot) {
				this.pauseSnapshots.set(actor, {
					collisionType: actor.body.collisionType,
					vel: actor.vel.clone(),
					acc: actor.acc.clone(),
					angularVelocity: actor.angularVelocity,
					isVisible: actor.graphics.isVisible,
				});
			}

			actor.body.collisionType = CollisionType.PreventCollision;
			actor.vel = vec(0, 0);
			actor.acc = vec(0, 0);
			actor.angularVelocity = 0;
			actor.graphics.isVisible = false;
			actor.actions.clearActions();
		}

		for (const actor of [...this.pauseSnapshots.keys()]) {
			if (!actor.hasTag(this.pausedTag) || actor.isKilled()) {
				this.restoreFromPause(actor);
			}
		}
	}

	private restoreFromPause(actor: Actor) {
		const snapshot = this.pauseSnapshots.get(actor);
		if (!snapshot) {
			return;
		}

		actor.body.collisionType = snapshot.collisionType;
		actor.vel = snapshot.vel.clone();
		actor.acc = snapshot.acc.clone();
		actor.angularVelocity = snapshot.angularVelocity;
		actor.graphics.isVisible = snapshot.isVisible;
		this.pauseSnapshots.delete(actor);
	}
}
