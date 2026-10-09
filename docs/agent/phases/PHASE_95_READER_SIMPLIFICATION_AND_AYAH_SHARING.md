# Phase 95 — Reader simplification and ayah image sharing

## Authorized plan

The owner explicitly corrects Benefit placement: it belongs to reading, never inside audio playback. Use the same bulb throughout; put a full-width secondary Benefit action immediately below the three surah landing actions. Remove the highlighted audio and sharing items from Reader overflow, preserving equivalent main-screen/player actions and their functional tests.

Build a dedicated ayah image-sharing flow alongside existing text sharing. Offer portrait 1080×1350 and square 1080×1080 previews, optional reviewed Arabic word meanings and optional existing English translation. Preserve the Mushaf font and exact complete canonical ayah text. Reuse explicit numbered translation boundaries from approved app content; never infer missing boundaries or introduce unreviewed translations. Mark translation source accurately and explain unavailable optional data. Use calm manuscript styling, consistent readable sizes, measured diacritics, continued cards for long content, source attribution and preview controls. Use existing share/download utilities, cancellation and bounded object-URL cleanup. Add pure layout/content tests, accessible component tests and browser/export-image evidence before normal release gates.

## Local implementation evidence

- AyahShareStudio and measured PNG layouts reuse existing share utilities and fonts without new dependencies.
- Optional translations retain Pickthall or Saheeh International attribution; missing reviewed data is explicitly unavailable. Glossary wording and canonical Arabic bytes are unchanged.
- Pure content/pagination tests pass, including all text preserved across continued cards. Arabic and English Chromium and Firefox preview/export tests pass; cross-engine and release gates continue.
- Native options, accessible complete text, cancellation/error status, focus restoration and preview URL cleanup are covered. Mobile ayah actions and the preview share a bounded native scroll area.

## Verification contract

Use the targeted image-sharing, release-history, reader-menu, Benefit and playback specs plus the full browser suite. Inspect exported Arabic portrait/square PNGs and narrow/enlarged previews. Verify the archive is readable after a real offline reload and that its decoded bytes match every recorded note. Preserve all quality/content/bundle gates and the owner's separately withheld primary-workspace edits. Final exact results and production smoke evidence belong in the release report.
