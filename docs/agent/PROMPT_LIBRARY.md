# Prompt Library

## A. Bootstrap prompt

```text
Read AGENTS.md and docs/agent/INDEX.md completely. Read all existing repository documents referenced by the active phase. Follow the authority order in AGENTS.md. Do not edit code until the active phase explicitly permits implementation.
```

## B. Analysis-only prompt

```text
Execute the analysis section of [PHASE FILE] only. Do not edit files.

Return:
1. Current implementation summary
2. Relevant files and components
3. Existing tests
4. Contract or requirement conflicts
5. Proposed implementation plan
6. Risks and regression areas
7. Test and evidence plan
8. Acceptance-criteria mapping
9. Decisions that require my approval
```

## C. Implementation prompt

```text
Proceed with the approved plan for [PHASE NAME].

Constraints:
- Stay within the phase scope.
- Preserve architecture, content integrity, offline behavior and persisted data.
- Reuse existing components and tokens before creating new ones.
- Add or update tests in the same change.
- Do not perform unrelated refactors or formatting.
- Report any blocker instead of guessing.

After implementation, run the phase-required tests and produce docs/agent/templates/PHASE_REPORT.md.
```

## D. Diff-review prompt

```text
Review the current branch diff as a strict senior reviewer. Do not edit yet.

Check:
- Scope creep
- UX regressions
- Accessibility semantics and keyboard behavior
- RTL/LTR correctness
- Responsive behavior
- State/persistence risks
- Offline risks
- Duplicate components or hard-coded styles
- Missing tests
- Documentation drift

Return findings by severity with exact files and recommended corrections.
```

## E. Fix-only prompt

```text
Fix only the numbered findings below. Do not redesign other areas.

[PASTE FINDINGS]

For each finding, state the change and test that proves it. Then rerun the relevant phase gates and update the phase report.
```

## F. Accessibility audit prompt

```text
Audit the active screen against docs/agent/ACCESSIBILITY_REQUIREMENTS.md and the applicable WAI-ARIA APG patterns.

Do not assume that an axe pass proves accessibility. Check native semantics, names, roles, states, keyboard interaction, focus order, focus visibility, announcements, target size, contrast, text scaling, reduced motion, RTL/LTR and cognitive clarity.

Return:
- Critical, high, medium and low findings
- WCAG success criteria where confidently applicable
- Exact component/file locations
- Recommended fixes
- Automated and manual tests required
```

## G. Visual consistency prompt

```text
Review the active screen against docs/DESIGN_SYSTEM.md and docs/agent/DESIGN_SYSTEM_DELTA.md.

Identify:
- One-off colors, radii, shadows, spacing and type sizes
- Inconsistent card anatomy
- Duplicate controls
- Weak hierarchy
- Uncontrolled transparency or image contrast
- Incomplete states
- Misaligned RTL/LTR behavior

Recommend the smallest shared-system changes that resolve the issues.
```

## H. Release-candidate prompt

```text
Treat the current branch as a release candidate. Do not add features.

Run or verify:
- pnpm check
- pnpm test:e2e
- pnpm build:pages
- pnpm audit:prod
- release evidence in docs/agent/RELEASE_EVIDENCE.md

Review PWA install/update, offline core flow, persistence, sync failure behavior, prayer-time behavior, responsive layouts, accessibility and privacy. Report blockers and do not claim readiness while required evidence is missing.
```
