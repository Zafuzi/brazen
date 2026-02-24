import { createApp } from "vue";
//@ts-ignore
import App from "./App.vue";

export const config = {
	inventory: {
		width: "300px",
		height: "300px",
	},
	refinery: {
		show: false,
	},
};

createApp(App).mount("#app");
