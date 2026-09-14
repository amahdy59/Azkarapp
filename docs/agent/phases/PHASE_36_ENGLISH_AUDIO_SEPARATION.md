# Phase Report — English audio verification and separation

## Objective

Verify the complete Cloudflare English-audio inventory, reconcile it with the canonical application manifest, and prevent Arabic and English playback from being mixed implicitly.

## Scope completed

- Inspected all 114 `english-george` objects in the `azkar-audio` R2 bucket.
- Downloaded and validated all 114 as reachable `audio/mpeg` MP3 files.
- Wired seven previously unavailable canonical English recordings: `e-hm-75a`, `m-hm-83`, `m-hm-98`, `s-hm-102`, `s-hm-105`, `s-hm-107`, and `s-hm-108`.
- Reconciled all 88 production English variants with their live duration, byte size, and SHA-256.
- Confirmed the remaining 26 R2 objects are duplicate instance-name recordings whose reviewed wording already resolves through one of the 88 canonical assets.
- Replaced implicit language fallback with language-locked playback plans and dedicated Reader actions.
- Updated the R2 CORS policy for the GitHub Pages origin and exact local development/preview origins.

## Files changed

- `src/app/audio/audioManifest.ts`
- `src/app/audio/buildPlaybackPlan.ts`
- `src/app/audio/resolveAudioAsset.ts`
- `src/app/App.tsx`
- `src/app/screens/ReaderScreen.tsx`
- English and Arabic localization files
- Focused audio architecture and Reader tests
- `scripts/audit-english-audio.mjs` and `package.json`
- Audio architecture, phase index, decision log, and release notes

## Components added or modified

- Reader audio menu
- Playback-plan builder and language-aware coverage resolver
- Application audio-plan orchestration
- English audio integrity audit

## User-visible changes

- Reader options now distinguish “Play Arabic recitation” from “Play English translation.”
- Starting either action cannot expose or fall back to the other language within that playback plan.
- Seven additional canonical duas now have reviewed English narration available.

## Accessibility work

- Both playback choices are native menu items with explicit localized accessible names and disabled unavailable states.
- Existing keyboard order, focus behavior, and minimum target geometry are preserved.

## Tests added or updated

- Playback plans are verified to expose only voices from the requested language.
- Reader options are verified to invoke distinct Arabic and English handlers.
- The English integrity audit verifies every wired recording against live R2 bytes.

## Commands run

| Command                                     | Result                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm typecheck`                            | Passed                                                                    |
| Focused audio architecture and Reader tests | 17 passed                                                                 |
| `pnpm audit:english-audio`                  | 88 of 88 passed exact transport and integrity checks                      |
| `node scripts/validate-audio-manifest.mjs`  | Passed: 195 instances, 119 assets, 124 mappings                           |
| Production/local R2 Range probes            | `206`; matching CORS origin and exposed range headers after policy update |

## Visual/manual evidence

- Cloudflare dashboard confirmed the saved CORS origins, `GET`/`HEAD`, `Range`, exposed response headers, and 3600-second max age.
- Browser metadata loaded for every wired English recording while refreshing duration metadata.

## Documentation updated

- Audio architecture now defines language-locked plans and the strict English audit.
- DEC-178 records the language, canonical-identity, and integrity contract.

## Decisions recorded

- Duplicate instance-name R2 objects do not receive competing assignments when one canonical recording already serves identical reviewed wording.
- English translation audio remains dua-only; Qur'anic audio remains Arabic recitation.

## Known limitations or remaining risks

- The bucket still uses Cloudflare's rate-limited `r2.dev` development URL. A custom domain is recommended before treating the audio host as a production-grade delivery endpoint.
- File integrity and canonical wiring are verified; this phase does not perform a new linguistic review of the spoken English against every written translation.
- Deployment and production UI verification must be recorded from the release commit; local integrity checks alone are not production evidence.

## Out-of-scope findings

- None.

## Recommended next step

Move the rate-limited `r2.dev` audio host to a custom delivery domain, then repeat the exact transport and playback checks at that origin.
