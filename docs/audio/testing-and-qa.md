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
- Verify the volume slider opens on hover and keyboard focus with a fine pointer, stays open while the pointer crosses from speaker to slider, opens on click with touch input, reports a vertical orientation and percentage, and restores its persisted level.
- Verify collections with multiple reviewed recordings expose Play All on both overview and Reader, disclose partial coverage, and advance through the frozen queue.
- Verify compact progress and both native slider tracks remain inside the player bounds, use CSS-rendered tracks/thumbs, retain 44px interaction height, and mirror their fill in RTL without reversing media time.
- Verify visible focus and 44px targets at narrow width, 200%, and 400% zoom.
- Verify English fills timeline progress left-to-right and Arabic fills it right-to-left without horizontal overflow.
- With a screen reader, confirm dynamic Play/Pause names and polite track/error/repetition/queue announcements; current time must not announce every second.
- Test offline with a fully downloaded item and an uncached item.
- Switch category and Core/Complete during playback; the audio title/text identity and queue must not change.
- Complete both Play Once and prescribed-repeat audio, navigate to another prayer or subcategory, and confirm natural completion updates only the frozen source session once. Repeat must wait for its final repetition; pause, stop, skip, and failure must not complete it.
- Confirm the current Reader counter disappears while its audio plan is active, returns after a playback error, and never disappears for a different zikr.
- Confirm Reader and player keyboard shortcuts do not both react to one Arrow, Space, or Escape press.
- Listen to every production mapping with headphones and compare the complete displayed Arabic.
- Exercise Chromium, Firefox, and WebKit; automated axe checks supplement but do not replace this review.
