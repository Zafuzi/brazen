<script setup lang="ts">
import { type Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Mining } from "../levels/mining";
import { formatNumberFast } from "../lib/math";

const props = defineProps<{ engine: Engine }>();
const isMiningActive = ref(false);
const player = ref();

const syncPlayer = () => {
	const scene = props.engine.currentScene;
	if (!(scene instanceof Mining)) {
		isMiningActive.value = false;
		return;
	}

	isMiningActive.value = true;
	const pl = scene.player;
	player.value = {
		vel: pl.vel,
		acc: pl.acc,
		angularVelocity: pl.angularVelocity,
	};
};

const updateSubscription = props.engine.on("postupdate", syncPlayer);
syncPlayer();

onBeforeUnmount(() => {
	updateSubscription.close();
});
</script>

<template>
	<div v-if="isMiningActive" class="panel player_motion">
		<div class="player_motion_row">
			<p>Velocity:</p>
			<div class="player_motion_row_data">
				<p>{{ formatNumberFast(player.vel.x) }}</p>
				<p>{{ formatNumberFast(player.vel.y) }}</p>
			</div>
		</div>

		<div class="player_motion_row">
			<p>Acceleration</p>
			<div class="player_motion_row_data">
				<p>{{ formatNumberFast(player.acc.x) }}</p>
				<p>{{ formatNumberFast(player.acc.y) }}</p>
			</div>
		</div>

		<div class="player_motion_row">
			<p>Angular Velocity</p>
			<div class="player_motion_row_data">
				<p class="grid-fill">{{ formatNumberFast(player.angularVelocity) }}</p>
			</div>
		</div>
	</div>
</template>

<style lang="less">
.player_motion {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;

	height: 80px;

	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	align-items: center;
	text-align: center;
	flex-flow: row nowrap;

	gap: 24px;

	.player_motion_row {
		display: flex;
		flex-flow: column;

		align-items: center;
		justify-content: center;
		text-align: center;

		gap: 8px;

		.player_motion_row_data {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: center;
			justify-content: space-evenly;

			gap: 8px;

			p {
				color: var(--primary);
				padding: 4px;
				font-size: 1.5rem;
			}
		}
	}
}
</style>
