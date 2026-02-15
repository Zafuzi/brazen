import {
	Actor,
	CircleCollider,
	Collider,
	CollisionContact,
	CollisionType,
	Engine,
	Entity,
	Keys,
	Side,
	Sound,
	Sprite,
	toRadians,
	vec,
	Vector,
} from "excalibur";
import { Images, Sounds } from "../misc/resources";
import { Asteroid } from "./asteroid";

export class Player extends Actor {
	private size = 48;
	private thrust: Actor = new Actor({
		name: "PlayerThrust",
		pos: vec(0, 64),
		opacity: 0,
		z: -1,
		collisionType: CollisionType.PreventCollision,
	});

	private miningRate: number = 0.25;
	private miningRange: number = 5_000;
	private miningTarget: Asteroid | undefined;
	private beamLine: Sprite = Images.Thrust_purple.toSprite({
		destSize: {
			width: 10,
			height: this.miningRange,
		},
	});

	private miningBeam: Actor = new Actor({
		z: -1,
		anchor: vec(0.5, 0),
		rotation: toRadians(-90),
		pos: vec(0, 0),
		scale: vec(1, 1),
	});

	public selectedItem: Actor | undefined;

	private autoPilotEnabled: boolean = false;

	private thrustSound: Sound = Sounds.ThrustSound;
	private miningSound: Sound = Sounds.MiningSound;
	private hitSound: Sound = Sounds.HitAsteroid;
	private movementLoopsStarted = false;

	public inventory: Map<string, number> = new Map();

	private currentCollisions = new Set<Entity>();

	constructor() {
		super({
			name: "Player",
			collisionType: CollisionType.Active,
			pos: vec(0, 0),
			scale: vec(0.5, 0.5),
		});

		this.collider.set(
			new CircleCollider({
				radius: this.size - 10,
			}),
		);
	}

	onInitialize(engine: Engine) {
		this.addChild(this.thrust);
		this.graphics.add(Images.Ship.toSprite());
		this.thrust.graphics.add(Images.Thrust_blue.toSprite());
		this.miningBeam.graphics.add(this.beamLine);

		engine.currentScene.world.add(this.miningBeam);

		this.thrustSound.loop = true;
		this.thrustSound.volume = 0;

		this.miningSound.loop = true;
		this.miningSound.volume = 0;

		this.hitSound.volume = 1;

		//@ts-ignore
		engine.events.on("selectedItem", this.selectItem);
	}

	onPreUpdate(engine: Engine, elapsed: number): void {
		this.startMovementLoopsIfReady(engine);
		const keys = engine.input.keyboard.getKeys();

		if (keys.indexOf(Keys.W) === -1 && keys.indexOf(Keys.D) === -1) {
			this.thrustEnd();
		}

		if (keys.indexOf(Keys.Escape) > -1) {
			this.deselectItem();
		}

		if (keys.indexOf(Keys.X) > -1 || keys.indexOf(Keys.ShiftRight) > -1 || keys.indexOf(Keys.ShiftLeft) > -1) {
			this.vel = this.vel.scale(0.98);
			this.angularVelocity *= 0.98;
		}

		if (keys.indexOf(Keys.A) > -1 || keys.indexOf(Keys.ArrowLeft) > -1) {
			this.thrustTurnLeft();
		}

		if (keys.indexOf(Keys.D) > -1 || keys.indexOf(Keys.ArrowRight) > -1) {
			this.thrustTurnRight();
		}

		if (keys.indexOf(Keys.W) > -1 || keys.indexOf(Keys.ArrowUp) > -1) {
			this.thrustForwardStart();
		}

		if (keys.indexOf(Keys.S) > -1 || keys.indexOf(Keys.ArrowDown) > -1) {
			this.thrustReverseStart();
		}

		for (const actor of this.currentCollisions) {
			if (!this.miningTarget && actor instanceof Asteroid) {
				this.miningTarget = actor as Asteroid;
			}
		}

		if (!this.miningTarget?.isActive) {
			this.miningTarget = undefined;
		}

		if (this.currentCollisions.size === 0) {
			this.miningTarget = undefined;
		}

		if (this.selectedItem) {
			if (!this.selectedItem.isActive) {
				this.deselectItem();
				this.miningSound.volume = 0;
			}

			if (this.autoPilotEnabled) {
				this.rotateTo(this.selectedItem, elapsed);
			}
		} else {
			this.miningSound.volume = 0;
		}

		if (this.selectedItem instanceof Asteroid && this.selectedItem?.pos) {
			const a = this.pos;
			const b = this.selectedItem.pos;

			const delta = b.sub(a);
			const dist = delta.magnitude;
			if (dist <= this.miningRange) {
				this.miningBeam.pos = a;
				this.miningBeam.rotation = Math.atan2(delta.y, delta.x) - Math.PI / 2;
				this.beamLine.destSize.height = dist;

				this.selectedItem.mine(this.miningRate);

				const ore = this.selectedItem?.ore;
				if (ore) {
					this.inventory.set(ore, (this.inventory.get(ore) ?? 0) + this.miningRate);
				}

				this.miningSound.volume = 0.5;
				this.beamLine.opacity = 1;
			} else {
				this.miningSound.volume = 0;
				this.beamLine.opacity = 0;
			}
		} else {
			this.miningSound.volume = 0;
			this.beamLine.opacity = 0;
		}
	}

	private startMovementLoopsIfReady(engine: Engine) {
		if (this.movementLoopsStarted || !engine.isRunning()) {
			return;
		}

		this.thrustSound.play();
		this.miningSound.play();
		this.movementLoopsStarted = true;
	}

	private updateTick = 0;
	onPostUpdate(engine: Engine, elapsed: number): void {
		this.angularVelocity *= 0.98;
		this.updateTick += Math.round(elapsed);
	}

	onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		this.hitSound.play();
	}

	thrustForwardStart = () => {
		this.acc = Vector.fromAngle(this.rotation - Math.PI / 2).scale(100);
		this.thrust.graphics.opacity = 1;
		this.thrustSound.volume = 0.5;
	};

	thrustReverseStart = () => {
		this.acc = Vector.fromAngle(this.rotation - Math.PI / 2).scale(-10);
		this.thrustSound.volume = 0.2;
	};

	thrustTurnLeft = () => {
		this.angularVelocity += -0.1;
		this.autoPilotEnabled = false;
		this.thrustSound.volume = 0.3;
	};

	thrustTurnRight = () => {
		this.angularVelocity += 0.1;
		this.autoPilotEnabled = false;
		this.thrustSound.volume = 0.3;
	};

	thrustEnd = () => {
		this.acc = Vector.Zero;
		this.thrust.graphics.opacity = 0;
		this.thrustSound.volume = 0;
	};

	rotateTo = (target: Actor, elapsed: number) => {
		if (!target) {
			return;
		}

		const delta = target.pos.sub(this.pos);

		const targetAngle = Math.atan2(delta.y, delta.x);

		// Find smallest angular difference
		let diff = targetAngle - this.rotation;

		// Wrap to [-PI, PI]
		diff = Math.atan2(Math.sin(diff), Math.cos(diff)) + Math.PI / 2;

		const rotationSpeed = 2; // radians per second

		this.angularVelocity = diff * Math.min(1, rotationSpeed * elapsed);
	};

	selectItem = (target: Actor) => {
		this.selectedItem = target;
		this.autoPilotEnabled = true;
	};

	deselectItem = () => {
		this.selectedItem = undefined;
	};
}
