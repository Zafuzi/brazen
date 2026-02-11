import {
	clamp,
	Color,
	DisplayMode,
	Engine,
	FadeInOut,
	KeyEvent,
	Keys,
	SolverStrategy,
	Subscription,
} from "excalibur";
import { loader } from "./misc/resources";
import { Mining } from "./levels/mining";

const game = new Engine({
	width: 1024,
	height: 768,
	displayMode: DisplayMode.FitScreenAndFill,
	pixelArt: false,
	antialiasing: true,
	enableCanvasContextMenu: false,
	backgroundColor: Color.Transparent,
	scenes: {
		start: Mining,
	},
	physics: {
		solver: SolverStrategy.Arcade,
	},
});

game
	.start("start", {
		loader,
		inTransition: new FadeInOut({
			duration: 500,
			direction: "in",
			color: Color.ExcaliburBlue,
		}),
	})
	.then(() => {
		game.input.keyboard.on("press", (event: KeyEvent) => {
			switch(event.key) {
				case Keys.Backquote:
					game.toggleDebug();
					break;
			}
		});

		game.input.pointers.on("wheel", (event) => {
			const newZoom = game.currentScene.camera.zoom - event.deltaY / 1_000;

			game.currentScene.camera.zoom = clamp(newZoom, 0.3, 1.5);
		})

		game.toggleDebug();
	});
