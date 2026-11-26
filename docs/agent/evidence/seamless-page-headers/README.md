# Seamless page headers — actual local app

These screenshots come from the verified local application build, not generated design mockups. Ordinary desktop captures use actual zero top insets. Phone images demonstrate 320px/200% text; no Android status icons are fabricated.

## Reading and counting

| Page              | Arabic desktop              | English desktop             | Arabic 320px/200% text         |
| ----------------- | --------------------------- | --------------------------- | ------------------------------ |
| Collection Reader | [View](reader-ar-1440.png)  | [View](reader-en-1440.png)  | [View](reader-ar-320-200.png)  |
| Masbaha           | [View](masbaha-ar-1440.png) | [View](masbaha-en-1440.png) | [View](masbaha-ar-320-200.png) |
| Salawat           | [View](salawat-ar-1440.png) | [View](salawat-en-1440.png) | [View](salawat-ar-320-200.png) |

The new in-flow headers borrow the surrounding canvas and use semantic title/action/progress ink. There is no separate navy band or decorative scene behind functional controls.

## Theme and accessibility examples

[Dark](reader-dark-en-1440.png) · [Glass](reader-glass-ar-1440.png) · [High contrast](reader-contrast-en-1440.png)

The feature cases also cover Midnight, both directions, 768px tablet geometry, actual 44px targets, real pointer hit recovery and protected menu/focus behavior. Physical-device and assistive-technology acceptance remain separate.

## Ordinary-page audit

These existing headers already matched their owning canvas and were retained:

| Family         | Actual app                                      |
| -------------- | ----------------------------------------------- |
| Library        | [View](page--azkar-en.png)                      |
| Category       | [View](page--azkar-evening-en.png)              |
| Surah entry    | [View](page--azkar-friday-kahf-1-en.png)        |
| Quran overview | [View](page--quran-wird-en.png)                 |
| Quran Benefits | [View](page--quran-wird-benefits-en.png)        |
| Progress       | [View](page--progress-en.png)                   |
| Settings       | [View](page--settings-en.png)                   |
| Qibla          | [View](page--qibla-en.png)                      |
| Benefits       | [View](page--benefits-en.png)                   |
| Friday         | [View](page--friday-en.png)                     |
| Search         | [View](page--search-en.png)                     |
| More           | [View](page--more-en.png)                       |
| Learn          | [View](page--learn-en.png)                      |
| Book reader    | [View](page--learn-dalil-al-mutamir-p-1-en.png) |

Home's photography/independent material, immersive Mushaf paper, publication covers and headerless onboarding/completion retain their existing content roles. Scrolling headers and menus retain protected paint; seamless appearance does not make overlays transparent.

See the [phase report](../../reports/SEAMLESS_PAGE_HEADERS_LOCAL_2026_11_25_REPORT.md) for commands, exact outcomes and limitations.
