# Phase 94 — lasting release notes

## Authorized plan

The owner asks for a release notes page documenting software updates. Extend Settings › About › What's new into a bilingual release history using existing panel navigation, accessible native disclosure controls, readable dates/stamps and offline bundled history. Preserve the newest-only update manifest contract. Backfill actual committed bilingual notes without inventing historical changes, retain original historical copy, and enforce archiving the current manifest before each application release. Add unit and browser coverage, update architecture/maintenance documentation, and release through normal local and CI gates after the scoped player phase.

## Archive size and offline contract

Retain all 235 recorded bilingual summaries in the readable authoring JSON. The archive command generates a lossless gzip asset, whose exact decoded bytes are checked before release. Workbox precaches only this release-history binary alongside the app; optional listening packs remain excluded. Decoding uses the existing browser gzip platform capability. The newest summary is bundled separately as a fallback. The embedded Amiri Quran font uses its existing WOFF2 file, matching the app's other embedded font faces, without shipping a second unused WOFF copy. No font glyphs or sacred wording change, and all existing bundle ceilings remain intact.
