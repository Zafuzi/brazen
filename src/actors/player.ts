import {
	Actor,
	CircleCollider,
	CollisionType,
	Engine,
	Entity,
	Keys,
	Shape,
	Sprite,
	toRadians,
	vec,
	Vector,
} from "excalibur";
import { Resources } from "../misc/resources";
import { Asteroid } from "./asteroid";

export class Player extends Actor {
	private size = 48;
	private thrust: Actor;
	private rangeSensor: Actor;
	private miningTarget: Asteroid | undefined;
	private beamLine: Sprite;
	private miningBeam: Actor;
	private miningRange: number = 1_000;

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

		this.thrust = new Actor({
			name: "PlayerThrust",
			pos: vec(0, 64),
			opacity: 0,
			z: -1,
			collisionType: CollisionType.PreventCollision,
		});

		this.addChild(this.thrust);

		this.rangeSensor = new Actor({
			pos: vec(0, 0),
			collisionType: CollisionType.Passive,
		});

		this.rangeSensor.collider.set(Shape.Circle(this.miningRange));

		this.addChild(this.rangeSensor);

		this.rangeSensor.on("collisionstart", (evt) => {
			this.currentCollisions.add(evt.other.owner);
		});

		this.rangeSensor.on("collisionend", (evt) => {
			this.currentCollisions.delete(evt.other.owner);
		});

		this.miningBeam = new Actor({
			z: -1,
			anchor: vec(0.5, 0),
			rotation: toRadians(-90),
			pos: vec(0, 0),
			scale: vec(1, 1),
		});

		this.beamLine = Resources.Thrust_purple.toSprite({
			destSize: {
				width: 10,
				height: this.miningRange,
			},
		});

		this.miningBeam.graphics.add(this.beamLine);
	}

	onInitialize(engine: Engine) {
		this.graphics.add(Resources.Ship.toSprite());
		this.thrust.graphics.add(Resources.Thrust_blue.toSprite());
		engine.currentScene.world.add(this.miningBeam);
	}

	onPreUpdate(engine: Engine, elapsed: number): void {
		const keys = engine.input.keyboard.getKeys();

		if (keys.indexOf(Keys.W) === -1 && keys.indexOf(Keys.D) === -1) {
			this.thrustEnd();
		}

		if (keys.indexOf(Keys.Space) > -1) {
			this.vel = this.vel.scale(0.98);
		}

		if (keys.indexOf(Keys.A) > -1) {
			this.thrustTurnLeft();
		}

		if (keys.indexOf(Keys.D) > -1) {
			this.thrustTurnRight();
		}

		if (keys.indexOf(Keys.W) > -1) {
			this.thrustForwardStart();
		}

		if (keys.indexOf(Keys.S) > -1) {
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

		const target = this.miningTarget;

		if (target?.pos) {
			const a = this.pos;
			const b = target.pos;

			const delta = b.sub(a);
			const dist = delta.magnitude;

			this.miningBeam.pos = a;
			this.miningBeam.rotation = Math.atan2(delta.y, delta.x) - Math.PI / 2;
			this.beamLine.destSize.height = dist;
			this.beamLine.opacity = 1;
			target.mine();
		} else {
			this.beamLine.opacity = 0;
		}
	}

	onPostUpdate(engine: Engine, elapsed: number): void {
		this.angularVelocity *= 0.98;
	}

	thrustForwardStart = () => {
		this.acc = Vector.fromAngle(this.rotation - Math.PI / 2).scale(100);
		this.thrust.graphics.opacity = 1;
	};

	thrustReverseStart = () => {
		this.acc = Vector.fromAngle(this.rotation - Math.PI / 2).scale(-10);
	};

	thrustTurnLeft = () => {
		this.angularVelocity += -0.1;
	};

	thrustTurnRight = () => {
		this.angularVelocity += 0.1;
	};

	thrustEnd = () => {
		this.acc = Vector.Zero;
		this.thrust.graphics.opacity = 0;
	};
}
