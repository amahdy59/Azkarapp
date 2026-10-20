# Performance, stability and Progress review — 2026-10-20

## Scope and evidence

Reviewed shell/materials and header scroll ownership, Progress derivation/charts, clocks/startup deferral, sharing preparation/cancellation, the existing Progress proposal, local evidence and every failed job in Quality run 39357670363. This is a focused engineering review, not an exhaustive app/device certification. Physical GPU/inertial-scroll and assistive-technology acceptance remain separate.

## Confirmed findings and repairs

### P1 — Unavailable frost leaves Progress controls transparent

The base CSS gave sticky controls a solid background only outside Glass or in high contrast. Glass styling itself lives inside a positive backdrop-filter query. If that feature query is unavailable while Glass remains selected, the complete title/filter group has no protective ground and moving text competes with its controls.

Reproduced in Arabic at 390px and English at 1280px by disabling only positive frost queries: both original tests failed with rgba(0, 0, 0, 0). Give base controls their existing theme background; supported Glass overrides it inside the existing query. All six repaired tests pass across Chromium, Firefox and WebKit through rest and upward/reversed scrolling. No palette, threshold, shell or stationary Library change. This proves a fallback defect; it does not establish that the owner's unspecified device uses this fallback.

### P2 — Scrolling rebuilds unchanged Progress history

ProgressScreen allocated a new displayDate on every render and new empty default arrays. These identities invalidated garden/weekly derivations when only header elevation changed. A regression measured one initial garden calculation plus two unnecessary calculations after scrolling down and back up (three total).

Memoize the selected date against actual clock/period/offset/calendar and use stable empty-record defaults. The same regression now requires one calculation for that cycle; changed records and the configured 03:00 devotional-day boundary still recompute. Existing period-navigation/Quran-goal and clock/scroll tests also pass: 28 tests in five files. This is a measured reduction in recomputation, not a claimed physical-device speedup percentage or zero-scroll-work result.

### P2 — Responsive plan options sit on the target-size floor

CI and local mobile Chromium reproduction found one 44px option measured 43.999969px after positioned rendering. Preserve strict target/direction/alignment/selection assertions; use 48px options matching compact-form fields. Local mobile/tablet checks pass. Saved plan payloads/calculations remain unchanged.

### P2 — Combined sharing evidence test exhausts its budget

Full-shard WebKit exhausted the unchanged 90-second test budget while one board flow traversed wide geometry, 21–23 square PNGs, a real download, two phone widths and 200% text. Failed logs show different late steps on retries. Split wide design/export and phone/enlarged reflow into independent flows with identical setup and every original assertion. Keep timeouts, browser inventory, real files, geometry, axe and console checks. This is test decomposition, not an application performance fix.

## Header rendering review

Live Chromium paint probing confirms supported Glass samples and blurs content behind Progress. Extended upward/reversal checks for Progress, Settings/root/subsections and the deliberately stationary Library passed 24 cases across three engines; another Home protected-ground/fallback check passed. Tests retain fixed header bounds, 32px frost, original 8px/2px hysteresis, nested-scroll isolation, one transparent inner Progress header, opaque/high-contrast recovery and axe. Home retains one shared scrolled frost, with no duplicate header/card filter.

The unavailable-frost regression proves its repair separately. Do not describe the owner's unspecified visual glitch as conclusively reproduced on their device from these tests alone. Screen/device context remains useful if a compositor-specific symptom persists. Screenshots are actual app captures; the colored paint probe was diagnostic only and is absent from product code.

## Performance opportunities to profile next

Fresh production-build startup observation: Home became visible at 5,976ms under six-times CPU slowdown, 100ms latency and 200kB/s download throughput. No optional audio controller/catalogue or Reader component chunk loaded at Home entry. Recorded long tasks included one 1,013ms task under that CPU throttle. These are desktop simulation measurements, not physical-device guarantees or a controlled before/after speedup. The resource trace also includes the eagerly referenced content and Al-Baqarah chunks; profile their parse/evaluation work separately before proposing a lazy-content split that must preserve first-offline-use and synchronous collection contracts.

1. **Reuse export preparation within one generation.** Compatibility checking and generation both prepare the same Quran glyph inputs. Before Sleep square exports produce 21–23 full PNGs. Profile preparation versus drawing/encoding separately before bounded request-local reuse. Preserve exact text/glyph offsets, cancellation, readable sizes, streamed/previous previews and URL cleanup. No global unbounded image cache or new dependency is justified from inspection alone.
2. **Index history per record revision.** Historical views rebuild aggregates/matched windows on unrelated renders, and garden judgments scan record lists per day. Profile realistic long-history interactions before sharing indexed days across selectors. Key caches to actual record/date/calendar boundaries and language where labels are cached. Never backfill observations or interpret missing history as missed worship.
3. **Measure hidden-detail mount costs.** Native disclosures can mount complete content while closed. Defer expensive content only when profiling warrants it, preserving keyboard recovery, selection, exact exports and offline access.

Retain existing strengths: clocks pause/resynchronize around hidden tabs; startup maintenance is deferred; optional audio/content loads at intent; exports abort obsolete work and revoke owned URLs; native scrolling uses threshold-only React state. No evidence here justifies replacing the router/state/toolchain, virtualizing small lists or adding dependencies.

## Progress proposal disposition

Proceed with one compact range toolbar, four independent overview metrics, one selectable prominent trend and optional comparisons/exact records. Home remains the recording surface; Friday/reflection remains optional context. Avoid a combined worship score or invented historical opportunities.

Compose using verified Day/Week/Month/Year first and reconcile totals against fixtures/exports. Custom needs separate acceptance for inclusive labels, civil/devotional rollover, Gregorian/Hijri boundaries, future/partial days, equal-length comparisons, free/repeating Quran plans and unavailable older item history. Keep selection visit-local initially; test and separately approve normalization/backup/sync before saving preferences. A day shows useful counts, rather than a one-point trend. The dashboard redesign remains proposed.

Acceptance: Arabic/English at 320/390/834/1280px and 200% text; short-screen sticky clearance; complete keyboard/pointer values and explicit export scope; no clipping, invented zeros or denominator drift.

## Verification record

Final commands, screenshots, release revision and CI/Pages/production outcomes accompany the phase report and output/release-2026-10-20/PHASE_REPORT.md. Preserve failed candidates. Local results do not replace final gates or exact-commit production confirmation.
