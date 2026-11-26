# Settings audio, downloads and location — 2026-11-25

## Authority and scope

The owner requests separating Audio from Downloads in Settings, replacing numeric prayer-location summaries with a place name, and suggestions for further menu improvements. Keep this work local; no commit, push, deployment or release-note update. Preserve independent devotional-document edits.

## Plan

1. Inspect Settings navigation, audio/download composition, GPS display and offline location contracts.
2. Expose Audio & recitations and Downloads as separate primary rows using existing routes, icons and panels. Remove the nested download row and restore Back focus to the primary Downloads row.
3. Resolve unnamed/coordinate-only locations against the built-in city catalogue, within 75 km, using explicit localized “Near city, country” wording. Keep a neutral device/saved-location fallback outside the catalogue. Preserve custom names, precise calculation coordinates and the no-network privacy contract.
4. Update unit/browser regressions and collect bilingual responsive screenshots, keyboard/focus and accessibility evidence. Run targeted tests and the complete non-browser quality gate. Record unrelated mixed-checkout failures honestly.
5. Report broader menu recommendations separately from the focused implementation.

## Verification

See [the local phase report](../reports/SETTINGS_AUDIO_LOCATION_LOCAL_2026_11_25_REPORT.md).

## Approved summary follow-up

The owner now requests applying all four recommendations locally. Show the selected voice/speed, the last verified download category readiness with approximate app-origin storage, saved reminder on/off choices alongside location, and weekly-goal context in place of the Garden-only summary. Reuse the existing status scan; the menu must not scan caches or load optional audio corpora. Unknown and invalidated download status must invite a check rather than claim readiness. Preserve custom settings, local persistence, keyboard recovery, responsive reflow and all existing gates. Also correct the desktop selected row for Downloads. Extend unit/browser evidence and report this follow-up separately from the original checkpoint. No commit or publication.
