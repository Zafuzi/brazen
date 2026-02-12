import { Signal } from "@preact/signals";
import { Actor } from "excalibur";
import { Asteroid } from "../../actors/asteroid";
import { Player } from "../../actors/player";
import "./radar.css";

type RadarProps = {
	actors: readonly Actor[];
	player: Player;
	tick: Signal<boolean>;
};

export const Radar = ({ actors, player, tick }: RadarProps) => {
	tick.value; // 👈 subscribe

	const sorted = Array.from(actors)
		.filter((a) => a instanceof Asteroid && a.isActive)
		.sort((a, b) => a.pos.distance(player.pos) - b.pos.distance(player.pos))
		.slice(0, 50);

	return (
		<div className="radar">
			<h2>RADAR</h2>
			<div>
				{sorted.map((actor) => (
					<RadarAsteroid key={actor.id} asteroid={actor as Asteroid} player={player} />
				))}
			</div>
		</div>
	);
};

const RadarAsteroid = ({ asteroid, player }: { asteroid: Asteroid; player: Player }) => {
	const onItemClick = () => {
		player.selectItem(asteroid);
	};

	return (
		<p className="radar_item" onClick={onItemClick}>
			Asteroid: {asteroid.pos.distance(player.pos).toFixed(0)}px - {asteroid.ore}
		</p>
	);
};
