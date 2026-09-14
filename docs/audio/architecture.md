# Audio architecture

Azkar uses explicit content identity and an approved asset registry. Playback never examines ID fragments, citations, first words, or similar text.

## Boundaries

- A `Zikr` is a category instance. Its `id` remains screen-specific; `canonicalKey` identifies identical wording across screens.
- `audioAssetId` exists only when `audioAssignments.ts` contains an exact production assignment.
- `audioManifest.ts` owns immutable recording metadata. Content contains no provider URL.
- `buildPlaybackPlan.ts` snapshots stable zikr IDs, semantic order, segments, voices, repetition behavior, and the category/subcategory/routine context when Play is pressed.
- In the English interface, a dua with a reviewed `english-george` variant starts with that English narration while the preference is still `default-dua`; an explicit listener voice choice remains authoritative. Arabic mode and Quran reciter selection keep their existing defaults.
- `AudioProvider.tsx` owns the application’s single production `HTMLAudioElement`. Screen navigation cannot replace its plan.
- `AudioProvider.tsx` also owns persisted playback rate, volume, and mute state. The floating player only renders and invokes that controller state; screens never manipulate an audio element directly.
- Reviewed source records may carry Arabic display metadata alongside the original English attribution. Resolution preserves both, and the player selects the interface-language form without changing the reviewed media identity.

Qur'anic passages are logical entries containing ordered verse segments. Next and Previous move by zikr; segment transitions remain internal. The Three Quls use one ritual-round progression. While audio owns the current Reader entry, the manual counter is hidden. Only natural completion of the selected run emits an entry-completion event: Play Once completes after one full recitation, while Repeat waits for every prescribed repetition. Pause, stop, skip, error, and partial listening do not. The application records that event against the frozen plan context, even if the reader navigated elsewhere meanwhile.

## State and failures

The controller states are idle, loading, ready, playing, paused, buffering, ended, and error. Every media load has a generation number; reducer actions from an older load are ignored. A failed item pauses progression and exposes Retry, Skip, and Stop. No error substitutes another asset.

## Adding or replacing audio

1. Complete the source, licence, recording, and human-review workflow.
2. Add immutable, versioned files to the configured audio host.
3. Add source, asset, segment, variant, checksum, duration, and size metadata.
4. Add exact instance assignments only after approval.
5. Increment the asset and manifest versions when bytes change; never overwrite an approved versioned path.
6. Run `pnpm validate:audio`, `pnpm report:audio -- --write`, and the full `pnpm check`.

Replacing a file changes only manifest metadata and hosting bytes, never player logic.

## Migration and rollback

The former heuristic resolver was removed only after regression tests covered its known failures and the new controller passed focused tests. Rollback is a source revert; do not restore heuristic matching. If approved metadata is suspect, remove the exact assignment so the UI reports audio unavailable while reading/counting remain usable.
