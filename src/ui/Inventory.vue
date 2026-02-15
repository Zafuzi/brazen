<script setup lang="ts">
import { Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Mining } from "../levels/mining";
import { formatAmount } from "../lib/math";

const props = defineProps<{ engine: Engine }>();
const isMiningActive = ref(false);
const inventory = ref<{ name: string, amount: number }[]>([]);

const syncInventory = () => {
	const scene = props.engine.currentScene;
	if (!(scene instanceof Mining)) {
		isMiningActive.value = false;
		return;
	}

	isMiningActive.value = true;

	inventory.value = [];
	Array.from(scene.player.inventory).map((item) => {
		inventory.value.push({
			name: item[0],
			amount: item[1],
		})
	})

	inventory.value = inventory.value.sort((a, b) => {
		return b.amount - a.amount;
	})
};

const updateSubscription = props.engine.on("postupdate", syncInventory);
syncInventory();

onBeforeUnmount(() => {
	updateSubscription.close();
});
</script>

<template>
	<div class="panel player_inventory">
		<h3>Inventory</h3>
		<div class="panel player_inventory_container">
			<div class="player_inventory_item" v-for="item in inventory" :key="item.name">
				<p>{{ item.name }}</p>
				<p>{{ formatAmount(item.amount) }}</p>
			</div>
		</div>
	</div>
</template>

<style lang="less">
.player_inventory {
	position: absolute;
	bottom: 100px;
	left: 20px;

	max-width: 300px;
	height: 300px;

	width: 100%;

	display: flex;
	flex-flow: column;

	gap: 8px;


	h3 {
		margin: 0 auto;
		color: white;
		margin-bottom: 8px;
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
		background-color: var(--primary);
	}
}
</style>