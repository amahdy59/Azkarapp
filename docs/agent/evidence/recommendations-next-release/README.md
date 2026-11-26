# Separate next-release candidate — screenshot evidence

Actual app captures from the isolated worktree on 2026-11-26. No concepts or regenerated artwork. This candidate is local and unpublished. The base is `974cb93d`; current main release remediation is not copied here.

Qibla orientation and permission states use labelled synthetic fixtures. These show layout and behavior, not physical direction accuracy, real handset permission UI or TalkBack/VoiceOver acceptance. Location dialogs use a deterministic Cairo fix. Ordinary Qibla 360×640/390×844 has no scroll and unchanged location/dial/direction/action-slot bounds across sensor states. At 320px/200% text, vertical recovery is retained to keep all text/actions usable. Home screenshots show the scrolled routines/books/tools area.

[Phase plan](../../phases/RECOMMENDATIONS_NEXT_RELEASE_2026_11_26.md) · [Checkpoint report](../../reports/RECOMMENDATIONS_NEXT_RELEASE_2026_11_26_REPORT.md) · [Capture provenance](manifest.json) · [Browser gallery](gallery.html)

## Qibla: stable mobile states

| View               | State                                                                                | Screenshot                                 |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| Qibla AR · 390×844 | live-simulated; synthetic orientation samples, Glass; geometry verified unchanged    | [Open](qibla-ar-390-live-simulated.png)    |
| Qibla AR · 390×844 | aligned-simulated; synthetic orientation samples, Glass; geometry verified unchanged | [Open](qibla-ar-390-aligned-simulated.png) |
| Qibla AR · 390×844 | poor-simulated; synthetic orientation samples, Glass; geometry verified unchanged    | [Open](qibla-ar-390-poor-simulated.png)    |
| Qibla AR · 390×844 | stale-simulated; synthetic orientation samples, Glass; geometry verified unchanged   | [Open](qibla-ar-390-stale-simulated.png)   |
| Qibla EN · 390×844 | live-simulated; synthetic orientation samples, Glass; geometry verified unchanged    | [Open](qibla-en-390-live-simulated.png)    |
| Qibla EN · 390×844 | aligned-simulated; synthetic orientation samples, Glass; geometry verified unchanged | [Open](qibla-en-390-aligned-simulated.png) |
| Qibla EN · 390×844 | poor-simulated; synthetic orientation samples, Glass; geometry verified unchanged    | [Open](qibla-en-390-poor-simulated.png)    |
| Qibla EN · 390×844 | stale-simulated; synthetic orientation samples, Glass; geometry verified unchanged   | [Open](qibla-en-390-stale-simulated.png)   |

## Qibla: permission and recovery

| View               | State                                                      | Screenshot                                   |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| Qibla AR · 390×844 | permission-needed; mocked permission result, light solid   | [Open](qibla-ar-390-permission-needed.png)   |
| Qibla AR · 390×844 | permission-denied; mocked permission result, light solid   | [Open](qibla-ar-390-permission-denied.png)   |
| Qibla AR · 390×844 | permission-recovery; mocked permission result, light solid | [Open](qibla-ar-390-permission-recovery.png) |
| Qibla EN · 390×844 | permission-needed; mocked permission result, light solid   | [Open](qibla-en-390-permission-needed.png)   |
| Qibla EN · 390×844 | permission-denied; mocked permission result, light solid   | [Open](qibla-en-390-permission-denied.png)   |
| Qibla EN · 390×844 | permission-recovery; mocked permission result, light solid | [Open](qibla-en-390-permission-recovery.png) |

## Qibla: enlarged-text recovery

| View                           | State                                                             | Screenshot                                 |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------ |
| Qibla AR · 320×700 · 200% text | enlarged-recovery; scrollable enlarged-text recovery, light solid | [Open](qibla-ar-320-enlarged-recovery.png) |
| Qibla AR · 320×700 · 200% text | enlarged-details; scrollable enlarged-text recovery, light solid  | [Open](qibla-ar-320-enlarged-details.png)  |
| Qibla EN · 320×700 · 200% text | enlarged-recovery; scrollable enlarged-text recovery, light solid | [Open](qibla-en-320-enlarged-recovery.png) |
| Qibla EN · 320×700 · 200% text | enlarged-details; scrollable enlarged-text recovery, light solid  | [Open](qibla-en-320-enlarged-details.png)  |

## Home book discovery and continuation

| View                     | State                                                                                     | Screenshot                       |
| ------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------- |
| Home books AR · 390×1000 | First visit; compact discovery below daily routines; light solid; no publication requests | [Open](home-ar-390-discover.png) |
| Home books AR · 834×1000 | Saved Arabic Umrah source page 6; light solid; no publication requests                    | [Open](home-ar-834-continue.png) |
| Home books EN · 390×1000 | First visit; compact discovery below daily routines; light solid; no publication requests | [Open](home-en-390-discover.png) |
| Home books EN · 834×1000 | Saved Arabic Umrah source page 6; light solid; no publication requests                    | [Open](home-en-834-continue.png) |

## Location dialogs

| View                                       | State                                                                           | Screenshot                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------- |
| Home location AR · 1440×900                | Compact protected dialog; 448px maximum; Glass; deterministic Cairo GPS fixture | [Open](home-location-ar-1440.png)            |
| Home location AR · 320×700 · 200% text     | Opaque bounded dialog with reachable Close; deterministic Cairo GPS fixture     | [Open](home-location-ar-320-text200.png)     |
| Settings location AR · 1440×900            | Compact protected dialog; 448px maximum; Glass; deterministic Cairo GPS fixture | [Open](settings-location-ar-1440.png)        |
| Settings location AR · 320×700 · 200% text | Opaque bounded dialog with reachable Close; deterministic Cairo GPS fixture     | [Open](settings-location-ar-320-text200.png) |
| Home location EN · 1440×900                | Compact protected dialog; 448px maximum; Glass; deterministic Cairo GPS fixture | [Open](home-location-en-1440.png)            |
| Home location EN · 320×700 · 200% text     | Opaque bounded dialog with reachable Close; deterministic Cairo GPS fixture     | [Open](home-location-en-320-text200.png)     |
| Settings location EN · 1440×900            | Compact protected dialog; 448px maximum; Glass; deterministic Cairo GPS fixture | [Open](settings-location-en-1440.png)        |
| Settings location EN · 320×700 · 200% text | Opaque bounded dialog with reachable Close; deterministic Cairo GPS fixture     | [Open](settings-location-en-320-text200.png) |
