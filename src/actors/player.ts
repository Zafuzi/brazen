import {
	Actor,
	CollisionType,
	Engine,
	ExitViewPortEvent,
	KeyEvent,
	Keys,
	PolygonCollider,
	vec,
	Vector,
} from "excalibur";
import { Resources } from "../misc/resources";

export class Player extends Actor {
	private size = 48;

	constructor() {
		super({
			name: "Player",
			collisionType: CollisionType.Active,
			scale: vec(0.5, 0.5),
		});

		this.body.mass = 10;
		this.body.friction = 0.9;
		this.body.bounciness = 0.2;

		this.collider.set(
			new PolygonCollider({
				points: [
					vec(0, -this.size),
					vec(this.size, this.size),
					vec(-this.size, this.size),
				],
			}),
		);
	}

	onInitialize(engine: Engine) {
		this.graphics.add(Resources.Ship.toSprite());
		this.pos = vec(engine.screen.halfDrawWidth, engine.screen.halfDrawHeight);

		this.on("exitviewport", (_event: ExitViewPortEvent) => {
			if (this.pos.x < 0) {
				this.pos.x = engine.drawWidth + this.collider.bounds.width / 2;
			} else if (engine.drawWidth < this.pos.x) {
				this.pos.x = -this.collider.bounds.width / 2;
			}

			if (this.pos.y < 0) {
				this.pos.y = engine.drawHeight + this.collider.bounds.height / 2;
			} else if (engine.drawHeight < this.pos.y) {
				this.pos.y = -this.collider.bounds.height / 2;
			}
		});

		engine.input.keyboard.on("hold", (event: KeyEvent) => {
			switch (event.key) {
				case Keys.A:
				case Keys.ArrowLeft:
					this.thrustTurnLeft();
					break;

				case Keys.D:
				case Keys.ArrowRight:
					this.thrustTurnRight();
					break;

				case Keys.W:
				case Keys.ArrowUp:
					this.thrustForwardStart();
					break;

				case Keys.S:
				case Keys.ArrowDown:
					this.thrustReverseStart();
					break;

				default:
					break;
			}
		});

		engine.input.keyboard.on("release", (event: KeyEvent) => {
			this.thrustEnd();
		});
	}

	onPreUpdate(engine: Engine, elapsed: number): void {
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
