import { Player } from "../../actors/player";
import { formatAcceleration, formatNumberFast, formatVelocity } from "../../lib/math";
import { rplc8 } from "../../lib/rplc8";
import "./PlayerHud.css";

let playerMotionEl = rplc8(".player_motion", {});
let playerInventoryEl = rplc8(".player_inventory_item", {});

document.addEventListener("DOMContentLoaded", () => {
	playerMotionEl = rplc8(".player_motion", {});
	playerInventoryEl = rplc8(".player_inventory_item", {});
});

export function updatePlayer(player: Player) {
	if (playerMotionEl) {
		playerMotionEl.update({
			name: player.name,
			velx: formatVelocity(player.vel.x),
			vely: formatVelocity(player.vel.y),
			accx: formatAcceleration(player.acc.x),
			accy: formatAcceleration(player.acc.y),
			angular: formatVelocity(player.angularVelocity * 100),
		});
	}

	if (playerInventoryEl) {
		const inventory: any = [];
		player.inventory.forEach((value, key) => {
			inventory.push({
				ore: key,
				amount: formatNumberFast(value),
			});
		});
		playerInventoryEl.update(inventory);
	}
}
