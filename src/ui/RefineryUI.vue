<script setup lang="ts">
import { type Engine } from "excalibur";
import { onBeforeUnmount, ref, type Ref } from "vue";
import type { Player } from "../actors/player";
import type { Station } from "../actors/station";
import type { Mining } from "../levels/mining";
import { formatAmount } from "../lib/math";
import { type SavedStation } from "../lib/save";

type InventoryItem = {
	name: string;
	amount: number;
};

const props = defineProps<{ engine: Engine; toggleRefinery: Function }>();
function goMining() {
	hotSave();
	props.toggleRefinery();
}

const player: Ref<Player | undefined> = ref();
const stations: Ref<Station[] | undefined> = ref([]);
const inventory: Ref<InventoryItem[]> = ref([]);
const refinery: Ref<SavedStation | undefined> = ref();

const syncRefinery = () => {
	const scene = props.engine.currentScene as Mining;
	player.value = scene.player;
	stations.value = scene.stations;

	inventory.value = [];
	Array.from(player.value.inventory).map((item) => {
		inventory.value.push({
			name: item[0],
			amount: item[1],
		});
	});

	inventory.value = inventory.value.sort((a: any, b: any) => {
		return b.amount - a.amount;
	});

	refinery.value = stations.value.find((station) => station.name === "Refinery");
};

const updateSubscription = props.engine.on("postupdate", syncRefinery);
syncRefinery();

onBeforeUnmount(() => {
	hotSave();
	updateSubscription.close();
});

function refineItem(item: InventoryItem) {
	const refine = {
		ore: item.name,
		amount: item.amount,
		startAmount: item.amount,
		refined: 0,
	};

	const inventoryItemIndex = inventory.value.findIndex(({ name }) => name === item.name);

	if (player.value && inventoryItemIndex !== undefined && inventoryItemIndex > -1) {
		const station = stations.value?.filter((station) => station.name === "Refinery")[0];
		const existing = station?.refining.find((block) => {
			return block.ore === item.name;
		});

		if (existing) {
			existing.amount += refine.amount;
			existing.startAmount += refine.startAmount;
		} else {
			station?.refining.push(refine);
		}

		player.value.inventory.delete(item.name);
	}

	hotSave();
}

function hotSave() {
	const scene = props.engine.currentScene as Mining;
	scene.autosave();
}
</script>

<template>
	<div class="panel refinery">
		<button @click="goMining">Un-Dock</button>

		<div class="player_inventory">
			<div class="player_inventory_container">
				<div class="player_inventory_item" v-for="item in refinery?.refining" :key="item.ore">
					<p>{{ item.ore }}</p>
					<p>{{ formatAmount(item.refined) }} / {{ formatAmount(item.startAmount) }}</p>
					<p>{{ Math.floor((item.refined / item.startAmount) * 100) }}%</p>
				</div>
			</div>
		</div>

		<div class="player_inventory">
			<div class="player_inventory_container">
				<div @click="refineItem(item)" class="player_inventory_item" v-for="item in inventory" :key="item.name">
					<p>{{ item.name }}</p>
					<p>{{ formatAmount(item.amount) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
.refinery {
	position: absolute;
	top: var(--inset-top);
	left: var(--inset-left);
	right: var(--inset-right);
	bottom: var(--inset-bottom);

	display: flex;
	flex-direction: column;
	gap: 8px;

	align-items: start;
	justify-content: start;

	padding: 8px;

	.player_inventory {
		width: 100%;
		height: 100%;

		display: flex;
		flex-flow: column;

		gap: 8px;

		h3 {
			width: 100%;
			margin: 0 auto;
			color: white;
			text-align: center;
		}

		.player_inventory_container {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
			overflow-y: auto;
			overflow-x: hidden;

			gap: 8px;
			padding-right: 8px;
		}

		.player_inventory_item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 8px;
			border: 2px solid var(--primary);
			color: var(--primary-text);

			cursor: pointer;
			user-select: none;

			&.active,
			&:hover {
				border-color: transparent;
				background-color: var(--primary);
				color: white;
			}
		}
	}
}
</style>
