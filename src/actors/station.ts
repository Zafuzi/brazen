import {
	Actor,
	CollisionType,
	CompositeCollider,
	Engine,
	Shape,
	toRadians,
	vec,
} from "excalibur";
import { Resources } from "../misc/resources";

export class Station extends Actor {
	private size = 48;
	constructor() {
		super({
			name: "Station",
			pos: vec(400, -400),
			collisionType: CollisionType.Fixed,
			angularVelocity: toRadians(2),
			scale: vec(3, 3),
		});

		this.collider.set(
			new CompositeCollider([
				Shape.Circle(this.size - 10, vec(0, 0)),
				Shape.Circle(this.size / 2, vec(-this.size, -this.size)),
				Shape.Circle(this.size / 2, vec(this.size, this.size)),
				Shape.Circle(this.size / 2, vec(this.size, -this.size)),
				Shape.Circle(this.size / 2, vec(-this.size, this.size)),
			]),
		);
	}

	onInitialize(engine: Engine): void {
		this.graphics.add(Resources.Station.toSprite({}));
	}
}
