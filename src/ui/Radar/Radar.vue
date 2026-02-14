<script lang="ts" setup>
import type { Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { formatDistance, formatNumberFast } from "../../lib/math";
import { Mining } from "../../levels/mining";

const props = defineProps<{ engine: Engine }>();

type RadarAsteroid = {
	id: number;
	ore: string;
	amount: string;
	distance: string;
	active: boolean;
};

const asteroids = ref<RadarAsteroid[]>([]);
const isMiningActive = ref(false);
const MAX_ITEMS = 40;
const isActive = (asteroidId: number, playerSelectedId: number | undefined) => {
	return asteroidId === playerSelectedId;
};

const syncRadar = () => {
	const scene = props.engine.currentScene;
	if (!(scene instanceof Mining)) {
		isMiningActive.value = false;
		asteroids.value = [];
		return;
	}

	isMiningActive.value = true;
	const player = scene.player;
	const playerPos = player.pos;

	asteroids.value = scene.asteroids
		.filter((asteroid) => asteroid.isActive)
		.sort((a, b) => {
			return playerPos.distance(a.pos) - playerPos.distance(b.pos);
		})
		.slice(0, MAX_ITEMS)
		.map((asteroid) => {
			const distance = asteroid.pos.sub(playerPos).magnitude;
			return {
				id: asteroid.id,
				ore: asteroid.ore,
				amount: formatNumberFast(asteroid.amount),
				distance: formatDistance(distance),
				active: isActive(asteroid.id, player.selectedItem?.id),
			};
		});
};

const updateSubscription = props.engine.on("postupdate", syncRadar);
syncRadar();

onBeforeUnmount(() => {
	updateSubscription.close();
});

function clickItem(asteroidId: number) {
	props.engine.emit(
		"selectedItem",
		(props.engine.currentScene as Mining).asteroids.find((a) => a.id === asteroidId),
	);
}
</script>

<template>
	<div v-if="isMiningActive" class="panel radar">
		<div
			@click="clickItem(asteroid.id)"
			v-for="asteroid in asteroids"
			:key="asteroid.id"
			:class="{ radarItem: true, active: asteroid.active }"
		>
			<h3>{{ asteroid.ore }}</h3>

			<div>
				<p>
					<strong>{{ asteroid.amount }}</strong>
				</p>

				<p>
					<strong>{{ asteroid.distance }}</strong>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.radar {
	position: absolute;
	bottom: 20px;
	right: 20px;

	max-height: 300px;
	max-width: 300px;
	width: 100%;

	overflow: auto;

	display: flex;
	align-items: center;
	justify-content: start;
	flex-flow: column;
	gap: 8px;

	align-self: end;
	padding-right: 8px;

	.radarItem {
		width: 100%;

		display: grid;
		align-items: center;

		grid-template-columns: 1fr 1fr;

		padding: 8px;
		cursor: pointer;
		border-radius: 8px;

		user-select: none;

		&.active {
			background-color: var(--primary);
		}

		&:hover {
			opacity: 0.8;
		}
	}
}
</style>
