import { Actor, CollisionType, CompositeCollider, Engine, Shape, toRadians, vec } from "excalibur";
import { Resources } from "../misc/resources";

export class Station extends Actor {
	constructor() {
		super({
			name: "Station",
			pos: vec(0, -400),
			collisionType: CollisionType.Fixed,
			angularVelocity: toRadians(2),
		});
	}

	onInitialize(engine: Engine): void {
		const image = Resources.Station_00.toSprite();

		this.graphics.add(image);

		const width = image.width;

		const centerRadius = width / 4;
		const cornerRadius = width / 3;

		this.collider.set(
			new CompositeCollider([
				Shape.Circle(centerRadius, vec(0, 0)),
				Shape.Circle(centerRadius / 1.5, vec(-cornerRadius, -cornerRadius)),
				Shape.Circle(centerRadius / 1.5, vec(cornerRadius, cornerRadius)),
				Shape.Circle(centerRadius / 1.5, vec(cornerRadius, -cornerRadius)),
				Shape.Circle(centerRadius / 1.5, vec(-cornerRadius, cornerRadius)),
			]),
		);
	}
}
