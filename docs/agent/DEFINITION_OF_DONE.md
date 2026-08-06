# Definition of Done

A feature or phase is not done because the page looks better in one screenshot.

## Product

- The intended user task is clearer or faster.
- One dominant action is identifiable where required.
- Empty, loading, error and success states are defined.
- Existing important behavior is preserved unless explicitly changed.
- Arabic and English copy is complete.

## Accessibility

- Correct semantics are used.
- Keyboard behavior works.
- Focus is visible and logical.
- Target sizes are adequate.
- Contrast is verified.
- Color is not the only state indicator.
- Text scaling and reflow work.
- Reduced motion works.
- Dynamic status is announced appropriately.
- Required manual checks are recorded.

## Visual design

- Shared tokens and components are used.
- No arbitrary one-off color, radius, shadow or spacing is introduced without justification.
- Component states are complete.
- Photography/decoration does not undermine readability.
- RTL and LTR are both visually correct.

## Engineering

- Architecture boundaries are preserved.
- Types are strict and clear.
- State changes are normalized and migrated safely where applicable.
- Offline behavior remains functional.
- Tests cover changed behavior.
- No unrelated refactor is included.
- No dependency is added without approval and justification.

## Quality gates

Normally required:

```bash
pnpm check
pnpm test:e2e
```

Also run targeted tests during development and `pnpm build:pages` for release-affecting work.

## Evidence

- Before/after screenshots for visible changes
- Viewport matrix where applicable
- Accessibility results
- Test command results
- Known limitations
- Updated documentation
- Phase report

## Review

- The user or reviewer has inspected the actual application, not only the code.
- Critical and high-severity findings are closed.
- Medium findings are either closed or recorded with an owner and rationale.
