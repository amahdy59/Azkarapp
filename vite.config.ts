import { defineConfig, loadEnv } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { AUDIO_MANIFEST_VERSION } from "./src/app/audio/audioManifest";

export default defineConfig(({ mode }) => {
  const isGithubPages = mode === "github-pages";
  const appBase = isGithubPages ? "/Azkarapp/" : "/";
  const audioBaseUrl = loadEnv(mode, process.cwd(), "").VITE_AUDIO_BASE_URL?.replace(/\/+$/, "");
  const audioUrlPattern = audioBaseUrl
    ? new RegExp(`^${audioBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`)
    : undefined;

  return {
    base: appBase,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used - do not remove them.
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["**/*.svg"],
        manifest: {
          name: "Azkar",
          short_name: "Azkar",
          description:
            "A daily Islamic remembrance app for reading, counting, and tracking morning, evening, and before-sleep azkar.",
          theme_color: "#0a1228",
          background_color: "#0a1228",
          display: "standalone",
          id: appBase,
          start_url: appBase,
          scope: appBase,
          shortcuts: [
            {
              name: "Morning Azkar",
              short_name: "Morning",
              description: "Open the morning remembrance collection.",
              url: `${appBase}?category=morning`,
            },
            {
              name: "Evening Azkar",
              short_name: "Evening",
              description: "Open the evening remembrance collection.",
              url: `${appBase}?category=evening`,
            },
            {
              name: "Before Sleep Azkar",
              short_name: "Sleep",
              description: "Open the before-sleep remembrance collection.",
              url: `${appBase}?category=before_sleep`,
            },
          ],
          icons: [
            {
              src: "192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,webp,avif,woff2}"],
          // Only real exclusions belong here. The rest of this list used to name
          // uncompressed masters, design sources and superseded imagery that no
          // code path referenced — keeping them out of the precache while still
          // deploying ~24 MB of them. Those files now live in design-sources/ or
          // are gone entirely (DEC-066 / F24), so naming them here would be dead
          // configuration. Do not re-add an asset here to hide its weight; take
          // it out of public/ instead.
          globIgnores: ["**/FridayModeScreen-*.js"],
          runtimeCaching: [
            {
              urlPattern: /\/assets\/.*\.(?:js|css)$/,
              handler: "StaleWhileRevalidate" as const,
              method: "GET" as const,
              options: {
                cacheName: "azkar-routes-v1",
                expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            ...(audioUrlPattern
              ? [
                  {
                    urlPattern: audioUrlPattern,
                    handler: "CacheFirst" as const,
                    method: "GET" as const,
                    options: {
                      cacheName: `azkar-audio-v${AUDIO_MANIFEST_VERSION}`,
                      rangeRequests: true,
                      // Only explicit verified downloads enter this cache.
                      cacheableResponse: { statuses: [418] },
                    },
                  },
                ]
              : []),
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ["**/*.svg", "**/*.csv"],
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            motion: ["motion"],
            audio: [
              path.resolve(__dirname, "src/app/audio/AudioProvider.tsx"),
              path.resolve(__dirname, "src/app/audio/buildPlaybackPlan.ts"),
            ],
          },
        },
      },
    },
  };
});
