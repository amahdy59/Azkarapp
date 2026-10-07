# Phase 84 — Stable Home photograph loading

## Objective

Prevent partial photograph/color bands from appearing under Home cards while images load.

## Scope and components

AzkarHeroBackground retains the existing stable placeholder and reveals the complete image only after browser decoding succeeds. Cached images follow the same decode boundary. A failed scene can recover when its identity changes; stale decode callbacks cannot reveal another image. Existing Home photograph selection, card anatomy, theme colors and scrim remain unchanged.

## Accessibility and tests

The background remains decorative and does not add focus targets or announcements. Text retains the established on-media palette and dark fallback. Unit tests cover delayed decode and scene recovery. A browser test holds photo requests, verifies readable Home controls above the placeholder, then releases the request and verifies the complete decoded image. Pending and decoded screenshots are written to `output/playwright`.

## Commands and evidence

Results are recorded in the release response. Targeted Home/browser coverage and complete non-browser gates are run; final CI runs the full browser suite.

## Known limitations

Automated delayed-image checks verify the decode boundary. Android-specific GPU/compositor behavior still requires a physical-device check; this phase does not claim universal rendering perfection.

## Recommended next step

Review the Home photograph on the owner's Android device after the deployed update.
