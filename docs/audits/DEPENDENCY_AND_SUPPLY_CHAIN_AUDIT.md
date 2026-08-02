# Dependency and Supply-Chain Audit

## 1. Vulnerability Audit

- **Command**: `pnpm audit --prod`
- **Result**: No known vulnerabilities found.
- **Status**: Clean.

## 2. Outdated Dependencies (from `pnpm outdated`)

The following dependencies are outdated:

### Major updates requiring migration / caution

- `react` and `react-dom` (Current: 18.3.1, Latest: 19.2.8) - Major React 19 update, holds potential for breaking changes.
- `@types/react` and `@types/react-dom`

### Safe patch / minor updates (Runtime)

- `@supabase/supabase-js` (Current: 2.56.0, Latest: 2.111.0)
- `@radix-ui/react-alert-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-scroll-area`, `@radix-ui/react-radio-group`, `@radix-ui/react-select`, `@radix-ui/react-slot`
- `motion` (Current: 12.23.24, Latest: 12.43.0)
- `tailwind-merge` (Current: 3.2.0, Latest: 3.6.0)
- `tw-animate-css` (Current: 1.3.8, Latest: 1.4.0)

### Build-tool only (Safe to upgrade if tests pass)

- `eslint` (Current: 10.6.0, Latest: 10.8.0)
- `typescript-eslint` (Current: 8.62.1, Latest: 8.65.0)
- `prettier` (Current: 3.9.4, Latest: 3.9.6)
- `typescript` (Current: 5.9.3, Latest: 7.0.2)
- `vite` and `@vitejs/plugin-react`
- `tailwindcss` and `@tailwindcss/vite`
- `@playwright/test` and `playwright`
- `vitest` and `@vitest/coverage-v8`
- `jsdom` and `@testing-library/jest-dom`

## 3. Duplicate Dependencies

- **Command**: `pnpm list --depth 0`
- **Result**: No severe duplication found at the root level. Resolution is clean.

## 4. Secret and Sensitive-File Review

- **`.gitignore`**: Present and correctly ignores `node_modules`, `dist`, `.env`, and IDE files.
- **`.env.example`**: Checked. Contains safe placeholder variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Keys**: No `service-role` keys or private Android keystores were found committed to the repository.
- **CI Workflows**: GitHub Actions uses Secrets management for deployments.

No critical secret exposure exists.
