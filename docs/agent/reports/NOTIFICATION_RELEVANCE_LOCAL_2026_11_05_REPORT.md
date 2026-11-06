# Phase Report — Relevant notifications and dated delivery

## Objective

Apply the approved catalogue with prayer-specific authentic narration, appropriate timing, deterministic group rotation and useful notification destinations.

## Scope completed

Five prayer pools, morning/evening/sleep rotation and the existing Friday reading/dua and pre-Fajr payloads use the approved source text and conditions. Prayer titles show the scheduled clock time. Shared occurrences retain selected prayer filters, local routine times and completion suppression, with expiry and dated identities. One Android scheduling owner replaces two competing owners and clears old marked alarms. Browser taps use protected worker and constructor navigation. Native prayer taps open the named prayer.

## Files changed

notificationCopy, notificationEvidence.json, reminderOccurrences, contextReminders, useForegroundReminders, native reminder plan/replacement, the former native scheduler compatibility module, notifications, the imported worker script, Vite configuration and localized clock-time titles. The existing build-only audio literal compactor and its exact-value tests restore bundle headroom. Source, delivery, worker, lifecycle and browser tests accompany the changes.

## Components added or modified

The existing Notifications settings controls retain their roles. The implementation changes scheduling and delivery services. Native notifications receive an expanded text body so captions and sources remain available.

## User-visible changes

Asr uses the two cool prayers or angels gathering at Fajr and Asr. Dhuhr before zawal uses the explicitly labelled voluntary-prayer narration. Each main group names the featured zikr and keeps its conditions. The same dated event receives the same evidence in browser delivery and Android queue rebuilds. Tapping an alert opens its corresponding prayer or reading group.

## Accessibility work

Arabic/English notification direction and text remain explicit. Native expanded text includes the quotation, caption and reference. Existing settings permission recovery, test status and keyboard controls remain in the browser regression scope.

## Tests added or updated

Exact approved quotation/source matching, Asr pool rotation, Dhuhr advance guard, group counts, selected-location and DST/date boundaries, browser expiry, shared Android copy, simultaneous events, multiple mounted hooks and rerenders, legacy native alarm cancellation, internal/native/worker route validation and the bilingual Asr click/reload journey.

## Commands run

| Command / scope                                                             | Exact result                                                                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Focused notification/source/occurrence/worker/native/lifecycle units        | 66 passed across ten files in 4.58s                                                                                                  |
| Upgrade history and native expanded-body follow-up units                    | 14 passed in 4.55s                                                                                                                   |
| Stable native IDs and dated plan units                                      | 14 passed in 4.41s                                                                                                                   |
| Shared reference/grade metadata and native plan units                       | 8 passed in 3.95s                                                                                                                    |
| Initial browser matrix                                                      | 11 passed, one WebKit English reminder case timed out after its axe scan                                                             |
| Isolated unchanged WebKit case                                              | 1 passed in 53.6s                                                                                                                    |
| Final Arabic/English Asr payload, loaded destination, tap and reload matrix | 6 passed across Chromium, Firefox and WebKit in 1.4m                                                                                 |
| Shared prayer-helper and lifecycle follow-up                                | 21 passed in 9.56s                                                                                                                   |
| Build-only audio literal sharing                                            | 5 passed in 1.45s, including exact before/after equality for both real manifests                                                     |
| Complete final quality gate                                                 | `pnpm check` passed every stage in 168.5s, including coverage and bundle ceilings. `output/notification-relevance-release-check.log` |
| Android web build                                                           | Final native candidate passed in 23.91s                                                                                              |
| Pages build                                                                 | Final pass, including CSS and unchanged bundle ceilings. 12,570,360 bytes. output/notification-relevance-release-pages.log           |
| Browser inventory                                                           | Passed. 3,279 cases across nine shards                                                                                               |
| Physical device inventory                                                   | ADB found no connected devices                                                                                                       |
| Production dependency audit                                                 | No known vulnerabilities found                                                                                                       |

The first full gate found the new worker's missing globals declaration, an upgrade-history test running before its correction, and a 2,625-byte bundle overrun. Intermediate gates passed units/lint but retained 1,226-byte, 174-byte and 39-byte excesses. The final candidate removes unused old payload strings and section labels, shares reference/grade metadata and reuses the dated planner in the prayer diagnostic helper. The existing build-only audio interning also shares repeated labels over sixteen bytes, with exact before/after catalogue equality tests. Source records and exported values remain identical. Exact logs are under `output/notification-relevance-*.log`. No thresholds, assertions or source text were weakened.

## Visual/manual evidence

The final matrix records delivered notification payload attachments and loaded Asr screenshots under `output/playwright/notification-relevance-final`. The Arabic Chromium destination screenshot was visually inspected. These are browser notification adapter captures. Physical Android notification display, lock-screen truncation and timing remain device acceptance work.

## Documentation updated

Content authoring, architecture, prayer-time contract, quality checklist, decision log, active phase/index and both notification approval documents.

## Decisions recorded

The owner approved the catalogue conditional on authenticity, relevance and timing. The ready subset follows the catalogue's implementation stages A/B and the existing reminders in C. Catalogue rows that still require payloads, guides, eligibility or calendar confirmation remain future stages. Existing opt-ins and notification count are retained.

## Known limitations or remaining risks

Android delivery can be delayed by exact-alarm access, power restrictions or force-stop. Clock-time titles remain truthful during those delays. Browser expiry cannot control OS delivery after a notification request has been accepted. Web Locks coordinate supported browser tabs. The fallback coordinates concurrent instances in one page, with persisted history and stable OS notification tags assisting deduplication.

## Out-of-scope findings

Optional Friday salawat, voluntary fasting, Duha, Witr and calendar-sensitive reminders remain catalogue follow-ups with their new setting/guide and eligibility work. Approval of the topic list does not supply the pending payloads or missing destinations.

## Recommended next step

Review the local source/rotation and browser evidence. Complete real Android expanded-notification, tap and delivery checks before publication. The preceding Mushaf/Information candidate remains local under its review gate.
