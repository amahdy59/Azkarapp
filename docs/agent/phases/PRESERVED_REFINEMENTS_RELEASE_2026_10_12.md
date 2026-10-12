# Phase Report — Preserved refinements release

## Objective

Publish all pending owner fixes to GitHub and production after complete verification, preserving every completed refinement and improving testing efficiency only where evidence calls for it.

## Scope completed

Plan before release edits: inspect Git/production state and the 91 pending files; preserve a hashed copy and binary patch; review feature contracts and integration; replace the bilingual release summary and archive it under a new same-day stamp; measure and record approved feature bundle growth without raising ceilings; run frozen install, full local quality/browser gates and production audit; commit and push through the unchanged hook; inspect all exact-commit workflows and verify production.

HEAD and origin/main initially matched 96c92c2e. The preceding exact-commit Quality and Pages workflows succeeded. All original pending files are backed up under `output/release-preservation-2026-10-12/`, with SHA-256 hashes in its manifest. No file deletion or reset is part of this phase.

## Files changed

All pending source/test/documentation files from the Progress trends/optional charts/alignment, after-prayer learning order, expanded surah listening, Mushaf opening readability, Al-Imran audio restoration, audio CORS/ZIP and shared control alignment reports. Release-only changes: this report, agent index/decision log, bilingual release notes/history and measured bundle baseline.

Small integration repairs additionally touch `ProgressPeriodViews.tsx`, `ProgressScreen.tsx`, `QuranSurahListeningReader.tsx`, `src/styles/theme/surfaces.css` and their existing browser checks. No pending feature is removed.

## Components added or modified

The existing pending changes add Progress period navigation/views/trends, grouped Azkar list presentation, continuous surah listening and verified audio archive preparation. Shared tabs, segmented labels, Mushaf opening fitting/word meaning paint, expanded audio surface and download management are refined. Architecture, stable identities, persistence and reviewed content boundaries are retained.

## User-visible changes

Clearer Progress periods, optional charts/calendar and consistent menus; connected expanded Quran listening with larger text and compact controls; clearer opening Mushaf pages and meaning affordances; restored owner-confirmed Al-Imran audio; verified all-audio ZIP saving; explicit after-prayer learning stages/count groups; centered Library controls. Existing reading, sharing and offline fixes are preserved.

## Accessibility work

Preserve semantic buttons, tabs, radio groups and shared Select; direction-aware keyboard interaction, focus restoration, target sizes, contrast/theme tokens, enlarged text, reduced motion, native reading overflow and meaningful scoped statuses. Automated and visual evidence do not establish complete human assistive-technology compliance.

## Tests added or updated

Feature reports retain all new unit/browser regressions. Integration runs the complete local browser suite, not only focused specs. Full exact-commit CI inventory and coverage remain mandatory.

## Commands run

- `git fetch origin`: passed; HEAD/origin divergence 0/0.
- Preservation script: 91 pending files copied and hashed; binary patch retained.
- `pnpm install --frozen-lockfile`: passed with pnpm 11.19.0.
- Earlier combined `pnpm check`: all stages passed except measured bundle baseline; diagnostic excluding the alignment changes reproduced the same growth. This release records the approved cumulative feature cost rather than reverting owner fixes or raising ceilings.
- Fresh production measurement after release-note archiving: initial route **163,527 gzip bytes** (previous 159,119; +4,408 / 2.77%); stylesheet **163,539 raw / 28,443 gzip bytes** (previous 165,436 / 28,649; both reduced). Recorded these actual role-based metrics in `scripts/bundle-baseline.json`; every hard ceiling and the 2% future-growth guard remain unchanged. The initial increase accompanies approved labels/group data and complete owner refinements; no deferred audio chunk is imported by the initial route. Build and bundle check passed. Detailed measurement is `output/preserved-release-bundle-measurement.json`.

Final gate, browser, audit, hook, workflow and production results are recorded as they complete.

Integrated verification: `pnpm check` passed every stage in **88.1s**, with full enforced unit coverage. `pnpm validate:audio` passed hosted probes for 255 zikr instances, 166 assets and 197 approved mappings. `pnpm audit:prod` found no known vulnerabilities. `pnpm test:e2e:inventory` accounts for **1,321 cases**, scheduled 190/190/189/150/150/100/100/100/152 with no missing or duplicated cases. Release-note shape/freshness/history check passed.

The initial sequential full browser diagnostic found duplicated `progress-primary-heading` test IDs between Month trend and its mounted hidden Day Details heading. Renamed the details ID to `progress-selected-day-heading`; both semantic headings and all product behavior remain. Targeted view/chart units passed 16/16. Original interrupted diagnostics remain in `output/preserved-release-full-browser.log` and `test-results/`; they are not counted as a passing full run.

For local efficiency, built a frozen production preview at port 4188 and selected all existing projects in disjoint groups. An initial four-worker experiment coincided with only 69,592KiB available machine memory and markedly slower browser times. Stopped only this release's Firefox/WebKit trees after verifying their exact command lines, retaining their diagnostic logs/results. Available memory recovered to 6.5GiB. No unrelated app was terminated. Final browser concurrency is bounded to the normal two-worker total. The original Chromium preview remains untouched throughout its run; a separate repaired build at port 4189 serves fresh affected Chromium checks and complete Firefox/WebKit projects. Separate JSON/trace/result paths retain all diagnostics. Existing inventory identities prove complete scenario coverage; original failures require fresh passing evidence. No browser scenario, timeout, retry, coverage threshold, CI schedule or worker default is removed or weakened.

Integration exposed a real 8px strip above Progress's nested sticky header: the existing direct-child header rule did not match the centered wrapper. Extend that rule specifically to the Progress wrapper, retaining its measure and opaque sticky surface. Continuous-surah preference labels/checkmarks now use centered flex anatomy with explicit label spans and nonshrinking icons, matching paginated preferences. Browser checks measure control/label/icon centers, containment and 44px height in both languages.

Update older tests to the approved product contracts: Day/Week headings retain actual single-line, unclipped text checks; descriptive Month/Year titles permit at most two complete lines without shrinking the approved font. The former CSS `white-space: nowrap` assertion incorrectly rejected a naturally single-line Week title. Calendar navigation targets its native button rather than matching help prose. Paired meaning tests target continuous passage identities for Kahf/Sajdah/Mulk, retaining side-by-side geometry, hidden-audio follow, active verse visibility, short-height and 200% reflow checks, and adding an active-word check inside the next passage. Paginated Baqarah retains its printed-page checks.

Final repaired build measurement: initial route **163,538 gzip bytes** (+4,419 / 2.78% versus the preceding deployed baseline); stylesheet **163,612 raw / 28,455 gzip bytes**, both below the preceding baseline. The integration repairs add 11 initial-route gzip bytes to the cumulative feature build. Recorded the final actual sizes with unchanged ceilings and future-growth guard.

## Visual/manual evidence

The initial Chromium diagnostic completed 721 cases: 709 passed, one pre-existing skip and eleven failures (four superseded heading assumptions, one calendar selector, three continuous-passage selectors and the real header gap on three device projects). A repaired-build follow-up passed 32/35; its remaining three failures came from an integer-width wrapping probe for an exactly fitting fractional-width Day title. Measure actual text-range width for single-line text while retaining height, overflow and font checks. All six heading/long-collection cases then passed in 26.8s. All affected product controls, six continuous listening cases, paired translation, Library geometry and sticky headers passed fresh checks.

The desktop app interrupted the local test/preview processes before final Firefox/WebKit JSON reporting. Preserve their stdout and artifacts: 145 Firefox and 74 WebKit successful case records, no failures. Match every record to the current inventory and resume only the unfinished cases with Playwright's `--test-list-invert`: 155 Firefox and 226 WebKit. Final evidence distinguishes stdout success records from completed JSON reports; no execution results or receipts are fabricated. Complete CI independently reruns every case for the exact published commit.

Resumed execution found three layout-test timeouts: a Firefox Mushaf-lettering player disappeared before expansion, WebKit English audio detached during expansion, and an Arabic Downloads disclosure scrolled beneath the floating dock. These specs mocked only native `play()` but retained real network/media loading and events. Replace those mocks with a shared persistent EventTarget audio fixture for these geometry-only checks. Downloads focuses the native disclosure before pointer activation, exercising existing dock-aware focus scrolling; retain every target, overflow, dock clearance, accessibility and expansion assertion. Fresh runs cover both complete specs on all three engines. Separate hosted validation, audio-integrity/lifecycle and downloader tests continue to exercise actual loading/error behavior.

Existing feature captures under `output/playwright/`, Progress/after-prayer/Mushaf/audio evidence directories are retained. Final production evidence is captured after deployment.

## Documentation updated

Feature contracts and phase reports are retained; this report/index/decision log record superseding publication authority. Fresh bilingual notes describe only changes since the preceding deployed commit and use `2026-10-12-2`, distinct from the preceding same-day release.

## Decisions recorded

No deletion of owner fixes, reset, force push or hook bypass. Record intentional measured baseline growth with unchanged hard ceilings. Existing testing efficiency is sufficient: the latest nine-group CI's longest browser job including setup took 9m55s, versus the earlier 15m02s longest group. Keep all projects and inventory, avoid overlapping heavy local quality/build/browser runs, finish tracked documentation before the final quality pass, and reuse only a valid exact-content receipt at push.

## Known limitations or remaining risks

Physical-device and human screen-reader validation remain separate. Large audio archives use browser file saving and retain offline copies; browser/device storage limitations remain explicit. No new religious interpretation or independent scholarly review is claimed.

## Out-of-scope findings

No runtime dependency, toolchain, hard budget, router, persistence or database changes. No speculative pipeline rewrite is needed after measured successful scheduling improvements.

Owner follow-up asks to reduce repeated push/test cost. Extend the existing development-only feature helper with `progress` and `controls`; retain continuous-surah/paired-meaning coverage in both `quran` and `audio`. Its seven targeted unit regressions pass (0.52s). `pnpm test:e2e:feature controls --list --project=desktop-chromium --grep 'Library|segmented controls'` resolves six existing checks across three files, rather than launching all 1,321 cases. README documents targeted development, necessary engine checks, finishing tracked edits before the exact-content quality receipt, and relying on the unchanged hook once. The later owner efficiency correction below supersedes the initial broad-local-matrix requirement; full CI remains mandatory for every application release. No CI release assertion or scheduling requirement is changed.

## Recommended next step

Complete verified main publication and exact-commit production smoke, then owner review on physical devices.

## Owner-requested efficiency correction during verification

The owner reports that duplicated local full-matrix execution is taking too long and consuming credits. Supersede the earlier broad-local-run requirement: stop the remaining broad WebKit run after preserving diagnostics, finish focused repairs, and use the unchanged mandatory complete CI matrix as the release gate. AGENTS and README now require affected local feature/engine checks, full non-browser quality, the existing 26-case fast smoke and Pages build; complete CI still checks all 1,321 browser cases and every quality gate before deployment. Full local matrices remain optional diagnostics when explicitly requested or targeted reproduction cannot resolve a failure. No complete local matrix pass is claimed for this release. The interrupted stdout/JSON artifacts remain honest partial evidence; their diagnostic coverage is not fabricated into a passing full run.

Additional diagnostic repairs: keyboard-help focus visibility now observes late label/scrollport reflow and disconnects on blur/close (2/2 component units pass). Settings Back tests wait for mounted destination content, because hash changes precede animated panel replacement. An isolated Firefox diagnostic identified port 4190 as a browser-blocked network port; final repaired preview uses 4198 without relaxing browser security. Existing pending owner changes remain intact.

Final focused results: complete Downloads-with-player and Mushaf-lettering specs passed **54/54** on Chromium, Firefox and WebKit in **13.2m**, with the persistent layout fixture. Keyboard-help enlarged-text and nested Settings Back checks passed **9/9** on the same three engines in **51.9s**. Earlier repaired Chromium geometry/continuous-listening/paired-meaning checks passed 32 cases, and all six final heading/long-title checks passed. Inventory collection still proves **1,321** required CI cases with no missing or duplicate shard assignments. No local full-matrix pass is claimed. Final `pnpm check`, 26-case smoke, frozen install and Pages build run once through the unchanged pre-push hook; exact-commit CI/deployment and production confirmation are recorded in the session's final release evidence.

Final preservation comparison found no missing original file. Original source differences after the 91-file backup are only the documented Progress heading ID/header class, centered surah preference anatomy and associated tests; feature work is retained. Release-specific new fixes in the shared header rule and keyboard-help reflow are bounded additions. Reviewed content and existing persistence/audio restoration edits remain preserved. Final initial-route and stylesheet measurements are 163,538 gzip and 163,612 raw / 28,455 gzip bytes, respectively, with unchanged hard limits.

## Publication and exact-commit CI remediation

Pushed the preserved release as `3fcc8667` through the unchanged hook: frozen install passed; complete `pnpm check` passed in **152.9s** and recorded its exact-content receipt; fast browser smoke passed **26/26** in **1.9m**; Pages build and unchanged bundle/CSS checks passed. Working tree was clean and HEAD/origin matched.

[Quality run 38253239915](https://github.com/amahdy59/Azkarapp/actions/runs/38253239915) passed checks and eight of nine browser groups. WebKit group 2 passed 98 cases but failed both Baqarah listening language cases: after phone-to-desktop resize, the test read an expanded variant before responsive player remount, then its Minimize target detached. Inspected that job's logs, three-attempt traces/contexts and the aggregation job's failure; verify correctly rejected incomplete passing coverage. No deployment of that commit occurred.

The smallest remediation changes only the test sequence: minimize in the stable narrow layout, assert compact, resize, close the desktop sidebar, and expand. Keep every existing playback/state, word/translation, offline, accessibility, target, geometry and screenshot assertion. Six Arabic/English Chromium/Firefox/WebKit focused cases passed **6/6 in 1.3m**. No runtime or religious-content change. Release notes still describe the complete application changes since the last successfully deployed commit; no extra user-visible note is needed for this test-only correction. Publish remediation through all unchanged hook gates and require the fresh exact-commit full CI before Pages.
