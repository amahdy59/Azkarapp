# Offline audio caching

Audio is excluded from Workbox precaching. Users may explicitly download Morning Core, Evening Core, or Before-Sleep Core from Downloads settings once approved assets exist.

The downloader fetches a complete HTTP 200 response, validates MIME type, exact byte size, and SHA-256, then stores it in `azkar-audio-v<manifest version>`. A 206 response, partial body, failed response, mismatched checksum, or unapproved variant is never cached. A failed/cancelled collection download removes files added by that attempt.

The registry records asset and manifest versions. Startup cleanup removes stale app-owned audio caches and records. Workbox's range-request plugin slices only complete cached responses for media requests. Normal streaming responses are deliberately ineligible for insertion into the explicit download cache.

Users can cancel an active download and remove downloaded audio. The UI claims offline availability only from the verified registry.
