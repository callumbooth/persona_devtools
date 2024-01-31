/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tsconfigPaths(), dts({ rollupTypes: true })],
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, "src/main.ts"),
			name: "@persona-ui/seeding",
			// the proper extensions will be added
			fileName: "seeding",
		},
	},

	test: {
		globals: true,
		root: __dirname,
	},
});
