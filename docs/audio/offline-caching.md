# Offline audio caching

Audio is excluded from Workbox precaching. Users may explicitly download Morning Core, Evening Core, or Before-Sleep Core from Downloads settings once approved assets exist.

Partial voice coverage never substitutes English narration in an Arabic download or Arabic recitation in an English narration download. Manifest 7 invalidates older downloaded catalogs after two Arabic variants fail their approved checksums; their separately approved English variants remain downloadable when explicitly selected.

The downloader fetches a complete HTTP 200 response, validates MIME type, exact byte size, and SHA-256, then stores it in `azkar-audio-v<manifest version>`. A 206 response, partial body, failed response, mismatched checksum, or unapproved variant is never cached. A failed/cancelled collection download removes files added by that attempt.

The registry records asset and manifest versions. Startup cleanup removes stale app-owned audio caches and records. Workbox's range-request plugin slices only complete cached responses for media requests. Normal streaming responses are deliberately ineligible for insertion into the explicit download cache.

Users can cancel an active download and remove downloaded audio. General download totals use the verified-download registry; travel readiness additionally checks the actual cached files.

Travel preparation runs the complete Mushaf and four approved audio groups (Morning Core, Evening Core, Before-Sleep Core, and Al-Kahf in the selected voice) as independent jobs. A failed group does not remove other completed groups; cancellation preserves completed collections and cached Mushaf pages. Group and within-group progress, remaining size, and failed group names are visible. Audio coverage is limited to available approved recordings and is explicitly disclosed.

Cached audio is checked against MIME type, full-response status, exact length, and SHA-256 before it contributes to travel readiness or is skipped on retry. Readiness is therefore based on actual cached bytes rather than registry totals. A failed audio attempt removes only files added by that attempt and preserves previously verified files. The optional Al-Kahf corpus loads only when Downloads is opened. Storage estimates are advisory and cache-write errors remain recoverable.

## Independent download management — 2026-10-10

Offline access presents an essentials bundle (Mushaf, Morning Core, Evening Core, Before-Sleep Core, Al-Kahf) and independent Mushaf, Al-Baqarah, Al-Kahf and daily collection controls. Al-Baqarah remains excluded from essentials. Recording sizes derive from selected approved variants and use decimal MB. Readiness checks deduplicate variants across groups and verify sequentially, limiting simultaneous large-file buffers. The selected recordings can be removed without a registry entry; unrelated recordings and other voice variants are retained. Shared daily recordings affect the readiness of every collection that uses them, which the screen discloses.

Storage quota is advisory origin storage, not device free space. Offline app loading is described separately from downloaded page/font readiness. Progress updates after verified whole audio files; cancellation rolls back newly added files and preserves prior verified files. Cancellation is rechecked after checksum verification before cache publication. The bundle preserves successful groups when another group fails and identifies failed groups. No new ownership registry, resumable byte ranges, content changes or concurrent jobs are introduced.
