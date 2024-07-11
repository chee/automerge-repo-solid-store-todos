import {defineConfig} from "vite"
import solidPlugin from "vite-plugin-solid"
import devtools from "solid-devtools/vite"
import wasm from "vite-plugin-wasm"
import {VitePWA as pwa} from "vite-plugin-pwa"

export default defineConfig({
	plugins: [
		devtools(),
		solidPlugin(),
		wasm(),
		pwa({
			registerType: "prompt",
			injectRegister: false,
			pwaAssets: {
				disabled: true,
				config: false,
			},
			manifest: {
				name: "todo",
				short_name: "todo",
				description: "my todo items",
				theme_color: "#36f9c0",
				display: "fullscreen",
				background_color: "#ffe9ed",
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,wasm}"],
				cleanupOutdatedCaches: false,
				clientsClaim: true,
				maximumFileSizeToCacheInBytes: 999999999999999,
				additionalManifestEntries: [],
			},
			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: true,
				type: "module",
			},
		}),
	],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
})
