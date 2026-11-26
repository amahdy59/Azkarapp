# Native English Learn evidence — 2026-11-25

Captured from the actual local application in isolated browser profiles. External requests were blocked during the visual review. No account or production-site change was performed.

- `desktop-english.png`: English tawaf reading inside the app, with native contents/navigation and the source-bound diagram.
- `phone-english-arabic-ui.png`: 390px English sa'i content within Arabic interface navigation; physical diagram direction remains unchanged.
- `phone-reading-options-200.png`: final compact language controls in Arabic UI at 320px/200% text.
- `options-{light,dark,midnight}-{1280,320}.png`: protected options in the three app themes using Glass; narrow cases use 200% text.
- `options-light-solid-{1280,320}.png` and `options-midnight-solid-320-contrast.png`: solid and high-contrast/reduced-transparency fallbacks.
- `browser-review.json`: nine asserted theme/material/width configurations, eighteen reader/options axe scans with zero selected violations and no horizontal content overflow. Glass retains the app's protected reading ground; theme classes are asserted explicitly.

The three-engine Learn browser suite passes 18 cases. The final WebKit origin-outage regression passes three consecutive cases: save both languages, stop the test-owned server, require a worker-served reload, read the cached English text/diagram/bookmark, remove English and retain Arabic readiness. It does not fake a successful document or rely on the pinned engine's faulty offline flag.

The [phase report](../../reports/ENGLISH_LEARN_INTEGRATION_LOCAL_2026_11_25_REPORT.md) records commands, exact results, source coverage, earlier corrected diagnostics and remaining independent language/religious-source and physical-device assistive-technology acceptance. Automated evidence does not establish complete accessibility compliance.
