# Audio architecture

Azkar uses explicit content identity and an approved asset registry. Playback never examines ID fragments, citations, first words, or similar text.

## Boundaries

- A `Zikr` is a category instance. Its `id` remains screen-specific; `canonicalKey` identifies identical wording across screens.
- `audioAssetId` exists only when `audioAssignments.ts` contains an exact production assignment.
- `audioManifest.ts` owns immutable recording metadata. Content contains no provider URL.
- `buildPlaybackPlan.ts` snapshots stable zikr IDs, semantic order, segments, voices, repetition behavior, and the category/subcategory/routine context when Play is pressed.
- Reader options expose separate Arabic-recitation and English-translation actions. A requested English plan contains only the reviewed `english-george` voice; a requested Arabic plan contains no English voice. Missing coverage is omitted rather than filled from the other language, so Play All cannot change language mid-session. Qur'an remains Arabic recitation.
- `AudioProvider.tsx` owns the application’s single production `HTMLAudioElement`. Screen navigation cannot replace its plan.
- `AudioProvider.tsx` also owns persisted playback rate, volume, and mute state. The floating player only renders and invokes that controller state; screens never manipulate an audio element directly.
- Compact and expanded player forms share stable logical edges for Minimize/Expand and Close and dock to the reading surface's bottom safe area. Only one playback-progress indicator is visible: compact phones use the derived session-progress strip, while wider compact and every expanded layout use the interactive media timeline.
- Expanded transport controls preserve 44px targets and fit a 320px viewport. The expanded player replaces the Reader canvas below the session header, or the main application canvas elsewhere, with a flat, opaque listening surface. It has no dialog, scrim, floating frame, or focus trap. Covered canvas children are inert and hidden from assistive technology until collapse; surrounding header and navigation remain available. Escape closes a nested reciter menu first, then minimizes the player and restores focus. Exact reviewed text uses the shared scalable reading type steps and a keyboard-focusable native scroll region. A short landscape window places reading beside transport; exceptionally small windows can scroll the whole surface. Playback never estimates verse boundaries or moves the reading position automatically. Recording attribution is retained in the reciter menu without a separate info action.
- The Reader dock places listening and the labelled Benefit action above its counter/navigation row. It preserves the shared rectangular counter, shows one compact listening-progress strip while audio owns the entry, and restores counter focus after Stop. Playback repetition options remain Play Once (the default) or the full reviewed prescribed count, including 33, 34, and 100 repetitions; there is no ten-repetition eligibility cutoff. Queue position and repetition position are both shown during a repeated queue. There is no shortened-routine preference.
- Media Session metadata describes the recording that is actually playing: English narration uses the English title and narrator, while Arabic dua and Qur'an use Arabic identity. Platform playback state, artwork, seeking, queue navigation, and Stop stay synchronized with the shared controller, and Stop clears stale lock-screen metadata.
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

For English narration, also run `pnpm audit:english-audio`. Unlike the lightweight range probe in `validate:audio`, this downloads every approved English recording and verifies its MP3 signature, MIME type, exact byte size, and SHA-256 against the manifest.

Replacing a file changes only manifest metadata and hosting bytes, never player logic.

## Migration and rollback

The former heuristic resolver was removed only after regression tests covered its known failures and the new controller passed focused tests. Rollback is a source revert; do not restore heuristic matching. If approved metadata is suspect, remove the exact assignment so the UI reports audio unavailable while reading/counting remain usable.
