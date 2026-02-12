import { clamp, Color, DisplayMode, Engine, FadeInOut, KeyEvent, Keys, PointerScope, SolverStrategy } from "excalibur";
import { Mining } from "./levels/mining";
import { loader } from "./misc/resources";
import { MainMenu } from "./ui/MainMenu/MainMenu";

const game = new Engine({
	width: 1280,
	height: 720,
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

game.add("Mining", Mining);

game.start("start", {
	loader,
	inTransition: new FadeInOut({
		duration: 500,
		direction: "in",
		color: Color.ExcaliburBlue,
	}),
}).then(() => {
	game.input.keyboard.on("press", (event: KeyEvent) => {
		switch (event.key) {
			case Keys.Backquote:
				game.toggleDebug();
				break;
		}
	});

	game.input.pointers.on("wheel", (event) => {
		const newZoom = game.currentScene.camera.zoom - event.deltaY / 1_000;
		game.currentScene.camera.zoom = clamp(newZoom, 0.3, 1.5);
	});
});
