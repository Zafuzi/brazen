import { Engine, Scene } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";
import { Radar } from "./Radar";

export class Mining extends Scene {
	public player = new Player();
	public station = new Station();
	public asteroids: Asteroid[] = [];

	constructor() {
		super();

		this.station.events.on("pointerup", () => {
			this.player.selectItem(this.station);
		});
	}

	override onInitialize(engine: Engine): void {
		this.add(this.player);
		this.add(this.station);

		for (let i = 0; i < 1_000; i++) {
			const asteroid = new Asteroid();

			asteroid.events.on("pointerup", () => {
				this.player.selectItem(asteroid);
			});

			asteroid.on("kill", () => {
				this.asteroids.splice(
					this.asteroids.findIndex((a) => {
						a.id == asteroid.id;
					}),
				);
			});

			this.asteroids.push(asteroid);
			this.add(asteroid);
		}

		engine.currentScene.camera.strategy.lockToActor(this.player);
		engine.currentScene.camera.zoom = 1;

		this.add(new Radar(this.player));
	}

	override onPreUpdate(engine: Engine, elapsedMs: number): void {}
}
