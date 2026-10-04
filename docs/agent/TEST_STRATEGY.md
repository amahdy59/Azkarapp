# Test and Evidence Strategy

## Testing layers

### 1. Static checks

- Prettier
- ESLint including JSX accessibility rules
- TypeScript

### 2. Unit/component tests

Use Vitest and Testing Library for:

- State transitions
- Component semantics
- Keyboard behavior
- i18n rendering
- Progress calculations
- Persistence normalization
- Domain logic

### 3. Browser tests

Use Playwright for:

- Navigation and browser history
- Core reading flow
- Search
- Settings
- Responsive layout
- RTL/LTR
- PWA-related UI where testable
- axe scans
- Touch-target checks

### 4. Visual evidence

Capture at minimum:

#### Mobile

- 320×700
- 390×844

#### Tablet

- 768×1024
- 1024×768

#### Desktop

- 1280×800
- 1440×900

For major screen phases, capture:

- Arabic light
- Arabic dark/midnight
- English light
- English dark/midnight
- Large text
- Empty state
- In-progress state
- Complete state

### 5. Manual accessibility

- Keyboard only
- 200% text zoom
- Browser/OS high contrast or forced colors where available
- Reduced motion
- Screen reader on desktop
- Screen reader on mobile
- Text over images
- Logical reading and focus order

### 6. Performance

Record:

- Production build size and budget result
- Cold-load observation on representative mobile hardware or throttling
- Main interaction responsiveness
- Large-list behavior
- Image and font loading
- React Profiler evidence for suspected render problems

Do not optimize based only on intuition. Measure before and after.

## Baseline artifact location

Store generated reports under a non-production evidence location such as:

```text
docs/agent/evidence/<phase>/<date>/
```

Avoid committing very large binary evidence unless repository policy allows it. Link to CI artifacts or issue attachments when better.

## Commands

During implementation:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
```

Before phase completion:

```bash
pnpm check
pnpm test:e2e:fast
```

Also run browser specs for the affected feature. Use full local `pnpm test:e2e` for broad changes, browser infrastructure, uncertain scope or CI diagnosis. Full quality/browser/Pages/audit verification remains mandatory in CI for every application release. The push hook reuses only a recent identical-snapshot quality pass; CI always runs fresh. Pages deploys after successful Quality for the exact current-main commit, avoiding duplicate CI suites.

Before release:

```bash
pnpm build:pages
pnpm audit:prod
```

## Failure policy

- Report the exact failing command and relevant output.
- Determine whether the failure is introduced by the phase or pre-existing.
- Do not delete or weaken a test to make a failure disappear.
- Do not claim completion while required gates fail.

## Essential local testing

- Documentation changes: check affected-file formatting and links.
- Small behavior changes: select relevant unit files and browser specs. Prefer unit tests for calculation, normalization and state edge cases; use browsers for integration and user flows.
- Layout/accessibility changes: exercise affected widths, Arabic/English, keyboard and relevant axe assertions. Preserve distinct engine and responsive assertions.
- Persistence/offline/prayer/sync changes: include failure, recovery and boundary cases plus the affected end-to-end flow.
- Shared shell, global styling, browser infrastructure or uncertain scope: run the full local browser suite once.
- Do not run every individual static command before `pnpm check`: it already includes them. Let the pre-push hook reuse the successful unchanged quality snapshot.
- Do not add tests that only repeat implementation details. Keep each regression's failure reason clear. Remove duplicated scenarios only when their unique assertions remain covered elsewhere.

The fast gate includes settings/navigation/legal flows and the existing first-offline Reader/counting/Settings regression. Tooling suites use Node without React/jsdom setup; mock-sensitive application suites remain isolated. Browser tests use condition-based assertions instead of arbitrary readiness delays, and CI rejects focused `test.only` runs.

`pnpm test:timings` reads the latest `output/e2e-results.json`; `pnpm test:timings <report>` reads a saved comparison. Timings include every retry attempt, and report both flaky successes and failures. Keep reports separate with `E2E_REPORT_PATH`. Investigate slow tests and retries before changing worker counts, timeout values or matrix allocation. Never present a run under concurrent load as a controlled speed benchmark.

Tests do not kill preview-port listeners. An occupied port fails visibly. Use a separate checkout and an unused `E2E_PORT` for concurrent browser verification; the default remains 4173. The server and Playwright use the same validated port, and the server launches the existing Vite build/preview through Node without shell interpolation. An independently managed exact-candidate preview remains possible with `E2E_BASE_URL`; do not reuse a stale preview just to avoid a build.

Local browser runs fail on the first attempt by default; use an explicit retry only while investigating a flake. CI retains its existing retries, and the timing report includes all attempts. The isolated-suite guard covers static/dynamic mocks, unmocking, hoisted setup and module resets.

Hosted-audio validation checks every approved variant with four bounded workers rather than serial network calls. Shared URLs are probed once within each run; every alias still compares its own expected metadata, and nothing is cached across runs. Timeout, retry, HTTP/MIME and content-integrity requirements remain unchanged. Network probe tests use deterministic responses, including stalled requests, recovery and conflicting shared-URL metadata.

Quality CI preserves its browser timing JSON for seven days on success or failure, alongside the existing failure traces. Download that artifact to investigate a slow CI run with `pnpm test:timings <report>`.

Retained trace archives and error contexts must also upload when the job succeeds on retry; a flaky success still needs its failed-attempt evidence. Independent viewport/navigation tasks should have separate test cases instead of exhausting one cumulative deadline. Keep assertion and per-test timeout ceilings unchanged. Routine named visual captures may have one Chromium owner when other engines repeat the same files without image assertions; retain every engine's behavioral/axe checks and failure traces.

Windows WebKit uses one worker for that project: measured expanded-player sweeps improved with less rendering contention. The project keeps every engine assertion and its existing timeout; other platforms retain the global worker limit. This is a measured local allocation, not a guarantee about total suite duration.

The real service-worker update fixture launches Vite through Node, owns a process-specific build directory and binds its server to an operating-system-assigned port. Cleanup checks that directory ownership before removal, so concurrent sessions do not share fixture builds or fixed-port listeners.

Local pnpm check includes network-independent audio metadata validation. Complete hosted probes remain mandatory in Quality CI through pnpm validate:audio; run that command locally for audio hosting/catalog changes. The local CLI regression blocks every fetch and validates the real catalog, proving the boundary without mocking away catalog integrity.

After restoring progress, semantic state can arrive before rendered geometry settles. Assert the restored ratio and poll the existing geometric requirement, reading compared rectangles in one browser evaluation. Use the standard assertion timeout and retain the original precision; a permanently incorrect fill must still fail.
