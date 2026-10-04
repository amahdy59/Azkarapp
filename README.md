# Azkarapp

Azkarapp is an Arabic/English, offline-capable Progressive Web App for reading daily azkar, tracking quiet routine progress, and showing location-aware prayer times. The application is built with React, TypeScript, Vite, Tailwind CSS, and optional Supabase account synchronization.

Production site: [amahdy59.github.io/Azkarapp](https://amahdy59.github.io/Azkarapp/)

## Product capabilities

- Reviewed azkar collections with Arabic-first reading and optional English translation/transliteration
- Preview and share individual azkar or collections as complete image cards, text or contextual links, with selectable artwork/formats, explicit card selection, long-surah Mushaf reminders and one-file ZIP saving
- Time-aware Home recommendations, next-prayer countdown, and Hijri date
- Private on-device astronomical prayer timings with selectable calculation methods and manual minute adjustments
- Automatic geolocation, device IANA timezone detection, and DST handling without sending coordinates to a third party
- Local progress, saved zikr, sessions, configurable prayer/routine reminders, accessibility preferences, and theme persistence
- Optional Supabase Google, email OTP, and feature-flagged Apple authentication with cross-device synchronization
- Installable PWA, offline app shell, update prompts, and quick actions
- Responsive RTL/LTR layouts with WCAG-oriented automated checks

## Prayer times and daylight saving

Prayer times are calculated synchronously on the device from the selected coordinates, calculation method, and the saved IANA timezone. Date-specific timezone rules apply DST automatically, and the user's optional per-prayer minute adjustments are applied last. No coordinate or prayer-time network request is required.

Settings displays the selected timezone, current UTC offset, and whether daylight saving or standard time is active. Users can opt into a reminder 10 or 15 minutes before each calculated prayer. Reminder scheduling uses the next exact due time while the installed app remains open or backgrounded rather than repeatedly polling.

See [docs/PRAYER_TIMES.md](docs/PRAYER_TIMES.md) for formulas, caching, DST detection, failure behavior, and verification procedures.

## Technology

| Area          | Implementation                               |
| ------------- | -------------------------------------------- |
| Application   | React 18, TypeScript, Vite                   |
| Styling       | Tailwind CSS 4, semantic CSS theme tokens    |
| Motion        | Motion for React with reduced-motion support |
| Persistence   | Validated `localStorage` snapshot            |
| Remote sync   | Optional Supabase Auth and database          |
| PWA           | `vite-plugin-pwa` and Workbox                |
| Unit tests    | Vitest and Testing Library                   |
| Browser tests | Playwright and axe-core                      |
| Hosting       | GitHub Pages through GitHub Actions          |

## Prerequisites

- Node.js 24.x (`.nvmrc` pins the exact CI patch release)
- pnpm 11.19.0 (`packageManager` and CI use this exact release)
- Chromium for Playwright browser tests

## Local setup

```bash
pnpm run verify:toolchain
pnpm install --frozen-lockfile
pnpm dev
```

Use `nvm use` before setup when Node does not match `.nvmrc`. Install pnpm 11.19.0 through your normal package-manager or version-manager bootstrap if `pnpm run verify:toolchain` reports a mismatch. Do not regenerate the lockfile with another pnpm release.

The frozen install activates the tracked pre-push hook. It verifies the toolchain and dependency graph, reuses an unchanged local quality pass or runs `pnpm check`, then runs core browser smoke tests and the Pages build before Git can push. The full browser suite runs in CI before deployment.

Vite prints the local development URL. To exercise browser tests on a new machine, install the repository-pinned browser engines once:

```bash
pnpm setup:browsers
```

Local and CI tests both use Playwright's pinned Chromium, Firefox, and WebKit revisions; they do not depend on a separately installed system Chrome.

### Environment variables

Copy `.env.example` to `.env` only when Supabase or hosted legal pages are required:

```bash
cp .env.example .env
```

| Variable                        | Required    | Purpose                                                        |
| ------------------------------- | ----------- | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | No          | Supabase project URL                                           |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No          | Preferred public browser key                                   |
| `VITE_SUPABASE_ANON_KEY`        | No          | Legacy public key fallback                                     |
| `VITE_APP_URL`                  | No          | Canonical app URL used to construct the OAuth callback         |
| `VITE_TERMS_URL`                | No          | Hosted terms URL                                               |
| `VITE_PRIVACY_URL`              | No          | Hosted privacy URL                                             |
| `VITE_GOOGLE_AUTH_ENABLED`      | No          | Shows Google only when set to `true`                           |
| `VITE_EMAIL_AUTH_ENABLED`       | No          | Shows six-digit email OTP only when set to `true`              |
| `VITE_APPLE_AUTH_ENABLED`       | No          | Shows Apple only when set to `true`                            |
| `VITE_TELEMETRY_ENDPOINT`       | No          | Privacy-safe error and Web Vitals collector                    |
| `VITE_AUDIO_BASE_URL`           | Conditional | Public audio origin; required when approved audio assets exist |

Never commit `.env` or service-role credentials. The app remains usable as a local guest when Supabase variables are absent.

## Commands

| Command                        | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `pnpm dev`                     | Start the Vite development server                                                         |
| `pnpm build`                   | Create the production build in `dist/`                                                    |
| `pnpm build:pages`             | Build with the GitHub Pages base path and enforce the bundle budget                       |
| `pnpm preview`                 | Preview the production build locally                                                      |
| `pnpm setup:browsers`          | Install the pinned Chromium, Firefox, and WebKit test engines                             |
| `pnpm check`                   | Run formatting check, ESLint, TypeScript, unit tests, production build, and bundle budget |
| `pnpm test:run`                | Run all unit tests once                                                                   |
| `pnpm test:e2e`                | Run Playwright tests across desktop Chromium, Firefox, WebKit, mobile, and tablet         |
| `pnpm lint`                    | Run ESLint with zero warnings allowed                                                     |
| `pnpm typecheck`               | Run strict TypeScript checking                                                            |
| `pnpm format`                  | Format the repository with Prettier                                                       |
| `pnpm audit:prod`              | Audit production dependencies                                                             |
| `pnpm validate:audio`          | Validate manifest, mappings, metadata, Qur'an ranges, and hosted audio                    |
| `pnpm report:audio -- --write` | Regenerate the approved/unmatched audio mapping report                                    |

Use relevant unit/browser specs while developing. Before pushing, the hook enforces frozen install, `pnpm check`, `pnpm test:e2e:fast` and `pnpm build:pages`. A quality pass is reusable for 24 hours only for identical input contents, installed dependencies, toolchain/platform and build environment. CI always runs full quality and browser verification. Run the full local browser suite for broad changes, browser infrastructure, uncertain scope or CI diagnosis.

For a small change, select its unit files with `pnpm test:run <file>` and its browser specs with `pnpm test:e2e <spec> --project=desktop-chromium`. The fast browser gate covers settings, navigation, legal pages, and offline reading/counting. It uses the normal bounded worker pool instead of forcing extra workers while other sessions are active. Tooling tests run in an isolated Node project; application tests retain their existing DOM and mock-isolation contracts.

Browser runs write `output/e2e-results.json`. Run `pnpm test:timings` to see slow tests, retries, failures and wall time; supply a report filename to inspect an earlier run. Set `E2E_REPORT_PATH` for separate reports when comparing runs. The report is diagnostic and never replaces the test command's exit status.

Browser tests build a fresh preview and fail if the selected port is occupied; they never terminate the process occupying it. The default is 4173. Set `E2E_PORT` to an unused port for a separate session (PowerShell: `$env:E2E_PORT = "4197"`; then run the usual browser command). Ports are validated before starting the server. Stop your own stale preview explicitly, or use `E2E_BASE_URL` only for an independently managed preview of the exact candidate. Concurrent full browser runs should use separate checkouts and ports because their build and trace directories are shared within a checkout.

## Architecture

```text
src/
├─ app/
│  ├─ components/       Shared product components and UI primitives
│  ├─ content/          Azkar data and prayer-time domain logic
│  ├─ hooks/            Focused interaction, reminder, auth, and sync orchestration
│  ├─ i18n/             Arabic and English translations
│  ├─ screens/          Screen-level composition and interaction
│  ├─ App.tsx           Application shell, navigation, and state composition
│  ├─ state.ts          State defaults, validation, persistence, and merge rules
│  └─ types.ts          Shared application/domain types
├─ lib/                 External service boundaries such as Supabase
└─ styles/              Theme tokens, offline typography, Tailwind, and global behavior

e2e/                    Playwright browser and accessibility coverage
supabase/               Database schema and ordered migrations
scripts/                Build and repository verification utilities
docs/                   Engineering and product contracts
```

The primary rules are:

- Screens render and coordinate interaction; they do not call Supabase directly.
- Remote and persistence boundaries stay outside presentation JSX.
- Persisted and remote snapshots pass through `normalizeAppState` before rendering.
- Static domain data belongs in `content`; reusable visual patterns belong in `components`.
- All product icons are re-exported through `src/app/components/icons.ts`.
- Arabic/English direction comes from application state; DOM/tab order remains semantic.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boot flow, state ownership, persistence, sync, navigation, offline behavior, and extension guidance.

## Data and persistence

Guest data is stored under the versioned `azkarapp.state.v1` local-storage key. `state.ts` repairs malformed or legacy values and always returns a complete render-safe snapshot.

Signed-in users can synchronize:

- Profile and settings
- Saved zikr IDs
- Session history
- Idempotent daily collection completions

Local state remains the immediate source for rendering. Remote failures must not remove local reading or progress functionality.
Precise location coordinates, navigation, audio state, notification permission, installation state, and temporary UI state
remain device-local.

### Supabase setup

1. Create `.env` from `.env.example`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or the legacy `VITE_SUPABASE_ANON_KEY`).
3. Run `supabase db push`; the ordered files in `supabase/migrations/` are the only deployment source of truth.
4. Treat [`supabase/schema.sql`](supabase/schema.sql) as a generated current-state snapshot for review, not a second setup path.
5. Configure the Supabase Site URL and redirect allowlist:
   - `https://amahdy59.github.io/Azkarapp/?view=auth-callback`
   - `http://localhost:5173/?view=auth-callback`
6. Configure Google, email, or Apple externally, then enable only its matching Vite feature flag.
7. Deploy `supabase/functions/delete-account` before enabling account deletion.

Google requires a Google Cloud OAuth client ID and secret. Apple requires an Apple Developer account, Services ID, Team ID, Key ID, and signing key; its web OAuth secret must be rotated every six months. Public email OTP requires custom SMTP. These credentials are intentionally never stored in this repository.

Row-level security and private ownership rules in the schema are part of the application contract; do not bypass them from client code.

## Testing and quality

`pnpm check` is the local and CI non-browser gate. GitHub's Quality workflow additionally runs the complete Playwright suite. Browser coverage includes:

- Onboarding and core navigation
- 320px overflow protection
- Arabic RTL ordering
- Desktop, phone, and tablet app-canvas behavior
- WCAG A/AA automated scans
- Keyboard focus and minimum touch targets
- Settings corruption recovery and persistence

Prayer-domain unit coverage includes calculation-method parsing, IANA timezone metadata, Cairo standard/DST offsets, local astronomical calculation, manual adjustments, and invalid-setting fallback.

The authoritative release checklist is [docs/QUALITY_CHECKLIST.md](docs/QUALITY_CHECKLIST.md).

## Deployment

Application pushes to `main` trigger the full `.github/workflows/quality.yml` gate. Its successful completion triggers `.github/workflows/deploy-pages.yml` for that exact current-main commit. Pages builds the artifact, deploys it and verifies production without running the same suite again. Manual deployment also requires successful Quality for the selected main commit. Documentation-only pushes do not redeploy; pull requests and manual Quality runs retain full verification.

Repository settings must use **GitHub Actions** as the Pages source. Add `VITE_SUPABASE_URL` as an Actions variable and a publishable key as `VITE_SUPABASE_PUBLISHABLE_KEY` (a secret is acceptable despite the key being public). Provider flags are Actions variables and should remain false until the corresponding provider is configured.

Pushes to `main` that touch `cloudflare/**` or `wrangler.jsonc` additionally trigger `.github/workflows/deploy-worker.yml`, which applies D1 migrations, deploys the `azkarapp-api` Worker, and verifies its health endpoint. That workflow skips until the repository has `CLOUDFLARE_API_TOKEN` (Workers and D1 edit permissions) and `CLOUDFLARE_ACCOUNT_ID` secrets; without them the Worker must be deployed manually with `wrangler d1 migrations apply azkarapp-production --remote` followed by `wrangler deploy`. The `VISITOR_SALT` value itself is set once outside version control with `wrangler secret put VISITOR_SALT`.

## Maintenance workflow

1. Fetch `origin/main` and confirm the working tree scope.
2. Make the smallest domain-appropriate change.
3. Rewrite `public/release-notes.json` so it covers only what changed since the last deployment: replace every entry with the 3–4 most important user-facing changes in simple Arabic and English, and bump `"release"`. Run `pnpm run check:release-notes` to list the commits still waiting to be announced; the same check runs first in the pre-push hook.
4. Add or update colocated unit tests and relevant Playwright coverage.
5. Update documentation when behavior, state shape, environment variables, or operational procedures change.
6. Run `pnpm run verify:toolchain`, `pnpm install --frozen-lockfile`, `pnpm check`, the relevant Playwright specs, and `pnpm build:pages`.
7. Commit and push only after all required checks pass.
8. Confirm the GitHub Quality and Pages workflows complete successfully.

### Dependency updates

- Keep the seven-day `minimumReleaseAge` quarantine in `pnpm-workspace.yaml`; do not bypass it to make an install green.
- Add dependencies with the pinned pnpm release and commit `package.json` and `pnpm-lock.yaml` together.
- If the newest release is quarantined, select an eligible reviewed release or wait for the quarantine to expire.
- Treat any quarantine exception as a separate, documented security decision rather than an ordinary dependency update.
- Pull requests and direct `main` pushes run the frozen install, quality suite, full browser suite, Pages build, and production dependency audit.

Documentation sources of truth:

- [Application architecture](docs/ARCHITECTURE.md)
- [Prayer times, timezone, and DST](docs/PRAYER_TIMES.md)
- [Design and interaction system](docs/DESIGN_SYSTEM.md)
- [Engineering and release checklist](docs/QUALITY_CHECKLIST.md)
- [Design-spec implementation coverage](docs/DESIGN_SPEC_COVERAGE.md)
- [Content authoring and review](docs/CONTENT_AUTHORING.md)
- [Adding and operating application audio](docs/audio/adding-your-own-audio.md)

## Known constraints

- Reliable reminders while the PWA is completely closed require a connected push-scheduling service; current reminders work while the app is open or backgrounded, subject to browser power-management behavior.
- Prayer times are calculated values and may differ by local authority. Users can select an authority method and apply manual minute adjustments.
- Browser geolocation requires HTTPS (or localhost) and explicit user permission.
- A device with an incorrect timezone can affect calculated times. Settings shows the effective IANA timezone and UTC offset and allows manual correction.

### Audio validation during development

Local pnpm check validates audio catalog metadata offline. Use pnpm validate:audio for audio-host/catalog changes and live recording verification; Quality CI requires this full live validation before every release. pnpm validate:audio:local performs the same structural checks without network probes.
