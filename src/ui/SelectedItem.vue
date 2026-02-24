<script setup lang="ts">
import { Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Asteroid } from "../actors/asteroid";
import { Mining } from "../levels/mining";
import { formatAmount, formatDistance } from "../lib/math";

const props = defineProps<{ engine: Engine; toggleRefinery: Function }>();
const isMiningActive = ref(false);
const selected = ref();

const syncSelected = () => {
	const scene = props.engine.currentScene;
	if (!(scene instanceof Mining)) {
		isMiningActive.value = false;
		return;
	}

	isMiningActive.value = true;
	const pl = scene.player.selectedItem;
	if (pl) {
		let name = pl.name;
		let amount;
		let distance = formatDistance(pl.pos.distance(scene.player.pos));

		if (pl instanceof Asteroid) {
			name = pl.ore;
			amount = formatAmount(pl.amount);
		}

		selected.value = {
			type: pl.constructor.name,
			name,
			amount,
			distance,
			rawDistance: pl.pos.distance(scene.player.pos),
		};
	}
};

const updateSubscription = props.engine.on("postupdate", syncSelected);
syncSelected();

onBeforeUnmount(() => {
	updateSubscription.close();
});

function canInterface() {
	return selected.value.rawDistance < 500 && selected.value.type === "Station";
}

function dockToStation() {
	const scene = props.engine.currentScene as Mining;
	scene.player.dockTo(selected.value);
	props.toggleRefinery();
}
</script>

<template>
	<div v-if="selected" class="panel selectedItem">
		<h2>{{ selected.name }}</h2>
		<p class="selectedItem_amount" v-if="selected.amount">{{ selected.amount }}</p>
		<p class="selectedItem_distance">{{ selected.distance }}</p>
		<div v-if="canInterface()">
			<button class="button button-primary" @click="dockToStation">Dock</button>
		</div>
	</div>
</template>

<style lang="less">
.selectedItem {
	position: absolute;
	overflow: auto;

	display: flex;
	align-items: center;
	justify-content: center;
	flex-flow: column;
	gap: 8px;
	padding: 8px;

	top: var(--inset-top);
	left: var(--inset-left);

	height: 200px;
	width: 200px;

	border-radius: var(--rounding);

	h2 {
		font-size: 2rem;
		text-align: center;
	}

	.selectedItem_amount {
		font-weight: bold;
	}

	.selectedItem_distance {
		font-size: 2rem;
	}
}
</style>
