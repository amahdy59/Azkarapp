# Engineering and release checklist

This document makes the project checklist auditable. A recommendation is **met** only when its automated check passes or a dated manual test record exists. “Not applicable” requires a reason in the pull request.

## Automated gates

Every pull request must pass `pnpm check` and `pnpm test:e2e`.

| Concern             | Evidence                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| Type safety         | Strict TypeScript and `tsc --noEmit`                                              |
| Code hygiene        | ESLint, React Hooks rules, JSX accessibility rules, and Prettier                  |
| Critical data logic | Unit tests for persistence, corruption recovery, merging, and localization        |
| Accessibility       | Axe WCAG A/AA scan plus keyboard skip-link smoke test at mobile and desktop sizes |
| Performance         | Screen lazy loading, Vite tree shaking, and per-asset bundle budgets              |
| Secrets             | Runtime environment variables; `.env*` excluded except `.env.example`             |
| Deployment          | The Pages workflow runs all non-browser quality gates before building             |

Current per-file production budgets are 550 KiB JavaScript, 128 KiB CSS, and 1 MiB for another asset. The CSS ceiling increased from 120 KiB to 128 KiB in July 2026 after the required Midnight/Light/OLED semantic theme contract. The documented accessible motion system now produces a measured 128.5 KB stylesheet while keeping the existing ceiling unchanged; approximately 2.5 KB of headroom remains. Reducing a budget is encouraged; any further increase requires measured justification in the pull request.

## Architecture rules

1. Use the existing layer-based structure documented in the README; do not introduce a competing feature structure.
2. Screens render and coordinate interaction. Put persistence and remote calls in `state.ts` or `src/lib`, static data in `content`, translations in `i18n`, and reusable visual patterns in `components`.
3. Use descriptive camelCase functions/values and PascalCase React components/types. Component filenames match their primary export.
4. Prefer typed props and function signatures. Add a “why” comment only when a constraint or decision is not evident from the code.
5. Search before creating a utility or component. Explain every new runtime dependency in the pull request.
6. Use theme variables and shared components before adding one-off colors, spacing, or motion.
7. AI-assisted code must be identified in the pull request and read, understood, tested, and reviewed by a human. Generated imports and prototypes are not evidence of correctness.

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

| Test                    | Required result                                                                                              | Date / tester / evidence |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Keyboard-only core flow | Logical order, visible focus, no traps; onboarding → category → reader → completion → settings               | Pending                  |
| Screen reader           | VoiceOver, TalkBack, or NVDA completes the same core flow with understandable names and announcements        | Pending                  |
| Text resize             | 200% browser zoom and largest app text setting do not hide content or actions                                | Pending                  |
| Contrast                | Light, dark, high-contrast, and color-blind modes pass a contrast analyzer                                   | Pending                  |
| Responsive layout       | 320 px mobile, 390 px mobile, tablet, and desktop reflow without clipping                                    | Pending                  |
| RTL                     | Arabic onboarding, navigation, category, reader, counter, and settings have correct order and icon direction | Pending                  |
| Safe areas              | iOS notch/home indicator and Android cutout do not cover controls                                            | Pending                  |
| Poor connectivity       | Offline banner appears; local reading/progress works; sync recovers after reconnect                          | Pending                  |
| Performance             | Record cold load, interaction responsiveness, and React Profiler evidence on a representative mobile device  | Pending                  |
| Media access            | Audio alternatives/transcripts and image descriptions are correct wherever media is introduced               | Pending                  |

Until every applicable row has dated evidence, the project must not claim complete manual checklist compliance.
