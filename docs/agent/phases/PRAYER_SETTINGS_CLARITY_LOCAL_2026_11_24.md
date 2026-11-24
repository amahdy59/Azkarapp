# Prayer settings clarity — 2026-11-24

The owner approves the reviewed prayer-settings and calculation-picker concepts and requests implementation without pushing. Keep the work local; no commit, push, deployment or release-note rewrite. Preserve concurrent Home, Qibla and Downloads work.

## Plan

1. Reuse Card, Button, the shared Select, ResponsiveSheet/Modal, ChoiceRadioItem and icon exports. Separate the saved/device location summary, calculation method and closed advanced settings. Collapse timezone explanations and move city search into a protected picker.
2. Use a phone sheet for the five complete method names, a concise closed value and adjacent full authority name. Preserve immediate selection and local calculation. Protect the first visible overlay frame, stable page geometry, selection, focus, Escape/native Back and viewport bounds. Keep search separate from scrolling city results.
3. Present explicit location-request results in the existing closable modal pattern. Announce city/method updates without adding page geometry. Keep pending GPS cancellation and honest source labels; never infer a city or choose a method from it.
4. Reuse the existing visible/foreground clock and date/zone-keyed timezone status to avoid annual Intl sampling during city typing while retaining date/DST refresh.
5. Add unit/browser regressions for GPS races, denial, all methods, offline/reload durability, enlarged full labels, opacity/hit testing and keyboard/focus recovery. Capture actual Arabic/English phone/tablet/desktop evidence and theme/material fallbacks. Run intact local gates and report unrelated mixed-checkout failures explicitly.

No dependency, prayer parameter, religious content, persistence schema, remote state or reminder-delivery change is authorized. Physical Android, TalkBack/VoiceOver and field-performance acceptance remain separate from browser evidence.

## Local implementation checkpoint

Implemented and feature-verified locally; see [the phase report](../reports/PRAYER_SETTINGS_CLARITY_LOCAL_2026_11_24_REPORT.md) for actual screenshots, exact successful checks, corrected Firefox enlarged-text coverage and the unrelated mixed-checkout gate findings. No commit, push, deployment or release-note change. Full release readiness is not claimed.
