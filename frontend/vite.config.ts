import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  base: "/",
  build: {
    outDir: "build",
  },
  resolve: {
    alias: {
      "@kodewords/shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  plugins: [
    react(),
    cloudflare(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,ttf,woff,woff2}"],
      },
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png", "assets/**/*.*"],
      manifest: {
        name: "kodewords",
        short_name: "kodewords",
        description: "A fun word game.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        scope: "/kodewords/",
        start_url: "/",
        icons: [
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
