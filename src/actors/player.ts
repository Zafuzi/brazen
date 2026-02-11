import { Actor, CircleCollider, CollisionType, Engine, Keys, vec, Vector } from "excalibur";
import { Resources } from "../misc/resources";

export class Player extends Actor {
	private size = 48;

	constructor() {
		super({
			name: "Player",
			collisionType: CollisionType.Active,
			pos: vec(0, 0),
			scale: vec(0.5, 0.5),
		});

		this.body.mass = 10;
		this.body.friction = 0.9;
		this.body.bounciness = 0.2;

		this.collider.set(
			new CircleCollider({
				radius: this.size,
			}),
		);
	}

	onInitialize(engine: Engine) {
		this.graphics.add(Resources.Ship.toSprite());
	}

	onPreUpdate(engine: Engine, elapsed: number): void {
		const keys = engine.input.keyboard.getKeys();

		if (keys.indexOf(Keys.W) === -1 && keys.indexOf(Keys.D) === -1) {
			this.thrustEnd();
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
	}

	onPostUpdate(engine: Engine, elapsed: number): void {
		this.angularVelocity *= 0.98;
	}

	thrustForwardStart = () => {
		this.acc = Vector.fromAngle(this.rotation - Math.PI / 2).scale(50);
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
	};
}
