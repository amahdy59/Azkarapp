# Manual QA walkthrough

Scripts for the four rows in `QUALITY_CHECKLIST.md`'s Manual release record that **cannot** be automated. The other seven rows are covered by `e2e/manual-checklist.spec.ts` and are already dated.

Record the date, your name, and the outcome in the checklist table when you finish a section. If a step fails, note what happened rather than marking the row done.

Test against the deployed site (`https://amahdy59.github.io/Azkarapp/`) so you exercise the real service worker and asset loading.

---

## 1. Screen reader

**Why a human is required:** automated tests prove accessible text _exists_. They cannot tell you whether it _makes sense when heard_. This matters here specifically — corrupted Arabic shipped twice during development without a single test failing, because nothing asserted on how Arabic reads.

**Pick one:** VoiceOver (macOS ⌘F5 / iOS Settings → Accessibility), NVDA (Windows, free), or TalkBack (Android).

Run the core flow **with your eyes closed or the screen curtain on**. If you can complete it without looking, it passes.

| #   | Step                                  | What to listen for                                                                                        |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Launch the app                        | Language choice is announced; options are distinguishable                                                 |
| 2   | Choose Arabic, continue as guest      | Announcements switch to Arabic and are correctly pronounced — **not** garbled or read as Latin characters |
| 3   | Navigate to Azkar                     | Each group heading is announced before its collections ("أذكار اليوم", then the cards)                    |
| 4   | Open Morning Azkar, start the session | The zikr text reads correctly; the counter states its current count and target                            |
| 5   | Complete one zikr                     | Completion is announced without cutting off the zikr being read                                           |
| 6   | Go to Progress → Week tab             | **Every grid cell** states its routine and status ("Morning: Completed"). No cell should be silent        |
| 7   | Progress → Month tab                  | Each day states its number and status (complete / partial / unstarted)                                    |
| 8   | Open Settings and change theme        | The control's purpose and new state are both clear                                                        |

**Fail conditions:** any silent control, Arabic read as gibberish, an announcement that interrupts devotional text mid-sentence, or focus landing somewhere unexplained.

---

## 2. Safe areas

**Why a human is required:** needs real hardware. Emulators do not reproduce notch and gesture-bar insets faithfully.

Use a notched iPhone (X or later) and an Android device with a cutout or gesture bar. Install the PWA to the home screen — **browser chrome hides the problem**.

| #   | Step                                      | Check                                                            |
| --- | ----------------------------------------- | ---------------------------------------------------------------- |
| 1   | Open the installed app, portrait          | Top bar clears the notch; nothing is obscured                    |
| 2   | Rotate to landscape                       | Content clears the notch on the side it moves to                 |
| 3   | Open the reader                           | Bottom controls sit above the home indicator and remain tappable |
| 4   | Open a benefit/reference sheet            | Sheet content is not cut off at either end                       |
| 5   | Bottom navigation, portrait and landscape | All items reachable; none sit under the gesture bar              |

---

## 3. Performance

**Why a human is required:** needs a representative mid-range device, not a development machine.

Use a mid-range Android phone (not a flagship) on a throttled connection (DevTools → Network → Fast 3G).

| #   | Measure                    | Target                          | How                                                   |
| --- | -------------------------- | ------------------------------- | ----------------------------------------------------- |
| 1   | Cold load to interactive   | Under ~3s on Fast 3G            | DevTools Performance, hard reload with cache disabled |
| 2   | Counter tap responsiveness | No perceptible lag              | Tap rapidly through a full collection                 |
| 3   | Screen transitions         | No dropped frames               | Performance trace while moving Home → Azkar → Reader  |
| 4   | React render cost          | No unexpected re-renders on tap | React DevTools Profiler while counting                |

Save the trace files alongside the checklist entry.

---

## 4. Media alternatives

**Why a human is required:** judging whether a description is _adequate_ is editorial, not mechanical.

| #   | Check                                 | Expectation                                                 |
| --- | ------------------------------------- | ----------------------------------------------------------- |
| 1   | Audio recitation controls             | Purpose is clear without hearing the audio                  |
| 2   | Decorative imagery (hero backgrounds) | Hidden from assistive tech — should not be announced at all |
| 3   | Meaningful imagery                    | Has a description conveying what matters, not a filename    |
| 4   | Progress visuals (palms, leaves)      | The same information is available as text                   |

---

## Recording results

Update the table in `docs/QUALITY_CHECKLIST.md` with `YYYY-MM-DD / your name / outcome`. Leave a row `Pending` if you did not complete it — a partially-run section is not evidence.
