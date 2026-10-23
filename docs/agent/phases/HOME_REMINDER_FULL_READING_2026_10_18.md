# Phase — Complete Home reminder reading, 2026-10-18

> Verification update, 2026-10-18: the later combined `output/playwright/seamless-quality.log` passed the complete non-browser gate, including unit coverage, lint, types, formatting and bundle checks. Earlier failures and pending-gate statements below are historical. Subsequent gap fixes have their own report: [Session gap closure](SESSION_GAP_CLOSURE_2026_10_18.md). Physical-device and human assistive-technology acceptance remain pending.

## Approved objective

The owner approves the Reading flow sample and requests applying all rotating content locally. Narrations taller than four rendered lines show an ellipsis and an explicit expand/collapse action. The abbreviated meaning expands independently and starts collapsed. Preserve source links, grading, Arabic/English, relevant scheduling and offline reading. The subsequent explicit R2 instruction authorizes publishing the immutable content package to avoid the site output ceiling. Application changes stay local: do not commit, push or deploy the application.

## Plan before editing application code

1. Inventory both the 71 curated sources and 185 eligible corpus fallback entries. Preserve canonical azkar, Quran, repetition counts, stored identities and other pending changes.
2. Keep the existing shared Home card surface and implement measured four-line disclosure with native buttons, native meaning details, source attribution and natural content height. Freeze the displayed reminder while expanded/focused, then resume the existing schedule after reading ends.
3. Add a deferred reading catalogue for complete source text and concise bilingual meanings, with exact reference/quotation-boundary evidence. Reuse existing reviewed canonical duas. Never call an excerpt or a source summary a complete narration, and never attribute an editorial summary to a commentary not actually checked. Under the latest owner authorization, upload a content-addressed R2 package, verify public bytes/CORS and pin URL/size/SHA-256. Cache only verified bytes for offline reads, independently of core service-worker installation.
4. Apply the same reading controls to every curated and fallback path. Keep complete supplied semantic text in the DOM; visual clamping never alters its bytes. Keep Quran quotation/translation separate from commentary and editorial suggestions.
5. Verify content coverage and identity/source fidelity, independent keyboard/pointer expansion, actual four-line overflow at different widths, resizing, language changes, offline use and stable reading across rotation. Run relevant unit/browser specs and the complete non-browser quality gate; produce local screenshots and a structured report.

## Inspection and authority

The current Home selector combines a deferred 41-source baseline, 30 authenticated additions and a 185-record eligible azkar fallback. Some supporting corpus text is a reviewed excerpt or a description and some references use old volume/page numbering. Those need explicit quotation-boundary/source review rather than mechanically labelling existing fields complete. Previous source contracts and canonical content remain authoritative. This phase supersedes excerpt-only presentation for individually verified complete Home readings, not the underlying azkar records.

## Verification and final report

### Objective

Apply the owner-selected Reading flow and complete the Home-only content review.

### Scope completed

- 71 curated sources retain their schedule: 18 Quran records and 53 full hadith/dua readings, all with bilingual brief meanings.
- All 185 original fallback identities have explicit reviewed mappings. 165 map to verified readings; 20 map to authenticated alternatives. The audit records original citations, candidates, reasons and resources. 186 deduplicated reading/meaning records ship in one lossless R2 package; source JSON and the binary remain locally reviewable.
- Canonical azkar/Quran/counts, stored identities, prayer behaviour and optional synchronization are unchanged.

### Files changed

Shared UI: `src/app/components/HomeCards.tsx`, new `ReminderReading.tsx` and its tests. Composition: `src/app/screens/HomeScreen.tsx`, `src/app/dailyEvidence.ts`, existing Home render fixture. Content: new `homeReminderReadings.json`, `homeReminderFallbacks.json`, `homeReminderManifest.json`, `reminderReadings.ts`, its tests and `home-reminder-readings.bin`. Packaging: `scripts/pack-home-reminder-readings.mjs`, `scripts/upload-home-reminder-readings.mjs`, `package.json`, `vite.config.ts`. Copy: deferred Arabic/English reminder i18n. Browser evidence: `e2e/contextual-reminder-plan.spec.ts`. Dated primary/fallback source snapshots and the 185-entry audit live in `docs/agent/evidence/`. Existing R2 CORS documentation adds the local verification origin while preserving all prior rules.

### Components and user-visible behaviour

`ReminderReading` owns independent narration/meaning disclosures and measured four-line overflow. The full semantic narration stays in the DOM. Native ellipsis, font settling, resizing and Arabic/English are supported. Meaning starts closed; Quran is not clamped. Original explanatory prose remains available, with source-derived meaning separate from editorial application. Source links and grading stay visible. The card pins its current source while expanded or focused; explicit Next clears the pin. Companion reports have their own label.

### Accessibility

Native button/details/summary semantics, controlled text IDs, expansion state, 44px targets and visible focus. Browser checks exercise Enter-key activation, independent disclosures, narrow/wide reflow, no horizontal overflow, text preservation, rotation hold and scoped axe scans in three engines. These checks do not establish complete WCAG compliance or replace human assistive-technology review.

### Tests and commands

Targeted initial units: six files, 45 tests passed. The final R2/cache change was checked by three files, 34 tests passed, including network/size/checksum rejection, clean retry, verified offline reads, damaged-cache eviction and denied-storage recovery. The latest full unit/coverage stage passes with 295 files and 2,071 tests; unrelated counter-guidance files were removed by their owning session during this work. The final R2 browser matrix passes all 18 cases across Chromium, Firefox and WebKit. The browser inventory contained 2,058 cases across nine partitions at verification; all partition checks passed.

| Command                                                                                                                                                                      | Result                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm pack:home-reminders`                                                                                                                                                   | Pass: 186 readings, 185 fallback mappings, 91,906 bytes; deterministic manifest matches local source package.                                                                                               |
| `pnpm upload:home-reminders`                                                                                                                                                 | Pass: immutable R2 upload, exact public SHA-256 and CORS for wa-zaker.com, Pages and local preview.                                                                                                         |
| `pnpm exec vitest run src/app/content/reminderReadings.test.ts src/app/components/ReminderReading.test.tsx src/app/screens/HomeScreen.render.test.tsx`                       | Pass: 3 files, 34 tests.                                                                                                                                                                                    |
| `pnpm exec vite build --outDir output/reminder-app-dist` with isolated browser API URL                                                                                       | Pass: catalogue binary absent from deployment output; no bundle budget increase.                                                                                                                            |
| `pnpm exec playwright test e2e/contextual-reminder-plan.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke` with local preview | Pass: 18 cases; `output/reminder-content/r2-browser-complete.json`.                                                                                                                                         |
| `pnpm test:e2e:inventory`                                                                                                                                                    | Pass: 2,058 tests across nine partitions.                                                                                                                                                                   |
| `pnpm check --serial`                                                                                                                                                        | Unit/coverage, build, typecheck, lint, audio/Quran/listening integrity, previews, type/motion rules, bundle and CSS checks pass. Five documentation formatting issues were corrected before the final gate. |
| `git diff --check`                                                                                                                                                           | Pass.                                                                                                                                                                                                       |

Latest complete `pnpm check` attempt: exit 1 solely because formatting flagged `src/app/share/quickRoutineShare.ts`, owned by the concurrent sharing session. All other stages pass, including 295 unit files/2,071 tests, enforced coverage, lint, typecheck, production build, content checks and bundle/CSS limits. Full output: `output/reminder-content/final-stable-check.log`. Earlier checks raced with unrelated counter-guidance files being removed during discovery. This report does not claim a successful complete repository command or release readiness from those interrupted/format-failed runs.

The owner explicitly requests coordination to avoid conflicts and duplicate credits. The active “Polish sharing and header styling” and “Unify zikr footers and text fit” sessions received the completed reminder scope, exact passing/failing gate results, shared-file boundaries and a request to nominate one final shared-gate owner. This session holds further full suites and code edits; the sharing owner handles its formatting. Only this dedicated phase report is being finalized here. No commit, push or application deployment is performed.

The first browser run found a test race: the fixture passed a transient absent identity as an assertion options object. Waiting for a nonempty, changed source identity corrected that test. Later R2 timing exposed a real refresh flicker: Home briefly cleared its verified library selection. It now retains the current verified card until the replacement is ready. The i18n feature dictionary uses its own typed function name; the catalogue's fresh-module tests join the repository isolation list. No assertions, coverage thresholds or bundle ceilings were reduced.

The pinned WebKit's offline flag rejects service-worker responses before the worker can answer, matching [upstream issue 42775](https://github.com/microsoft/playwright/issues/42775). The all-engine outage tests instead start a test-owned loopback origin, install the real app/service worker, cache exact package bytes, stop that origin, block remote HTTPS requests and retain the same reload/first-use assertions. A separate case denies R2 from the start and proves core installation plus first reader use after the origin stops. Original failed traces are retained in `output/reminder-webkit-offline/` and `output/reminder-browser-r2-outage/`; the corrected checks pass without engine skips or retries. Live R2 checksum/CORS are verified separately by the upload command.

### Evidence

Arabic phone and English desktop collapsed/expanded screenshots: `output/reminder-browser-complete/`, with per-engine trace paths on failures. Actual images were inspected, including the final Arabic phone card. The local preview is at http://127.0.0.1:4897/. Verification logs and reports live in `output/reminder-content/`. Source comparison: dated JSON evidence files; no claim of independent scholarly approval.

### Documentation and decisions

Content authoring, architecture, design system, agent index and decision log updated. Reviewable source JSON remains local in the repository; the packaged schedule/Quran data compare byte-for-byte against the existing authoring modules. R2 delivery is now explicitly authorized and implemented; application release remains outside scope.

The owner additionally removes the app-scheduling disclaimer from the Monday/Thursday meaning. Its Arabic sentence and English counterpart are removed, the primary narration and concise meaning remain, and the newly packed bytes are published at a fresh immutable R2 URL. The earlier object remains untouched and unreferenced by the current manifest.

### Known limitations and remaining risks

The package is 91,906 bytes and relies on native DecompressionStream, as does the existing release archive. The optional Home reminder waits for verified data rather than flashing old unverified excerpts. Source websites are only used by explicit links. Human religious-content and assistive-technology review remain distinct from the source comparison and automated checks.

The owner-authorized immutable object is published at `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/content/home-reminders/v1/home-reminder-readings-988d6641cd52d6dd79282e8bd05aacede730eebcb8e2a69185935ee829452002.bin`, 91,906 bytes, SHA-256 `988d6641cd52d6dd79282e8bd05aacede730eebcb8e2a69185935ee829452002`. Public GET bytes and CORS were verified for wa-zaker.com, Pages and local preview. Content-Type is application/octet-stream; immutable cache metadata is set without Content-Encoding. The Azkar bucket has no attached custom domain; existing public R2 delivery is reused without DNS changes. No credentials were displayed. Existing CORS rules are preserved with one added loopback verification origin.

The optional reminder package needs connectivity once before offline use; verified bytes are cached before the card appears and rechecked on later loads. It is outside the core SW install precache so temporary R2 unavailability cannot block core installation/update. Private browsers or storage quotas may deny offline storage while allowing online reading. Existing canonical fallback references remain unchanged in collection readers and need a separate content-review phase if corrections are desired there. The deployed application is unchanged.

### Recommended next step

Review the local cards and source audit; coordinate the combined workspace gate before a separately authorized application release. R2 content upload is complete. No commit, push or application deployment performed.
