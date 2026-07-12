# Pull Request Checklist

> Check off what applies. If a section does not apply to this PR, mark it N/A rather than deleting it. That keeps a record that it was considered.

## Summary

- **What does this PR do?**
- **Why is it needed?**
- **AI-assisted?** (Y/N - if yes, note which parts were AI-generated vs. hand-written/reviewed)

---

## 1. Architecture & Code Organization

- [ ] File(s) placed in the correct folder per the project structure and feature/layer convention
- [ ] Clear separation between UI components, business logic, data access, utilities, config, and constants
- [ ] Each component/module has one clear responsibility; large multi-purpose files were split where appropriate
- [ ] No duplicate logic - checked for an existing utility, hook, service, or component before adding a new one
- [ ] Reusable UI patterns extracted instead of copy-pasted across screens
- [ ] Business logic kept out of JSX/view markup where a hook, service, formatter, or helper is more appropriate
- [ ] No hardcoded values that should be design tokens, constants, config, or environment variables
- [ ] Naming is descriptive and consistent with the rest of the codebase
- [ ] File names match the default export/component name where the local pattern expects that
- [ ] No leftover dead code, commented-out blocks, debug UI, or `console.log` statements
- [ ] New dependencies justified; no library added for something a small local utility could handle
- [ ] Complex logic has "why" comments where non-obvious

## 2. AI-Generated Code Review (if applicable)

- [ ] I have read and understood every AI-generated line, not just skimmed it
- [ ] AI-generated sections were reviewed and adjusted to match the repo's patterns
- [ ] No hallucinated props, methods, APIs, routes, database fields, or package features
- [ ] No hardcoded secrets, API keys, tokens, credentials, or sample data left in the code
- [ ] Error handling is real and actionable; no silent `try/catch` blocks swallowing failures
- [ ] Types/interfaces match actual data shapes, not guessed shapes
- [ ] Type safety is preserved; no unnecessary `any`, unsafe casts, or disabled checks added
- [ ] Generated code did not introduce duplicate utilities or components that already exist

## 3. Performance

- [ ] No unnecessary re-renders introduced; checked with profiler if UI-heavy
- [ ] Memoization (`useMemo`, `useCallback`, `React.memo`, or equivalent) used deliberately, not sprinkled without need
- [ ] Routes or heavy components are code-split/lazy-loaded where appropriate
- [ ] Lists larger than 20 items use virtualization, pagination, or incremental loading instead of full array rendering
- [ ] Images are optimized, appropriately sized, lazy-loaded where appropriate, and not full-resolution assets for thumbnails
- [ ] No accidental full-library imports or bundle-size regressions
- [ ] No blocking synchronous calls on the main/UI thread
- [ ] Expensive user-triggered work is debounced/throttled where needed, such as search, scroll, and resize
- [ ] API calls and database queries avoid N+1 patterns
- [ ] Pagination/infinite loading used instead of loading unbounded data at once
- [ ] API caching strategy considered where relevant
- [ ] Mobile flows avoid JS-thread-heavy animations, excessive polling, and battery/network-heavy background work
- [ ] Offline or poor-connectivity behavior considered for mobile-critical flows

## 4. Accessibility

- [ ] Semantic HTML/native components used correctly; no `div` pretending to be a button
- [ ] Proper page structure and landmarks used where relevant (`header`, `nav`, `main`, `footer`)
- [ ] Heading hierarchy is logical
- [ ] Forms have associated labels, not placeholder-only labels
- [ ] All interactive elements are reachable and operable via keyboard
- [ ] Focus states are visible on new interactive elements
- [ ] No keyboard traps introduced
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Gestures have accessible alternatives where needed
- [ ] Color contrast checked (AA minimum: 4.5:1 text, 3:1 large text/UI)
- [ ] Color is not the only indicator of meaning
- [ ] Images have meaningful `alt` text, or decorative images are marked appropriately
- [ ] Video/audio includes captions or transcripts where relevant
- [ ] ARIA is used only when native semantics are insufficient
- [ ] Dynamic content such as toasts, errors, and loading states is announced via `aria-live` or platform equivalent
- [ ] Text can resize up to 200% without breaking the layout
- [ ] Reduced-motion preferences respected for animations
- [ ] Tested with a screen reader (VoiceOver/TalkBack/NVDA) if this touches a core flow

## 5. UX Consistency

- [ ] Loading, empty, error, and success states are designed - not just the happy path
- [ ] Error messages are actionable, not generic
- [ ] Actions that take longer than about 300ms show loading feedback or optimistic UI where appropriate
- [ ] Destructive or irreversible actions have confirmation
- [ ] Matches existing design system tokens for spacing, color, type, radius, and motion
- [ ] No one-off magic numbers unless locally justified
- [ ] Interaction patterns are consistent with the rest of the app
- [ ] Copy and terminology are consistent with the rest of the app
- [ ] Forms validate inline where useful, not only on submit
- [ ] Navigation and back behavior are predictable
- [ ] Empty/onboarding states guide first-time users instead of showing a blank screen
- [ ] RTL layout checked if this affects Arabic/RTL locales
- [ ] Safe areas respected on mobile devices with notches/home indicators
- [ ] Tested at mobile, tablet, and desktop breakpoints (web) or on multiple device sizes (mobile)

## 6. Testing & Verification

- [ ] Manually tested the happy path
- [ ] Manually tested at least one edge case, such as empty state, slow network, invalid input, or denied permission
- [ ] Unit/integration tests added or updated for critical logic, or marked N/A with reason
- [ ] Existing tests/builds pass, or failures are documented
- [ ] Linting/formatting checked if repo tooling exists, or marked N/A
- [ ] Verified on a real device or accurate emulator (mobile) / real browser (web), not just assumption of correctness
- [ ] Critical flows such as auth, payments, data mutations, or offline behavior tested when touched

## 7. Documentation

- [ ] README/docs updated if this changes setup, structure, architecture decisions, or usage
- [ ] Complex components have prop/param docs (JSDoc/TSDoc, type annotations, or equivalent)
- [ ] Any new environment variables documented in `.env.example`
- [ ] Any performance budgets, accessibility exceptions, or intentional skips documented in reviewer notes

---

## Reviewer Notes

_(For whoever reviews this PR, including future-you)_

- Anything you are unsure about or want a second opinion on:
- Anything intentionally skipped and why:
