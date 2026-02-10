import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./misc/resources";
import { MyLevel } from "./levels/level";

const game = new Engine({
	width: 1024,
	height: 768,
	displayMode: DisplayMode.FitScreen,
	pixelArt: true,
	scenes: {
		start: MyLevel,
	},
});

game
	.start("start", {
		loader,
		inTransition: new FadeInOut({
			duration: 1000,
			direction: "in",
			color: Color.ExcaliburBlue,
		}),
	})
	.then(() => {});