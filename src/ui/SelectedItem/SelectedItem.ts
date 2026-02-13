import { Actor } from "excalibur";
import { Asteroid } from "../../actors/asteroid";
import { Player } from "../../actors/player";
import { formatDistance, formatNumberFast } from "../../lib/math";
import { rplc8 } from "../../lib/rplc8";
import "./SelectedItem.css";

let selected = rplc8(".selectedItem", {});
document.addEventListener("DOMContentLoaded", () => {
	selected = rplc8(".selectedItem", {});
});

export function updateSelected(actor: Actor | undefined, player: Player) {
	if (selected) {
		selected.elem.classList.remove("hid");

		const data = {
			title: "",
			amount: "",
			distance: "",
		};

		if (actor) {
			data.title = (actor as Asteroid)?.ore ?? actor?.name ?? "";
			data.distance = formatDistance(player.pos.distance(actor?.pos)) || "";
		}

		if (actor instanceof Asteroid) {
			data.amount = formatNumberFast((actor as Asteroid)?.amount) || "";
		}

		selected.update(data);

		return;
	}
}
