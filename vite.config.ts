import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  plugins: [react(), tailwindcss(), Inspect()],
  server: {
    port: 3000,
    host: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "https://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections
      "/socket.io": {
        target: "https://localhost:8080",
        ws: true,
        changeOrigin: true,
        secure: false,
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
      "@layoutComponents": "/src/shared/components/layoutComponents",
      "@ui": "/src/shared/components/ui",
      "@lib": "/src/shared/lib",
      "@store": "/src/shared/store",
      "@hooks": "/src/shared/hooks",
      "@assets": "/src/assets",
    },
  },
});
