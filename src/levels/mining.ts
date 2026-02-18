import { Engine, Timer, vec, type SceneActivationContext } from "excalibur";
import { Asteroid, type OreType } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";
import { SaveSystem } from "../lib/save";
import { StreamScene } from "../lib/streamer";

export class Mining extends StreamScene {
	public player = new Player();

	public asteroids: Asteroid[] = [];
	public stations: Station[] = [
		new Station({
			name: "Refinery",
		}),
		new Station({
			name: "Sell Station",
			pos: vec(780_621, 880_420),
		}),
		new Station({
			name: "Fuel Depot",
			pos: vec(-10_128, 827_008),
		}),
	];

	constructor() {
		super();

		document.querySelector(".tutorial")?.classList.remove("hid");
	}

	override onInitialize(engine: Engine): void {
		this.add(this.player);
		this.setStreamTarget(this.player);

		SaveSystem.getState("asteroids").then((savedAsteroids) => {
			if (savedAsteroids?.length) {
				savedAsteroids.forEach((a) => {
					const asteroid = new Asteroid({
						pos: vec(a.pos.x, a.pos.y),
						vel: vec(a.vel.x, a.vel.y),
						angularVelocity: a.angularVelocity,
						ore: a.ore as OreType,
						variation: a.variation,
						amount: a.amount,
						startAmount: a.startAmount,
					});

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
					this.registerStreamable(asteroid);
				});
			} else {
				for (let i = 0; i < 100; i++) {
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
					this.registerStreamable(asteroid);
				}
			}
		});

		this.stations.forEach((station: Station) => {
			station.events.on("pointerup", () => {
				this.player.selectItem(station);
			});

			this.registerStreamable(station);
		});

		this.updateStreaming();

		const t = new Timer({
			repeats: true,
			action: this.autosave.bind(this),
			interval: 1_000,
		});

		this.addTimer(t);
		t.start();
	}

	onDeactivate(context: SceneActivationContext) {
		this.autosave();
	}

	autosave() {
		console.log("saving scene");
		const asteroids = this.asteroids
			?.filter((streamable) => streamable instanceof Asteroid)
			.map((asteroid) => {
				return {
					ore: asteroid.ore,
					amount: asteroid.amount,
					startAmount: asteroid.startAmount,
					pos: {
						x: asteroid.pos.x,
						y: asteroid.pos.y,
					},
					vel: {
						x: asteroid.vel.x,
						y: asteroid.vel.y,
					},
					angularVelocity: asteroid.angularVelocity,
					variation: asteroid.variation,
				};
			});

		SaveSystem.setState("asteroids", asteroids ?? []);
		this.player.autosave();
		// SaveSystem.setState("stations", this.stations);
	}
}
