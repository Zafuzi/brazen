import {
	Color,
	DisplayMode,
	Engine,
	FadeInOut,
	KeyEvent,
	Keys,
	SolverStrategy,
} from "excalibur";
import { loader } from "./misc/resources";
import { Mining } from "./levels/level";

const game = new Engine({
	width: 2560,
	height: 1440,
	displayMode: DisplayMode.FitScreen,
	pixelArt: false,
	antialiasing: true,
	fixedUpdateFps: 30,
	enableCanvasContextMenu: false,
	backgroundColor: Color.Transparent,
	scenes: {
		start: Mining,
	},
	physics: {
		solver: SolverStrategy.Realistic,
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
		})
	});
