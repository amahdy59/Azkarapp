# Pre-Implementation Motion Audit: Baseline

This document outlines the state of the Azkarapp motion system prior to implementing the new centralized guidelines.

## 1. Existing Animated Areas

There are over 18 keyframe animations currently used across the application. Note their varying durations, easings, and purposes:

| Animation                                         | Duration | Easing      | Purpose / Notes                                        |
| :------------------------------------------------ | :------- | :---------- | :----------------------------------------------------- |
| `waveform`                                        | Infinite | Linear      | Audio/Visual indicator                                 |
| `pulse-horizontal`                                | Infinite | Ease-in-out | Ambient attention                                      |
| `palm-glow-pulse`                                 | Infinite | Ease-in-out | Ambient attention                                      |
| `celebration-glow`                                | Varies   | Varies      | Completion celebration, uses `::before` pseudo-element |
| _(Additional 14+ keyframes to be categorized...)_ | -        | -           | -                                                      |

## 2. Existing Transitions

Transitions are currently applied in various UI elements with varying consistency:

- **Universal press feedback**
- `ui-icon-button`
- `interactive-elem`
- Radix scrollbar interactions
- Counter progress updates
- Counter navigation
- Theme transitions

## 3. Motion Libraries

The application currently depends on multiple motion libraries:

- **`framer-motion` (v12):** Used heavily in `ReaderScreen.tsx`, `SplashScreen.tsx`, and `SettingsScreen.tsx`.
- **`canvas-confetti`:** Used for celebrations in `CompletionScreen.tsx`.
- **`tw-animate-css`:** Used for Radix primitive animations (dialog, drawer, dropdown).

## 4. Existing Reduced-Motion Implementation

The current approach to reduced motion is fragmented:

- `.reduce-motion` class acts as a global override (forces `0.01ms` duration).
- `@media (prefers-reduced-motion: reduce)` is used as a global `0.01ms` sledgehammer.
- Per-component reduced motion is only implemented on the counter component (e.g., lines 864-874).
- JS-based `useReducedMotion()` hook used in `ReaderScreen`.
- `window.matchMedia` checks used in `CompletionScreen`.

## 5. Accessibility Risks

- **Infinite Animations:** `waveform`, `pulse-horizontal`, and `palm-glow-pulse` run continuously, violating WCAG 2.2.2.
- **Pseudo-element Animation:** `celebration-glow` animates the `::before` pseudo-element, which can be problematic for performance and screen readers.
- **Global Override Sledgehammer:** The `0.01ms` global override provides a jarring, instantaneous experience rather than a gracefully reduced motion alternative.

## 6. Performance Risks

- **Layout Reflows:** The progress bar animates its `width`, causing costly layout reflows every frame.
- **Broad Transitions:** The use of `transition-all` is prevalent, leading to unintended property animations and potential performance drops.

## 7. Overscroll Behavior

- Native overscroll is blocked by `overscroll-behavior-y: none` on `html` and `body`.
- `contain` CSS property is used on nested containers, which may interact unpredictably with native platform scrolling expectations.

## 8. Missing Elements

- No centralized CSS motion tokens (durations, easings, scales).
- Lack of per-component reduced-motion alternatives (relying heavily on global resets).
- No automated or manual motion validation scripts in the CI/CD pipeline or testing suite.
