import { Actor } from "excalibur";
import { Asteroid } from "../../actors/asteroid";
import { Player } from "../../actors/player";
import { Station } from "../../actors/station";
import { formatDistance, formatNumberFast } from "../../lib/math";
import { rplc8 } from "../../lib/rplc8";
import "./Radar.css";

let radar = rplc8(".radarItem", []);

document.addEventListener("DOMContentLoaded", () => {
	if (!radar) {
		radar = rplc8(".radarItem", []);
	}
});

export function updateRadar(actors: Actor[], station: Station, player: Player) {
	if (radar) {
		const massage = actors
			.sort((a, b) => {
				return player.pos.distance(a.pos) - player.pos.distance(b.pos);
			})
			.slice(0, 10)
			.map((actor) => {
				const data = {
					id: actor.id,
					title: "",
					amount: "",
					distance: "",
					active: player.selectedItem?.id === actor.id ? "active" : "",
				};

				data.title = (actor as Asteroid)?.ore ?? actor?.name ?? "";
				data.distance = "Distance: " + formatDistance(player.pos.distance(actor?.pos)) || "";

				if (actor instanceof Asteroid) {
					data.amount = "Ore: " + formatNumberFast((actor as Asteroid)?.amount) || "";
				}

				return data;
			});

		massage.unshift({
			id: station.id,
			title: station.name,
			amount: "",
			distance: "Distance: " + formatDistance(player.pos.distance(station.pos)),
			active: player.selectedItem?.id === station.id ? "active" : "",
		});

		radar.update(massage, (e: HTMLElement, d: any, i: number) => {
			e.addEventListener("click", () => {
				const toSelect = actors.find((a) => a.id === d.id);
				if (toSelect) {
					player.selectItem(toSelect);
				}

				if (d.id === station.id) {
					player.selectItem(station);
				}
			});
		});

		document.querySelector(".radar")?.classList.remove("hid");
		return;
	}
}
