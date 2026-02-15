import { Engine, Scene, toRadians, vec } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";

export class Mining extends Scene {
	public player = new Player();

	public asteroids: Asteroid[] = [];
	public stations: Station[] = [
		new Station({
			name: "Home Station",
		}),
		new Station({
			name: "Far Away Station",
			pos: vec(1_000_000, 1_000_000),
			angularVelocity: toRadians(-7),
			visible: false,
		}),
	];

	constructor() {
		super();

		document.querySelector(".tutorial")?.classList.remove("hid");
	}

	override onInitialize(engine: Engine): void {
		this.add(this.player);

		for (let i = 0; i < 3_000; i++) {
			const asteroid = new Asteroid();

			asteroid.events.on("pointerup", () => {
				this.player.selectItem(asteroid);
			});

			asteroid.on("kill", () => {
				const asteroidIndex = this.asteroids.findIndex((a) => a.id === asteroid.id);
				if (asteroidIndex >= 0) {
					this.asteroids.splice(asteroidIndex, 1);
				}
			});

			this.asteroids.push(asteroid);
			this.add(asteroid);
		}

		this.stations.forEach((station: Station) => {
			station.events.on("pointerup", () => {
				this.player.selectItem(station);
			});

			this.add(station);
		});

		engine.currentScene.camera.strategy.lockToActor(this.player);
		engine.currentScene.camera.zoom = 0.5;
	}

	onPostUpdate(engine: Engine, elapsed: number): void {}
}
