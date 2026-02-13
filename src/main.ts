import { clamp, Color, DisplayMode, Engine, KeyEvent, Keys, PointerScope, SolverStrategy } from "excalibur";
import { Mining } from "./levels/mining";
import { loader } from "./misc/resources";
import { FuelDepot } from "./ui/FuelDepot/FuelDepot";
import { MainMenu } from "./ui/MainMenu/MainMenu";
import { OreStation } from "./ui/OreStation/OreStation";

const game = new Engine({
	displayMode: DisplayMode.FillScreen,
	pixelArt: false,
	antialiasing: true,
	enableCanvasContextMenu: false,
	backgroundColor: Color.Transparent,
	scenes: {
		start: MainMenu,
	},
	physics: {
		solver: SolverStrategy.Arcade,
	},
	canvasElementId: "game",
	pointerScope: PointerScope.Canvas,
});

game.add("MainMenu", MainMenu);
game.add("OreStation", OreStation);
game.add("FuelDepot", FuelDepot);
game.add("Mining", Mining);

game.start("start", {
	loader,
}).then(() => {
	game.input.keyboard.on("press", (event: KeyEvent) => {
		switch (event.key) {
			case Keys.Backquote:
				game.toggleDebug();
				break;
			case Keys.P:
				game.director.goToScene("MainMenu");
				break;
			case Keys.O:
				game.director.goToScene("OreStation");
				break;
			case Keys.M:
				game.director.goToScene("Mining");
				break;
			case Keys.F:
				game.director.goToScene("FuelDepot");
				break;
		}
	});

	game.input.pointers.on("wheel", (event) => {
		const newZoom = game.currentScene.camera.zoom - event.deltaY / 1_000;
		game.currentScene.camera.zoom = clamp(newZoom, 0.3, 1.5);
	});
});
