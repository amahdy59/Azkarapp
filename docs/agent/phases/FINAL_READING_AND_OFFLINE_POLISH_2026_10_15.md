# Final reading, offline clarity and release acceptance

The owner approved all six final recommendations on 2026-10-15 and requires actual screen previews before pushing.

Plan, in bounded reviewable changes:

1. Reading presentation: replace repeated current-ayah side marks with a faint word-level verse tint and emphasized existing end marker. Preserve exact-word emphasis, semantic current state, canonical fifteen-slot/page/font geometry, manual browsing and reduced motion. Shared English translation uses at least 12px inline clearance, stable scrollbar space and a non-overlay bottom-right verse chip. This explicitly supersedes the earlier numbered left-gutter presentation and line-mark contract; devotional content is unchanged.
2. Offline and progress clarity: reuse existing verified download/cancel/remove/export boundaries, make downloaded audio discoverable and states/sizes explicit, and explain the existing daily-versus-situational reset policy beside its action. Retain all recorded history and current schema. Standardize only affected controls through existing shared components.
3. Reliability: inspect the two retained WebKit failures (large-text listening scroll-bottom and devotional share return focus), fix evidence-supported lifecycle/interaction causes and add regression coverage. No retries/timeouts/assertions/coverage/budget limits are weakened.
4. Verification/release: actual Arabic/English, phone/desktop and enlarged-text screenshots during work; targeted unit/browser checks; intact local hooks and exact-commit CI/Pages/production smoke. Run available Android build/device checks and record unavailable physical-phone/TalkBack/reminder/widget acceptance honestly. Do not claim Play readiness from compilation or browser emulation.

No runtime dependency, reviewed source content, recording permission or persistence migration is authorized or needed. Physical acceptance/signing and store declarations remain separate evidence requirements.

Owner screenshot correction: the English ayah number must not consume its own row. Use an absolute bottom-right chip, 8px top and 10px bottom paragraph padding (scaling together), and a narrow inline text clearance. Remove the English header/footer rules. The owner proposes overlaying compact playback over the Mushaf with explicit Hide/Show rather than shrinking the canonical page; apply locally and show actual visible/hidden previews before publication. Keep Stop, full-player expansion and manual seeking distinct, retain a labeled 44px Show player tab with playback state, and preserve current timing on hiding.

Subsequent owner correction supersedes the reserved inline clearance: increase the prior 12px left paragraph padding by 2px and use that same 14px on both sides (calc(0.75rem + 2px) scales with text). No dedicated right gutter; the absolutely positioned chip may overlay the paragraph as the owner explicitly requested. Keep the 2px top/bottom difference and show an updated preview.
