# AI Improvement System Index

## Purpose

This folder converts the Azkarapp UX and visual-design review into a controlled, testable delivery program.

## Reading order

1. `BASELINE_AND_GOVERNANCE.md`
2. `PRODUCT_UX_PRINCIPLES.md`
3. `SCREEN_RECOMMENDATIONS.md`
4. `ACCESSIBILITY_REQUIREMENTS.md`
5. `IA_AND_CONTENT_MODEL.md`
6. `DESIGN_SYSTEM_DELTA.md`
7. `COMPONENT_ARCHITECTURE.md`
8. `ROADMAP.md`
9. `DEFINITION_OF_DONE.md`
10. `TEST_STRATEGY.md`
11. `AGENT_WORKFLOW.md`
12. `PROMPT_LIBRARY.md`
13. `DECISION_LOG.md`
14. `RELEASE_EVIDENCE.md`

## Existing repository sources of truth

These files already exist and must not be ignored:

- `README.md` — product, setup, commands, architecture overview, deployment
- `docs/ARCHITECTURE.md` — runtime boundaries, state ownership, navigation, sync, offline behavior
- `docs/DESIGN_SYSTEM.md` — current implemented visual and interaction contracts
- `docs/QUALITY_CHECKLIST.md` — automated and manual release gates
- `docs/CONTENT_AUTHORING.md` — reviewed content rules
- `docs/MOTION_SYSTEM.md` — motion requirements where applicable
- `docs/PRAYER_TIMES.md` — location, timezone, DST, calculation and caching behavior

`docs/agent/` does not automatically replace those files. It defines the improvement program and the proposed target state. Approved implementation phases must update the existing authoritative files when a contract changes.

## Phase files

Run the phase files in numerical order unless the decision log explicitly records a justified change.

| Phase | File                                           | Result                                                                |
| ----- | ---------------------------------------------- | --------------------------------------------------------------------- |
| 00    | `phases/PHASE_00_REPOSITORY_AUDIT.md`          | Verified current-state map and conflict register                      |
| 01    | `phases/PHASE_01_BASELINE_CAPTURE.md`          | Reproducible visual, accessibility, performance and behavior baseline |
| 02    | `phases/PHASE_02_DESIGN_FOUNDATIONS.md`        | Approved tokens and global interaction foundations                    |
| 03    | `phases/PHASE_03_SHARED_COMPONENTS.md`         | Reusable component primitives and states                              |
| 04    | `phases/PHASE_04_SHELL_NAVIGATION.md`          | Responsive application shell and navigation                           |
| 05    | `phases/PHASE_05_HOME.md`                      | Focused time-aware home page                                          |
| 06    | `phases/PHASE_06_LIBRARY.md`                   | Scannable, searchable azkar library                                   |
| 07    | `phases/PHASE_07_READER.md`                    | Accessible and calm core reading session                              |
| 08    | `phases/PHASE_08_PROGRESS.md`                  | Useful, non-punitive progress experience                              |
| 09    | `phases/PHASE_09_SETTINGS.md`                  | Clear settings IA and controls                                        |
| 10    | `phases/PHASE_10_SYSTEM_STATES.md`             | Loading, empty, error, offline, update and sync states                |
| 11    | `phases/PHASE_11_RESPONSIVE_I18N.md`           | Full viewport, language and direction validation                      |
| 12    | `phases/PHASE_12_ACCESSIBILITY_REMEDIATION.md` | WCAG-focused remediation and manual evidence                          |
| 13    | `phases/PHASE_13_RELEASE_HARDENING.md`         | Performance, security, PWA and release readiness                      |

## Core rule

The agent must never interpret “perfect the application” as permission to rewrite the entire repository. Perfection is approached through evidence-backed iteration, not one-shot replacement.
