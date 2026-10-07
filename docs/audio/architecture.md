# Audio architecture

Startup-performance refinement (2026-10-07): the audio module loads at entry to reading, library, prayer, Friday or settings surfaces, and on explicit playback requests. Home does not initialize the controller or catalogues. Optional downloaded-audio maintenance runs after application commit and skips importing the catalogue when neither a registry nor an audio cache exists. Existing saved downloads and retired caches retain the same cleanup boundary; loading failures can still be retried through playback requests.

The Khatmah right toolbar offers Al-Baqarah's existing approved `ir-baqarah`/`quran-002` recording while reading that surah. It requests the same lazy audio module and drives the single AudioProvider for start, pause and resume. The frozen plan uses the reviewed collection identity, Arabic recitation and Play Once. It does not infer verse timing or move the printed page.

DEC-215 (2026-10-02) makes prescribed repetition the default for new listening runs; Play Once remains selectable. A recording can declare its embedded repetition count. Playback loops and displayed counts account for the selected voice's value, including when changing voices mid-run. Completion still requires the final natural ending. These facts supersede older default-mode descriptions below.

Manifest 8 restores owner-reviewed Arabic recordings for سبحان الله وبحمده, أستغفر الله وأتوب إليه and اللهم مصرف القلوب at fresh v2 paths. The owner confirmed Abdullah Muhammad, complete matching text and one embedded repetition on 2026-10-05. The first two recordings serve their existing shared instances; the dua gains Arabic alongside its existing English variant. Existing R2 objects, English variants and all assignment IDs remain unchanged. Manifest 7's quarantine remains historical evidence; its rejected recordings are not reused. Resolved URLs include the recorded checksum. Prescribed repeat is unavailable for a recording whose embedded count cannot divide the prescribed count exactly; the player never rounds up and over-recites.

Azkar uses explicit content identity and an approved asset registry. Playback never examines ID fragments, citations, first words, or similar text.

## Boundaries

- A `Zikr` is a category instance. Its `id` remains screen-specific; `canonicalKey` identifies identical wording across screens.
- `audioAssetId` exists only when `audioAssignments.ts` contains an exact production assignment.
- `audioManifest.ts` owns immutable recording metadata. Content contains no provider URL.
- `buildPlaybackPlan.ts` snapshots stable zikr IDs, semantic order, segments, voices, repetition behavior, and the category/subcategory/routine context when Play is pressed.
- The Reader listening dock starts Arabic recitation; its options retain the separate English-translation action. A requested English plan contains only the reviewed `english-george` voice; a requested Arabic plan contains no English voice. Missing coverage is omitted rather than filled from the other language, so Play All cannot change language mid-session. Qur'an remains Arabic recitation.
- `AudioProvider.tsx` owns the application’s single production `HTMLAudioElement`. Screen navigation cannot replace its plan.
- `AudioProvider.tsx` also owns persisted playback rate, volume, and mute state. The floating player only renders and invokes that controller state; screens never manipulate an audio element directly.
- Compact and expanded player forms share stable logical edges for Minimize/Expand and Close and dock to the reading surface's bottom safe area. Only one playback-progress indicator is visible: compact uses a short passive waveform for current-recording progress (or a truthful fallback line), and expanded uses the interactive media timeline. Close is at logical start and Expand/collapse at logical end in both forms.
- Expanded transport controls preserve 44px targets and fit a 320px viewport. The expanded player replaces the Reader canvas below the session header, or the main application canvas elsewhere, with a flat, opaque listening surface. It has no dialog, scrim, floating frame, or focus trap. Covered canvas children are inert and hidden from assistive technology until collapse; surrounding header and navigation remain available. Escape closes a nested reciter menu first, then minimizes the player and restores focus. Exact reviewed text uses the shared scalable reading type steps and a keyboard-focusable native scroll region. A short landscape window places reading beside transport; exceptionally small windows can scroll the whole surface. Playback never estimates verse boundaries or moves the reading position automatically. The player shows the selected reciter name only, without recording attribution or a separate info action.
- The Reader dock places listening and the labelled Benefit action above its counter/navigation row. It preserves the shared rectangular counter, shows one compact listening-progress strip while audio owns the entry, and restores counter focus after Stop. Playback repetition options remain Play Once or the full reviewed prescribed count (the default), including 33, 34, and 100 repetitions; there is no ten-repetition eligibility cutoff. Queue position and repetition position are both shown during a repeated queue. There is no shortened-routine preference.
- Media Session metadata describes the recording that is actually playing: English narration uses the English title and narrator, while Arabic dua and Qur'an use Arabic identity. Platform playback state, artwork, seeking, queue navigation, and Stop stay synchronized with the shared controller, and Stop clears stale lock-screen metadata.
- Reviewed source records may carry Arabic display metadata alongside the original English attribution. Resolution preserves these records for verification; the player displays only the selected reciter name. Optional consolidated credits belong in Settings → About.

- Compact dock containment is independent of the floating player's desktop navigation offsets. Container width determines whether the single listening-progress strip or the seek timeline is visible. Expanded text shares the Reader length/legibility policy through scalable units and the app text-size setting; this plain-text listening surface does not alter canonical Mushaf page typography. Speed selection exposes all supported rates directly, and repeat names the reviewed prescribed count. Normal short-phone layouts reserve transport space while reading scrolls; enlarged text retains whole-surface scroll recovery.

Qur'anic passages are logical entries containing ordered verse segments. Next and Previous move by zikr; segment transitions remain internal. The Three Quls use one ritual-round progression. While audio owns the current Reader entry, the manual counter is hidden. Only natural completion of the selected run emits an entry-completion event: Play Once completes after one full recitation, while Repeat waits for every prescribed repetition. Pause, stop, skip, error, and partial listening do not. The application records that event against the frozen plan context, even if the reader navigated elsewhere meanwhile.

## State and failures

Expanded reading centers fitting content on both axes in its available text canvas. Flex auto margins collapse for overflowing passages, preserving access to the first and last lines through native keyboard/pointer scrolling. Symmetric scrollbar gutters keep the passage horizontally centered in both languages. This owner-requested alignment supersedes the earlier top-alignment rule for fitting content only.

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

## Waveform and continuation refinement — 2026-10-04

The player uses RTL media controls, waveform sequence/fill and native seeking in Arabic, with Previous/rewind right of Play and Next/forward left. English uses LTR. Left Arrow advances time in Arabic and Right Arrow goes backward; English reverses those keys. Waveform peaks are generated at build-authoring time from approved bytes and keyed by SHA-256 in audioWaveforms.json. The lazy audio player bundles the 96-bin integer peaks, so seeking needs no new request, decoder, runtime dependency or offline cache. scripts/generate-audio-waveforms.mjs verifies checksum and byte size before decoding with the existing development Chromium runtime. audioWaveformUnavailable.json preserves historical failed checks for m-hm-91-abdullah-muhammad-v1 and m-hm-96-abdullah-muhammad-v1. Their owner-reviewed v2 replacements have new checksums and verified peaks; no failed v1 object was overwritten or relabelled.

AudioProvider owns transient autoAdvance and its synchronous event ref. Individual listening snapshots the available collection order with continuation off; Play All starts on. The one expanded switch toggles continuation without changing the queue, selected run, voice, current media time, repetition mode or persisted/synchronized preferences. Natural endings still finish all segments and prescribed ritual rounds. Completion remains natural-ending only, and manual navigation is always independent of continuation. Existing Reader completion navigation is preserved and loads the following selection paused when continuation is off.

Expanded identity centers the reciter without a duplicate zikr title; queue and repetition positions remain separate in the footer. Reader ownership follows membership of the frozen queue during track synchronization, preventing an intermediate counter remount from collapsing the player on manual Next/Previous. Volume, speed value and the brief continuation switch share one row, wrapping only when space or enlarged text requires it.

### Owner-approved repetition presentation (2026-10-04)

Queue position and current/total repetition progress, including embedded recording counts, appear separately in the expanded footer beside the prescribed-repeat option. The header centers only the reciter, preserving the owner's current refinement. This supersedes the earlier header queue-position presentation without changing playback or completion.
