import { Engine, Timer, vec, type SceneActivationContext } from "excalibur";
import { Asteroid, type OreType } from "../actors/asteroid";
import { Player } from "../actors/player";
import { PlayerInGameHud } from "../actors/playerInGameHud";
import { Station } from "../actors/station";
import { SaveSystem } from "../lib/save";
import { StreamScene } from "../lib/streamer";

export class Mining extends StreamScene {
	public player = new Player();

	public asteroids: Asteroid[] = [];
	public stations: Station[] = [
		new Station({
			name: "Refinery",
			variant: "Station_00",
		}),
		new Station({
			name: "Sell Station",
			pos: vec(780_621, 880_420),
			variant: "Station_01",
		}),
		new Station({
			name: "Fuel Depot",
			pos: vec(-100_128, 0),
			variant: "Station_02",
		}),
	];

	private hud: PlayerInGameHud;

	constructor() {
		super();

		document.querySelector(".tutorial")?.classList.remove("hid");

		this.hud = new PlayerInGameHud({ player: this.player, radius: 300 });
	}

	override onInitialize(engine: Engine): void {
		engine.add(this.hud);
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

	private updateTick = 0;
	onPreUpdate(engine: Engine, elapsed: number): void {
		if (this.updateTick > 500) {
			const asteroids = this.asteroids
				.sort((a, b) => {
					return this.player.pos.distance(a.pos) - this.player.pos.distance(b.pos);
				})
				.slice(0, 5);

			this.hud.setMarkers([...this.stations, ...asteroids]);
			this.updateTick = 0;
		}

		this.updateTick += Math.round(elapsed);
	}

	onDeactivate(context: SceneActivationContext) {
		this.autosave();
	}

	autosave() {
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

		SaveSystem.setState(
			"stations",
			this.stations.map((station) => {
				return {
					name: station.name,
					refining: station.refining,
				};
			}),
		);
	}
}
