import { Engine, Scene, Timer } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";
import { updateRadar } from "../ui/Radar/Radar";

export class Mining extends Scene {
	public player = new Player();
	public station = new Station();
	public asteroids: Asteroid[] = [];
	private radarTimer: Timer = new Timer({
		repeats: true,
		action: this.triggerRadarUpdate.bind(this),
		interval: 2_000,
	});

	constructor() {
		super();

		this.station.events.on("pointerup", () => {
			this.player.selectItem(this.station);
		});

		document.querySelector(".tutorial")?.classList.remove("hid");
	}

	override onInitialize(engine: Engine): void {
		this.add(this.player);
		this.add(this.station);
		this.add(this.radarTimer);

		this.player.addSelectHook(this.triggerRadarUpdate.bind(this));

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

				this.triggerRadarUpdate();
			});

			this.asteroids.push(asteroid);
			this.add(asteroid);
		}

		engine.currentScene.camera.strategy.lockToActor(this.player);
		engine.currentScene.camera.zoom = 1;

		updateRadar(this.asteroids, this.station, this.player);
		this.radarTimer.start();
	}

	onPostUpdate(engine: Engine, elapsed: number): void {}

	triggerRadarUpdate() {
		updateRadar(this.asteroids, this.station, this.player);
	}
}
