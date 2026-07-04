# Azkarapp

Vite + React prototype for the Azkar app UI, now cleaned up for local persistence and Supabase integration.

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

## Remaining follow-up

- Replace placeholder social auth and sharing actions with real implementations
- Consider splitting the large single-file prototype UI into smaller components and routes
