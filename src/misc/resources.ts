import { DefaultLoader, ImageSource, Sound } from "excalibur";

export const Resources = {
	Background: new ImageSource("./milky-way.jpg"),

	Ship: new ImageSource("./ships/ship_b.png"),

	Thrust_purple: new ImageSource("./effects/thrust_purple.png"),
	Thrust_yellow: new ImageSource("./effects/thrust_yellow.png"),
	Thrust_red: new ImageSource("./effects/thrust_red.png"),
	Thrust_blue: new ImageSource("./effects/thrust_blue.png"),

	ThrustSound: new Sound("./sounds/thrust.wav"),

	Station_00: new ImageSource("./stations/station_a.png"),
	Station_01: new ImageSource("./stations/station_b.png"),
	Station_02: new ImageSource("./stations/station_c.png"),

	Asteroid_00: new ImageSource("./asteroids/asteroid_a.png"),
	Asteroid_01: new ImageSource("./asteroids/asteroid_b.png"),
	Asteroid_02: new ImageSource("./asteroids/asteroid_c.png"),
	Asteroid_03: new ImageSource("./asteroids/asteroid_d.png"),
	Asteroid_04: new ImageSource("./asteroids/asteroid_e.png"),
	Asteroid_05: new ImageSource("./asteroids/asteroid_f.png"),
	Asteroid_06: new ImageSource("./asteroids/asteroid_g.png"),
	Asteroid_07: new ImageSource("./asteroids/asteroid_h.png"),

	Star_00: new ImageSource("./stars/star_a.png"),
	Star_01: new ImageSource("./stars/star_b.png"),
	Star_02: new ImageSource("./stars/star_c.png"),
	Star_03: new ImageSource("./stars/star_d.png"),
} as const;

export const loader = new DefaultLoader();
for (const res of Object.values(Resources)) {
	loader.addResource(res);
}
