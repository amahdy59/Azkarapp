# Azkarapp Motion System

## Home prayer typography and action feedback — 2026-10-21

Expanded Home prayer digits grow by 40% inside their original line footprint; period labels stay small and collapsed digits retain their previous size. Digit font/clearance use explicit expanded/condensed endpoints on the same 220ms standard curve as the inherited card/footer/countdown handoff. WebKit retains stale inherited relative-font calculations after live resizing, so glyph fitting cannot rely on the inherited number alone. The sticky shell remains the single external geometry owner; there is no text scaling, new clock or scripted animation. The narrow enlarged-text fallback retains the existing full-row natural reflow. This owner-approved scope supersedes earlier identical-type-size wording only; card dimensions, reserved page space, native scrolling, reversal and interaction holds remain authoritative.

Home Share actions use the shared press response, a 150ms icon lift/scale on keyboard focus or fine-pointer hover and a subtle local ink surface. Routine/Wird/header/shortcut icons share the same still-aware cue; photography and devotional text remain stationary. Refresh acknowledges each actual activation with one 220ms half-turn/fade on its icon, without delaying the refresh, remounting its button, adding a timer or implying loading/success. This finite functional acknowledgement is a bounded owner-approved exception to the general rotation restriction. Both OS and app reduced motion remove lift, scale and rotation while preserving native actions, visible focus, press feedback and truthful status messages. Disabled actions do not engage.

Reduced motion applies the same static expansion endpoint directly to sticky descendants instead of relying on registered-property inheritance across WebKit size containers. The shell transition remains removed and both size endpoints are immediate, including preference changes during an active handoff. Default motion retains its single inherited geometry transition and existing 60ms/160ms footer/countdown sequence. No new clock or synthetic scrolling is added.

## Keyboard/pointer parity and native ranges — 2026-10-20, local only

Home action icons share one 150ms, 1.08 scale cue on keyboard focus and fine-pointer hover. Independent CSS scale preserves existing RTL arrow rotation; disabled actions and OS/app reduced motion retain the still icon. Routine-card photography stays stationary. Native ranges retain immediate values and use a 90ms engagement tint/halo alongside the existing focus outline, with immediate still feedback in reduced motion. No thumb-position interpolation, scripted input, new timer or haptic is added. Delegated keyboard press presentation releases on Escape, pointer handoff and page exit as well as blur, cancellation, visibility and unmount; native activation remains browser-owned.

See [local motion review and evidence](agent/phases/MOTION_CONTROL_POLISH_2026_10_20.md). Shared coverage is not a claim that every control state or real-device assistive-technology interaction has been verified. Further motion should prioritize truthful asynchronous completion, save/undo confirmation and small localized transitions for newly revealed non-reading context; preserve reading geometry and immediate continuous input.

## Mushaf gesture and page-turn ownership — 2026-10-20

Both hosts keep a single 220ms, 28px directional paper arrival with a restrained 80%-to-full opacity handoff; surrounding tools stay stationary. Committed swipes reset their drag without a competing CSS settle. Only incomplete drags settle back. Pointer cancellation never commits a page change. Current content remains in place until its replacement is ready; meanings do not gate readiness. OS/application reduced motion removes movement and keeps full contrast, factual progress and gesture outcomes. No page curl, duplicate page/toolbar mount, animation loop or new dependency is introduced. Shared filter chevrons and tab indicators use existing finite motion and reduced-motion recovery.

## Listening unlock feedback — 2026-10-20

A two-second continuous hold shows factual elapsed progress in the lock-button arc. One local 100ms interval updates only that modal while held; release, cancellation, target exit, blur, backgrounding or unmount stops it. Progress uses immediate still updates in every motion mode, with no decorative loop, scale, live announcements or screen-wide clock. Keyboard hold and Escape recovery remain available; the accessible progress value agrees with the visible arc.

## Owner policy: purposeful motion is welcome — 2026-10-20

Animation and microinteractions are an intentional part of the default product experience. Prefer beautiful, functional motion that confirms actions or reveals time, progress and changing state. Calm does not mean motionless. Existing Reduce Motion and the OS preference provide a calmer alternative; they are not reasons to omit considered default animation. Preserve visible state, focus, accuracy and immediate control in both modes.

This supersedes the blanket ban on recurring **functional, data-driven** motion and the prayer-summary prohibition for the approved small interval ring. A functional update must represent actual changing information, stay local to its component, pause hidden/offscreen work, cancel on unmount, avoid layout/blur animation and use short finite transitions. Decorative ambient loops, flashing, motion across sacred text and expensive full-screen effects remain prohibited. Existing static checks, token limits and performance/accessibility gates stay intact; this policy adds no blanket tooling exemption.

The next-prayer summary uses one second-aligned deadline clock shared by its expanded/condensed labels. A small SVG arc advances by actual elapsed time between dated adhans, never a repeating pretend progress cycle. Only changed seconds fade in for 180ms; the arc settles with the standard 220ms token. Fixed-width digits and stable card geometry prevent layout movement. OS/app reduced motion removes both effects and keeps factual time updates immediate, without live announcements. No frame loop, rotating ambient indicator, animated backdrop filter, permanent will-change, dependency or per-second Home recalculation is added.

## Synchronized Home prayer transition — 2026-10-19

The owner requests smoother, accurate Home motion. Supersede the 60ms hold plus 160ms contraction with one immediate 220ms expansion-value transition using the shared standard duration/easing. Footer details fade out over the first 60ms; the compact next countdown arrives over the final 60ms. Expansion hides the countdown immediately and reveals footer details over the final 60ms. Both directions finish together, without a stationary pause or early countdown against moving geometry. Preserve CSS interruption/reversal, stable typography, reserved page-flow space, interaction holds, 96px/8px hysteresis and instant OS/app reduced-motion cancellation. Native scrolling and the single stationary frost layer remain browser-owned.

## Stationary header surface — owner correction, 2026-10-18

Library, Progress and Settings keep the same header tint/sheen while scrolling. The owner requests stronger passing-content frost: switch 22px to 32px only at the existing scroll-elevation threshold; do not interpolate blur or add per-frame JS. Edge/shadow retains brief elevation feedback and reduced-motion suppression. Glass disables the named app-content capture boundary so actual content is sampled beneath its sticky chrome; Opaque keeps the named route transition. Preserve native Progress scrolling/focus recovery and accepted Home card motion. This supersedes historical opaque-header coverage and the interim separately clipped records viewport.

## Coordinated Home expansion — owner live-preview correction, 2026-10-18

The approved [stable prayer-card follow-up](agent/phases/STABLE_PRAYER_CARD_SCROLL_2026_10_18.md) supersedes the earlier 280ms preview. One registered/inherited CSS number, --home-prayer-expansion, contracts over 160ms after a 60ms footer-text fade. Expansion restores geometry before revealing footer text. The compact next countdown uses separate opacity feedback and is hidden from assistive technology to avoid duplication. Text sizes/columns stay stable while icons and whitespace compact. ResizeObserver reserves the expanded flow footprint without synthetic scroll writes; focus or open prayer details hold geometry. Native CSS handles reversal and OS/app reduced-motion cancellation. Keep 96px/8px hysteresis, no row entrance, no animated blur, no React frame loop and native horizontal swipe/keyboard access with a hidden scrollbar. This remains the bounded Home exception to general layout-animation restrictions; older engines without typed custom-property interpolation recover immediately.

## Single-shell Home handoff — 2026-10-18, local refinement

The owner-approved scrolling review replaces coordinated per-card height interpolation with one 180ms outer sticky-shell height transition plus detail opacity. This remains the bounded Home exception to layout-animation rules; card text takes its natural compact layout without scaling. Keep 96px-collapse/8px-restore hysteresis, cancellation on reversals/unmount/OS or application reduced motion, and no native anchoring compensation. Ordinary scrolling does not restart the handoff. Header coverage is immediate rather than a transparent-background fade, so passing text stays occluded. Native wheel/touch scrolling and stationary frost remain; loaded-photo Glass frame diagnostics complement the existing constrained Solid checks.

## Immediate reduced-motion Library cards — 2026-10-16

Stagger entrances have no animation or initial opacity delay under OS or in-app reduced motion. Shared Glass photography is stationary and stays outside route content movement; no parallax, animated blur or scroll inertia is added. The listening-lock pill has no modal centering/zoom transform.

## Owner responsiveness correction — 2026-10-16

The subsequent request to remove sluggish mobile/desktop scrolling shortens the Home state handoff to 180ms, superseding the earlier 260ms value below. Native wheel/touch scrolling has no synthetic inertia. Ordinary scroll does not trigger repeated React header updates or animations. Automatic Quran following and Reader collection positioning use immediate native positioning to avoid accumulating smooth-scroll work. All OS/app reduced-motion cancellation rules remain intact. Remove the full-shell turbulence/blend decoration and avoid per-card backdrop filters outside photographic Home.

## Home prayer scroll handoff — 2026-10-16

The owner-requested handoff fixes summary columns/header padding. Cards compact after 96px and restore at 8px. The current owner-approved follow-up replaces the earlier 220ms FLIP with bounded 260ms coordinated card/sticky-shell height interpolation and opacity-only arrival. This specific handoff is an exception to the general no-layout-animation preference; it prevents a height snap followed by a detached content slide. Text is not scaled and blur is not animated. Ordinary scroll does not restart motion. Reversals, unmount and OS/application reduced motion cancel active effects. Home disables compensating native scroll anchoring.

## Prayer surface emphasis — 2026-10-16

Latest owner correction removes current's decorative emphasis entirely once next enters the last 30 minutes, rather than gradually retaining half its highlight. Next still increases on the existing minute clock. All reduced-motion/transparency and no-loop constraints remain.

Home summary emphasis is a stationary surface treatment updated by the existing minute clock. During the final 30 minutes before next adhan, current's decorative strength decreases while next's increases. No extra timer, moving gradient, pulsing, whole-card opacity change, layout animation or animated blur is introduced. The existing brief border-color transition respects application/system reduced motion; the sheen and restrained shadow update discretely. Reduced transparency/high contrast omit the glow and retain opaque materials. Prayer timing, text contrast and native progress semantics are unchanged.

## Shared switch feedback — 2026-10-13

Settings and reminder switches reuse ToggleTrack. Its thumb uses a 150ms token-based transform, mirrored by actual CSS direction, instead of animating inset layout. OS reduced motion and the app preference make the position change immediate. Logical start stays fixed; switch semantics, focus and at least 44px targets remain with each action owner.

## Interaction polish — 2026-10-12

Shared counter Enter/Space presses use the same finite pressed response as pointer activation. One deliberate keydown counts once; operating-system repeat events do not add unintended repetitions. Keyup, blur and pointer cancellation release the response; reduced motion retains counting without adding a pressed animation. Home completion exits retain their staged opacity/transform sequence but no longer interpolate grid row geometry per frame; the existing owner timer removes the faded card. Reader controls stay stationary and rapid text navigation retains latest-selection-wins interruption.

## 1. Motion Principles

The motion system for Azkarapp is designed to be calm, responsive, lightweight, predictable, and respectful. Animation must serve a clear purpose and should remain stable during reading.

**Core Purposes of Motion:**

- **Confirm interaction:** Immediate visual feedback when a user interacts with elements.
- **Explain state change:** Clarify what happens when the UI transitions between states.
- **Preserve spatial context:** Help users understand where they are in the application.
- **Indicate progress:** Provide visual cues for ongoing background tasks.
- **Communicate completion:** Highlight significant user achievements or task conclusions.

## 2. Motion Hierarchy

Animations are categorized into four levels based on their purpose and duration:

- **Level 1 — Immediate feedback (70-120ms):** Used for button presses, card interactions, counter updates, and navigation selections.
- **Level 2 — State transition (120-220ms):** Used for selectors, navigation drawer/tabs, bookmarking actions, and progress updates.
- **Level 3 — Content transition (180-300ms):** Used for screen transitions, reader views, dialogs, and bottom sheets.
- **Level 4 — Meaningful completion (440-600ms):** Reserved exclusively for zikr or routine completion celebrations.

## 3. Motion Tokens

Use the following CSS custom properties to ensure consistency across the application:

```css
:root {
  /* Durations */
  --motion-duration-press: 90ms;
  --motion-duration-fast: 150ms;
  --motion-duration-standard: 220ms;
  --motion-duration-emphasis: 500ms;
  --motion-duration-entrance: 260ms;
  --motion-duration-release: 420ms;

  /* Easings */
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);

  /* Transformations */
  --motion-scale-pressed: 0.97;
  --motion-scale-pressed-compact: 0.92;
  --motion-ease-release: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 4. Approved Animation Properties

To maintain performance and visual consistency, only the following properties should be animated:

- `opacity`
- `transform` (translate, scale)
- `stroke-dashoffset`
- Existing SVG `fill` / `stroke`
- `background-color`
- `border-color`
- `box-shadow` (only when subtle)

## 5. Prohibited Patterns

The following animation patterns are strictly prohibited:

- `width` / `height` animation (causes layout reflows)
- `margin` / `padding` animation
- Continuous ambient loops
- Parallax scrolling effects
- Flashing or rapidly blinking elements
- Confetti (except on specific completion screens)
- Exaggerated bouncy or arcade-style motion. The restrained press-release overshoot approved in DEC-116 remains governed by the shared release token.
- Rotation (except for loading spinners)
- Blur filters (heavy on performance)
- Large or complex shadows

## 6. Component Motion Matrix

| Component               | Animation                         | Duration                   | Easing             | Reduced Motion Behavior         |
| :---------------------- | :-------------------------------- | :------------------------- | :----------------- | :------------------------------ |
| **Universal Press**     | Scale to 0.97; compact icons 0.92 | 90ms down / 420ms release  | Standard / Release | Opacity change only, max 100ms  |
| **Counter Number Pop**  | Scale/Opacity up                  | 160ms                      | Enter              | Opacity transition              |
| **Counter Ring Pulse**  | Subtle scale outward              | 280ms                      | Enter              | Removed                         |
| **Counter Readiness**   | Ready state indication            | 600ms                      | Enter              | Removed                         |
| **Counter Completion**  | Final state animation             | 440ms                      | Enter              | Fade to completion state        |
| **Home Completion**     | Surface/copy/icon in; reverse out | 500ms                      | Enter/Exit         | Instant reveal/removal          |
| **Counter Tap Ripple**  | Scale/opacity from input          | 560ms                      | Ease-out           | Removed                         |
| **Home Hero Particles** | Finite upward drift               | 3.9-4.8s                   | Ease-out           | Removed                         |
| **Check Draw**          | SVG `stroke-dashoffset`           | 300ms                      | Enter              | Instant or fast opacity (100ms) |
| **Navigation Active**   | Highlight state change            | 220ms                      | Enter              | Opacity fade                    |
| **Favorite Pop**        | Scale and color shift             | 260ms                      | Enter              | Opacity/Color transition only   |
| **Zikr Step**           | Reading text only, 28px / 20px    | 240ms arrival / 100ms exit | Enter/Exit         | Immediate stable text           |
| **Completion Screen**   | Enter transition                  | 240ms                      | Ease-out           | Crossfade only                  |
| **Celebration Pop**     | Pop / Glow                        | 520ms/900ms                | Enter              | Opacity fade (max 100ms)        |
| **Menu Pop**            | Context menu opening              | 160ms                      | Standard           | Opacity fade                    |
| **Scrim In**            | Background dimming                | 180ms                      | Standard           | Instant or fast opacity         |
| **Leaf Appear**         | Spring scale in                   | 380ms                      | Spring             | Opacity fade                    |
| **Progress Ring**       | `stroke-dashoffset`               | 150ms                      | Standard           | Removed or fast opacity         |

## 7. Reduced Motion Behavior

Users who prefer reduced motion should have a comfortable experience. This is controlled via the OS `prefers-reduced-motion` media query and the app-level `.reduce-motion` class.

The shared screen-transition boundary treats the View Transitions API as optional enhancement. If the browser skips an animation, the destination state remains authoritative and the animation-level rejection is contained; update-callback failures must still surface. Embedded browsers without `matchMedia` continue without throwing.

**Key Requirements:**

- Remove scale, translation, spring physics, and parallax effects.
- Opacity transitions and color changes may remain.
- Maximum duration for any reduced animation is **100ms**.
- Mushaf page changes are immediate under reduced motion, keeping devotional text and page controls at full contrast.
- Reduced-motion modal dialogs disable their entry animation entirely so WebKit cannot retain the initial zoom frame; centering and full-size controls remain intact.
- Implement per-component alternatives instead of a global sledgehammer override where appropriate.
- JavaScript-driven smooth scrolling and completion effects must use the shared `motionPreferences.ts` gate so both the OS preference and the in-app Reduce Motion setting are honored. Haptics use the same boundary and remain independently controlled by the Haptic Feedback setting.
- Route view transitions, shared active-tab pills, the audio-player layout morph, and reader direction changes must honor both sources of reduced motion. Qibla alignment uses a finite settle confirmation rather than a looping target animation.

## 8. Accessibility Requirements

All animations must comply with WCAG standards:

- **WCAG 2.2.2 (Pause, Stop, Hide):** No continuous animation lasting longer than 5 seconds. Animations must be pausable or stoppable.
- **WCAG 2.3.1 (Three Flashes or Below Threshold):** Absolutely no flashing or blinking content.
- **WCAG 2.3.3 (Animation from Interactions):** All interaction-triggered animations must have a reduced motion alternative.

## 9. Performance Requirements

Animations must not degrade the user experience:

- **Compositor-friendly:** Only animate opacity and transform whenever possible.
- **Finite ambience:** Home particles run once after entry; they never loop, flash, capture input, or continue as an endless distraction.
- **No Layout Reflow:** Avoid animating properties that trigger reflow (e.g., width, height, margin, padding) per frame.
- **No Permanent `will-change`:** Use `will-change` sparingly and remove it when the animation completes.
- **No Extra Libraries:** Do not add new animation libraries. Use CSS transitions/animations or existing libraries carefully.
- **Pause When Hidden:** Pause all animations when the application or element is not visible.
- High-frequency counting surfaces replace the current ripple instead of accumulating ripple nodes. A single response confirms each tap without turning repeated devotion into decorative noise.

- Counting press/release styles refer directly to CSS motion variables without synchronous computed-style reads during renders or taps.
- Home photographs are static. They have no ambient scale loop or permanent `will-change` hint.
- Library card entrances use the 260ms entrance token with at most 200ms stagger delay, only during the initial opening. Search, group and tab interactions stop entrances immediately; later filtering and clearing search do not replay them. Static chart heights update directly; only their colors transition.
- Prayer, Friday and Mushaf progress indicators reuse clipped translated fills, retaining their existing numeric values, direction and reduced-motion behavior.
- The motion quality gate checks CSS ambient loops and explicit JSX layout transitions/Motion targets. An unrelated earlier reduced-motion rule never exempts a later loop. This static check does not prove frame rate, visibility pausing or comprehensive accessibility.
- Shared, Home and counter progress fills translate a full-size surface through a clipped track. Direction follows the interface, rounding and divider thickness remain stable, and no width/inline-size transition or permanent layer hint is needed.
- Route snapshots name only the main canvas. The root snapshot does not crossfade persistent navigation. Active navigation icons reuse a finite entrance cue; global OS and in-app reduced-motion rules cover elements and pseudo-elements in surfaces.css.
- Live Qibla rotation uses the existing shortest-angle sensor smoothing without an additional CSS rotation transition. This avoids long interpolation across north and the signed turn seam. The finite alignment confirmation remains optional and reduced-motion aware.

## Reading-text transition — 2026-10-04

Enabling reduced motion during an unfinished transition cancels the outgoing presence boundary immediately, without waiting for the earlier exit animation.

Interruption refinement (2026-10-05): when another selection arrives before the current transition settles, cancel that animation generation and show the latest entry immediately. Every further input remains immediate until 340ms (one exit/arrival interval) passes without a selection change. Do not queue intermediate entries or replay their counts. Ordinary navigation preserves 100ms exit/240ms arrival. Reduced motion retains one stable frame while entry-local reading controls reset by identity. Reset/restore cancels delayed completion advance; normal taps retain 15ms haptics and the final tap uses only the existing completion pattern.

ReadingTextTransition shares a non-bouncing sheet-like transition between zikr entries in Reader and expanded audio. Exit translates 20px over 100ms with the existing exit curve; arrival translates 28px over 240ms with cubic-bezier(0.22, 1, 0.36, 1), easing to rest. Travel follows language direction and reverses for Previous. Only the reading text moves; controls and page geometry stay fixed. Initial content and reduced-motion users receive immediate stable text. It does not animate canonical Mushaf pages or add persistence.

## Owner-requested coordinated prayer collapse — 2026-10-16

Supersedes the earlier transform-only 220ms handoff: interpolate actual sticky-shell and five card heights together over 260ms with cubic-bezier(0.2, 0, 0, 1); arriving detail uses opacity only. This bounded layout interpolation explains the state change without text scaling, moving blur or an adjacent-content snap. Retain 96px/8px hysteresis, 1fr/auto footer alignment, cancellation on reversal/unmount/preferences, immediate OS/application reduced motion and no effect on ordinary scroll ticks. No extra clock, loop or permanent compositor hint. Local-only phase: `docs/agent/phases/AUTOMATIC_PATH_AND_HOME_POLISH_2026_10_16.md`.

## Control feedback audit — 2026-10-20, local only

Retain shared 90ms press/420ms restrained release, 150–220ms state transitions and existing reading/panel transitions. Home evidence-share and devotional actions use compact press depth; delegated keyboard feedback fills Enter's missing native :active state without generating actions. Selection controls/summary retain brief opacity engagement and native range controls show an engagement ring while dragging or keyboard-focused. Exclude disabled/no-press controls and text editing. OS and app reduced motion remove compact and keyboard scaling while preserving opacity feedback. No ambient motion, per-frame React state, animated blur, new haptics or reading-text effects are added. Further animation should explain a demonstrated transition or completion; additional decorative loops would undermine the calm reading contract.

## Final shared feedback refinement — 2026-10-20

Shared ordinary actions include finite 150ms color/background/border/shadow changes alongside existing press/release tokens. Labelled devotional tools use the ordinary 0.97 depth; icon-only targets retain 0.92 for visible feedback at 52px. Semantic unavailable controls do not receive hover/press scaling; keyboard feedback also covers native details summaries and menu/checkbox choices, with the existing cancellation lifecycle. The delegated handler never toggles details or dispatches clicks. Native ranges keep their engagement/focus ring and native values; no timers, vibration, loops, animated blur or new reading-text animation are added. Language switching keeps the control's geometry stable and changes main content immediately. OS/app reduced motion remains still and preserves opacity confirmation.

Keyboard release also overrides WebKit's lingering native :active appearance after Space then Tab. A released marker clears on the next pointer/keyboard activation and on unmount; it changes presentation only, preserving native activation and disabled opacity. Mobile WebKit's enlarged short-window recovery is verified through native keyboard focus because its browser automation does not expose wheel input; desktop engines additionally verify actual wheel recovery.
