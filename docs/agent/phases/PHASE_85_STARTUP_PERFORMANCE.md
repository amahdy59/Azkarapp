# Phase 85 — Startup performance

## Objective and plan

Reduce avoidable startup work on slower phones while preserving offline reading, downloaded recordings and persisted progress. Inspect the production dependency graph, record a cold Home opening under six-times CPU throttling and a 200 kB/s connection, defer optional cache maintenance until the application has painted, avoid loading audio catalogues when there are no downloads to maintain, and repeat the same measurement. Add scheduling and browser regressions, run release gates and monitor deployment.

## Baseline evidence

The initial throttled opening took 13,903 ms. Its resource trace included audioOfflineCache, the full audio controller, audio-core and audio-duas although no playback was requested. This is a desktop-browser simulation, not a physical Android benchmark.

## Scope completed

App initializes persisted state once per mount, warms audio at playback-capable screen entry, and preserves explicit retry requests. StartupMaintenance waits for a frame and an idle slot, performs lightweight QCF cleanup, and imports downloaded-audio maintenance only when bookkeeping/cache evidence exists. Main uses the shared localized ScreenFallback while application code is pending. No dependency, content, persistence schema, prayer calculation or service-worker update policy changed.

## Files and components

Modified main.tsx, App.tsx and isolatedSuites.ts; added startupMaintenance.ts and its tests, plus startup-performance.spec.ts. Architecture/audio contracts and the agent index document the startup boundary.

## Accessibility and evidence

Loading feedback reuses ScreenFallback's localized status/busy semantics and existing theme/reduced-motion rules. Reader Listen exposes its pending state with aria-busy. Existing audio controls and the single controller retain their native keyboard/pointer behavior. Throttled openings after optimization recorded 5,738 ms and 6,222 ms versus 13,903 ms initially. Audio catalogue/player requests were absent from Home opening. This observation is approximately 55–59% faster in this desktop simulation, not a guaranteed physical-device improvement; host load and browser scheduling vary.

## Tests and commands

New unit tests cover fresh/downloaded/corrupt registries, deferred cleanup and cancellation. Browser tests exercise throttled Home, delayed application code and an early Listen request. Arabic/English playback requests retain their selected language while waiting for the controller. A test caught ordinary Reader clicks being ignored during audio loading; the request boundary was repaired rather than relaxing its assertion. The final audio-integrity matrix passed 24 tests across Chromium, Firefox and WebKit in 3.1 minutes. The earlier spacing/Baqarah/performance matrix passed seven tests. Complete release-gate results follow in the final release report.

Initial complete-gate failures identified a missing type import, a TypeScript feature-detection narrowing issue and the mandatory isolation entry for the new mocked suite. All were repaired; no checks or thresholds were changed. A subsequent complete non-browser gate passed in 143.1 seconds before the final early-Listen repair. Final exact-snapshot gates run before publication.

The final application-code `pnpm check` passed all eleven stages in 236.0 seconds, including 1,491 unit tests and existing coverage, content, type, lint and bundle checks. The dynamic-viewport fallback regression passed all three engines with exit 0 in 11.6 seconds against an independently built final artifact. The preceding concurrent attempt passed its three assertions but returned exit 1 because a Windows browser worker stalled at teardown; that run is not counted as a successful command.

## Compatibility limitation

The shell previously declared only dynamic viewport heights. Added standard vh fallbacks behind an explicit unsupported-dvh feature guard for app-viewport, the compact shell and the responsive shell; modern browsers continue using dvh. A targeted browser regression activates this guard and removes dynamic-height declarations to verify usable Home and main-canvas dimensions. The first test caught production optimization dropping consecutive fallback declarations; the guard preserves them in shipped CSS. This repairs a concrete compatibility hazard without claiming complete old-engine support.

The owner reports an unidentified Samsung phone running Android 6 or 7 whose installed PWA does not open. The browser version and a reproduction are unavailable. The existing Tailwind 4 contract requires modern browser capabilities; performance improvements alone cannot guarantee compatibility with an obsolete engine. Preserve the approved architecture rather than silently replacing the styling system or claiming old-engine support without evidence.

## Recommended next step

Measure the released application on the affected phone when available. Record the browser version and distinguish website startup from installed-PWA startup.
