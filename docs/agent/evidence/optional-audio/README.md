# Optional audio and Quran comparison — actual local evidence

Captured on 2026-11-26 from the next-release worktree. Application changes remain local. Existing default reciters and the source-review status of books are preserved.

## Application menus

The added optional Muhammad Jumah voice uses the existing protected Select. These actual screenshots cover Arabic/RTL and English/LTR, Glass at 320px/200% and desktop, and solid material at tablet width. Browser assertions check viewport bounds, opaque paint, hit testing, option height and Escape/focus recovery.

| Language | Viewport | Material/text | Screenshot                       |
| -------- | -------- | ------------- | -------------------------------- |
| Arabic   | 320px    | Glass, 200%   | [Menu](reciter-menu-ar-320.png)  |
| English  | 320px    | Glass, 200%   | [Menu](reciter-menu-en-320.png)  |
| Arabic   | 834px    | Solid, 100%   | [Menu](reciter-menu-ar-834.png)  |
| English  | 834px    | Solid, 100%   | [Menu](reciter-menu-en-834.png)  |
| Arabic   | 1440px   | Glass, 100%   | [Menu](reciter-menu-ar-1440.png) |
| English  | 1440px   | Glass, 100%   | [Menu](reciter-menu-en-1440.png) |

## Integrated Quran options

- [Arabic actual-app reciter menu](quran-options-ar.png).
- [English actual-app reciter menu](quran-options-en.png).
- [Arabic selected Yasser](quran-selected-ar.png).
- [English selected Yasser](quran-selected-en.png).

These player screenshots use a labelled controlled media clock for deterministic switching/preference assertions. Original MP3 decoding/playback is verified independently below; the screenshots do not claim real playback timing. The initial default remains Abdullah Muhammad, and all three optional reciters are selectable without changing the dua preference.

## Quran review and books

- [Three selected reciters, phone](quran-comparison-390.png).
- [Three selected reciters, 320px/200% text](quran-comparison-320-text200.png).
- [All three local Arabic review books](all-local-review-books.png).
- [Exact-checksum native-playback, duration and responsive scan results](quran-verification.json).

The Quran page is a representative complete-Al-Mulk comparison, with the current recording alongside the owner's selected three. The owner subsequently replied “I approve all”; these three exact Al-Mulk files are now optional app voices, with the existing default preserved. Their local original MP3s and provider ayah responses are checksum-verified; native playback succeeds across Chromium, Firefox and WebKit. The nine responsive geometry/axe cases pass. This is technical evidence; owner listening acceptance is recorded separately in docs/audio/quran-reciter-pilot/activation.json. It does not establish complete Quran coverage or an app word-timing review.

The three book cards remain explicitly labelled where source reconciliation is incomplete; all are visible in the development catalogue. Al-Mukhtar was opened in the user's actual local tab before this verification. The ordinary-production catalogue remains separately gated.

Automated accessibility checks do not establish complete WCAG compliance. Real assistive-technology/native-device acceptance remains separate.
