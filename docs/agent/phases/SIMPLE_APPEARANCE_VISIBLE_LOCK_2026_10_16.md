# Phase Report — Simple appearance and visible listening lock

## Objective

Implement the owner's subsequent request for Opaque/Glass choices, the current Home photograph across Glass interface pages, and visible read-only listening while accidental-touch protection is active.

## Approved plan

1. Preserve normalized stored values and legacy compatibility; show only Opaque/Glass in the primary App selector. Selecting it applies throughout the app. Keep the earlier requested independent Home setting as a collapsed optional customization with a same-as-app switch and two choices.
2. Share the exact Home scene-selection helpers with a deferred interface backdrop. Reuse the existing responsive/cached image component, no parallax or extra blur, controlled theme veil, solid reading surfaces, Save-Data/error/offline/high-contrast/forced-colors fallbacks. No new image service or dependency.
3. Reuse the named modal/focus containment and hold/cancel/Escape recovery for audio protection. Make its touch shield transparent and its sole visible unlock control a small fixed pill. Underlying audio/text remain visually unchanged and controls remain blocked.
4. Update relevant unit/browser assertions, bilingual copy and contracts. Repair the previous full-matrix test ambiguity by scoping Home option selectors. Run focused three-engine and constrained-performance evidence; run intact release gates, exact-commit CI, both deployments and live smoke.

## Scope boundaries

No content, counts, source interpretation, audio plan/timing, storage schema or runtime dependency change. This is the owner's superseding appearance/lock continuation of the app-material release, not a roadmap expansion.

## Verification and final outcome

Implementation and the focused local browser matrix are complete. Exact-commit release gates and production results are recorded in the consolidated release evidence after completion.

## Scope completed

Primary Opaque/Glass selector applies to Home and all interface pages, including selecting the checked option. Home customization is a collapsed native disclosure with Same as app and a two-option override; photos remain independent. New installs inherit the Opaque default; legacy normalized settings and explicit overrides survive. Shared pure Home time helpers select the same responsive/cached scene on Glass interface routes. The stationary background is deferred, contrast-veiled and omitted for reading, forced colors and applicable reduced-transparency/data-saving/failure conditions. The audio touch shield is transparent with a fixed safe-area hold-to-unlock pill, preserving visible exact text, playback and progress. Reduced-motion Library cards have no delayed stagger or hidden initial state.

## Files changed

App/state and tests; HomeScreen and extracted homeTime helpers; AppSceneBackground and tests; AppearancePanel/SettingsScreen and tests; AudioControlLock, Modal's optional style support; SegmentedControl's optional checked-option application and tests; bilingual i18n; interface material/reduced-motion CSS; app-material, lock, Home-clarity and texture browser tests; architecture/design/audio/motion/decision/index documentation; bilingual release notes/history.

## Components added or modified

AppSceneBackground is a deferred decorative composition using existing TimeOfDayBackground/AzkarHeroBackground. Existing SegmentedControl and SettingsToggleRow keep native semantics. AudioControlLock reuses the existing Modal focus trap and dismissal contract. No new runtime dependency, remote service, image asset, content interpretation or database change.

## User-visible changes

Two clear primary appearance options; optional Home-only appearance; matching stationary scene on Glass interface pages; protected opaque reading. Learning text and audio remain visible while accidental touches are blocked. New installs have a consistent Opaque default. Reduced-motion Library cards appear immediately.

## Accessibility work

Two-option named radio groups; native keyboard-accessible disclosure; switch semantics; visible focus and 44px targets. High contrast, forced colors, data saving and legacy device transparency remain authoritative as documented. Transparent modal preserves focus containment, Escape recovery, incomplete-hold cancellation and opener focus restoration. Unlock bounds are checked in RTL/LTR. Automated scans do not establish full accessibility certification.

## Tests added or updated

New-install versus legacy persistence; global application/reselection versus optional Home override; three-engine bilingual layouts and actual card material; shared scene identity and reading exclusion; light/dark/midnight contrast scans; image failure, scene recovery and Save-Data; transparent lock/text visibility, safe-area geometry and existing pointer/keyboard/playback assertions; absent texture and immediate reduced-motion cards. All original religious-source/count, reading geometry, keyboard and persisted image-independence checks remain.

## Commands run

Focused settings/lock/segmented/Home/image tests: 32 passed. Scene failure/accessibility/Data Saver tests: 3 passed. Previous CI selector repairs: 26 passed across Chromium, Firefox and WebKit. The first combined browser pass exposed local browser timeouts. After placement/reduced-motion refinements and reduced worker contention, the fresh complete affected matrix passed all 46 cases across Chromium, Firefox and WebKit in 10.1 minutes, with zero skipped, flaky or unexpected cases. The corrective unit run passed all 69 tests. Complete quality gate, hook, exact-commit CI and both production results are recorded in the final release evidence; this source report does not imply deployment success before those checks finish.

## Visual/manual evidence

Browser screenshots cover simplified settings, Glass Library and visible locked playback in Arabic/English on phone/desktop. Visual review identified and repaired inherited modal translation clipping and delayed reduced-motion card paint. Fresh Arabic phone settings/lock and desktop Library captures were visually inspected; the final evidence is under output/simple-appearance-evidence.

## Documentation updated

Architecture, design system, motion system, audio architecture, decision log, phase index, this report, preceding release follow-up and release 2026-10-16.11 with four matching Arabic/English outcomes and retained history.

## Decisions recorded

The owner's latest screenshot/request supersedes the exposed Follow device and four-way Home choices. Stored compatibility is retained rather than rewriting user settings. Optional Home customization preserves the earlier requested Home-only Glass option. Existing direct-main publication authority and full release gates continue.

## Known limitations or remaining risks

Touch protection does not lock the operating system or prevent intentional Escape. Physical older-device and assistive-technology acceptance remain separate. Photographs are optional decoration and require their existing cache/network on first use; failure leaves theme surfaces. Cloudflare and GitHub Pages deploy independently and must both be verified. Blur costs remain device-dependent; no scroll inertia/parallax or per-card interface blur is added.

## Recommended next step

After exact-commit Quality/Pages and production smoke, sample physical older phones and screen-reader flows; prioritize further changes using measured field performance.

## Proactive follow-up ideas shared with the owner

The owner requests thoughtful improvement suggestions, not command-only execution. Physical older-phone scroll sampling would validate browser emulation. An optional explicit keep-screen-awake setting during locked learning could prevent display sleep; it is deferred pending a product decision because of battery use. No new runtime screen-wake behavior is silently introduced.

## Pages budget and WebKit contrast follow-up

The Pages-mode hook correctly rejected the unpublished initial commit because its compressed CSS exceeded the unchanged 28 KiB ceiling by six bytes. Removing a redundant hidden-scene selector restores headroom; component gating already unmounts that scene in Solid and applicable reduced-system modes. Earlier CI retry evidence also showed a transient stale text colour in WebKit: reduced-motion segmented indicators now render a stationary span rather than a zero-duration shared-layout effect, and reading-language labels resolve their own foreground token across nested theme changes. Original axe assertions remain, with explicit colour/transform checks added. No budget, coverage or assertion is weakened. The final source is rechecked and the unpublished commit is amended before pushing; no failed hook reached the remote.
The additional appearance/theme regression pass completed 15/15 cases across Chromium, Firefox and WebKit in 3.0 minutes, including explicit foreground/indicator assertions and unchanged accessibility scans. A redundant generic sheen was also removed: the shared scene already supplies depth, and card translucency remains unchanged. This reduces stylesheet work and keeps both standard and Pages builds within the original ceilings. The final full gate runs on this finished snapshot before publication.
