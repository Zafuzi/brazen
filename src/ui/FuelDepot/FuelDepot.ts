import { Scene } from "excalibur";
import "./FuelDepot.css";

export class FuelDepot extends Scene {
	private ui: HTMLElement | null = null;
	onActivate() {
		this.ui = document.getElementById("ui");

		if (!this.ui) {
			throw new Error("Failed to activate UI");
		}

		const title = document.createElement("h1");
		title.textContent = "Insert the Lady";

		this.ui.classList.add("panel", "FuelDepot");
		this.ui.classList.remove("hid");

		const btnStart = document.createElement("button");
		btnStart.className = "button button--start";
		btnStart.textContent = "Back";
		btnStart.onclick = (e) => {
			e.preventDefault();
			this.engine.goToScene("Mining");
		};

		this.ui.appendChild(title);
		this.ui.appendChild(btnStart);
	}

	onDeactivate() {
		if (!this.ui) {
			throw new Error("Failed to deactivate UI");
		}
		this.ui.classList.remove("FuelDepot");
		this.ui.classList.add("hid");
		this.ui.innerHTML = "";
	}
}
