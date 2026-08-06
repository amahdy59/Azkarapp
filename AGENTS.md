# AGENTS.md — Azkarapp Agent Constitution

This file defines mandatory behavior for any AI coding agent working in this repository.

## 1. Mission

Improve Azkarapp into a calm, Arabic-first, accessible, reliable, responsive, and maintainable devotional application without breaking its offline-first reading experience, user progress, prayer-time behavior, localization, persistence, optional synchronization, or deployment pipeline.

## 2. Read before acting

Before proposing or changing code, read:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/QUALITY_CHECKLIST.md`
5. `docs/CONTENT_AUTHORING.md`
6. `docs/agent/INDEX.md`
7. The active file in `docs/agent/phases/`

When the task affects prayer times, audio, motion, Supabase, content, or design coverage, also read the relevant existing domain document.

## 3. Authority order

Use this priority when requirements conflict:

1. User-approved decision recorded in `docs/agent/DECISION_LOG.md`
2. The active approved phase brief
3. Existing repository domain contracts
4. `docs/agent/` guidance
5. Existing implementation
6. Old screenshots or inferred behavior

Do not silently override an existing contract. Report conflicts before implementation.

## 4. Mandatory operating pattern

For every phase:

1. Inspect the current implementation.
2. Identify affected files and existing reusable components.
3. Produce a plan before editing.
4. Wait for approval when the user has requested a planning gate.
5. Make the smallest coherent change.
6. Add or update tests in the same change.
7. Run relevant targeted tests.
8. Run the repository quality gates required by the phase.
9. Produce screenshots or other evidence where required.
10. Update documentation when behavior or contracts change.
11. Return a structured phase report.

Never implement multiple roadmap phases in one uncontrolled change.

## 5. Repository-specific constraints

- Use Node 20+ and pnpm 9+.
- Use existing scripts from `package.json`; do not replace the toolchain without explicit approval.
- Preserve the current React + TypeScript + Vite + Tailwind architecture.
- Screens compose behavior; reusable presentation belongs in `src/app/components`.
- Do not call Supabase, `localStorage`, or raw network services from reusable visual components.
- Persisted or remote state must pass through the existing normalization and merge boundaries.
- Core reading, counting, saved state, progress, and settings must continue to work offline.
- Arabic and English direction comes from application state. Preserve semantic DOM and keyboard order.
- Add product copy through the i18n system.
- Use the existing icon export layer rather than importing a second icon library.
- Use semantic theme tokens and shared components before adding one-off styling.
- Do not add runtime dependencies unless the existing platform and repository utilities cannot solve the problem. Explain any approved dependency.

## 6. Accessibility baseline

Target WCAG 2.2 AA across default themes and core flows.

Mandatory rules:

- Use native HTML semantics first.
- All actions must work with keyboard and pointer.
- Provide a visible focus indicator.
- Use appropriate button, link, radio, switch, tab, dialog, progress, and status semantics.
- Do not communicate information through color alone.
- Maintain at least 44×44 CSS px for ordinary product targets unless a documented inline-text exception applies.
- Support text resizing, narrow screens, RTL/LTR, reduced motion, reduced transparency where implemented, and safe-area insets.
- Dynamic loading, errors, saves, downloads, and progress changes must be announced appropriately without making entire screens live regions.
- Automated accessibility scans are necessary but not sufficient. Preserve manual keyboard and assistive-technology checks in the release evidence.

Do not claim complete accessibility compliance from automated tests alone.

## 7. UX and visual-design principles

- Give each screen one dominant next action.
- Preserve user control and clear recovery from mistakes.
- Prefer recognition over recall; show current state and continuation points.
- Reduce duplicated actions and ambiguous chevrons/buttons.
- Use decorative photography only where contrast is controlled.
- Functional content should use stable surfaces.
- Keep sacred or devotional text visually primary and free from excessive gamification.
- Progress feedback should be encouraging, not punitive.
- Use progressive disclosure for complex settings and secondary detail.
- Maintain consistent component anatomy, spacing, radius, type, iconography, and states.

## 8. Source and content integrity

Do not edit reviewed azkar, Qur'anic text, benefits, references, translations, transliterations, repetition counts, or attribution as a visual-design shortcut. Content changes require the repository's content-review process and relevant documentation updates.

## 9. Testing requirements

At minimum, use the relevant subset of:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm test:e2e
pnpm check
pnpm build:pages
pnpm audit:prod
```

The normal merge gate is:

```bash
pnpm check
pnpm test:e2e
```

Do not hide failures, weaken assertions, reduce coverage thresholds, skip tests, or increase bundle budgets merely to obtain a passing result.

## 10. Diff discipline

- Do not format unrelated files.
- Do not refactor unrelated modules.
- Do not change content, architecture, and visual design simultaneously unless the approved phase requires all three.
- Preserve public behavior not named in the active phase.
- Keep commits reviewable and phase-scoped.
- Prefer several coherent commits over one opaque rewrite.

## 11. Required phase report

At the end of a phase, report:

- Objective completed
- Files changed
- Components added or modified
- User-visible behavior changed
- Accessibility work completed
- Tests added or updated
- Commands run and exact results
- Screenshots/evidence produced
- Remaining risks or known limitations
- Documentation updated
- Recommended next phase

Use `docs/agent/templates/PHASE_REPORT.md` as the format.

## 12. Stop conditions

Stop and ask for a decision when:

- The active phase conflicts with an existing documented contract.
- The requested change could corrupt persisted or synchronized user data.
- A design change requires content or religious-source interpretation.
- A major dependency, router, state-management system, or design-system replacement is proposed.
- The correct responsive-shell target is unclear.
- Tests expose a pre-existing failure that makes the phase result ambiguous.
- The agent cannot verify a destructive change safely.

## Autonomous main-branch release authority

The user explicitly authorizes the coding agent to diagnose, repair, commit, and push changes directly to `main` when working on this repository.

The agent is responsible for completing the full release cycle:

1. Inspect the current repository and deployment state.
2. Implement the requested application changes.
3. Run all required local quality gates.
4. Diagnose and repair any local, GitHub Actions, or GitHub Pages configuration problem.
5. Commit the verified changes.
6. Push the verified commit to `origin/main`.
7. Monitor all workflows triggered by the push.
8. Inspect logs for every failed job.
9. Apply the smallest correct remediation.
10. Commit and push remediation changes when required.
11. Continue until:
    - `Quality / verify` succeeds.
    - `Deploy GitHub Pages / build` succeeds.
    - `Deploy GitHub Pages / deploy` succeeds.
    - The production application responds successfully.
    - A production smoke test confirms that the expected application is live.

### Allowed operations

The agent may:

- Run `git fetch`, `git pull --ff-only`, `git add`, `git commit`, and `git push`.
- Push directly to `origin/main`.
- Use authenticated GitHub CLI and GitHub API operations.
- Inspect workflow runs, jobs, artifacts, deployments, environments, branch policies, repository variables, secrets metadata, and Pages settings.
- Cancel stale or superseded workflow runs.
- Rerun failed jobs or workflows.
- Modify `.github/workflows/` when necessary.
- Modify GitHub Pages and `github-pages` environment configuration when necessary.
- Remove obsolete Pages deployment branch policies.
- Normalize Pages to use GitHub Actions and `main`.
- Increase deployment timeouts when evidence supports doing so.
- Add post-deployment health checks.
- Commit and push deployment remediation changes.

### Mandatory safety constraints

The agent must not:

- Use `git push --force` or `--force-with-lease`.
- Use `git reset --hard` against shared history.
- Bypass hooks with `--no-verify`.
- Delete or rewrite unrelated commits.
- Disable tests or reduce coverage merely to obtain a green result.
- weaken accessibility, security, bundle, type-safety, or content-integrity checks.
- Expose secrets in logs, commits, reports, or workflow output.
- Delete the GitHub Pages site except as a documented last resort and only after preserving its current configuration.
- Change reviewed religious content as part of deployment remediation.
- repeatedly push arbitrary changes merely to trigger a deployment.

### Required local gate before every push

Before pushing to `main`, the agent must run:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:e2e
pnpm build:pages
