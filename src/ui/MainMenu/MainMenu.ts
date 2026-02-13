import { Scene } from "excalibur";
import "./MainMenu.css";

export class MainMenu extends Scene {
	private ui: HTMLElement | null = null;
	onActivate() {
		this.ui = document.getElementById("ui");

		if (!this.ui) {
			throw new Error("Failed to activate UI");
		}

		const title = document.createElement("h1");
		title.textContent = "Brazen";

		this.ui.classList.add("panel", "MainMenu");
		this.ui.classList.remove("hid");

		const btnStart = document.createElement("button");
		btnStart.className = "button button--start";
		btnStart.textContent = "Start";
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
		this.ui.classList.add("hid");
		this.ui.classList.remove("MainMenu");
		this.ui.innerHTML = "";
	}
}
