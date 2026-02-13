import { globals } from "./globals";

export const formatDistance = (px: number): string => {
	const km = px / globals.PIXELS_PER_KM;

	if (km < 1) {
		return `${(km * 1000).toFixed(0)} m`;
	}

	return `${km.toFixed(2)} km`;
};

export const formatVelocity = (pixelsPerSecond: number): string => {
	const kmPerSecond = pixelsPerSecond / globals.PIXELS_PER_KM;

	if (Math.abs(kmPerSecond) < 1) {
		return `${(kmPerSecond * 1000).toFixed(0)} m/s`;
	}

	return `${kmPerSecond.toFixed(2)} km/s`;
};

export const formatAcceleration = (pixelsPerSecondSquared: number): string => {
	const kmPerSecondSquared = pixelsPerSecondSquared / globals.PIXELS_PER_KM;

	if (Math.abs(kmPerSecondSquared) < 1) {
		return `${(kmPerSecondSquared * 1000).toFixed(0)} m/s^2`;
	}

	return `${kmPerSecondSquared.toFixed(2)} km/s^2`;
};

export function formatNumberFast(value: number, decimals = 0, abbreviate = false): string {
	if (!Number.isFinite(value)) return "0";

	const sign = value < 0 ? "-" : "";
	let abs = Math.abs(value);
	let suffix = "";

	if (abbreviate) {
		if (abs >= 1e12) {
			abs /= 1e12;
			suffix = "T";
		} else if (abs >= 1e9) {
			abs /= 1e9;
			suffix = "B";
		} else if (abs >= 1e6) {
			abs /= 1e6;
			suffix = "M";
		} else if (abs >= 1e3) {
			abs /= 1e3;
			suffix = "K";
		}
	}

	const fixed = abs.toFixed(decimals);
	const [intPart, decPart] = fixed.split(".");

	const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return decPart ? `${sign}${withCommas}.${decPart}${suffix}` : `${sign}${withCommas}${suffix}`;
}
