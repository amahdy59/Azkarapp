# Azkarapp

Vite + React prototype for the Azkar app UI, now cleaned up for local persistence and Supabase integration.

## Quality commands

- `pnpm check` runs formatting, linting, strict type checking, unit tests, production build, and bundle budgets.
- `pnpm test:e2e` runs WCAG A/AA and keyboard smoke tests in desktop and mobile Chromium.
- Pull requests and pushes to `main` run both suites in GitHub Actions.

## Run locally

1. Install dependencies with `pnpm install`
2. Start the app with `pnpm dev`
3. Create a production build with `pnpm build`
4. Preview the production build locally with `pnpm preview`

## Supabase setup

1. Copy `.env.example` to `.env`
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Apply [supabase/schema.sql](/C:/Users/AhmedMahdy/OneDrive%20-%20Advansys%20IS/Documents/Antigravity/Azkarapp/supabase/schema.sql) in your Supabase project

## GitHub Pages

1. Push the repo to `main`
2. In GitHub, open `Settings -> Pages`
3. Set `Source` to `GitHub Actions`
4. Add repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. The workflow in [.github/workflows/deploy-pages.yml](/C:/Users/AhmedMahdy/OneDrive%20-%20Advansys%20IS/Documents/Antigravity/Azkarapp/.github/workflows/deploy-pages.yml) will deploy the app to `https://amahdy59.github.io/Azkarapp/`

## Current state

- User language, theme, guest/auth hints, progress, and sessions persist locally
- Supabase client scaffolding is available in [src/lib/supabase.ts](/C:/Users/AhmedMahdy/OneDrive%20-%20Advansys%20IS/Documents/Antigravity/Azkarapp/src/lib/supabase.ts)
- Phone OTP auth is wired for Supabase using `signInWithOtp`, `verifyOtp`, and `resend`
- Signed-in users sync profile, settings, progress, and session history to Supabase
- The app builds successfully with `vite build`

## Architecture

- `src/app/screens`: screen-level presentation and interaction
- `src/app/components`: reusable app components; `components/ui` contains vendored primitives
- `src/app/content`: static azkar and category data
- `src/app/i18n`: translations
- `src/app/state.ts`: validated local state persistence and merging
- `src/lib`: external service boundaries such as Supabase authentication
- `src/styles`: design tokens, global behavior, fonts, and Tailwind integration
- `e2e` and colocated `*.test.ts(x)`: browser and unit tests

UI code must not access Supabase directly. Shared formatting, persistence, data access, and validation belong outside screen JSX. See [docs/QUALITY_CHECKLIST.md](docs/QUALITY_CHECKLIST.md) for the review standard and manual release gates.

## Known product follow-up

- Replace placeholder social auth and sharing actions with real implementations.
- Continue extracting orchestration from `App.tsx` and focused subcomponents from `ReaderScreen.tsx` as those flows change.
