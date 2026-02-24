<script setup lang="ts">
import { type Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Mining } from "../levels/mining";
import { formatNumberFast, formatVelocity } from "../lib/math";

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
		pos: pl.pos,
		fuel: pl.fuel,
		credits: pl.credits,
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
	<div v-if="isMiningActive" class="player_motion">
		<div class="player_motion_row">
			<div class="player_motion_row_data">
				<p>{{ formatNumberFast(player.credits) }} Credits</p>
			</div>
		</div>

		<div class="player_motion_row">
			<div class="player_motion_row_data">
				<p>{{ formatNumberFast(player.fuel) }} Fuel</p>
			</div>
		</div>

		<div class="player_motion_row">
			<div class="player_motion_row_data">
				<p>{{ formatVelocity(player.vel.x) }}</p>
				<p>{{ formatVelocity(player.vel.y) }}</p>
			</div>
		</div>
	</div>
</template>

<style lang="less">
.player_motion {
	position: absolute;
	bottom: var(--inset-bottom);
	left: 50%;
	transform: translateX(-50%);

	height: auto;

	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	text-align: center;
	flex-flow: row nowrap;

	gap: 24px;
	padding: 12px;
	z-index: var(--panel-layer);

	.player_motion_row {
		display: flex;
		flex-flow: column;

		align-items: center;
		justify-content: center;
		text-align: center;

		gap: 8px;

		background-color: color-mix(in srgb, var(--primary) 10%, rgba(0, 0, 0, 0.8));
		color: var(--primary);
		border: 2px solid var(--primary);
		padding: 8px;
		border-radius: 100vw;

		.player_motion_row_data {
			display: flex;
			flex-flow: row wrap;
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
