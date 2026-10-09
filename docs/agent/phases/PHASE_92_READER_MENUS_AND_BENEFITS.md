# Phase 92 — contextual reader menus and visible benefits

## Objective and authorized plan

The owner requests colored narrated words with a faint background and underline, without font or layout changes; Benefit consistently at the bottom including full surahs; and compact anchored Aa/overflow menus instead of bottom sheets. They specifically confirm the additional Al-Kahf Friday-light narration.

Reuse the existing Radix menu primitives. Keep appearance choices in Aa, actions in overflow, and remove duplicated display/counter controls from the other menu. Surahs omit irrelevant counter settings and actions already available on their landing page. Keep Benefit in the existing footer anatomy, including listening where supported. Preserve focus return, keyboard navigation, 44px targets, RTL, text resizing and collision-limited scrolling.

Add the confirmed narration alongside Muslim 809, preserving the Quran and existing narration. Source: https://sunnah.com/mishkat:2175 — Al-Bayhaqi's report, graded hasan by Al-Albani. Keep that grading distinct from Muslim's narration; update generator preservation and content tests.

## Verification and boundaries

Inspect current reader/menu/footer components; update targeted content, menu, highlighting and browser tests; run normal quality and release gates. Preserve in-progress owner audio-layout changes in the primary workspace and integrate only when ready. No dependencies, persistence changes, timing guesses, reviewed Quran changes, test reductions or budget increases.
