import { DefaultLoader, ImageSource } from "excalibur";

export const Resources = {
	Ship: new ImageSource("./ships/ship_a.png"),
	Station: new ImageSource("./stations/station_a.png"),
} as const;

export const loader = new DefaultLoader();
for (const res of Object.values(Resources)) {
	loader.addResource(res);
}