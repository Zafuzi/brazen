import { Actor, CollisionType, Color, Engine, Label, Rectangle, ScreenElement, vec } from "excalibur";
import { Asteroid } from "../../actors/asteroid";
import { Player } from "../../actors/player";
import { Station } from "../../actors/station";
import { formatDistance, formatNumberFast } from "../../lib/math";

export class Radar extends ScreenElement {
	private player: Player;
	private cursor = vec(16, 16);

	private interface: any = {
		panel: null,
		selected: {
			name: null,
			amount: null,
			ore: null,
			distance: null,
		},
	};

	constructor(player: Player, asteroids: Asteroid[], station: Station) {
		super({
			pos: vec(16, 32),
			anchor: vec(0, 0),
			width: 300,
			height: 300,
			z: 100,
			collisionType: CollisionType.Passive,
		});

		this.player = player;
	}

	onInitialize(engine: Engine): void {
		this.interface.selected.name = new Label({
			text: "",
			color: Color.White,
			scale: vec(2, 2),
		});

		this.interface.selected.amount = new Label({
			text: "",
			color: Color.White,
			scale: vec(2, 2),
		});

		this.interface.selected.distance = new Label({
			text: "",
			color: Color.White,
			scale: vec(2, 2),
		});

		this.interface.panel = new Rectangle({
			width: this.width,
			height: this.height,
			color: Color.Black,
			opacity: 0.8,
			strokeColor: Color.Black,
			lineWidth: 3,
			padding: 8,
			lineCap: "round",
			smoothing: true,
		});

		this.graphics.add(this.interface.panel);

		this.render(this.interface.selected.name, this.interface.selected.amount, this.interface.selected.distance);
	}

	render(...elements: Actor[]) {
		elements.forEach((element) => {
			element.pos = this.cursor;
			this.addChild(element);

			this.cursor.y += element.graphics.bounds.height;
		});
	}

	onPreUpdate(engine: Engine, elapsed: number): void {
		const { name, amount, distance } = this.interface.selected;

		name.text = "";
		amount.text = "";
		distance.text = "";

		const selectedItem = this.player.selectedItem;

		name.text = selectedItem?.name ?? "";

		if (selectedItem instanceof Asteroid) {
			amount.text = "Amount: " + formatNumberFast((selectedItem as Asteroid)?.amount);

			distance.text = "Distance: " + formatDistance(this.player.pos.distance(this.player.selectedItem?.pos));
		}
	}
}
