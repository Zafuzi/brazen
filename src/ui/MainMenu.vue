<script lang="ts" setup>
import { type Engine } from "excalibur";
import { ref } from "vue";

const props = defineProps<{ engine: Engine }>();
const hidden = ref(false);

function startGame() {
	hidden.value = true;
	props.engine.goToScene("Mining");
}
</script>

<style scoped lang="less">
#MainMenu {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8px;
	gap: 8px;

	backdrop-filter: blur(40px);
	z-index: 999;
}
</style>

<template>
	<div id="MainMenu" :class="{ hid: hidden }">
		<button @click="startGame">Start Game</button>
	</div>
</template>
