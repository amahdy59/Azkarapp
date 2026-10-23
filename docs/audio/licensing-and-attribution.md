# Licensing and attribution

Every variant must point to an `AudioSourceRecord` identifying the served recording and its permission evidence. Before approval, retain durable evidence that permits the intended public hosting, streaming, offline download, caching, and redistribution behavior. A provider name or public URL alone is not licence evidence.

Do not hotlink an unversioned third-party repository or use short-lived signed URLs in the static manifest. Host immutable files behind `VITE_AUDIO_BASE_URL` with HTTPS, correct MIME types, CORS, byte ranges, public read access, and stable caching.

The player displays only the reciter or voice name matching the served bytes. Attribution is not a player requirement. Optional consolidated source credits belong in Settings → About. Retain source and permission evidence in the registry for recording verification.

## Android release review — 2026-10-23

The owner confirms only Al-Kahf and Al-Baqarah use Muhammad Al-Shara (محمد الشرع). An AST inventory found two such variants, 108 Abdullah Muhammad variants and 143 English variants. Twenty-three Abdullah Muhammad variants had incorrectly referenced the generic `internal-upload` source; these now reference the existing `internal-upload-abdullah-muhammad` owner-authorized source. This corrects metadata only; filenames, bytes, checksums, transcripts, assignments and content review remain unchanged.

The owner explicitly authorizes the two Muhammad Al-Shara variants for Android distribution and offline caching. Android playback, coverage, download enumeration and file export share the platform eligibility boundary. Web availability remains as previously approved. Eligible recordings retain offline caching and user file export. This authorization is recorded as owner-provided permission; it is not an invented external license document.
