# Automated Release Baseline

## Repository Baseline commands

Executed the following commands on a clean checkout of `main` (branch `release-hardening/01-baseline`):

### 1. `pnpm install --frozen-lockfile`

- **Command**: `npx pnpm install --frozen-lockfile`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~6s

### 2. `pnpm format:check`

- **Command**: `npx pnpm format:check`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~2s
- **Output**: "All matched files use Prettier code style!"

### 3. `pnpm lint`

- **Command**: `npx pnpm lint`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~3s
- **Output**: No warnings or errors.

### 4. `pnpm typecheck`

- **Command**: `npx pnpm typecheck`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~4s

### 5. `pnpm test` (Unit tests)

- **Command**: `npx pnpm test:run`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~46s total execution
- **Important warnings**:
  - `Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?` (Relating to `SlotClone` inside `DrawerOverlay` / `DialogPortal`).
  - `Warning: Missing Description or aria-describedby={undefined} for {DialogContent}.`

### 6. `pnpm test:coverage`

- **Command**: `npx pnpm test:coverage`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~30s
- **Coverage values**:
  - Statements: 60.26%
  - Branches: 50.00%
  - Functions: 55.90%
  - Lines: 61.85%

### 7. `pnpm build`

- **Command**: `npx pnpm build`
- **Result**: Passed
- **Exit code**: 0
- **Duration**: ~21s
- **Bundle output sizes**:
  - Index JS chunk size: 345.98 kB (gzip: 96.15 kB)
  - Other chunks: Varying, mostly under 100kB.
  - CSS chunk size: 93.62 kB (gzip: 17.70 kB)

### 8. `pnpm budget`

- **Command**: `npx pnpm budget`
- **Result**: Passed
- **Exit code**: 0

### 9. `pnpm test:e2e`

- **Command**: `npx playwright install chromium --with-deps; npx pnpm test:e2e`
- **Result**: Passed
- **Exit code**: 0
- **Output**: 133 tests passed using 3 workers.

### 10. `pnpm audit:prod`

- **Command**: `npx pnpm audit:prod`
- **Result**: Passed
- **Exit code**: 0
- **Output**: `No known vulnerabilities found`
