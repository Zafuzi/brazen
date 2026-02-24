import { Actor, Engine, ScreenElement, vec, Vector, type ActorArgs } from "excalibur";
import { Images } from "../misc/resources";
import type { Player } from "./player";
import { Station } from "./station";

export class PlayerInGameHud extends ScreenElement {
	private radius = 100;
	private ogRadius = 100;
	private player: Player;

	// Dumb input: you control this list from outside
	private markers: Actor[] = [];
	private asteroidGraphic = Images.AsteroidIcon.toSprite();
	private stationGraphic = Images.StationIcon.toSprite();

	constructor(
		options: {
			player: Player;
			radius?: number;
			markers?: Actor[];
		} & ActorArgs,
	) {
		super({
			...options,
			anchor: vec(0.5, 0.5),
			z: 1001,
		});

		this.player = options.player;
		if (options.radius != null) {
			this.radius = options.radius;
			this.ogRadius = this.radius;
		}

		if (options.markers) this.markers = options.markers;
	}

	/** Replace the list (preferred) */
	public setMarkers(markers: Actor[]) {
		this.markers = markers;
	}

	/** Convenience helpers */
	public addMarker(marker: Actor) {
		this.markers.push(marker);
	}
	public clearMarkers() {
		this.markers = [];
	}

	onInitialize(engine: Engine): void {
		// this.asteroidGraphic.tint = Color.White;
		// this.stationGraphic.tint = Color.ExcaliburBlue;

		this.stationGraphic.width = this.stationGraphic.height = 16;
		this.asteroidGraphic.width = this.asteroidGraphic.height = 16;

		this.radius = this.ogRadius * engine.currentScene.camera.zoom;
		engine.input.pointers.on("wheel", (event) => {
			this.radius = this.ogRadius * engine.currentScene.camera.zoom;
		});
	}

	onPostUpdate(engine: Engine, elapsed: number): void {
		// HUD follows the player in screen space
		this.pos = engine.worldToScreenCoordinates(this.player.pos);

		const ctx = engine.graphicsContext;

		// center of HUD (screen coords)
		const cx = this.pos.x;
		const cy = this.pos.y;

		// Use player's WORLD position to compute angles in a stable space
		const px = this.player.pos.x;
		const py = this.player.pos.y;

		for (let i = 0; i < this.markers.length; i++) {
			const marker = this.markers[i];
			if (!marker || marker.isKilled()) continue;

			const g = marker instanceof Station ? this.stationGraphic : this.asteroidGraphic;

			if (!g) {
				console.warn(marker.name, "has no graphics");
				continue;
			}

			// angle from player -> marker in WORLD space
			const dx = marker.pos.x - px;
			const dy = marker.pos.y - py;
			const angle = Math.atan2(dy, dx);

			// position on ring around player in SCREEN space
			const ringOffset = Vector.fromAngle(angle).scale(this.radius);
			const x = cx + ringOffset.x;
			const y = cy + ringOffset.y;

			// Draw the marker's *current* graphic (sprite/animation/etc).
			// This assumes g.draw(ctx, x, y) draws centered according to g.anchor (typical in Excalibur).
			g.draw(ctx, x, y);
		}
	}
}
