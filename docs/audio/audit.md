# Legacy audio audit

The removed `useAudioPlayer` resolved URLs using substring checks against IDs and citations. Rules targeted 2:255, the first verses of surahs 112/113/114, 2:285, and the first verses of several whole surahs.

Confirmed defects included:

- `m-hm-75a` and `e-hm-75a` mapped to 2:255 because their IDs contain `75`.
- Morning/Evening Al-Ikhlas, Al-Falaq, and An-Nas played only verse 1.
- the three Tasbih Fatimah phrases mapped to 113:1 because their citation contains `3113`;
- `wu-hm-1` mapped to 113:1 because its citation contains `11/113`;
- Before Sleep Qur'anic passages were largely unreachable;
- Play All followed a live numeric index, swallowed unavailable tracks/errors, and changed labels when category/mode/navigation changed;
- pause hid the player, and no error/retry/seek/live-region behavior existed;
- Core Reader indexed the Complete list, allowing displayed content to diverge after a Complete-only gap.

Playback state lived in the hook (media element, numeric index, flags, times, rate, reciter, Play All) and in `App.tsx` (category, screen index, routine mode). Category and Reader forwarded numeric indexes; persisted completion already used stable zikr IDs except for a legacy index migration.

The old player exposed labelled 44px buttons for previous, play/pause, next, mode, reciter, speed, and close, but placed them in one overflowing row. It lacked accessible buffering text, a seek slider, explicit errors, and paused visibility.

Workbox precached only app-shell assets. No audio cache or audio tests existed.
