import { Actor, CollisionType, CompositeCollider, Engine, Shape, toRadians, vec, type ActorArgs } from "excalibur";
import { SaveSystem } from "../lib/save";
import { Images } from "../misc/resources";
import { OreTypes, type OreType } from "./asteroid";

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
	public variant: keyof typeof Images = "Station_00";
	public refining: { ore: string; refined: number; amount: number; startAmount: number }[] = [];

	constructor(options?: { variant?: keyof typeof Images } & ActorArgs) {
		super({
			name: "Station",
			pos: vec(0, -400),
			collisionType: CollisionType.Fixed,
			angularVelocity: toRadians(2),
			...options,
		});

		if (options?.variant) {
			this.variant = options.variant;
		}
	}

	onPostUpdate(engine: Engine, elapsed: number): void {
		if (this.refining.length) {
			this.refining.forEach((ore) => {
				if (ore.amount > 0) {
					let rate = 1 / 100;
					if (ore.amount - rate < 0) {
						rate = ore.amount;
						ore.amount = 0;
						ore.refined += rate;
						return;
					}

					ore.amount -= rate;
					ore.refined = (ore.refined ?? 0) + rate;
				}
			});
		}
	}

	onInitialize(engine: Engine): void {
		const image = Images[this.variant].toSprite();
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

		SaveSystem.getState("stations").then((stations) => {
			stations.forEach((station) => {
				if (station.name === this.name) {
					this.refining = station.refining;
				}
			});
		});
	}
}
