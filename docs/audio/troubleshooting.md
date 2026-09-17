# Audio troubleshooting

Start with the controller error code and the logged asset/variant IDs; do not inspect or log private profile data.

- `unassigned` / not found: confirm the exact zikr assignment and approved asset exist. Do not add a fallback.
- `text-mismatch`: compare display text and the manifest transcript using the review screen. Religious text is not changed to fit a recording.
- `playback-blocked`: retry from an explicit user Play action.
- `offline-not-cached`: verify the complete asset/version is present in the download registry and cache.
- network/CORS: check HTTPS, public access, CORS, correct MIME type, and byte-range support at `VITE_AUDIO_BASE_URL`.
- unsupported/decode: verify exported bytes, declared MIME, checksum, and browser codec support.
- metadata timeout: inspect response latency, range behavior, and whether a proxy buffers the file.

Run `pnpm validate:audio` after every manifest change. On suspected content risk, remove the exact production assignment; reading and counting continue without audio.
