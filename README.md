# Azkarapp

Azkarapp is an Arabic/English, offline-capable Progressive Web App for reading daily azkar, tracking quiet routine progress, and showing location-aware prayer times. The application is built with React, TypeScript, Vite, Tailwind CSS, and optional Supabase account synchronization.

Production site: [amahdy59.github.io/Azkarapp](https://amahdy59.github.io/Azkarapp/)

## Product capabilities

- Reviewed azkar collections with Arabic-first reading and optional English translation/transliteration
- Time-aware Home recommendations, next-prayer countdown, and Hijri date
- Online Aladhan prayer timings with daily caching and an astronomical offline fallback
- Automatic geolocation, coordinate-derived IANA timezone detection, DST handling, calculation methods, and manual minute adjustments
- Local progress, saved zikr, sessions, reminders, accessibility preferences, and theme persistence
- Optional Supabase phone OTP authentication and cross-device synchronization
- Installable PWA, offline app shell, update prompts, and quick actions
- Responsive RTL/LTR layouts with WCAG-oriented automated checks

## Prayer times and daylight saving

Prayer times resolve in this order:

1. Use a valid daily Aladhan response cached for the selected date, coordinates, and calculation method.
2. Fetch Aladhan timings when online. Its coordinate-derived IANA timezone metadata is saved with the location.
3. Calculate times locally when the API is unavailable.
4. Apply the saved IANA timezone rules for the requested date, including DST transitions.
5. Apply the user's optional per-prayer minute adjustments.

Settings displays the selected timezone, current UTC offset, and whether daylight saving or standard time is active. Automatic location detection prefers Aladhan's timezone for the detected coordinates and falls back to the browser/device timezone when offline.

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

- Node.js 20 or newer
- pnpm 9 or newer (`packageManager` is pinned to `pnpm@9.15.0`)
- Chromium for Playwright browser tests

## Local setup

```bash
pnpm install
pnpm dev
```

Vite prints the local development URL. To exercise browser tests on a new machine, install Chromium once:

```bash
pnpm exec playwright install --with-deps chromium
```

### Environment variables

Copy `.env.example` to `.env` only when Supabase or hosted legal pages are required:

```bash
cp .env.example .env
```

| Variable                 | Required | Purpose                       |
| ------------------------ | -------- | ----------------------------- |
| `VITE_SUPABASE_URL`      | No       | Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | No       | Public Supabase anonymous key |
| `VITE_TERMS_URL`         | No       | Hosted terms URL              |
| `VITE_PRIVACY_URL`       | No       | Hosted privacy URL            |

Never commit `.env` or service-role credentials. The app remains usable as a local guest when Supabase variables are absent.

## Commands

| Command            | Purpose                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `pnpm dev`         | Start the Vite development server                                                         |
| `pnpm build`       | Create the production build in `dist/`                                                    |
| `pnpm build:pages` | Build with the GitHub Pages base path                                                     |
| `pnpm preview`     | Preview the production build locally                                                      |
| `pnpm check`       | Run formatting check, ESLint, TypeScript, unit tests, production build, and bundle budget |
| `pnpm test:run`    | Run all unit tests once                                                                   |
| `pnpm test:e2e`    | Run Playwright tests across desktop, mobile, and tablet Chromium                          |
| `pnpm lint`        | Run ESLint with zero warnings allowed                                                     |
| `pnpm typecheck`   | Run strict TypeScript checking                                                            |
| `pnpm format`      | Format the repository with Prettier                                                       |
| `pnpm audit:prod`  | Audit production dependencies                                                             |

Run `pnpm check` and `pnpm test:e2e` before merging or releasing.

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
├─ assets/              Static artwork and media
├─ lib/                 External service boundaries such as Supabase
└─ styles/              Theme tokens, fonts, Tailwind, and global behavior

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

### Supabase setup

1. Create `.env` from `.env.example`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply [`supabase/schema.sql`](supabase/schema.sql) to a new project.
4. Apply files in `supabase/migrations/` in filename order for an existing project.
5. Configure the desired phone OTP provider and redirect settings in Supabase.

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

Prayer-domain unit coverage includes Aladhan parsing, coordinate timezone metadata, Cairo standard/DST offsets, offline calculation, manual adjustments, and cache fallback.

The authoritative release checklist is [docs/QUALITY_CHECKLIST.md](docs/QUALITY_CHECKLIST.md).

## Deployment

Pushes to `main` trigger:

1. `.github/workflows/quality.yml` — installs dependencies, runs `pnpm check`, and executes Playwright.
2. `.github/workflows/deploy-pages.yml` — verifies the build, creates the GitHub Pages artifact, and deploys it.

Repository settings must use **GitHub Actions** as the Pages source. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets if account features are required in production.

## Maintenance workflow

1. Fetch `origin/main` and confirm the working tree scope.
2. Make the smallest domain-appropriate change.
3. Add or update colocated unit tests and relevant Playwright coverage.
4. Update documentation when behavior, state shape, environment variables, or operational procedures change.
5. Run `pnpm check` and the relevant Playwright specs.
6. Commit and push only after all required checks pass.
7. Confirm the GitHub Quality and Pages workflows complete successfully.

Documentation sources of truth:

- [Application architecture](docs/ARCHITECTURE.md)
- [Prayer times, timezone, and DST](docs/PRAYER_TIMES.md)
- [Design and interaction system](docs/DESIGN_SYSTEM.md)
- [Engineering and release checklist](docs/QUALITY_CHECKLIST.md)
- [Design-spec implementation coverage](docs/DESIGN_SPEC_COVERAGE.md)

## Known constraints

- Reliable reminders while the PWA is completely closed require a backend push-scheduling service; current reminders are foreground/browser-capability dependent.
- Prayer times are calculated values and may differ by local authority. Users can select an authority method and apply manual minute adjustments.
- Browser geolocation requires HTTPS (or localhost) and explicit user permission.
- A device with a manually incorrect timezone can affect the offline fallback. Online automatic detection corrects this with Aladhan's coordinate-derived timezone; Settings shows the effective timezone and UTC offset for review.
