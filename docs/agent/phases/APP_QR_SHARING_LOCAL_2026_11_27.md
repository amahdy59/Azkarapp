# Home application QR and sharing — local 2026-11-27

## Objective and authority

The owner requests a desktop Home application QR and equivalent mobile sharing using `https://play.google.com/store/apps/details?id=m.azkar.com`. After inspecting the first screenshot, they reject excessive options and request a simpler, more intuitive page. Keep one Google Play QR, one Share app action and quiet Copy link. This supersedes the initial website picker and separate link/QR/save controls.

The owner explicitly reiterates local application only: no commit, push, deployment or release-note rewrite. Preserve all independent pending work.

## Inspected implementation and reusable pieces

Reuse Home composition, protected ResponsiveSheet/SheetHeader, Button, semantic tokens, icon exports, Android sharing adapters, Web Share capability checks and the installed QR generator. Public application sharing is separate from private QR device pairing.

## Approved plan before the simplification edit

1. Keep the desktop Home QR invitation at the existing 900px expanded/large boundary and one compact mobile/tablet Share app trigger. Keep one trigger DOM node across resizing for focus recovery.
2. Reduce the shared sheet to a clickable Google Play QR, one short caption, one dominant Share app button and a quiet Copy action. Show the selectable URL only when copying fails. Unsupported sharing exposes one Copy action.
3. Automatically include the locally prepared QR PNG when supported, otherwise share the same public link. Invoke handoff in the original click; serialize actions and distinguish cancellation/failure without downloading. Prepare no image when system sharing is unavailable.
4. Embed a compact public white-ground/four-module-margin PNG in the application source, avoiding HTTP image-cache dependence. Reuse its verified bytes for sharing without runtime QR/canvas work. Preserve offline reading/state and private synchronization and retain all existing bundle ceilings.
5. Update meaningful unit/browser tests, inspect actual screenshots, and verify RTL/LTR, themes/material fallbacks, narrow/enlarged text, full-code visibility, 44px targets, protected surfaces, hit testing, focus/Back recovery and offline behavior. Use the repository's Chromium installed-shell harness and supported cross-engine offline sharing tests.
6. Run the complete non-browser gate, Pages build and browser inventory. Record exact outcomes and independent shared-checkout limitations in the phase report. Keep the work local and uncommitted.

## Desktop spacing follow-up

The owner requests a more interesting desktop treatment using horizontal space efficiently. Keep the same single-action mobile entry and simplified actions. On desktop, use a full-width invitation with logical-start title/caption, a clear sharing cue and the QR at logical end, balanced padding, semantic accent and a stable white QR ground. Widen the desktop sharing dialog to put QR/caption beside Share/Copy/feedback; keep phone stacking. Preserve RTL mirroring, the surviving trigger, keyboard order, 900px boundary and enlarged-text recovery. Verify actual desktop RTL/LTR captures and existing narrow/sheet assertions. Local only; do not commit or push.

## Boundaries

No reviewed devotional text, prayer calculation, settings/state schema, persistence, routing, native plugin, synchronization or runtime dependency changes. Camera scanning, real Android chooser behavior and human assistive-technology acceptance remain separate from browser evidence.

## Completed local checkpoint

The simple mobile flow and horizontal desktop invitation/dialog are implemented and visually inspected. Final isolated-preview verification passes 34 selected cases across Chromium/Firefox/WebKit, plus 32 focused units, typecheck, feature lint and formatting. The [phase report](../reports/APP_QR_SHARING_LOCAL_2026_11_27_REPORT.md) records screenshots and the unresolved aggregate book-audit/total-output release gates. No complete-gate pass or physical acceptance is inferred. No commit, push or publication.
