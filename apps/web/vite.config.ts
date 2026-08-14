import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// SPA served by nginx in prod; /api/* and /og/* proxied to the API.
// Local dev proxies to the Fastify API on :4000.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:4000",
      "/og": "http://localhost:4000",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
