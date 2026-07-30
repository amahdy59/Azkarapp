# Supabase account integration

The code-side integration is dormant until a provider flag is enabled. Guest mode remains the default and continues to work offline.

## Project

- Project reference: `vanjwanmnusgnavzzzpz`
- Expected URL: `https://vanjwanmnusgnavzzzpz.supabase.co`
- Production app: `https://amahdy59.github.io/Azkarapp/`
- Production callback: `https://amahdy59.github.io/Azkarapp/?view=auth-callback`
- Local callback: `http://localhost:5173/?view=auth-callback`

Never place a secret key or service-role key in a `VITE_` variable. Browser code accepts only a publishable key or the legacy anon key.

## Apply and verify

After opening a fresh Codex task so the authenticated Supabase MCP tools are loaded:

1. Confirm `get_project_url` returns the expected URL.
2. Inspect tables, migrations, functions, Auth logs, and security/performance advisors.
3. Apply `supabase/migrations/20260730170636_provider_neutral_auth_and_sync.sql`.
4. Generate `public` TypeScript types with the MCP development tool.
5. Deploy `supabase/functions/delete-account`.
6. Run RLS isolation checks as anonymous, User A, and User B.

The repository deliberately does not contain database passwords, service-role keys, provider secrets, or SMTP credentials.

## Dashboard settings that require external credentials

Set the Site URL to the production app URL and add both callback URLs to the redirect allowlist.

Google:

- Create a Web OAuth client in Google Cloud.
- Add the production and local origins.
- Add the Supabase callback shown on the Google provider page.
- Enter the client ID and secret in Supabase, then set `VITE_GOOGLE_AUTH_ENABLED=true`.

Email OTP:

- Change the email template to include `{{ .Token }}` for a six-digit code.
- Configure custom SMTP before public release.
- Set `VITE_EMAIL_AUTH_ENABLED=true` only after delivery is verified.

Apple:

- Supply the Services ID, Team ID, Key ID, and signing key.
- Set a six-month secret-rotation reminder.
- Keep `VITE_APPLE_AUTH_ENABLED=false` until the provider is verified.

## GitHub Actions

Variables:

- `VITE_SUPABASE_URL`
- `VITE_GOOGLE_AUTH_ENABLED`
- `VITE_EMAIL_AUTH_ENABLED`
- `VITE_APPLE_AUTH_ENABLED`

Repository secret:

- `VITE_SUPABASE_PUBLISHABLE_KEY` (preferred), or legacy `VITE_SUPABASE_ANON_KEY`

Draft legal pages contain owner fields that must be approved before account providers are enabled.
