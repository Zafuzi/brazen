import { Actor, CollisionType, CompositeCollider, Engine, Shape, toRadians, vec } from "excalibur";
import { Images } from "../misc/resources";
import { OreType, OreTypes } from "./asteroid";

export type OrePrice = {
	key: OreType;
	sellPrice: number;
	buyPrice: number;
};

const getBaseOrePrice = (ore: OreType, index: number): number => {
	const nameHash = ore.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return 20 + ((nameHash + index * 17) % 481);
};

export const OrePrices: OrePrice[] = OreTypes.map((key, index) => {
	const sellPrice = getBaseOrePrice(key, index);
	return {
		key,
		sellPrice,
		buyPrice: Math.round(sellPrice * 1.2),
	};
});

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
		const image = Images.Station_00.toSprite();

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
