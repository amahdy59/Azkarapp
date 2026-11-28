# Phase Report — Completion within the viewport

The owner's later density correction supersedes the stretched-card presentation described in this checkpoint. See the [density follow-up report](COMPLETION_DENSITY_LOCAL_2026_11_27_REPORT.md) and [new actual-app gallery](../evidence/completion-viewport-density/README.md); this report preserves the earlier verification history.

## Objective

Apply the owner's local completion-screen correction: compact, uncluttered composition, stable-height benefit/Hadith card and all available actions visible on ordinary screens. The owner requests recommendations first, then explicitly authorizes implementation and actual screenshot evidence. No commit, push, deployment or release-note rewrite was performed.

## Scope completed

One bounded completion phase, preserving the independent working tree and its existing normalized safe-area change. Complete reviewed quotations, citations, deterministic reminder selection, actual collection/mode/prayer sharing, frozen session time, quiet progress, Continue and offline restart retain their domain ownership.

## Files changed

- Presentation: `src/app/screens/CompletionScreen.tsx`, `src/app/screens/CompletionScreen.css`, `src/app/components/CompletionReflectionCard.tsx`.
- Product labels: `src/app/i18n/ar.ts`, `src/app/i18n/en.ts` (compact Share azkar and distinct Reminder text region names only).
- Tests: `src/app/screens/CompletionScreen.sharing.test.tsx`, `e2e/completion-reflection.spec.ts`, `e2e/session-completion.spec.ts`.
- Contracts: `README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QUALITY_CHECKLIST.md`, `docs/agent/INDEX.md`, `docs/agent/DECISION_LOG.md`.
- Scoped [phase brief](../phases/COMPLETION_VIEWPORT_LOCAL_2026_11_27.md), this report and the [twelve-image evidence gallery](../evidence/completion-viewport/README.md), including its capture manifest.

These paths include earlier independent local changes; this phase does not claim ownership of their complete diff.

## Components added or modified

CompletionScreen and CompletionReflectionCard are modified. The existing Button, Modal and SheetHeader provide actions, protected details, dismissal and focus recovery. No dependency, persistence, synchronization, native Android, prayer-time or audio-controller changes.

## User-visible changes

- A compact check/title/acceptance header releases room for the reminder and actions.
- A shell-height grid fixes the card's outer bounds for the current ordinary viewport. Long quotations scroll natively inside it; title, full citation and Benefits stay outside the scrolling text. Reading type and reviewed content are preserved.
- Home/Done stays primary; abbreviated routines retain primary Continue and secondary Home. Compact Share, Session details and optional New session remain directly available, with contextual sharing names for assistive technology.
- Session details open separately instead of expanding the page. Frozen elapsed time, pause explanation, date and optional garden detail use the shared protected Modal.
- At a container narrower than 16rem or shorter than 36rem, intrinsic page reflow preserves complete text and actions. Ordinary 320px/390px phones, tablet and desktop fit without page scrolling; very short/enlarged screens retain scrolling recovery.

## Accessibility work

Keyboard-scrollable, distinctly named native quotation region with inset focus indication; complete sources and 44px-or-larger action targets; native buttons with full accessible sharing context; shared modal containment, protected opaque surface, Close/Escape/Back and explicit opener focus; preserved semantic DOM order, RTL/LTR and still alternatives. Automated browser/axe checks pass for the feature. Manual physical-device and assistive-technology acceptance remains pending; this is not a complete WCAG certification.

## Tests added or updated

Unit coverage exercises frozen details across dismissal/sharing, contextual compact labels, optional restart, exact reviewed evidence and actual collection/prayer payloads. Browser coverage asserts ordinary action positions before any scrollIntoView, no page overflow, source fidelity, equal insets, hit targets, native quotation scrolling with identical card bounds, safe-area delivery, modal focus recovery, Continue/Home priority, optional nineteen-day streak, real-origin outage completion/restart, enlarged-text recovery and motion/contrast fallbacks.

Development checks exposed a duplicate landmark name and the need to give the static native text scroll region keyboard focus. They were corrected with a distinct localized name and the repository's documented, element-scoped keyboard-scroll exception. Initial fixture issues were also corrected: use the actual Arabic Continue label, wait for native keyboard scrolling and supply insets after the root exists. No assertions, coverage thresholds, projects, budgets or product checks were weakened.

## Commands run

| Command                                                                                                                                                                                                                                                                                                                    | Exact result                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:run src/app/screens/CompletionScreen.sharing.test.tsx src/app/completionReflection.test.ts`                                                                                                                                                                                                                     | Passed: 2 files, 12 tests, 7.56s, exit 0.                                                                                                                                               |
| `pnpm typecheck`                                                                                                                                                                                                                                                                                                           | Passed, exit 0. Also passed in the complete gate.                                                                                                                                       |
| Targeted `pnpm exec eslint` over the three changed TSX/unit files and two browser specs, `--max-warnings 0`                                                                                                                                                                                                                | Passed, exit 0 after the native scroll-region correction.                                                                                                                               |
| Targeted `pnpm exec prettier --write` over the phase's changed files                                                                                                                                                                                                                                                       | Completed, exit 0; unrelated formatting files were not changed.                                                                                                                         |
| `E2E_PORT=4391 E2E_REPORT_PATH=output/completion-layout-review/cross-browser-results.json pnpm test:e2e e2e/completion-reflection.spec.ts e2e/session-completion.spec.ts --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/cross-browser`  | Passed: 42 tests, 458.25s, zero failed/skipped/flaky, exit 0.                                                                                                                           |
| `E2E_BASE_URL=http://127.0.0.1:4391 E2E_REPORT_PATH=output/completion-layout-review/streak-results.json pnpm test:e2e e2e/completion-reflection.spec.ts --grep 'optional streak' --project=desktop-chromium --project=desktop-firefox-smoke --project=mobile-webkit-smoke --output=output/completion-layout-review/streak` | Passed: 6 tests, 29.76s, zero failed/skipped/flaky, exit 0. Used the same managed isolated preview without another build.                                                               |
| `pnpm check`                                                                                                                                                                                                                                                                                                               | Failed, exit 1, 402.7s: 406 unit files / 2,868 tests passed; one independent book-audit file/test failed. Formatting and aggregate output budget also failed; every other stage passed. |
| `pnpm build:pages`                                                                                                                                                                                                                                                                                                         | Vite/PWA generation succeeded in 39.73s; unchanged total-output budget rejected 12,585,798 bytes against 12,582,912 (2,886 bytes over). Exit 1.                                         |
| `git diff --check`                                                                                                                                                                                                                                                                                                         | Passed, exit 0.                                                                                                                                                                         |

The complete gate passed toolchain, build, TypeScript, lint, audio manifest, Quran/listening/owner timing validation, type scale, motion rules and CSS utility validation. It does not establish release readiness. Logs are retained in `output/completion-layout-review/pnpm-check.log` and `build-pages.log`; browser reports and original screenshots are retained beside them.

Earlier Chromium development attempts are retained as failed diagnostics (8 failures / 6 passes, then 1 failure / 13 passes), superseded by the 42-case cross-engine pass and six additional streak cases. The complete local browser inventory was not duplicated; no publication was requested.

## Visual/manual evidence

The [gallery](../evidence/completion-viewport/README.md) preserves twelve unedited actual-app screenshots, copied with original paths and SHA-256 values in [capture-manifest.json](../evidence/completion-viewport/capture-manifest.json). Inspecting ordinary Arabic/English, short-inset quotation start/end, details, narrow/enlarged text, tablet, desktop, abbreviated and offline restart images confirms the intended hierarchy and stable controls. The streak is a synthetic fixture; inset values are simulated native handoff. They are explicitly labelled in the gallery.

Two preliminary interactive layout depictions are retained under `output/completion-layout-review/` as review concepts, separate from actual-app evidence.

## Documentation updated

The phase brief records the plan before implementation. Design, architecture and quality documents describe bounded ordinary completion, protected modal details and short/enlarged recovery. README and the working index identify the local follow-up. Decision log records the owner's new scope and publication hold.

## Decisions recorded

The latest owner instruction supersedes the prior completion-only ordinary page-scroll, content-sized card and native in-flow details presentation. Reviewed evidence, complete text/source, content-review boundaries, state ownership and all other completion contracts remain authoritative. Existing shared working-tree changes were preserved.

## Known limitations or remaining risks

- Complete-gate blockers are the same independent categories recorded before this phase in the [modal sizing report](MODAL_SIZING_LOCAL_2026_11_27_REPORT.md): `scripts/audit-learning-book-content.test.mjs:9` detects stale audit/learning-pack identities; `docs/learning/english-wird-source-overrides.json` fails formatting; total output exceeds the existing ceiling. The generic gate measured 12,588,710 bytes against 12,582,912. No baseline/ceiling was changed or unrelated asset removed.
- A literal ban on scrolling at 200% text or in a very short window would hide content/actions. The documented intrinsic fallback intentionally keeps them reachable.
- Physical Android insets, TalkBack/VoiceOver and actual-device gesture/scroll acceptance are pending. This phase changes web presentation only and does not rebuild or install an APK.

## Out-of-scope findings

Preserved all independent book, audio, Quran, overlay, sharing and native work. Their failures do not make the passing completion assertions ambiguous; they remain unresolved repository-release blockers.

## Recommended next step

Review the actual phone screenshots and test on the owner's device. Consolidation/release work should resolve the independently owned book-audit, formatting and aggregate bundle findings before a separately authorized publication.
