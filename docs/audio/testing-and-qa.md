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

- Use keyboard only: start, play/pause, previous/next, replay, seek with arrow keys, speed/voice, Retry/Skip/Stop.
- Verify visible focus and 44px targets at narrow width, 200%, and 400% zoom.
- Verify English LTR and Arabic RTL without horizontal overflow.
- With a screen reader, confirm dynamic Play/Pause names and polite track/error/repetition/queue announcements; current time must not announce every second.
- Test offline with a fully downloaded item and an uncached item.
- Switch category and Core/Complete during playback; the audio title/text identity and queue must not change.
- Listen to every production mapping with headphones and compare the complete displayed Arabic.
- Exercise Chromium, Firefox, and WebKit; automated axe checks supplement but do not replace this review.
