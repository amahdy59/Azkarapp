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
      // Both plugins are load-bearing: the app is React, and Tailwind compiles
      // the entire design system. (This previously claimed Tailwind "is not
      // being actively used" — a leftover from the Figma Make scaffold that was
      // actively misleading. DEC-070 / F36.)
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
            // The Mushaf page data now ships with the app, so no api.quran.com
            // route is needed. The QCF page fonts are stored explicitly by
            // src/app/content/qcfMushaf.ts in `azkar-qcf-fonts-v1`, which works
            // before the service worker has ever activated.
            {
              urlPattern: /\/data\/mushaf\/\d+\.json(\?.*)?$/,
              handler: "CacheFirst" as const,
              method: "GET" as const,
              options: {
                cacheName: "azkar-mushaf-v3",
                expiration: { maxEntries: 604, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
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
      modulePreload: {
        // Vite's default preloads every async chunk it can see from the
        // entry, including ones only ever reached through `loadAudioModule()`
        // — a deliberately deferred, on-demand load (see src/app/audio/lazyAudio.ts).
        // Left alone, the browser fetches its ~480KB before a reader has
        // asked for audio at all, defeating the point of deferring it.
        resolveDependencies: (_filename, deps) => deps.filter((dep) => !dep.includes("/audio-")),
      },
      rollupOptions: {
        output: {
          // A function, not the `{ name: [files] }` shorthand: that form
          // forces every dependency those files pull in — including ones
          // shared with unrelated code, like React/Radix internals — into
          // the named chunk too, which then makes other, otherwise-unrelated
          // chunks import from it just to reach that shared code. Naming
          // only the two audio entry points here lets Rollup's own
          // shared-chunk logic place their exclusive dependencies (the
          // manifest, the reducer) alongside them and keep genuinely shared
          // code out.
          manualChunks(id) {
            if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "vendor";
            /*
             * The corpus is its own chunk because two very different parts of
             * the app need it.
             *
             * Unnamed, Rollup folded `content/azkar.ts` into the `audio`
             * chunk below — and `state.ts`, which the entry loads to read the
             * stored appearance, imports the corpus to validate saved ids. So
             * the entry statically imported the audio chunk, and every visitor
             * downloaded the audio manifest and player before asking for a
             * sound: 121 kB gzip of the 250 kB initial budget, with the
             * lazy-audio module and the modulePreload filter above both
             * carefully deferring a chunk that had already been fetched.
             * Naming it here separates what the entry truly needs (the azkar)
             * from what it does not (audio), and takes the initial route from
             * ~250 kB gzip to ~196 kB.
             */
            if (id.endsWith("/src/app/content/azkar.ts")) return "content";
            if (id.includes("node_modules/motion")) return "motion";
            if (id.endsWith("/src/app/audio/AudioProvider.tsx") || id.endsWith("/src/app/audio/buildPlaybackPlan.ts")) {
              return "audio";
            }
          },
        },
      },
    },
  };
});
