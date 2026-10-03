# Offline audio caching

Audio is excluded from Workbox precaching. Users may explicitly download Morning Core, Evening Core, or Before-Sleep Core from Downloads settings once approved assets exist.

The downloader fetches a complete HTTP 200 response, validates MIME type, exact byte size, and SHA-256, then stores it in `azkar-audio-v<manifest version>`. A 206 response, partial body, failed response, mismatched checksum, or unapproved variant is never cached. A failed/cancelled collection download removes files added by that attempt.

The registry records asset and manifest versions. Startup cleanup removes stale app-owned audio caches and records. Workbox's range-request plugin slices only complete cached responses for media requests. Normal streaming responses are deliberately ineligible for insertion into the explicit download cache.

Users can cancel an active download and remove downloaded audio. General download totals use the verified-download registry; travel readiness additionally checks the actual cached files.

Travel preparation runs the complete Mushaf and four approved audio groups (Morning Core, Evening Core, Before-Sleep Core, and Al-Kahf in the selected voice) as independent jobs. A failed group does not remove other completed groups; cancellation preserves completed collections and cached Mushaf pages. Group and within-group progress, remaining size, and failed group names are visible. Audio coverage is limited to available approved recordings and is explicitly disclosed.

Cached audio is checked against MIME type, full-response status, exact length, and SHA-256 before it contributes to travel readiness or is skipped on retry. Readiness is therefore based on actual cached bytes rather than registry totals. A failed audio attempt removes only files added by that attempt and preserves previously verified files. The optional Al-Kahf corpus loads only when Downloads is opened. Storage estimates are advisory and cache-write errors remain recoverable.
