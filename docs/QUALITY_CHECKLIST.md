# Engineering and release checklist

This document makes the project checklist auditable. A recommendation is **met** only when its automated check passes or a dated manual test record exists. “Not applicable” requires a reason in the pull request.

## Automated gates

Every pull request must pass the pinned-toolchain check, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test:e2e`, `pnpm build:pages`, and `pnpm audit:prod`.

These full gates run once in the Quality CI job for every application release. Pages waits for successful Quality for the exact current-main commit, then builds and deploys without duplicating its suite. During development, use affected unit/browser tests. Locally, the push hook runs frozen install, full `pnpm check` (or its unchanged, less-than-24-hour content-bound receipt), `pnpm test:e2e:fast` and Pages build. Broader changes and uncertain scope still warrant full local browser verification. CI never trusts the local receipt.

The local smoke includes offline Reader/counting and Settings recovery in addition to navigation/legal coverage. Browser runs produce a JSON timing report inspected with `pnpm test:timings`; retry costs must remain visible. Tooling tests run in Node, and CI forbids focused browser tests. An occupied preview port fails without terminating another session. See `docs/agent/TEST_STRATEGY.md` for the change-based selection policy.

| Concern               | Evidence                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Type safety           | Strict TypeScript and `tsc --noEmit`                                                                                  |
| Code hygiene          | ESLint, React Hooks rules, JSX accessibility rules, and Prettier                                                      |
| Critical data logic   | Unit tests and enforced coverage thresholds for persistence, merging, progress, prayer calculation, and auth          |
| Accessibility         | Axe WCAG A/AA scans across onboarding, home, and settings; keyboard and touch-target checks                           |
| Browser compatibility | Full Chromium viewport matrix plus Firefox desktop and WebKit mobile core-flow smoke tests                            |
| Performance           | Screen lazy loading, Vite tree shaking, per-asset bundle ceilings, and a recorded baseline growth is measured against |
| Supply chain          | Exact pnpm pin, frozen lockfile, seven-day quarantine, and `pnpm audit:prod` on PRs and `main` pushes                 |
| Secrets               | Runtime environment variables; `.env*` excluded except `.env.example`                                                 |
| Deployment            | Pages requires successful full Quality for the exact current-main commit before building and verifies production      |

Dependency updates must be resolved with the pnpm release declared by `packageManager`. A package that is younger than `minimumReleaseAge` must not enter the lockfile through a local-policy bypass. Select an eligible reviewed release, wait for the quarantine to expire, or record an explicit security exception before changing `minimumReleaseAgeExclude`.

Current per-file production budgets are 480 KiB JavaScript, 164 KiB CSS, and 1 MiB for another asset, with compressed ceilings of 140 KiB per JavaScript file and 28 KiB per CSS file. The complete initial route graph, derived from Vite's build manifest, must remain below 250 KiB gzip including HTML, static JavaScript imports, and CSS. The recorded baseline is tighter than these backstops and must be updated downward after a material reduction; any increase requires a fresh production measurement and justification in the same change.

## Architecture rules

1. Use the existing layer-based structure documented in the README; do not introduce a competing feature structure.
2. Screens render and coordinate interaction. Put persistence and remote calls in `state.ts` or `src/lib`, static data in `content`, translations in `i18n`, and reusable visual patterns in `components`.
3. Use descriptive camelCase functions/values and PascalCase React components/types. Component filenames match their primary export.
4. Prefer typed props and function signatures. Add a “why” comment only when a constraint or decision is not evident from the code.
5. Search before creating a utility or component. Explain every new runtime dependency in the pull request.
6. Use theme variables and shared components before adding one-off colors, spacing, or motion.
7. AI-assisted code must be identified in the pull request and read, understood, tested, and reviewed by a human. Generated imports and prototypes are not evidence of correctness.
8. Update the README and relevant `docs/` source of truth when behavior, state, APIs, environment variables, or operational procedures change.

## Performance and resilience rules

- Lazy-load screens and genuinely heavy features. Avoid speculative memoization; profile before and after performance changes.
- Lists expected to exceed 20 visible items require pagination, incremental rendering, or virtualization.
- Images must declare useful alternative text, intrinsic dimensions where known, and lazy loading below the fold. Prefer WebP/AVIF for raster content.
- Debounce only expensive continuous input. Do not add polling when events, push, or user-triggered refresh is sufficient.
- Bound remote reads, avoid per-row calls, and document caching/invalidations beside the service boundary.
- Core reading, counting, and progress remain locally available. Remote sync failures must preserve local state and show actionable feedback.

## Accessibility and UX rules

- Use native elements first, one `main` landmark, logical headings, associated labels, and 44×44 CSS-pixel touch targets.
- Every action must work by keyboard with a visible focus indicator. Gestures need button alternatives.
- Meet WCAG AA contrast; do not communicate meaning by color alone.
- Announce asynchronous errors, loading, and meaningful state changes without making entire screens live regions.
- Support 200% text zoom, `prefers-reduced-motion`, RTL, narrow screens, safe-area insets, and predictable browser back/close behavior.
- Every asynchronous flow needs loading, success, empty, and actionable error behavior as applicable. Confirm destructive actions.

## Manual release record

Automation cannot prove the following. Complete and date this table for a release candidate; attach screenshots or issue links where useful.

| Test                    | Required result                                                                                              | Date / tester / evidence                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Keyboard-only core flow | Logical order, visible focus, no traps; onboarding → category → reader → completion → settings               | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts` (partial: tab order, visible focus, no trap) |
| Screen reader           | VoiceOver, TalkBack, or NVDA completes the same core flow with understandable names and announcements        | Pending                                                                                              |
| Text resize             | 200% browser zoom and largest app text setting do not hide content or actions                                | 2026-08-13 / automated / `e2e/manual-checklist.spec.ts`; one-line headings at 320/390/412 px         |
| Contrast                | Light, dark, high-contrast, and color-blind modes pass a contrast analyzer                                   | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts` (all 5 modes)                                |
| Responsive layout       | 320 px mobile, 390 px mobile, tablet, and desktop reflow without clipping                                    | 2026-08-13 / automated / includes OnePlus Nord 4 412×924, bounded onboarding, and zikr overview      |
| RTL                     | Arabic onboarding, navigation, category, reader, counter, and settings have correct order and icon direction | Pending                                                                                              |
| Safe areas              | iOS notch/home indicator and Android cutout do not cover controls                                            | Pending                                                                                              |
| Poor connectivity       | Offline banner appears; local reading/progress works; sync recovers after reconnect                          | Pending                                                                                              |
| Prayer time and DST     | Effective timezone/offset match the detected location; online and offline results use the selected method    | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts`                                              |
| Performance             | Record cold load, interaction responsiveness, and React Profiler evidence on a representative mobile device  | Pending                                                                                              |
| Media access            | Audio alternatives/transcripts and image descriptions are correct wherever media is introduced               | Pending                                                                                              |

Until every applicable row has dated evidence, the project must not claim complete manual checklist compliance.

### Automated vs. manual rows

Five rows above are now covered by `e2e/manual-checklist.spec.ts`, which runs in CI on every push. They are dated as automated evidence.

The remaining rows are **not** automatable and stay `Pending` until a person does them:

- **Screen reader** — needs a real VoiceOver/NVDA/TalkBack session. Automated keyboard coverage is not a substitute; it proves focus moves, not that announcements make sense.
- **Safe areas** — needs real notch/cutout hardware.
- **Performance** — needs a representative mobile device and profiler traces.
- **Media access** — needs human review of alternatives and descriptions.

The keyboard row is marked partial for the same reason: the automation proves tab order, focus visibility and absence of traps, but a human still has to confirm the flow is _sensible_.

## Sharing refinement checks

- Inspect mirrored preview/settings columns at wide widths, preview-first compact reflow, short landscape windows, native disclosure indicators and collapsed additions summaries. Check unavailable-size descriptions, size/language help associations, visible selection checkmarks, dropdown Escape/focus restoration, enlargement exit, and controls scrolling above the footer.

- Every zikr, selected meaning/pronunciation/benefit and available citation fit together on one image. Incompatible sizes explain size/Text/Link recovery.
- Reviewed multi-page surahs export name, reviewed benefit/source and an exact Mushaf QR/link; no verse payload in image, Text or ZIP.
- Current/Selected/Entire-collection scope matches both files and archive text; unsupported native payloads expose Save/Copy.
- Check 320px width and 200% text: compact header/action footer remain visible, scrolling focus is unobscured, keyboard stays in the modal, and Escape restores the trigger.
- Inspect actual olive/gold/lavender exports and single/reminder cards. Real social compression, QR scanning, Android/iPhone share sheets, cutouts and human screen-reader checks must be recorded separately from browser emulation.
- Inspect Arabic/English pill ink bounds, its exact 16px gap, proportionally enlarged brand, header/title separation, website badge contrast, QR clearance and multi-card-only numbering. Check contextual single-zikr titles versus collection titles, Portrait reminder defaults and all four available formats; branding must not split or remove content.
- Verify content presets, independent English translation and Arabic-only reviewed word explanations, glossary attribution, hidden unavailable glossary options and unchanged full-text/format recovery. Ordinary cards have no scan instruction above the website; reminder QR labels belong beside their code.

## Verified audit remediation checks

- `pnpm check` gives each run its own `coverage/check-<pid>` and `output/check-build-<pid>` directories. Bundle and CSS checks read that same build; their optional directory argument defaults to `dist`, preserving the Pages gate. Concurrent local checks must not combine coverage files or hashed build assets.
- Download and removal actions stay disabled while storage readiness is loading, so initial refreshes cannot clear a job's error or cancellation feedback.
- Verify Arabic/English Back and Previous/Next icons separately from the physical Mushaf page-turn controls.
- Inspect partial, empty, full and restored progress in both directions; translated fills must retain clipped geometry and divider thickness.
- Exercise menu keyboard focus in Light, Midnight and Dark, Escape focus return, OS reduced motion, and in-app reduced motion with OS motion enabled.
- Inspect compact sheet surface and inset ownership. Real cutout/gesture-navigation hardware, sensor feel and TalkBack/VoiceOver checks remain human evidence requirements.
- Capture current bundle measurements; never claim input latency or frame-rate gains without a representative-device trace.

- Sharing footer: verify Share/Save/Copy labels and decorative icons, one ordinary phone row, non-wrapping enlarged labels, 44px targets, matching selected payloads, explicit unavailable sharing, visible clipboard errors and quiet success announcements.

### Waveform player refinement

Verify one progress control per player form, RTL timeline/transport in Arabic and LTR in English, mirrored transport geometry and aligned icon centres, waveform source checksum coverage and truthful missing-data fallback. In Arabic, Previous/rewind are on the right and Next/forward on the left; Left Arrow seeks forward and Right Arrow seeks backward. Confirm manual Previous/Next with continuation off, final-natural-ending-only completion, internal segment/ritual progression, and independent prescribed-repeat state. Volume opens only on click/keyboard, remains vertical, changes no row geometry, and closes on Escape/outside press with correct focus restoration; iOS uses hardware volume. Retain narrow/landscape/200% text, all-theme axe and manual physical-device/screen-reader checks.

### Required audio release verification

Local pnpm check includes deterministic audio metadata validation. Quality CI additionally requires pnpm validate:audio for every approved hosted recording before deployment. No recording checks, coverage thresholds or budgets are removed.
