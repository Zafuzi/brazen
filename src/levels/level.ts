import { Engine, Scene } from "excalibur";
import { Player } from "../actors/player";
import { Station } from "../actors/station";

export class MyLevel extends Scene {
	private ship: Player = new Player();
	private station: Station = new Station();

	override onInitialize(engine: Engine): void {
		this.add(this.ship);
		this.add(this.station);

		engine.currentScene.camera.strategy.radiusAroundActor(this.ship, 50);
	}
}
