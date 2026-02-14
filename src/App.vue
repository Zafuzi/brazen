<script setup lang="ts">
import {
	clamp,
	Color,
	DisplayMode,
	Engine,
	KeyEvent,
	Keys,
	PointerScope,
	Scene,
	SolverStrategy,
	type DirectorNavigationEvent,
} from "excalibur";
import { onBeforeUnmount, onDeactivated, ref } from "vue";
import { Mining } from "./levels/mining";
import { loader } from "./misc/resources";
import MainMenu from "./ui/MainMenu.vue";
import Radar from "./ui/Radar.vue";
import PlayerHud from "./ui/PlayerHud.vue";

const hidden = ref(true);
const scene = ref("start");

const engine = new Engine({
	displayMode: DisplayMode.FillScreen,
	pixelArt: false,
	antialiasing: true,
	enableCanvasContextMenu: false,
	backgroundColor: Color.Transparent,
	scenes: {
		start: new Scene(),
	},
	physics: {
		solver: SolverStrategy.Arcade,
	},
	pointerScope: PointerScope.Canvas,
	suppressConsoleBootMessage: true,
});

engine.start("start", { loader }).then(() => {
	// engine.add("OreStation", OreStation);
	// engine.add("FuelDepot", FuelDepot);
	engine.add("Mining", Mining);

	let oldScene = engine.director.currentSceneName;
	engine.input.keyboard.on("press", (event: KeyEvent) => {
		switch (event.key) {
			case Keys.Backquote:
				engine.toggleDebug();
				break;
			case Keys.P:
				if (engine.director.currentSceneName === "start") {
					engine.director.goToScene(oldScene);
				} else {
					oldScene = engine.director.currentSceneName;
					engine.director.goToScene("start");
				}

				break;
			case Keys.O:
				engine.director.goToScene("OreStation");
				break;
			case Keys.M:
				engine.director.goToScene("Mining");
				break;
			case Keys.F:
				engine.director.goToScene("FuelDepot");
				break;
		}
	});

	engine.input.pointers.on("wheel", (event) => {
		if (engine) {
			const newZoom = engine.currentScene.camera.zoom - event.deltaY / 1_000;
			engine.currentScene.camera.zoom = clamp(newZoom, 0.3, 1.5);
		}
	});

	engine.on("navigation", (scn: DirectorNavigationEvent) => {
		scene.value = scn.destinationName;
	});

	hidden.value = false;
});

onBeforeUnmount(() => {
	engine.dispose();
});

onDeactivated(() => {
	engine.dispose();
});
</script>

<template>
	<div :class="{ hid: hidden }" id="root">
		<img id="root_bg" src="/milky-way.jpg" />
		<MainMenu v-if="scene === 'start'" :engine="engine" />
		<Radar v-if="scene === 'Mining'" :engine="engine" />
		<PlayerHud v-if="scene === 'Mining'" :engine="engine" />
	</div>
</template>

<style>
#root {
	width: 100vw;
	height: 100vh;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: transparent;

	#root_bg {
		z-index: -1;
	}
}

canvas {
	z-index: 0;
}
</style>
