import { Actor } from "excalibur";
import "./Radar.css";

export class Radar extends Actor {
	private ui: HTMLElement | null = null;

	onInitialize() {
		this.ui = document.getElementById("ui");

		if (!this.ui) {
			throw new Error("Failed to activate UI");
		}

		const title = document.createElement("h2");
		title.textContent = "Radar";

		this.ui.classList.add("panel", "radar");

		this.ui.appendChild(title);
	}

	onPostKill() {
		if (!this.ui) {
			throw new Error("Failed to deactivate UI");
		}
		this.ui.classList.remove("radar");
		this.ui.innerHTML = "";
	}
}
