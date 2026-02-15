<script lang="ts" setup>
import { type Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Mining } from "../levels/mining";
import { formatAmount, formatDistance } from "../lib/math";

const props = defineProps<{ engine: Engine }>();

type RadarAsteroid = {
	id: number;
	ore: string;
	amount: string;
	distance: string;
	active: boolean;
};

type RadarStation = {
	id: number;
	name: string;
	distance: string,
	active: boolean
}

const asteroids = ref<RadarAsteroid[]>([]);
const stations = ref<RadarStation[]>([]);

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
		stations.value = [];
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
				amount: formatAmount(asteroid.amount),
				distance: formatDistance(distance),
				active: isActive(asteroid.id, player.selectedItem?.id),
			};
		});

	stations.value = scene.stations
		.filter((station) => station.isActive)
		.sort((a, b) => {
			return playerPos.distance(a.pos) - playerPos.distance(b.pos);
		})
		.slice(0, MAX_ITEMS)
		.map((station) => {
			const distance = station.pos.sub(playerPos).magnitude;
			return {
				id: station.id,
				name: station.name,
				distance: formatDistance(distance),
				active: isActive(station.id, player.selectedItem?.id),
			};
		});
};

const updateSubscription = props.engine.on("postupdate", syncRadar);
syncRadar();

onBeforeUnmount(() => {
	updateSubscription.close();
});

function clickStation(stationId: number) {
	props.engine.emit(
		"selectedItem",
		(props.engine.currentScene as Mining).stations.find((s) => s.id === stationId),
	);
}

function clickAsteroid(asteroidId: number) {
	props.engine.emit(
		"selectedItem",
		(props.engine.currentScene as Mining).asteroids.find((a) => a.id === asteroidId),
	);
}
</script>

<template>
	<div v-if="isMiningActive" class="radar">
		<div class="panel radar_stations">
			<h3>Stations</h3>
			<div @click="clickStation(station.id)" v-for="station in stations" :key="station.id"
				:class="{ radarItem: true, active: station.active }">
				<h3>{{ station.name }}</h3>

				<div class="radarItem_content">
					<p>
						<strong>{{ station.distance }}</strong>
					</p>
				</div>
			</div>
		</div>

		<div class="panel radar_asteroids">
			<h3>Asteroids</h3>
			<div @click="clickAsteroid(asteroid.id)" v-for="asteroid in asteroids" :key="asteroid.id"
				:class="{ radarItem: true, active: asteroid.active }">
				<h3>{{ asteroid.ore }}</h3>

				<div class="radarItem_content">
					<p>
						<strong>{{ asteroid.amount }}</strong>
					</p>

					<p>
						<strong>{{ asteroid.distance }}</strong>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.radar {
	position: absolute;
	bottom: 100px;
	right: 20px;

	max-width: 30%;
	width: 100%;

	overflow: hidden;

	display: flex;
	align-items: start;
	justify-content: start;
	flex-flow: column;

	gap: 8px;
	padding: 8px;

	.radar_asteroids,
	.radar_stations {
		display: grid;
		grid-template-columns: 1fr;

		width: 100%;
		margin-bottom: 8px;

		max-height: 300px;
		overflow-y: auto;

		&>h3 {
			padding: 4px;
		}
	}

	.radarItem {
		width: 100%;

		display: grid;
		align-items: center;

		grid-template-columns: 1fr auto;

		padding: 4px 4px 4px 8px;

		user-select: none;
		cursor: pointer;

		&.active {
			background-color: var(--primary);
		}

		&:hover {
			background-color: var(--primary);
			opacity: 0.8;
		}

		.radarItem_content {
			display: flex;
			align-items: end;
			justify-content: center;
			flex-direction: column;
		}
	}
}
</style>
