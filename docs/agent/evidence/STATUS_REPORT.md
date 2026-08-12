# Azkarapp — status report and improvement plan

**Produced:** 2026-08-10, against `b704f6f` (in sync with `origin/main`).

**How to read this:** everything under "Verified" was measured today by running it. Everything under "Not measured" is honestly unknown — I have not profiled it, and no one should treat its absence from the defect list as a clean bill of health.

---

## 1. Current state

### Verified today

| Check                     | Result                                                    |
| ------------------------- | --------------------------------------------------------- |
| `tsc --noEmit`            | Clean                                                     |
| `eslint --max-warnings 0` | Clean                                                     |
| Unit tests                | **386 passing** across 73 files — but see flakiness below |
| E2E tests                 | **314 passing** across 15 specs (last full green run)     |
| Bundle budget             | Passing                                                   |
| Working tree              | Clean except regenerated evidence screenshots             |

Source size: ~34,000 lines across `src`. 54 components, 22 runtime dependencies, 52 recorded decisions.

### Not measured — no data either way

- **Runtime performance.** No Lighthouse run, no device profiling, no interaction latency measurement. The only performance signals are a passing bundle budget and an 8.2 MB precache, neither of which tells you how the app feels on a mid-range Android.
- **Real screen-reader behaviour.** Automated axe scans pass; no VoiceOver / NVDA / TalkBack session has been run.
- **Safe areas** on notched hardware, **poor connectivity**, and **media alternatives**.

These are four of the six manual QA rows that remain `Pending` in `docs/QUALITY_CHECKLIST.md`, and they are the reason this app cannot yet make an honest accessibility or performance claim.

---

## 2. Phase status

| Phase                        | Status          | Notes                                                                                                |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| 00 Repository audit          | Complete        |                                                                                                      |
| 01 Baseline capture          | Complete        | Screenshot evidence set in place                                                                     |
| 02 Design foundations        | Complete        | DEC-006 … DEC-013: tokens, shadows, focus rings, status colours                                      |
| 03 Shared components         | Complete        | DEC-014 … DEC-025: Button, Tabs, SegmentedControl, Modal/ResponsiveSheet                             |
| 04 Shell and navigation      | Complete        | DEC-027: hybrid shell, three nav variants, real History API                                          |
| 05 Home                      | Complete        | DEC-028/029/044                                                                                      |
| 06 Library                   | Complete        | DEC-032/036: Arabic search normalization, taxonomy groups                                            |
| 07 Reader                    | Complete        | DEC-033/034/047/048                                                                                  |
| 08 Progress                  | Complete        | DEC-037/038/040/042: week-grid a11y, RoutineGarden split, metric integrity                           |
| 09 Settings                  | **Complete**    | DEC-050, landed 2026-08-10                                                                           |
| 10 System states             | **Not started** | Components exist (`NetworkStatus`, `SyncStatus`, `StatePanel`, `PwaNotice`) but are not standardised |
| 11 Responsive & i18n         | **Not started** | Partial coverage via the e2e viewport matrix                                                         |
| 12 Accessibility remediation | **Not started** | Automated scans pass; manual rows outstanding                                                        |
| 13 Release hardening         | **Not started** | Deployment pipeline is healthy; formal hardening pass not done                                       |

### Cross-cutting work completed outside the phase sequence

- **i18n integrity** — ~180 inline bilingual strings across 22 files moved into the bundle; zero remain except two documented in `AppErrorBoundary`. Missing translations now fail the build.
- **Storage integrity** — "Erase local data" now clears every app-owned namespace including downloaded offline audio (DEC-049); two unbounded key families now pruned.
- **Release gate** — `gardenViews.ts` reaches its 100% threshold from its own tests rather than depending on cross-file coverage merging.

---

## 3. What is not implemented

### Known regressions since the sweep

Five inline bilingual strings have reappeared in newer commits (`HomeCards.tsx`, `HomeScreen.tsx:139`, plus one more in `AppErrorBoundary`). These bypass the parity guard. Small, but they show the sweep needs a lint rule to hold, not just a one-time pass.

### Deferred with reasons

| Item                             | Why deferred                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Desktop Progress width           | Belongs to Phase 11, which owns the viewport matrix this needs                   |
| `App.tsx` extraction             | Plan written and awaiting review; see `pre-phase-ten/APP_TSX_EXTRACTION_PLAN.md` |
| Language and RTL co-location     | Not approved; `forceRtl` is a reading override, not a locale choice              |
| Progress/Friday state extraction | Owns real product semantics; needs its own decision                              |

---

## 4. Improvement plan by lens

### 4.1 Code maintainability and structure

**The single biggest issue: `App.tsx` at 1637 lines**, one `AppContent` function of ~1450 lines at cyclomatic complexity 80, holding ~40 `useState` and 14 `useEffect`, with **zero direct unit coverage**. Every screen depends on it, so it is both the riskiest file and the least protected.

A full plan exists with five extraction seams ordered by blast radius. The recommendation is to do seam 1 (`usePwaLifecycle`, ~60 lines) as a trial and judge the approach on whether the full e2e suite passes with **zero spec edits**.

**Other structural debt, in order:**

| File                | Lines | Issue                                                                                   |
| ------------------- | ----- | --------------------------------------------------------------------------------------- |
| `ReaderScreen.tsx`  | 1122  | Second-largest screen; heavy branching for phone/tablet/desktop trees                   |
| `ProgressViews.tsx` | 1020  | Four large view components in one file; 91% covered, so a split is safe whenever wanted |
| `state.ts`          | 762   | Persistence, normalization, migration and merge in one module                           |
| `content/azkar.ts`  | 3115  | Data, not logic — acceptable, but worth splitting per collection if it keeps growing    |

**Test coverage gaps** (~69% statements overall): `lib/auth.ts` at 29%, `lib/observability.ts` at 7%, `useAuthHandlers.ts` at 11%. These are the auth and telemetry paths — the ones hardest to debug from a user report.

**Recommended actions**

1. Add an ESLint rule banning bilingual ternaries in JSX so the i18n sweep cannot silently regress. This is the highest value-per-effort item on this list.
2. Trial `App.tsx` seam 1, then decide.
3. Raise `lib/auth.ts` coverage before touching it for any reason.
4. Consider splitting `ProgressViews.tsx` — the safety net already exists.

### 4.2 Test-suite reliability — treat as its own workstream

Across six full runs today, **a different test flaked almost every run**, in both the e2e suite and now the unit suite. The unit suite failed once at 31.7s on a test that passes in 0.4s alone, then passed 386/386 on re-run.

This is contention, not a product defect, and it is corrosive: it trains everyone to re-run rather than investigate.

The most likely lever: `playwright.config.ts` runs the suite against `npm run dev` — the **HMR dev server** — so every test competes with on-demand transforms. Running against a built preview would remove that variable. `workers: 3` may also be too many.

Note that `retries: process.env.CI ? 2 : 0` means CI silently retries these away while local developers see red — the failure is invisible exactly where it is automated.

### 4.3 Visual design consistency

The token system is in good shape after Phase 02: semantic colours, three-level elevation, standardised focus rings (3 px for controls, 1 px subtle for scroll regions), and opaque functional surfaces per DEC-003/007.

**Remaining inconsistencies**

- **Long vs short category naming.** "After Prayer Azkar" in lists, "Post-Prayer" in column headers. Both are now deliberate and commented, but a reader will notice.
- **Icon meaning is not audited.** `MapPin` now fronts a row covering both location _and_ reminders after the Phase 09 merge. Defensible, not obviously right.
- **The evidence screenshot set is stale** and regenerates noisily on every e2e run, so it cannot currently be used to spot visual regressions. Either commit regenerated shots deliberately as part of a release, or move them out of the working tree.

### 4.4 Performance

**Honest position: unmeasured.** What is known:

- Bundle budget passes; largest chunk ~356 kB raw / ~100 kB gzip
- Precache is **8.2 MB across 127 entries** — large for a first visit on a slow connection, and worth interrogating: fonts and background imagery dominate
- Route-level code splitting is in place and working

**Recommended actions**

1. Run Lighthouse on a throttled mid-range profile and record the numbers. Until this exists, every performance statement is a guess.
2. Interrogate the 8.2 MB precache — the app must work offline, but not everything needs precaching on first load.
3. Measure counter-tap latency specifically. It is the app's hottest interaction, and `useZikrCounter` already had a dead `pulse` state forcing an extra render per tap (fixed in DEC-033) — evidence this path deserves attention.

### 4.5 UX best practices

Strong: one dominant action per screen, non-punitive progress framing, guest mode fully usable, offline-first reading, recoverable accidental completions (DEC-034).

**Remaining gaps**

- **Settings rows still under-report state.** Phase 09 fixed the prayer-times row; Notifications still shows a constant "Setup" rather than on/off, and Offline access always shows "Included".
- **Desktop Progress underuses its width** — a narrow centred column on a 1280 px viewport.
- **No empty/loading/error standardisation** — that is Phase 10, and it is the next thing worth doing.
- **The compact Home header** shows bare numerals for streak and palms below the `sm` breakpoint.

### 4.6 Accessibility

Genuinely good foundations: WCAG 2.2 AA targeted, per-mode contrast automated across all five themes (DEC-035), APG tabs, real focus containment in dialogs (DEC-025), non-colour cues for navigation and completion state, and a week grid that conveys completion as text (DEC-037).

**Fixed today:** colour-blind support converted from four `aria-pressed` toggles to a real radio group; the Home streak/palms cluster given `role="img"` so its label is announced at all.

**Remaining — and the honest blocker**

1. **No real screen-reader session has been run.** Automated scans are necessary and not sufficient; AGENTS.md §6 says so explicitly. This is the single largest gap between "passes axe" and "is accessible".
2. **Safe areas** untested on notched hardware.
3. **200% zoom / largest text** is automated but not manually reviewed for sense.
4. **`aria-label` on roleless containers** has now appeared three times (Progress week grid, Home header, colour-blind group). Worth a lint rule, since the pattern clearly recurs.

---

## 5. Recommended order

1. **Phase 10 — system states.** Next in sequence, and it standardises loading/offline/error/empty, which every later phase depends on.
2. **Test-suite reliability.** Do this early; it makes every subsequent phase's evidence trustworthy.
3. **ESLint rule for inline bilingual strings.** Cheap, prevents regression of finished work.
4. **Phase 11 — responsive and i18n**, absorbing the desktop Progress width item.
5. **Phase 12 — accessibility**, with a real screen-reader session as its centrepiece. This is the phase that needs a human most.
6. **`App.tsx` seam 1**, once there is a quiet window — it conflicts badly with concurrent UI work.
7. **Phase 13 — release hardening**, including the first real performance measurement.
