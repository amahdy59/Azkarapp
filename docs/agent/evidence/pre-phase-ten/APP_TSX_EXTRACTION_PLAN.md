# `App.tsx` extraction plan

**Status:** Plan only. No extraction has been performed. This needs review before any code moves — it is the largest structural change left in the repo, and AGENTS.md §4 asks for a plan before editing.

**Produced:** 2026-08-10.

---

## 1. Why this file is the top maintainability item

| Measure                     | Value                                   |
| --------------------------- | --------------------------------------- |
| Lines                       | 1635                                    |
| `AppContent` function       | ~1450 lines, cyclomatic complexity 80   |
| `useState`                  | ~40                                     |
| `useEffect`                 | 14                                      |
| `useCallback` / `useMemo`   | 18                                      |
| Direct unit-test coverage   | **none** — no test file imports `App.tsx` |

For comparison, `RoutineGarden.tsx` was split under DEC-038 → DEC-040 at 672 lines. This is more than twice that, with a single component holding all of it.

It is also the file every screen ultimately depends on, so the cost of a bad refactor here is higher than anywhere else in the app.

## 2. What actually lives in it

State clusters cleanly into five groups, which is the encouraging part — the file is large but not tangled:

| Cluster                       | Lines     | State | What it owns                                                                                   |
| ----------------------------- | --------- | ----- | ---------------------------------------------------------------------------------------------- |
| Routing & navigation          | 187–208   | 11    | `view`, `activeTab`, `activeCat`, `activeIdx`, `searchQuery`, `librarySection`, route loading  |
| Appearance & accessibility    | 245–256   | 11    | theme, language, text size, contrast, motion, haptics, RTL, colour-blind                        |
| Prayer times & reminders      | 259–270   | 6     | reminders, location, weekly goal, quiet progress, day-start hour, calendar                      |
| Progress & completions        | 273–285   | 6     | daily completions, growth events, completed sets, Friday dua flow                               |
| Account & profile             | 324–329   | 6     | sessions, saved zikr, display name, email, phone, avatar                                        |

The 14 effects map onto the same groups:

| Effect line   | Concern                                                              |
| ------------- | -------------------------------------------------------------------- |
| 311, 315      | Friday weekly progress hydration                                     |
| 319           | Initial route resolution (lazy category preload)                     |
| 534           | Friday dua flow teardown when navigating away                        |
| 540           | Audio session ↔ reader position sync                                 |
| 695           | Prayer-boundary scheduling (`setTimeout` + visibility change)        |
| 724           | PWA update / install-prompt lifecycle                                |
| 743           | Appearance application (`applyAppAppearance`)                        |
| 756           | State persistence (`saveAppState`)                                   |
| 762, 770, 804 | History API: initial replaceState, hash sync, popstate handling      |
| 837           | Global keyboard shortcuts                                            |
| 890           | Home-only behaviour                                                  |

## 3. Proposed seams, in the order I would cut them

Ordered by ascending blast radius. Each is a separate reviewable change.

1. **`usePwaLifecycle`** — effect 724 plus `updateAvailable` / install-prompt state. Entirely self-contained, talks only to `window` events, has an existing e2e spec (`pwa-update.spec.ts`) as its safety net. Lowest risk; do this one first to validate the approach.
2. **`usePrayerBoundarySchedule`** — effect 695. Self-contained timer plus a visibility listener. Depends on `locationSettings` and nothing else.
3. **`useAppShortcuts`** — effect 837. A single `keydown` handler; its interactions are already covered by the keyboard e2e tests.
4. **`useHistoryRouting`** — effects 762, 770, 804 together with the in-app depth counter from DEC-027. These three must move as one unit; they share the counter and would break if separated.
5. **`useAppearanceSync`** — effect 743 plus the 11 appearance state slots. Larger, but mechanical.

**Deliberately not extracted:** the progress/completion cluster and the Friday dua flow. Those own real product semantics (the completion ledger, palm/leaf accounting) rather than lifecycle plumbing, and DEC-042 already established that this area is easy to get subtly wrong. They deserve their own decision, not inclusion in a mechanical refactor.

## 4. The safety net, and why it is not characterization tests

DEC-038 wrote characterization tests before splitting `RoutineGarden`, and that was right *there* — the file was pure rendering at 2.45% coverage.

`App.tsx` is a different problem. Unit-testing it in jsdom would mean mocking Supabase, the audio controller, the service worker, the History API, prayer-time calculation and geolocation. Those tests would assert against mocks rather than behaviour, and would need rewriting by the very refactor they exist to protect.

**The 314-test e2e suite is the better net here** and it already exists. It exercises routing, keyboard shortcuts, the PWA update notice, appearance switching and persistence against a real browser — precisely the seams listed above.

Proposed verification for each extraction, reusing the DEC-040 technique:

- The full e2e suite passes unchanged, with **no spec edits** — any edit needed means behaviour moved, not code
- Coverage totals are byte-identical before and after, which is what proved DEC-040's split was pure movement
- Every extracted symbol is re-exported from `App.tsx` where anything else imports it, so no call site changes

## 5. Risks

- **Effects 762/770/804 are order-dependent.** The depth counter is decremented in the `popstate` handler only, never in `pop()` — DEC-027 records why. Splitting them apart would reintroduce the double-count bug.
- **Effect 540 couples audio to reader position.** It reads `audioController.state`, so it is sensitive to render timing; moving it risks changing when it fires.
- **`AppContent` is lazily mounted per view.** Screens remount on navigation, which already broke `useScreenFocus` once (DEC-027). Any extracted hook holding a ref must be checked against that.
- **Concurrent work.** This file changes often. A long-running extraction branch would conflict badly; each seam should land quickly rather than accumulating.

## 6. Recommendation

Do **seam 1 only** (`usePwaLifecycle`) as a trial. It is small, independently verifiable, and will show whether the "no spec edits, identical coverage totals" bar is achievable here. If it holds, continue through seams 2–4. If it does not, stop and reconsider — that result would be worth more than the refactor.

Estimated size: seam 1 is roughly 60 lines moved. Seams 1–4 together are roughly 300 lines out of 1635, taking `AppContent` under ~1150 lines. That is an improvement, not a cure; the remaining bulk is the render tree and the five state clusters, which is a product-level decomposition rather than a mechanical one.
