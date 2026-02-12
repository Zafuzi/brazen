import { signal } from "@preact/signals";
import { Engine, Scene } from "excalibur";
import { render } from "preact";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";
import { Station } from "../actors/station";
import { Radar } from "../ui/radar/radar";

export class Mining extends Scene {
	private ship = new Player();
	private station = new Station();
	private asteroids: Asteroid[] = [];

	private radarTick = signal(false); // boolean so it doesn’t grow forever
	private radarEl!: HTMLElement;

	private radarAccumMs = 0;

	override onInitialize(engine: Engine): void {
		this.add(this.ship);
		this.add(this.station);

		for (let i = 0; i < 1_000; i++) {
			const asteroid = new Asteroid();
			this.asteroids.push(asteroid);
			this.add(asteroid);
		}

		engine.currentScene.camera.strategy.lockToActor(this.ship);
		engine.currentScene.camera.zoom = 1;

		this.radarEl = document.getElementById("radar")!;
		render(<Radar actors={this.asteroids} player={this.ship} tick={this.radarTick} />, this.radarEl);
	}

	override onPostUpdate(engine: Engine, elapsedMs: number): void {
		// Throttle to e.g. 10Hz so you don’t re-render + sort 1000 items 60 times/sec
		this.radarAccumMs += elapsedMs;
		if (this.radarAccumMs >= 100) {
			this.radarAccumMs = 0;
			this.radarTick.value = !this.radarTick.value;
		}
	}

	override onDeactivate(): void {
		if (this.radarEl) render(null, this.radarEl);
	}
}
