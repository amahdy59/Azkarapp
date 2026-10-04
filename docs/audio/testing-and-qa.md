# Audio testing and QA

Run:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm validate:audio
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Automated tests cover exact/no-fallback lookup, Arabic fingerprints, canonical reuse, required Qur'anic ranges, Core/Complete plan order, immutable plans, segment and ritual-round progression, reducer/stale events, blocked playback, Retry/Skip, paused visibility, and Core Reader identity.

## Manual checklist

- Use keyboard only: start, expand/minimize, play/pause, previous/next, seek with arrow keys, speed/voice, volume/mute, Retry/Skip/Stop.
- Verify the speaker opens volume on click or keyboard activation, never hover. Its centered popup expands vertically, reports native vertical orientation and percentage, offers explicit mute, and restores focus on Escape. iOS retains hardware volume without a software slider.
- Verify collections with multiple reviewed recordings expose Play All on both overview and Reader, disclose partial coverage, and advance through the frozen queue.
- Verify exactly one playback-progress indicator is visible: one short passive waveform (or truthful fallback line) for the current recording at every compact width, and one native waveform seek control (or truthful fallback line) when expanded. Confirm 44px interaction height, no large circular seek marker and physical LTR time/fill in both languages.
- Focus the seek timeline and verify Page Up/Page Down move by 30 seconds, Home/End remain available, and Arrow Right seeks forward and Arrow Left backward in both languages.
- Expand and minimize in both directions and confirm Expand/Minimize and Close remain on their established opposite logical edges.
- Verify visible focus and 44px targets at narrow width, 200%, and 400% zoom.
- At 320px, expand a multi-item queue in Arabic and English. Confirm the player has no horizontal overflow and Previous, Rewind, Forward, and Next remain fully inside its bounds.
- Expand short and long devotional entries with and without an English translation. Confirm the reviewed text and verse markers remain exact, app text resizing scales the reading type, and remaining content is reachable by keyboard and pointer scrolling.
- Tab through the expanded player and confirm the surrounding header/navigation remain reachable, while covered reading controls cannot receive focus. Verify the player fills the canvas below the session header without a scrim or floating frame at phone, tablet, desktop, and short landscape sizes. Escape closes a voice menu first, then minimizes the player and restores focus to Expand. Closing the desktop collection navigator returns focus to its toggle and removes its controls from the tab order.
- Open the reciter dropdown and verify the selected reciter name is accurate, without attribution, credits or a separate info icon.
- Before scrolling, verify compact Close, flexible context, Play and the dedicated Expand chevron remain inside the Reader canvas with the desktop collection navigator open and closed. Expanded alone exposes seeking, volume, speed, continuation and navigation.
- At 320×568 and short landscape, verify Play/Pause is initially fully visible. Check all supported speed choices, selected rate, nested Escape/focus restoration, prescribed-count repeat wording and unchanged text at all three app text-size settings.
- Verify zikr text begins close beneath the reciter metadata without vertically centered blank space. Speed value, Volume and the brief Play all switch follow transport in matching visual and keyboard order; prescribed repeat remains independent. At enlarged text, all content and settings remain scroll-reachable.
- In English, verify translation is primary and Arabic is initially hidden. Use Enter and Space on Show Arabic / Hide Arabic; focus stays on the toggle, its expanded state updates, and playback does not change. Verify Arabic stays primary in Arabic mode and missing translations show an explanation with Arabic fallback. Check the recording-language label independently of displayed text.
- Verify timeline progress fills physically left-to-right in both interface languages without horizontal overflow.
- On supported devices, verify lock-screen/notification metadata matches the recording language, Play/Pause/Seek/Previous/Next work, Stop clears the media card, and headset controls do not complete an interrupted item.
- With a screen reader, confirm dynamic Play/Pause names and polite track/error/repetition/queue announcements; current time must not announce every second.
- Test offline with a fully downloaded item and an uncached item.
- Switch category and Core/Complete during playback; the audio title/text identity and queue must not change.
- Complete both Play Once and prescribed-repeat audio, navigate to another prayer or subcategory, and confirm natural completion updates only the frozen source session once. Repeat must wait for its final repetition; pause, stop, skip, and failure must not complete it.
- Confirm the current Reader counter disappears while its audio plan is active, returns after a playback error, and remains stable while navigating entries in the frozen queue. A different collection retains its manual counter.
- Confirm Reader and player keyboard shortcuts do not both react to one Arrow, Space, or Escape press.
- Listen to every production mapping with headphones and compare the complete displayed Arabic.
- Exercise Chromium, Firefox, and WebKit; automated axe checks supplement but do not replace this review.

## Waveform and transport refinement

Generate verified peaks with `node scripts/generate-audio-waveforms.mjs`. The command uses the existing pinned development Chromium decoder and cached generated peaks keyed to approved SHA-256 values. Reject checksum/size mismatches, preserve their report and ordinary-timeline fallback, and never update the approved registry to match unreviewed hosted bytes. Unit coverage must account for every approved variant, validate 96 integer bins and bind rejected recordings to fallback.

Check one progress control, media direction consistently LTR in both UI languages, symmetrical transport slots and aligned glyph centres at 320px, desktop and 200% text. Verify manual navigation from individual listening without enabling automatic continuation, and that auto-next does not disable internal segments or prescribed ritual repetitions. Volume is absent from compact mode and on iOS; elsewhere its click-open popover stays vertical, supports pointer/arrow-key adjustment and mute, preserves row positions, and closes before the player on Escape.

- Confirm the collapsed Reader panel reaches the main canvas bottom within 1px at all tiers and 200% text. Safe-area padding belongs inside its surface; no counter-footer gap remains below audio. Check the fuller rounded compact waveform uses actual recording progress without a second line or slider.
