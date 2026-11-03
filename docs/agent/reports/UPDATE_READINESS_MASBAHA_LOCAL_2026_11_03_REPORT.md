# Phase Report — Optional updates and mobile Masbaha settings

## Objective

Implement background update preparation with explicit acceptance or Later, and a compact mobile Masbaha settings sheet. Changes are local for owner review.

## Scope completed

Browser preparation checks or awaits the service worker and reports readiness independently of activation. The Update action bypasses another network check when a worker is waiting. Preparation failure offers a retry while the current app remains available. The existing four-second handover and one-time stale-worker recovery apply only after acceptance. Later keeps the 24-hour per-release deferral, including when a ready event arrives after dismissal. Manual About review remains open across asynchronous readiness events.

Native Android downloads retain a candidate in memory and select the next bundle only after explicit acceptance. The plugin's checksum/rollback contract is preserved.

Mobile Masbaha shows the current dhikr and goal beside a 44px settings button. Its opaque shared sheet provides complete dhikr options, goal radios, an inline custom goal, and Apply/Cancel. Edits remain drafts. Applying a changed dhikr with an active count retains save/reset confirmation, and selecting a previously used dhikr restores its count/goal. At enlarged text, font-relative summary leading contains Arabic ink. Wider selectors retain their current behavior.

## Files changed

Primary source changes are main.tsx, pwaUpdate.ts, usePwaLifecycle.ts, PwaNotice.tsx, App.tsx, native/liveUpdate.ts, CustomCounterScreen.tsx, the new MasbahaSettingsSheet.tsx and Arabic/English i18n. Tests and existing mobile-selector expectations follow the approved sheet behavior. The active phase/index, architecture, design, quality, Android guidance and this report record the local behavior.

## Components added or modified

MasbahaSettingsSheet added. PwaNotice accepts a separate action-disabled state, keeping Later enabled during preparation. CustomCounterScreen composes the new sheet and delegates persistence to its existing counter handlers.

## User-visible changes

Preparing/ready status reflects actual update readiness. Readers choose Update or Later. Mobile dhikr and goal settings share one sheet and an explicit Apply action. Cancellation, reload and switching retain the expected saved counts.

## Accessibility work

Shared native radios, labelled numeric input with integer range 1–100000, complete option labels, 44px targets, keyboard/Escape recovery, opaque surfaces, viewport bounds, RTL/LTR and 200% text. Custom target validation prevents invalid application. Browser scans and geometry checks supplement visual inspection.

## Tests added or updated

Preparation without activation, queued-check discovery, direct ready-worker activation, deferral/manual review and retry units. Native tests verify download versus explicit next-bundle selection and failed-activation retry. Mobile browser flows cover draft cancellation, custom goal persistence, returning saved dhikr progress, full labels, opacity/hit testing, keyboard recovery and narrow/enlarged layouts. The real service-worker test uses two local releases, delays the new worker by 20 seconds, selects Later, reopens through About, accepts, and checks actual old/new release stamps.

## Commands run

The exact commands, exit results and screenshots are retained in output/local-update-*.log and output/playwright/local-update-masbaha/. Final check and Pages results are recorded in local-update-masbaha-quality-final.log and local-update-masbaha-pages-verified.log. The final real-worker result is in local-update-real-worker-passed.log.

Development evidence includes 56 targeted UI/update tests and seven native/isolation tests passing. Initial broad browser diagnostics identified Arabic summary line-box overflow, missing opaque-sheet class on the first candidate, and test harness/update-readiness races. These were repaired with retained assertions. Earlier failed logs remain alongside final reproductions.

## Final verification results

| Command                                                              | Result                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Targeted UI/update/native units                                      | 56 UI/update cases and seven native/isolation cases passed during development. The full gate below includes all final cases.                                                                                                                                                                                         |
| pnpm check                                                           | All stages passed in 140.1 seconds, including coverage, type safety, lint, format, content/timing checks, CSS utilities and existing bundle budgets. Evidence is output/local-update-masbaha-quality-final.log.                                                                                                      |
| pnpm build:pages                                                     | Passed, including bundle and CSS-utility checks. Evidence is output/local-update-masbaha-pages-verified.log.                                                                                                                                                                                                         |
| Current Masbaha, enlarged-control, notice and offline browser checks | 15 cases passed across Chromium/Firefox/WebKit. Includes both languages, 320px/200% text, Glass opacity and hit testing, saved count/goal restoration and first offline reading. Evidence is output/local-update-masbaha-verified-browser.json.                                                                      |
| Real two-build service-worker update                                 | Two cases passed in 55.6 seconds. A 20-second worker download respects Later, manual About review remains open, accepting changes the actual displayed build stamp, all settled assets load, and a fresh visit has no repeated prompt. Evidence is output/local-update-real-worker-passed.json and its matching log. |
| Final worker fixture lint/format                                     | Passed after replacing asynchronous waitForFunction predicates with explicit resolved-value polling and giving the isolated backend an explicit unavailable response. Application source remained the same as the successful full gate.                                                                              |
| git diff --check                                                     | Passed.                                                                                                                                                                                                                                                                                                              |

Earlier diagnostic runs remain in output/local-update-*.log. The first broad run passed 44 cases and exposed failures corrected by the final focused reproductions. The worker fixture initially advanced before a resolved asynchronous readiness predicate. Explicit polling now waits for the activated worker and the waiting update. Its isolated backend returns an explicit unavailable response so optional test presence calls do not appear as missing application assets. The final asset-availability assertion remains intact.

## Visual/manual evidence

Inspected Arabic sheet and summary screenshots. Browser runs write both languages at phone and enlarged widths. A loopback preview with isolated backend configuration serves the current local candidate at port 4197.

## Documentation updated

README, Android, architecture, design system, quality checklist, owner decision log, phase/index and this report.

## Decisions recorded

The owner's latest instruction keeps all work local. Mobile settings use draft Apply/Cancel. Goal changes retain current counts. Only switching an active dhikr invokes the existing save/reset confirmation.

## Known limitations or remaining risks

Physical Android relaunch/rollback and human assistive-technology acceptance need device verification. Browser/adapter tests establish the tested boundaries. These local changes have no production release stamp yet. The current preview uses port 4197 and the isolated browser-test backend.

## Out-of-scope findings

The first Pages build exceeded the total-output ceiling by 2259 bytes. The later candidate exceeded it by 2785 bytes. Both app-icon PNGs were losslessly re-encoded, preserving RGBA pixels exactly and saving 4629 bytes. The offline release-history gzip was recompressed with Zopfli, preserving every decoded byte and saving 5266 bytes. The one-time compression tool is installed only under ignored output/compression-tools. It adds no application dependency. Existing archive commands can regenerate a valid gzip, with the bundle gate continuing to enforce the output ceiling. No budget or test threshold was raised.

## Recommended next step

Review the local application and device acceptance evidence before requesting publication.
