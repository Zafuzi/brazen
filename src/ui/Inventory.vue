<script setup lang="ts">
import { Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import type { Player } from "../actors/player";
import { Mining } from "../levels/mining";
import { formatAmount } from "../lib/math";
import { config } from "../main";

const props = defineProps<{ engine: Engine; player?: Player; open?: boolean }>();
const inventory = ref<{ name: string; amount: number }[]>([]);
const isOpen = ref(props.open ?? false);

const width = ref(config.inventory.width);
const height = ref(config.inventory.height);

const syncInventory = () => {
	const scene = props.engine.currentScene;
	const player: Player | undefined = props.player ?? (scene as Mining).player;

	if (!player) {
		return;
	}

	inventory.value = [];
	Array.from(player.inventory).map((item) => {
		inventory.value.push({
			name: item[0],
			amount: item[1],
		});
	});

	inventory.value = inventory.value.sort((a, b) => {
		return b.amount - a.amount;
	});
};

const updateSubscription = props.engine.on("postupdate", syncInventory);
syncInventory();

onBeforeUnmount(() => {
	updateSubscription.close();
});
</script>

<template>
	<div :class="{ panel: true, player_inventory: true, open: isOpen }">
		<h3 @click="isOpen = !isOpen">Inventory</h3>
		<div class="panel player_inventory_container">
			<div class="player_inventory_item" v-for="item in inventory" :key="item.name">
				<p>{{ item.name }}</p>
				<p>{{ formatAmount(item.amount) }}</p>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
.player_inventory {
	position: absolute;
	bottom: var(--inset-bottom);
	left: var(--inset-left);

	max-width: v-bind(width);
	height: v-bind(height);

	width: 100%;

	display: flex;
	flex-flow: column;

	gap: 8px;

	&:not(.open) {
		height: min-content;
		.player_inventory_container {
			display: none;
			visibility: hidden;
			height: 0;
		}
	}

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
</style>
