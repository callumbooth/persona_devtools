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
			name: "PersonaDevtools",
			// the proper extensions will be added
			fileName: "persona_devtools",
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ["react", "react-dom", "react/jsx-runtime", "msw/browser"],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					react: "React",
					"react-dom": "React-dom",
					"react/jsx-runtime": "jsxRuntime",
				},
			},
		},
	},
	test: {
		globals: true,
	},
});
