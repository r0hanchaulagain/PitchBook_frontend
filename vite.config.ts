import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: "http://localhost:8080",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": "/src",
			"@features": "/src/features",
			"@layouts": "/src/shared/layouts",
			"@components": "/src/shared/components",
			"@featureComponents": "/src/shared/components/featureComponents",
			"@ui": "/src/shared/components/ui",
			"@lib": "/src/shared/lib",
			"@store": "/src/shared/store",
		},
	},
});



