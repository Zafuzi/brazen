import { Engine, Scene } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";

export class Mining extends Scene {
	private ship: Player = new Player();
	private station: Station = new Station();

	override onInitialize(engine: Engine): void {
		this.add(this.ship);
		this.add(this.station);

		for (let i = 0; i < 1_000; i++) {
			this.add(new Asteroid());
		}

		engine.currentScene.camera.strategy.lockToActor(this.ship);
		engine.currentScene.camera.zoom = 1;
	}
}
