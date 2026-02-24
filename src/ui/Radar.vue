<script lang="ts" setup>
import { type Engine } from "excalibur";
import { onBeforeUnmount, ref } from "vue";
import { Asteroid } from "../actors/asteroid";
import { Station } from "../actors/station";
import { Mining } from "../levels/mining";
import { formatAmount, formatDistance } from "../lib/math";

const props = defineProps<{ engine: Engine }>();

type RadarAsteroid = {
	id: number;
	ore: string;
	amount: string;
	distance: string;
	active: boolean;
	loaded: boolean;
};

type RadarStation = {
	id: number;
	name: string;
	distance: string;
	active: boolean;
	loaded: boolean;
};

const asteroids = ref<RadarAsteroid[]>([]);
const stations = ref<RadarStation[]>([]);
const actors = ref(0);

const isMiningActive = ref(false);
const isStationsOpen = ref(true);
const isAsteroidsOpen = ref(true);

const MAX_ITEMS = 40;
const isActive = (asteroidId: number, playerSelectedId: number | undefined) => {
	return asteroidId === playerSelectedId;
};

const syncRadar = () => {
	const scene = props.engine.currentScene as Mining;
	actors.value = scene.loaded.keys().toArray().length;

	if (!(scene instanceof Mining)) {
		isMiningActive.value = false;
		asteroids.value = [];
		stations.value = [];
		return;
	}

	isMiningActive.value = true;

	const player = scene.player;
	const playerPos = player.pos;

	asteroids.value = Array.from(scene.streamables)
		.filter((asteroid) => asteroid instanceof Asteroid)
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
				loaded: scene.loaded.has(asteroid),
			};
		});

	stations.value = Array.from(scene.streamables)
		.filter((station) => station instanceof Station)
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
				loaded: scene.loaded.has(station),
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
		<div :class="{ panel: true, radar_stations: true, open: isStationsOpen }">
			<h3 @click="isStationsOpen = !isStationsOpen">Stations</h3>
			<div
				@click="clickStation(station.id)"
				v-for="station in stations"
				:key="station.id"
				:class="{ radarItem: true, active: station.active }"
			>
				<h4>{{ station.name }}</h4>

				<div class="radarItem_content">
					<p>
						<strong>{{ station.distance }}</strong>
					</p>
				</div>
			</div>
		</div>

		<div :class="{ panel: true, radar_asteroids: true, open: isAsteroidsOpen }">
			<h3 @click="isAsteroidsOpen = !isAsteroidsOpen">Asteroids</h3>
			<div class="panel_content">
				<div
					@click="clickAsteroid(asteroid.id)"
					v-for="asteroid in asteroids"
					:key="asteroid.id"
					:class="{ radarItem: true, active: asteroid.active }"
				>
					<h4>
						{{ asteroid.ore }}
						-
						<strong>({{ asteroid.amount }})</strong>
					</h4>

					<div class="radarItem_content">
						<p>
							<strong>{{ asteroid.distance }}</strong>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.radar {
	position: absolute;
	top: var(--inset-top);
	bottom: calc(var(--inset-bottom) + 100px);
	right: var(--inset-right);

	max-width: 30%;
	width: 100%;

	overflow: hidden;

	display: flex;
	align-items: start;
	justify-content: space-between;
	flex-flow: column;

	gap: 4px;
	padding: 4px;

	.radar_asteroids,
	.radar_stations {
		display: grid;
		grid-template-columns: 1fr;

		width: 100%;

		position: relative;

		&:not(.open) {
			.radarItem {
				display: none;
			}
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
