# Interaction review — 2026-11-01

The owner requests an app-wide microinteraction review after the current reliability/first-use/card work, with particular attention to Home, consistent feedback by button type, smooth animation and strong tests. Continue the existing shared motion system; no dependency or animation-system replacement is proposed.

Plan before any motion edits:

1. Inspect shared Button/icon actions, native links/disclosures, tabs/radios, ToggleTrack, native ranges, menus/sheets, counters and async actions. Trace pointer/keyboard feedback, disabled/read-only exclusion, real busy/error announcements, cancellation and both reduced-motion alternatives.
2. Inspect Home's prayer expansion/condensation, refresh/share actions, routine CTA, summary pill, shortcuts and completion transitions. Preserve reading focus, RTL icon direction, stable sticky geometry, immediate values and paused hidden work.
3. Reuse existing recipes and repair only confirmed gaps. Do not add decorative loops, animate blur or introduce per-button listeners/frame state. Retain explicit reading/no-press exceptions. Any motion change requires matching regression evidence.
4. Run existing targeted Home/control browser regressions in Chromium, Firefox and WebKit plus relevant shared unit coverage and the intact complete release gates. Record source coverage, measured results and limitations; browser automation is not physical-device or human assistive-technology acceptance.

Initial source inventory: surfaces.css covers native buttons/links and semantic control states; useControlFeedback delegates keyboard press/release and cancellation without synthetic clicks; motion.css supplies Home icon cues; ToggleTrack and shared tab/radio primitives own state feedback; native ranges preserve immediate input values. Existing Home-specific regression suites cover finite action feedback, both still alternatives and interpolated prayer-card geometry. Prefer validating and retaining these contracts over adding competing animation recipes.
