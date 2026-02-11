import { Engine, Scene } from "excalibur";
import { Player } from "../actors/player";
import { Station } from "../actors/station";
import { Asteroid } from "../actors/asteroid";

export class Mining extends Scene {
	private ship: Player = new Player();
	private station: Station = new Station();
	private asteroids: Asteroid[] = []; 

	override onInitialize(engine: Engine): void {
		this.add(this.ship);
		this.add(this.station);

		for(let i = 0; i < 100; i++) {
			const asteroid = new Asteroid();
			this.asteroids.push(asteroid);
			this.add(asteroid);
		}

		engine.currentScene.camera.strategy.lockToActor(this.ship);
		engine.currentScene.camera.zoom = 0.8;
	}
}
