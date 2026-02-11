import {
	Color,
	DisplayMode,
	Engine,
	FadeInOut,
	SolverStrategy,
} from "excalibur";
import { loader } from "./misc/resources";
import { MyLevel } from "./levels/level";

const game = new Engine({
	width: 2560,
	height: 1440,
	displayMode: DisplayMode.FitScreen,
	pixelArt: false,
	antialiasing: true,
	fixedUpdateFps: 30,
	enableCanvasContextMenu: false,
	backgroundColor: Color.Black,
	scenes: {
		start: MyLevel,
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
	.then(() => {});
