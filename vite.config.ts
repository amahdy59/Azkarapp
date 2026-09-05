import { defineConfig, loadEnv, type Plugin } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";
import { AUDIO_MANIFEST_VERSION } from "./src/app/audio/audioManifest";

/**
 * The release this build is, stamped in at build time.
 *
 * The app fetches `release-notes.json` from the network while its own code comes
 * from the service-worker precache, so without this it could only ever compare
 * the deployed release against the last one a reader had dismissed — and a
 * reader still running last week's bundle was told "the app has been
 * updated" about a version they had not received. Knowing its own stamp lets
 * it tell "here is what you just got" from "here is what is waiting for you".
 */
function currentRelease(): string {
  try {
    const notes = JSON.parse(readFileSync("public/release-notes.json", "utf8")) as { release?: string };
    return typeof notes.release === "string" ? notes.release : "";
  } catch {
    return "";
  }
}

/**
 * Unwraps Tailwind's `color-mix` progressive-enhancement guards.
 *
 * Tailwind v4 emits every colour with an opacity modifier twice: a plain
 * fallback, then the same selector inside
 * `@supports (color: color-mix(in lab, red, red))` carrying the mixed value.
 * In this bundle that is 207 guards — 9.3 kB of pure wrapper syntax around
 * 19.9 kB of declarations, a fifth of the stylesheet spent on braces.
 *
 * Removing the wrapper changes nothing about which rule applies. A browser
 * that cannot parse `color-mix` drops that one declaration and keeps the
 * fallback emitted above it, which is exactly what the guard achieved; a
 * browser that can parse it applies the later rule, as it did inside the
 * guard. No support matrix has to be chosen for this to be safe — and that
 * matters, because the app's own hand-written CSS already uses `color-mix`
 * in eleven files, so the guards were protecting browsers that were never
 * going to render this app correctly anyway.
 *
 * Nested at-rules are preserved: the unwrapped rules stay inside whatever
 * media or supports block contained the guard, because the scan matches
 * braces rather than assuming top level.
 */
function unwrapColorMixGuards(): Plugin {
  const GUARD = /@supports\s*\(color:\s*color-mix\(in lab,\s*red,\s*red\)\)\s*\{/g;

  function unwrap(css: string) {
    let out = "";
    let index = 0;
    let removed = 0;
    GUARD.lastIndex = 0;

    for (let match = GUARD.exec(css); match; match = GUARD.exec(css)) {
      const bodyStart = match.index + match[0].length;
      let depth = 1;
      let cursor = bodyStart;
      for (; cursor < css.length && depth > 0; cursor++) {
        if (css[cursor] === "{") depth += 1;
        else if (css[cursor] === "}") depth -= 1;
      }
      // An unbalanced guard means the format changed under us; leave it alone.
      if (depth !== 0) continue;

      out += css.slice(index, match.index) + css.slice(bodyStart, cursor - 1);
      index = cursor;
      removed += 1;
      GUARD.lastIndex = index;
    }

    return { css: out + css.slice(index), removed };
  }

  return {
    name: "azkar:unwrap-color-mix-guards",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) continue;
        const source = typeof asset.source === "string" ? asset.source : Buffer.from(asset.source).toString("utf8");
        const { css, removed } = unwrap(source);
        if (removed > 0) asset.source = css;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isGithubPages = mode === "github-pages";
  const appBase = isGithubPages ? "/Azkarapp/" : "/";
  const audioBaseUrl = loadEnv(mode, process.cwd(), "").VITE_AUDIO_BASE_URL?.replace(/\/+$/, "");
  const audioUrlPattern = audioBaseUrl
    ? new RegExp(`^${audioBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`)
    : undefined;

  return {
    base: appBase,
    define: { __APP_RELEASE__: JSON.stringify(currentRelease()) },
    plugins: [
      // Both plugins are load-bearing: the app is React, and Tailwind compiles
      // the entire design system. (This previously claimed Tailwind "is not
      // being actively used" — a leftover from the Figma Make scaffold that was
      // actively misleading. DEC-070 / F36.)
      react(),
      tailwindcss(),
      unwrapColorMixGuards(),
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
