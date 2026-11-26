# Actual Home prayer implementation — 2026-11-25

These are screenshots of the local application build, rather than the earlier design concepts. The browser uses a fixed 25 November 2026 Cairo clock and synthetic guest records: Fajr at home and Dhuhr at the mosque, with Dhuhr's before-prayer Sunnah recorded. These records are confined to an isolated browser context.

The reading catalogue is served from its existing verified local binary for reproducible captures. The screenshots use Reduce Motion and wait for the overlay footer to settle. They do not establish physical-device or assistive-technology acceptance.

| View                                                                | Screenshot                                    |
| ------------------------------------------------------------------- | --------------------------------------------- |
| Arabic tablet, 768 × 855, desktop-style timings and recorded checks | [Expanded](01-tablet-expanded-ar.png)         |
| Arabic tablet, Now/Next retained after explicit Hide                | [Collapsed](02-tablet-collapsed-ar.png)       |
| Arabic tablet tracking dialog                                       | [Tracking](03-tablet-tracking-ar.png)         |
| Arabic desktop, 1440 × 1000                                         | [Desktop](04-desktop-expanded-ar.png)         |
| Arabic phone, 390 × 844                                             | [Sheet](05-phone-tracking-ar.png)             |
| Arabic narrow phone, 320 × 740, 200% text                           | [Enlarged text](06-narrow-200-percent-ar.png) |
| English light/solid tablet                                          | [Expanded](07-tablet-light-en.png)            |
| English light/solid tracking dialog                                 | [Tracking](08-tablet-tracking-light-en.png)   |
| English light/solid Home, scrolled 150px                            | [Home scroll](09-home-scrolled-en.png)        |
| English light/solid Library, scrolled 150px                         | [Library scroll](10-library-scrolled-en.png)  |

The narrow-text capture demonstrates whole-word label reflow, a separately scrolling body and visible Close/Done controls. Guidance and remaining actions are reached by scrolling that body. See the [phase report](../../reports/HOME_PRAYER_DIALOG_LOCAL_2026_11_25_REPORT.md) for checks and limitations.
