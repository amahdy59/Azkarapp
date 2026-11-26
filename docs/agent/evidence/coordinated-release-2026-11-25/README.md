# Coordinated release evidence

Actual application captures from the isolated loopback preview during the release begun on 2026-11-25 and continued on 2026-11-26. No production backend is used by these general UI checks.

| Capture                                                      | Finding                                                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [Prepared sharing before](prepared-sharing-phone-before.png) | At 390×844, the 48dvh preview pushes part of its navigation under the fixed export footer.                            |
| [Prepared sharing after](prepared-sharing-phone-after.png)   | The bounded 40dvh preview retains readable artwork, full-size inspection and completely visible 44px card navigation. |

The original six Arabic/English prepared-arrow cases failed across Chromium, Firefox and WebKit. After the CSS correction all six pass with their original viewport, physical arrow-direction, pointer/keyboard, boundary, grouping and target assertions intact. The accompanying 37 sharing matrix cases passed; the corrected source-radio focus behavior is included in its three-engine keyboard cases. Thirty-nine sharing component tests pass.

| Final Masbaha capture                                                 | Verified behavior                                                                                                                       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Arabic Light phone](quiet-masbaha-ar-phone.png)                      | One reviewed dhikr, fitted six-digit tally and three equal actions at 390×844.                                                          |
| [English Midnight, 320px/200%](quiet-masbaha-en-320-200.png)          | Separate header-title row, whole stacked action labels and fully reachable final focused action. Reading content scrolls independently. |
| [English enlarged labelled actions](quiet-masbaha-en-actions-200.png) | Final action remains completely visible after scrolling; retained full-viewport assertions pass.                                        |

The final quiet-layout/chooser regression passes all 12 cases across Chromium, Firefox and WebKit in 1.8m. The preceding wider migrated matrix passed 49 cases and exposed the same fractional scroll-end clipping in three engines; the final spacer fix resolves all three without relaxing the assertions. Five focused Masbaha/helper/portion suites pass 31 unit tests. Full run details remain in the coordinated report.

Quran enlargement passes fifteen responsive/pinch cases across the three engines: all word identities occur exactly once, portions fit, and returning restores the original Mushaf page and focus. Automated keyboard/viewport/axe evidence does not establish real-device or human assistive-technology acceptance.

Exact commands, subsequent custom-field checks and final release/CI/production identity belong to the [phase report](../../reports/COORDINATED_RELEASE_2026_11_25_REPORT.md). Local failure traces and detailed run JSON remain under `output/coordinated-*`.
