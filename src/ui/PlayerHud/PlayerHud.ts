import { Player } from "../../actors/player";
import { formatAcceleration, formatVelocity } from "../../lib/math";
import { rplc8 } from "../../lib/rplc8";
import "./PlayerHud.css";

let playerEl = rplc8(".player", {});
document.addEventListener("DOMContentLoaded", () => {
	playerEl = rplc8(".player", {});
});

export function updatePlayer(player: Player) {
	if (playerEl) {
		playerEl.elem.classList.remove("hid");
		playerEl.update({
			name: player.name,
			velx: formatVelocity(player.vel.x),
			vely: formatVelocity(player.vel.y),
			accx: formatAcceleration(player.acc.x),
			accy: formatAcceleration(player.acc.y),
			angular: formatVelocity(player.angularVelocity * 100),
		});
		return;
	}
}
