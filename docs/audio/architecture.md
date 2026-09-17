# Audio architecture

Azkar uses explicit content identity and an approved asset registry. Playback never examines ID fragments, citations, first words, or similar text.

## Boundaries

- A `Zikr` is a category instance. Its `id` remains screen-specific; `canonicalKey` identifies identical wording across screens.
- `audioAssetId` exists only when `audioAssignments.ts` contains an exact production assignment.
- `audioManifest.ts` owns immutable recording metadata. Content contains no provider URL.
- `buildPlaybackPlan.ts` snapshots stable zikr IDs, semantic order, segments, voices, and repetition behavior when Play is pressed.
- `AudioProvider.tsx` owns the application’s single production `HTMLAudioElement`. Screen navigation cannot replace its plan.

Qur'anic passages are logical entries containing ordered verse segments. Next and Previous move by zikr; segment transitions remain internal. The Three Quls use one ritual-round progression. Audio repetition never changes the spiritual counter.

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
