# Phase Report — Daily reliability and interaction polish

## Objective

Apply the owner's approved recommendations for faster startup, dependable reading continuation, truthful offline/reminder status and calm accessible motion. Widgets and native packaging are explicitly deferred.

## Plan and scope

Inspect existing behavior, measure throttled startup, repair demonstrated gaps, verify existing continuation/offline recovery, then complete targeted and full release gates. Use shared components and original normalization boundaries. Physical device, battery/thermal and human assistive-technology results cannot be inferred from desktop automation.

## Scope completed

Implementation completed. Reminder delivery no longer awaits an unregistered worker forever; permission is refreshed on return, queued obsolete delivery is suppressed and test notification requests cannot duplicate while pending. Background limitations are visible. Shared switches use direction-aware transform motion. Home's source badge no longer imports Reader counter code. Final release results are recorded in output/playwright/daily-polish/PHASE_REPORT_FINAL.md.

## Files changed

Notification service and tests, reminder hook/lifecycle tests, NotificationsPanel and bilingual copy, shared ToggleTrack/motion CSS, standalone HadithWeakChainBadge and its callers, startup/reminder browser coverage. No religious content or persistence schema change.

## Accessibility work

Existing switch semantics, keyboard interaction, target sizes and focus retained. Shared reduced-motion rules govern transform transitions. Permission and test outcomes have localized feedback; mobile narrow/large-text/axe checks are required.

## Commands run

Baseline throttled startup: passed, first Home frame 8,254ms. Initial reminder/settings units: 34 passed in 15.68s. Final results and screenshots recorded on completion.

Additional preservation/Home/playback units: 73 passed in 21.87s. Offline first reading and repeated sessions passed; bilingual reminder motion/keyboard/200% text/axe passed across Chromium/Firefox/WebKit, 6/6 in 1.5m. Changed throttled Home frame: 6,776ms, with counter chunk absent; this is a local diagnostic, not a general speedup claim. Browser inventory: 1,396 unique cases. First full check passed every non-unit stage but detected the new mocked lifecycle suite missing from the existing isolation registry; added it without changing assertions or thresholds. Corrected full gate and exact-commit release evidence follow in the report artifact.

## Components added or modified

HadithWeakChainBadge, ToggleTrack, NotificationsPanel, shared notification service and foreground reminder lifecycle.

## User-visible changes

Permission refreshes on return; test requests expose pending/success/failure and avoid indefinite worker readiness. Reminder availability explains background limitations. Switch motion mirrors RTL and stops with reduced motion. Home no longer imports counter tools for its source badge.

## Tests added or updated

Notification delivery/revocation/cancellation/failure units, reminder lifecycle tests, settings permission and pending-send tests, startup graph guard and bilingual all-engine reminder interaction/geometry/axe checks. New mocked suite registered with the required isolation policy.

## Visual/manual evidence

Arabic/English reminder screenshots captured under output/playwright/daily-polish/reminder-confirmed. Arabic screenshot visually inspected. Production screenshots follow exact-commit deployment. Native notification permission/delivery is mocked for browser tests; human assistive technology is not claimed.

## Documentation updated

Architecture, motion, prayer-time contract, index/decision log, this phase and fresh release notes 2026-10-13-3.

## Decisions recorded

Owner explicitly approves recommendations and defers widgets. Existing autonomous release authority applies.

## Known limitations or remaining risks

Physical Android/iPhone sessions and TalkBack/VoiceOver remain pending. PWA background scheduling is not guaranteed and fully closed-app reminders are not implemented. No widgets or native dependency introduced.

The existing Arabic WebKit Al-Kahf 200% End-key check failed once, then an isolated diagnostic passed in 59.3s and reached the exact bottom (13,391 + 593 = 13,984). This does not establish its cause; assertion and behavior are retained, with real-device diagnosis pending.

## Out-of-scope findings

Existing Downloads already verifies offline assets. Counts, saved Surah pages, normalized history and first-incomplete continuation retain their existing boundaries and passing coverage. No duplicate controls, religious content changes or speculative state replacement.

## Recommended next step

Complete browser verification and exact-commit Quality/Pages/live release, then physical-device checklist.
