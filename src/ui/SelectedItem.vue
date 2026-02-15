<script setup lang="ts">
import { Engine } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { formatAmount, formatDistance, formatNumberFast } from "../lib/math";
import { onBeforeUnmount, ref } from "vue";
import { Mining } from "../levels/mining";

const props = defineProps<{ engine: Engine }>();
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
			name,
			amount,
			distance
		};
	}
};

const updateSubscription = props.engine.on("postupdate", syncSelected);
syncSelected();

onBeforeUnmount(() => {
	updateSubscription.close();
});
</script>

<template>
	<div v-if="selected" class="panel selectedItem">
		<h3>{{ selected.name }}</h3>
		<p class="selectedItem_amount" v-if="selected.amount">{{ selected.amount }}</p>
		<p class="selectedItem_distance">{{ selected.distance }}</p>
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

	top: 20px;
	right: 20px;

	height: 200px;
	width: 200px;

	border-radius: 50%;

	h3 {
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