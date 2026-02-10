import { Actor, vec } from "excalibur";
import { Resources } from "../misc/resources";

export class Player extends Actor {
	constructor() {
		super({
			name: "Player",
			pos: vec(150, 150),
			width: 100,
			height: 100,
		});
	}

	override onInitialize() {
		this.graphics.add(Resources.Sword.toSprite());
	}
}
