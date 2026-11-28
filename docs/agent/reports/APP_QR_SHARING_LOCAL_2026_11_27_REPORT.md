# Phase Report — Simple Home application sharing, local 2026-11-27

Subsequent owner color review: the [Home material correction](HOME_MATERIAL_COLOR_LOCAL_2026_11_27_REPORT.md) supersedes this checkpoint's solid-card-on-Glass paint, pairs the books action's ink/ground correctly and aligns More/icons. Its report and gallery contain current color verification. All sharing/desktop composition behavior below remains preserved.

## Objective

Add desktop Home QR access and equivalent mobile sharing using the owner's exact Google Play link. Apply both screenshot corrections: fewer sharing options and more purposeful horizontal desktop composition. Local only: no commit, push, deployment, release notes or native binary changes.

## Scope completed

Desktop Home uses one full-width invitation: logical-start title/caption, filled sharing cue, accent edge, readable opaque ground and opposite-edge QR. The same trigger survives resizing. Phone/tablet uses one compact Share app entry.

Both open the same protected sheet with one QR, one caption, primary Share app and quiet Copy link. At 900px+, the dialog uses a bounded 42rem width and two equal columns for QR/caption and actions/feedback. Phones retain the stacked composition. There is no destination picker, ordinary URL field or separate open/share-QR/save control. The QR itself links to Google Play.

The single share action includes the QR PNG and Play Store URL when files are supported, otherwise just the URL. Unsupported system sharing presents one Copy action. Copy failure reveals, scrolls to, focuses and selects a manual link. Cancellation never downloads. The 393-byte monochrome PNG is embedded and reused byte-for-byte, with no network QR service, canvas or runtime generator.

## Files changed

- `src/app/share/appShareLinks.ts`, `appSharing.ts`, `appSharing.test.ts`
- `src/app/components/HomeAppShareCard.tsx`, `AppShareSheet.tsx`, `AppShareSheet.test.tsx`
- `src/app/screens/HomeAppShareSection.tsx`; one additive import/row in the already modified `HomeScreen.tsx`
- `src/app/components/home-wird.css`: scoped desktop invitation/dialog styles in the existing Home stylesheet
- `src/app/i18n/ar.ts`, `en.ts`: matching application-sharing copy
- `src/assets/app-sharing/google-play.json`; `scripts/generate-app-share-qr.mjs` reproduces it using the installed authoring dependency
- `e2e/home-app-sharing.spec.ts`
- README, architecture, design system, quality checklist, design coverage, working index, phase brief, this report and the evidence gallery

The checkout contained extensive independent work before this phase. Those edits remain preserved; shared-file changes are attributed here only to this feature's additions.

## Components added or modified

HomeAppShareCard presents the invitation. HomeAppShareSection owns opening and defers the domain-specific AppShareSheet. The sheet owns transient interaction/feedback and reuses ResponsiveSheet, SheetHeader, Button, status copy, icon exports and native sharing adapters. Native adapters remain unchanged. Public application sharing never enters the private QR synchronization flow.

## User-visible changes

- Scan directly from desktop Home or open Share app on any layout.
- Share through one action, automatically including the QR when supported.
- Copy through one quiet action, with manual recovery disclosed only on failure.
- Desktop uses horizontal space in both the Home invitation and sharing dialog, mirroring for Arabic.

## Accessibility work

Native link/button/input semantics, meaningful QR alternative, short associated description, 44px controls, visible focus, bounded protected sheets, opaque functional surfaces, measured RTL/LTR separation, whole-code visibility at enlarged text, scoped status/error announcements and a surviving opener across responsive transitions. The manual link receives focus and selection after a copy failure. Existing reduced-motion and Back/Escape contracts remain intact.

Screenshot review caught a real opaque-ground issue: the shared decorative finish replaced a gradient image while its shorthand left a transparent ground. An explicit semantic background color now preserves text contrast over Home photography. Card-level axe and opacity assertions accompany the existing sheet scans. Automated evidence does not establish complete WCAG or physical screen-reader compliance.

## Tests added or updated

Six service tests check every decoded PNG pixel against the exact URL's QR matrix, all four white quiet margins, no alpha, native/Web Share payloads, file/link capability fallback, cancellation without download and byte-exact file preparation without canvas. Six sheet tests check the reduced action inventory, automatic QR inclusion, manual-copy focus/selection, serialization, failure recovery and unsupported-sharing fallback.

Browser checks cover both languages, phone/tablet/desktop, themes/material fallbacks, 320px/200% text, the 900px/200% desktop boundary, whole-code visibility, 44px controls, opaque fills, actual hit testing, axe, keyboard containment, focus restoration, responsive changes, PNG payload signatures and offline reopening. Installed-shell offline reload follows the repository's Chromium convention. Existing complete release tests/assertions are retained.

## Commands run

| Command                                                                                                                                                                                                                | Exact result                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                                                                                                                                       | Passed; pnpm 11.19.0, already up to date.                                                                                                                                                                                                                                                                                                                                       |
| `pnpm test:run src/app/share/appSharing.test.ts src/app/components/AppShareSheet.test.tsx src/app/screens/HomeScreen.render.test.tsx src/app/i18n/parity.test.ts src/app/i18n/keyIntegrity.test.ts`                    | All 5 files / 32 tests passed on the final horizontal implementation.                                                                                                                                                                                                                                                                                                           |
| Targeted ESLint and Prettier for feature code, generator, CSS and browser tests                                                                                                                                        | Passed; no warnings.                                                                                                                                                                                                                                                                                                                                                            |
| `pnpm test:e2e e2e/home-app-sharing.spec.ts --project=desktop-chromium`                                                                                                                                                | All 20 cases passed before the desktop refinement. A preceding runner attempt failed test collection because Node required a JSON import attribute; the import was corrected and the inventory rerun.                                                                                                                                                                           |
| `pnpm test:e2e e2e/home-app-sharing.spec.ts --project=desktop-chromium --grep '1440px\|900px\|320px\|responsive changes' --output=output/app-sharing-desktop-artifacts`                                                | All 10 final horizontal-layout cases passed, including both languages, high contrast, Glass, opacity/card contrast, sheet columns, 900px/200%, narrow recovery and responsive focus.                                                                                                                                                                                            |
| `pnpm test:e2e e2e/home-app-sharing.spec.ts --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep '1440px light glass\|900px\|responsive changes' --output=output/app-sharing-desktop-engine-artifacts` | All 10 final horizontal-layout cases passed: five Firefox, five WebKit. The earlier broad WebKit run retained one 90-second responsive timeout; the focused final case passes without changing that limit or assertion.                                                                                                                                                         |
| Three-engine `--grep 'payloads\|manual copy\|offline'`                                                                                                                                                                 | All 13 recovery/payload/offline cases passed after manual-focus and mock-file-read corrections; unchanged sharing logic retained.                                                                                                                                                                                                                                               |
| `pnpm test:e2e:inventory`                                                                                                                                                                                              | Passed on the latest shared checkout: 4,877 tests exactly once across nine partitions; counts `[616,589,602,750,707,486,489,482,156]`. Independent tests were added during this phase.                                                                                                                                                                                          |
| `pnpm check`                                                                                                                                                                                                           | Failed on its recorded snapshot: 406 files / 2,861 tests passed; one independent `scripts/audit-learning-book-content.test.mjs` assertion failed. Formatting reported five shared/independent files. Build, typecheck, lint, manifest/timing/type-scale/motion and CSS checks passed. The initial bundle failure was reduced during this feature; no full-gate pass is claimed. |
| `pnpm build:pages` after the desktop refinement                                                                                                                                                                        | Vite/PWA compilation succeeds; the current total-output budget fails: 12,588,876 bytes versus 12,582,912 (5,964 bytes over). Home startup is 537,372 gzip bytes and passes its existing baseline allowance. No budget, threshold or assertion was raised.                                                                                                                       |

Detailed logs: `output/app-sharing-simple-check.log`, `output/app-sharing-desktop-horizontal.json`, `output/app-sharing-desktop-engines.json`, `output/app-sharing-desktop-inventory.log`, `output/app-sharing-desktop-pages-final.log`. The compact pre-refinement Pages build passed before subsequent desktop and independent shared-checkout edits; it is not substituted for the current failed budget gate.

### Final local continuation

The owner reiterates continuing locally. No further product behavior changes were needed after the desktop refinement. Final verification uses a dedicated preview directory (`output/app-sharing-final-preview`) to prevent concurrent browser builds in the shared checkout from replacing the files under test.

| Command                                                                                                                                                                                                                                                                                                     | Final result                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused service/sheet/Home/i18n unit command above                                                                                                                                                                                                                                                          | All 5 files / 32 tests passed; `output/app-sharing-final-unit.log`.                                                                                                                                                                                                                                         |
| `pnpm typecheck` and targeted ESLint                                                                                                                                                                                                                                                                        | Passed, zero warnings; `output/app-sharing-final-typecheck.log`, `output/app-sharing-final-lint.log`.                                                                                                                                                                                                       |
| Targeted Prettier and `git diff --check` for this phase's edits                                                                                                                                                                                                                                             | Passed; `output/app-sharing-final-format.log`.                                                                                                                                                                                                                                                              |
| `E2E_BASE_URL=http://127.0.0.1:4197 pnpm test:e2e e2e/home-app-sharing.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --grep 'payloads\|1440px light glass\|900px\|320px\|responsive changes\|offline' --output=output/app-sharing-final-local-artifacts` | All 34 selected cases passed (12 Chromium, 11 Firefox, 11 WebKit), including payload/manual-copy/offline cases and both horizontal surfaces; `output/app-sharing-final-local-browser.json`.                                                                                                                 |
| `pnpm build:pages`                                                                                                                                                                                                                                                                                          | Vite/PWA compilation succeeded. Existing total-output ceiling failed at 12,590,544 versus 12,582,912 bytes (7,632 bytes over) on the latest shared checkout. Home startup 537,380 gzip bytes passes its baseline allowance; `output/app-sharing-final-pages.log`. No complete release-gate pass is claimed. |

The desktop RTL/LTR Home/dialog gallery was refreshed from that isolated successful browser run. The final local design work is complete; the aggregate release blockers remain recorded. No commit, push, deployment, release-note edit, dependency change or bundle-limit increase was performed.

## Visual/manual evidence

The [actual-app gallery](../evidence/app-sharing/README.md) includes RTL/LTR desktop Home/dialog and simplified phone captures. Full captures are in `output/playwright/app-sharing-simple/`. These are application screenshots, not concepts.

## Documentation updated

README, architecture, design system, quality checklist, design coverage, working index, local phase brief, this report and gallery. They describe the simplified Google Play flow and horizontal desktop follow-up.

## Decisions recorded

Use the owner's exact Play Store URL. Replace separate website/link/QR/save choices with one Share action and quiet Copy. Use desktop width for the invitation and dialog while retaining phone stacking. The owner repeatedly requires local-only work: no commit, push or publication was performed.

## Known limitations or remaining risks

The current total-output ceiling remains a release blocker. A diagnostic build with this feature virtually removed fits the budget; no source/public files were removed for that diagnostic. This feature and the concurrently changing checkout need a deliberate reduction before release; the final UI is available locally, but it is not represented as passing all release gates. Do not hide the failure or raise the ceiling.

Physical-camera scanning, Android chooser/provider behavior and TalkBack/NVDA/VoiceOver remain pending. Opening Google Play requires connectivity. No native binary is rebuilt for this web-only scope.

Playwright [documents service-worker testing support for Chromium](https://playwright.dev/docs/service-workers); installed-shell offline reload follows that harness. Firefox/WebKit retain offline in-document code display, handoff and copying assertions. A separate minimal probe shows WebKit offline emulation rejects even a four-byte in-memory File through both arrayBuffer and FileReader. Its chooser mock treats offline files as opaque while checking exact name/type/size/caption; online tests verify real PNG bytes in every engine, and Chromium/Firefox verify bytes offline. No production behavior or offline-handoff assertion is bypassed.

## Out-of-scope findings

The independent content audit and formatting failures were preserved rather than silently repaired in this sharing phase. Broad changes to devotional books/audio/native work remain outside this task. No release receipt was fabricated or hook bypassed.

## Recommended next step

Review the local horizontal desktop and simplified phone UI, then scan/share on a physical phone. Resolve the coordinated checkout's remaining content/format/total-size gates before any future owner-authorized release. Preserve the publication hold.
