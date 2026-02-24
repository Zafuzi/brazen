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
import { Refinery } from "./levels/refinery";
import { SaveSystem } from "./lib/save";
import { loader } from "./misc/resources";
import Inventory from "./ui/Inventory.vue";
import MainMenu from "./ui/MainMenu.vue";
import PlayerHud from "./ui/PlayerHud.vue";
import Radar from "./ui/Radar.vue";
import RefineryUI from "./ui/RefineryUI.vue";
import SelectedItem from "./ui/SelectedItem.vue";

const hidden = ref(true);
const scene = ref("");
const showRefinery = ref(false);

SaveSystem.getState("engine").then((savedState) => {
	scene.value = savedState.scene;
});

const engine = new Engine({
	displayMode: DisplayMode.FillScreen,
	pixelArt: false,
	antialiasing: true,
	pixelRatio: 1,
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
	engine.add("Mining", Mining);
	engine.add("Refinery", Refinery);

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
			case Keys.M:
				engine.director.goToScene("Mining");
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
		hotSave();
		scene.value = scn.destinationName;
	});

	hidden.value = false;
});

onBeforeUnmount(() => {
	hotSave();
	engine.dispose();
});

onDeactivated(() => {
	hotSave();
	engine.dispose();
});

window.addEventListener("beforeunload", (event) => {
	event.preventDefault();
	hotSave();
});

if (import.meta.hot) {
	hotSave();
}

function hotSave() {
	let sceneName = scene.value;
	if (engine?.currentScene instanceof Mining) {
		(engine.currentScene as Mining).autosave();
	}

	SaveSystem.setState("engine", {
		scene: sceneName === "Mining" ? "start" : sceneName,
	});
}

function toggleRefinery() {
	showRefinery.value = !showRefinery.value;
}
</script>

<template>
	<div :class="{ hid: hidden }" id="root">
		<MainMenu v-if="scene === 'start'" :engine="engine" />
		<Radar v-if="scene === 'Mining'" :engine="engine" />
		<PlayerHud v-if="scene === 'Mining'" :engine="engine" />
		<SelectedItem v-if="scene === 'Mining'" :toggleRefinery="toggleRefinery" :engine="engine" />
		<Inventory v-if="scene === 'Mining'" :engine="engine" />
		<RefineryUI v-if="showRefinery" :toggleRefinery="toggleRefinery" :engine="engine" />
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
	background: #080514;
	background: radial-gradient(circle, rgba(8, 5, 20, 1) 0%, rgba(6, 1, 20, 1) 35%, rgba(0, 0, 0, 1) 100%);

	#root_bg {
		z-index: -1;
	}
}

canvas {
	z-index: 0;
}
</style>
