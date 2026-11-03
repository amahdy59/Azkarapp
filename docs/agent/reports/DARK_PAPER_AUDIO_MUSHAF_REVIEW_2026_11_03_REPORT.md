# Phase Report — Dark paper and audio/Mushaf review

## Objective

Make dark paper slightly more visible locally and provide recommendations grounded in the existing audio and Mushaf implementation. Preserve all preceding pending changes; no commit, push or deployment.

## Scope completed

- Increase the existing dark/Glass tile's quantized alpha by a 1.35 calibration factor, keeping the same fine texture and transfer size.
- Inspect the expanded audio footer, font/cache ownership, prefetch scheduling and Downloads status/download paths.
- Keep audio layout and Mushaf architecture proposals as recommendations in this checkpoint.

## Files changed

- `scripts/generate-paper-grain.mjs`, `scripts/paper-grain-assets.test.mjs`
- `src/assets/paper-grain-dark.png`, `src/styles/theme/paper-grain.css`
- `e2e/paper-grain.spec.ts`
- `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`
- `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`
- This report and `docs/agent/phases/DARK_PAPER_AUDIO_MUSHAF_REVIEW_2026_11_03.md`

The preceding optional-update/Masbaha modifications remain pending separately; this list describes only the latest checkpoint.

## Components added or modified

No component changes. Reuse the static paper surface material and existing theme/reader ownership.

## User-visible changes

Dark, Midnight, independent dark/OLED Mushaf colors and existing shared Glass surfaces receive slightly stronger fine grain. The dark tile stays 7,358 bytes; the accepted light tile remains byte-identical at 6,277 bytes (SHA-256 `BD36AFCF192445A891857D943E328EEC4EE13E81CDC70B018674FDF198631BA7`). Combined assets remain 13,635 bytes, below the unchanged 14KB ceiling. Pixel-weighted dark alpha rises from 8.940/255 to 11.920/255, exactly one third stronger; peak dark alpha rises from 15/255 to 20/255. There is no added request, live filter, blend overlay or animation.

## Accessibility work

Retain Paper texture off, app Reduce transparency, high contrast, forced colors and print precedence. Existing browser assertions cover stable geometry, keyboard switch operation, enlarged labels and targeted axe scans. These checks do not establish complete accessibility compliance or physical-device aesthetic acceptance.

## Tests added or updated

- Bound actual pixel-weighted dark alpha to 11–13/255 and peak alpha to 18–20/255, retaining neutral palette, dimensions, light-paper checks and asset ceiling.
- Expand the independent Mushaf theme regression to light, dark, Midnight and OLED with a light app theme. Retain the exactly-one-paper-layer assertion and overflow check.
- Exercise the existing light/dark/Midnight solid/Glass, Home surface and bilingual enlarged switch regressions across three browser engines.

## Commands run

| Command                                                                                                                                                                         | Result                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `node scripts/generate-paper-grain.mjs`                                                                                                                                         | Passed; dark 7,358 bytes, light 6,277 bytes, both peak alpha 20/255. Light hash unchanged.                                                                                                       |
| `pnpm exec vitest run scripts/paper-grain-assets.test.mjs`                                                                                                                      | 1 test passed.                                                                                                                                                                                   |
| `pnpm test:e2e e2e/paper-grain.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/playwright/dark-paper-verified` | 42 passed in 363.7 seconds; zero failed, skipped or flaky cases. Evidence: `output/dark-paper-browser-verified.json` and matching log.                                                           |
| `pnpm check`                                                                                                                                                                    | All stages passed in 175.5 seconds, including coverage, type safety, lint, format, content/timing checks, CSS utilities and unchanged bundle budgets. Evidence: `output/dark-paper-quality.log`. |
| `pnpm build:pages`                                                                                                                                                              | Passed, including existing bundle and CSS checks. Evidence: `output/dark-paper-pages.log`.                                                                                                       |
| Local preview build                                                                                                                                                             | Passed using the isolated loopback API fixture at port 4197. Evidence: `output/dark-paper-preview-build.log`.                                                                                    |

The first expanded browser diagnostic used the wrong nesting for the seeded Mushaf preference (`settings.mushafTheme` rather than top-level `mushafTheme`). Its independent-theme assertions correctly failed; correct the fixture and retain all assertions. No product theme defect was found. Preserve the diagnostic in `output/dark-paper-browser.log`; final evidence uses the `dark-paper-browser-verified` prefix.

## Visual/manual evidence

Normal-zoom screenshots are generated in `output/playwright/dark-paper-verified/` for each theme/material and independent Mushaf color. Enlarged Arabic/English switch evidence is included. Visually inspected the Midnight/Glass Progress screen and OLED Mushaf page: grain is visible, text stays sharp and the paper has no extra layer. Example evidence:

- `output/playwright/dark-paper-verified/paper-grain-static-paper-grain-midnight-glass-cross-browser-desktop-chromium/grain-midnight-glass.png`
- `output/playwright/dark-paper-verified/paper-grain-Mushaf-oled-pa-7facc--shared-grain-cross-browser-desktop-chromium/mushaf-grain-oled.png`

The preview is refreshed at `http://127.0.0.1:4197/`; accepting or deferring an update remains the reader's choice. The preview is a local test build, not a deployment.

## Documentation updated

Design/quality calibration, active phase pointer, owner decision and this phase report. Canonical content, audio behavior and download contracts are unchanged.

## Decisions recorded

Owner-requested modest dark-paper strength; local-only implementation. Audio and Mushaf suggestions below are proposed follow-up scopes, not implemented changes or measured performance gains.

## Known limitations or remaining risks

The shared dark tile also paints Glass surfaces, including Glass within a light app theme; those surfaces receive the same opacity increase. The accepted light tile itself is unchanged. Physical screens, glare and viewing angle can change perceived strength. Browser/asset checks do not replace owner review on the photographed tablet.

## Out-of-scope findings

### Recommended audio footer

`FloatingAudioPlayer.tsx` currently stacks the seek row, queue row, repetition feedback row and transport/actions row. Its auto-continue switch adds a second visible on/off line. Keep the large central play/pause and equal transport slots, with a single compact context row: `قائمة ١٤/١٤` and `تكرار ١/٣٣`. Preserve short visible words so the two fractions cannot be confused; use full accessible names for each. The queue control still opens the existing portalled queue sheet. Make repetition detail an opener for the existing repeat options rather than repeating the prescribed total in another line. Display only applicable metadata.

Use a single-line switch labelled `التالي تلقائياً` / `Play next`, retaining its fixed label, `aria-checked` state and accessible explanation. This accurately describes queue continuation; it must remain separate from repeating the current dhikr. Remove the redundant visible on/off sentence. Keep 44px targets, focus and non-color state feedback. Move timer/speed/voice details to the existing audio options; show a compact indicator while a timer is active. On phones, allow context controls to reflow into two deliberate rows instead of shrinking text or hiding every label. Preserve logical keyboard and RTL order, locked-player behavior and single-provider ownership. The [WAI switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) requires a stable label across state changes.

### Recommended Mushaf priorities

Already implemented: local canonical page JSON, per-page WOFF2 Cache Storage, deduplicated in-flight work, saved-page warm-up, next/previous prefetch with Data Saver restraint, selected-page/full downloads, validation, cancellation/resume, storage estimates and an explicit persistence request. Keep these rather than adding another cache layer or changing the reference typography.

1. **Make Downloads status cheaper.** `getMushafDownloadStatus` enumerates 604 pages and reads/validates every cached JSON/font body on each refresh; `DownloadsPanel.refreshStatus` waits for it alongside the audio audit before displaying the combined result. Profile with a fully cached Mushaf on Android. Consider a versioned verification index and independent incremental status panels: show an immediate previous summary as “checking”, then verify current cache entries in cancellable background batches. Record success only after completed validated writes, reconcile deletions/version changes and retain validation on actual reads. Never label stale presence as verified offline readiness.
2. **Prioritize the visible page.** The downloader has eight workers, each potentially fetching both JSON and a font, while reader look-ahead can request more fonts. Add a shared scheduler that prioritizes the current spread, then the next turn, then selected/full downloads and distant look-ahead. Measure a lower/adaptive background limit on constrained phones, pause obsolete speculative work and preserve consumer-safe promise ownership. Do not cancel a request still needed by the reader or silently stop an explicit download when the tab hides.
3. **Bound decoded-font memory.** JSON has a 128-page memory cap, but loaded `FontFace` objects and injected font rules accumulate for the session. Profile a long reading session before adding a small decoded-font LRU around the visible spread and nearby turns. Evict only unused decoded faces/rules, keeping validated offline bytes and a correct reload path. Test quick backtracking and facing pages before changing this boundary.
4. **Improve download clarity.** Replace the flat 224KB/page estimate with a versioned asset-size manifest when practical; report completed pages and actual bytes separately, and retain partial progress/retry. Existing selected-page downloads and storage protection should remain discoverable. Persistent storage is browser-controlled, so do not promise downloads can never be evicted; [MDN documents that the request can be denied](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).

Before implementation, collect cold-open, cached-open and next-turn p50/p95 times, font request counts/bytes, complete-download time and decoded-memory growth on the Android tablet and a constrained phone. These are code-inspection hypotheses, not measured device bottlenecks. Whole-Quran packaging, service-worker replacement or religious-source/font changes are unnecessary for this first performance pass.

## Recommended next step

Review the dark-paper screenshots and the compact audio-footer proposal. Implement audio layout separately, preserving repetition versus queue semantics, then benchmark Downloads status and foreground font scheduling before selecting a Mushaf performance change. Keep the local-only instruction until the owner changes it.
