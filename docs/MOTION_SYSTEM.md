# Azkarapp Motion System

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
- **Level 2 — State transition (120-200ms):** Used for selectors, navigation drawer/tabs, bookmarking actions, and progress updates.
- **Level 3 — Content transition (180-300ms):** Used for screen transitions, reader views, dialogs, and bottom sheets.
- **Level 4 — Meaningful completion (300-450ms):** Reserved exclusively for zikr or routine completion celebrations.

## 3. Motion Tokens

Use the following CSS custom properties to ensure consistency across the application:

```css
:root {
  /* Durations */
  --motion-duration-press: 90ms;
  --motion-duration-fast: 150ms;
  --motion-duration-standard: 220ms;
  --motion-duration-emphasis: 360ms;

  /* Easings */
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);

  /* Transformations */
  --motion-scale-pressed: 0.98;
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
- Bouncy or arcade-style motion
- Rotation (except for loading spinners)
- Blur filters (heavy on performance)
- Large or complex shadows

## 6. Component Motion Matrix

| Component              | Animation                | Duration    | Easing     | Reduced Motion Behavior         |
| :--------------------- | :----------------------- | :---------- | :--------- | :------------------------------ |
| **Universal Press**    | Scale to 0.98            | 90ms        | Standard   | Opacity change only, max 100ms  |
| **Counter Number Pop** | Scale/Opacity up         | 160ms       | Enter      | Opacity transition              |
| **Counter Ring Pulse** | Subtle scale outward     | 280ms       | Enter      | Removed                         |
| **Counter Readiness**  | Ready state indication   | 600ms       | Enter      | Removed                         |
| **Counter Completion** | Final state animation    | 440ms       | Enter      | Fade to completion state        |
| **Check Draw**         | SVG `stroke-dashoffset`  | 300ms       | Enter      | Instant or fast opacity (100ms) |
| **Navigation Active**  | Highlight state change   | 220ms       | Enter      | Opacity fade                    |
| **Favorite Pop**       | Scale and color shift    | 260ms       | Enter      | Opacity/Color transition only   |
| **Zikr Step**          | Enter / Exit translation | 300ms/220ms | Enter/Exit | Crossfade only                  |
| **Completion Screen**  | Enter transition         | 240ms       | Ease-out   | Crossfade only                  |
| **Celebration Pop**    | Pop / Glow               | 520ms/900ms | Enter      | Opacity fade (max 100ms)        |
| **Menu Pop**           | Context menu opening     | 160ms       | Standard   | Opacity fade                    |
| **Scrim In**           | Background dimming       | 180ms       | Standard   | Instant or fast opacity         |
| **Leaf Appear**        | Spring scale in          | 380ms       | Spring     | Opacity fade                    |
| **Progress Ring**      | `stroke-dashoffset`      | 150ms       | Standard   | Removed or fast opacity         |

## 7. Reduced Motion Behavior

Users who prefer reduced motion should have a comfortable experience. This is controlled via the OS `prefers-reduced-motion` media query and the app-level `.reduce-motion` class.

**Key Requirements:**

- Remove scale, translation, spring physics, and parallax effects.
- Opacity transitions and color changes may remain.
- Maximum duration for any reduced animation is **100ms**.
- Implement per-component alternatives instead of a global sledgehammer override where appropriate.

## 8. Accessibility Requirements

All animations must comply with WCAG standards:

- **WCAG 2.2.2 (Pause, Stop, Hide):** No continuous animation lasting longer than 5 seconds. Animations must be pausable or stoppable.
- **WCAG 2.3.1 (Three Flashes or Below Threshold):** Absolutely no flashing or blinking content.
- **WCAG 2.3.3 (Animation from Interactions):** All interaction-triggered animations must have a reduced motion alternative.

## 9. Performance Requirements

Animations must not degrade the user experience:

- **Compositor-friendly:** Only animate opacity and transform whenever possible.
- **No Layout Reflow:** Avoid animating properties that trigger reflow (e.g., width, height, margin, padding) per frame.
- **No Permanent `will-change`:** Use `will-change` sparingly and remove it when the animation completes.
- **No Extra Libraries:** Do not add new animation libraries. Use CSS transitions/animations or existing libraries carefully.
- **Pause When Hidden:** Pause all animations when the application or element is not visible.
