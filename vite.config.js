import { preact } from "@preact/preset-vite";
import { defineConfig } from "vite";

const tiledPlugin = () => {
	return {
		name: "tiled-tileset-plugin",
		resolveId: {
			order: "pre",
			handler(sourceId, importer, options) {
				if (!sourceId.endsWith(".tsx")) return;
				return { id: "tileset:" + sourceId, external: "relative" };
			},
		},
	};
};

export default defineConfig({
	base: "./",
	plugins: [tiledPlugin(), preact()],
	optimizeDeps: {
		exclude: ["excalibur"],
	},
	build: {
		assetsInlineLimit: 0,
		sourcemap: true,
		rollupOptions: {
			output: {
				format: "umd",
			},
		},
	},
});
