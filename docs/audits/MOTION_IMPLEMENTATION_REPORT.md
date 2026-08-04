# Motion Implementation Report

_This is a template document intended to be filled out as the motion system implementation progresses._

## 1. Files Changed

_List the core files modified to implement the motion system:_

- `theme.css`
- `index.css`
- `HomeScreen.tsx`
- `LayoutShells.tsx`
- `TimeOfDayBackground.tsx`
- _(Add more as implemented)_

## 2. Motion Implemented by Area

_Document the specific areas where the new motion guidelines have been applied:_

- **Tokens:** Centralized CSS custom properties implemented.
- **Per-Component Reduced-Motion:** Replaced global overrides with specific, graceful alternatives.
- **Press Feedback:** Standardized to scale `0.98` with `90ms` duration.
- **Navigation:**
- **Counter:**
- **Leaf Animations:**
- **Daypart Transitions:**
- **Completion Screen:**
- **Overscroll:**

## 3. Tests Added

_List any testing mechanisms introduced to validate motion:_

- [ ] Motion validation script (checks for prohibited patterns, `transition-all`, etc.)
- [ ] E2E tests simulating `prefers-reduced-motion`

## 4. Settled-State Visual Comparison

_Provide screenshots or descriptions ensuring the UI looks identical in its final state before and after the refactor._

| Component/Screen | Before | After | Status  |
| :--------------- | :----- | :---- | :------ |
| Home Screen      |        |       | Pending |
| Counter          |        |       | Pending |
| Reader           |        |       | Pending |

## 5. Bundle-Size Comparison

_Document any changes to bundle size resulting from consolidating animations or libraries._

| Metric          | Before | After | Difference |
| :-------------- | :----- | :---- | :--------- |
| CSS Bundle Size |        |       |            |
| JS Bundle Size  |        |       |            |

## 6. Accessibility Checks

_Verify compliance with WCAG guidelines:_

- [ ] **WCAG 2.2.2:** No animations run indefinitely > 5 seconds.
- [ ] **WCAG 2.3.1:** No flashing elements detected.
- [ ] **WCAG 2.3.3:** All interactive animations possess reduced-motion equivalents (max 100ms).

## 7. Remaining Manual Checks

_Checklist for final manual verification on target devices:_

- [ ] Verify standard motion on iOS
- [ ] Verify standard motion on Android
- [ ] Verify reduced motion setting triggers correctly on iOS
- [ ] Verify reduced motion setting triggers correctly on Android
- [ ] Ensure no layout jumps occur during screen transitions
- [ ] Check performance on low-end devices

## 8. Rejected Animation Ideas

_Document ideas that were proposed but ultimately rejected, with rationale:_

- **Sliding Nav Indicator:** Rejected because it requires adding DOM elements specifically for decoration.
- **Directional Screen Transitions:** Rejected due to the complexities involved with RTL (Right-to-Left) layout support.
- **Custom Overscroll Bounce:** Rejected as it violates platform expectations and native scrolling behavior.
