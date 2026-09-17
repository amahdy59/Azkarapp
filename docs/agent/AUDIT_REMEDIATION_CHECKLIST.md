# Audit remediation checklist

Derived from the codebase and product review of 2026-08-22, run against local HEAD `652a19d`
plus the uncommitted working tree, and against production `7476c2b`.

Every item below was verified by reading current source, running a gate, or measuring the live
deployment. Line references are accurate as of `652a19d`; re-check them if you pick this up after
further commits.

**How to use this file.** Work top to bottom — the order is deliberate, and section 2 is unsafe to
start before section 1 is finished. Tick an item only when its acceptance criteria pass and its
tests are committed in the same change, per `AGENTS.md` §4. Items marked **[needs you]** cannot be
completed by an agent without a decision or a piece of information only the owner has.

Next free decision number when this file was written: **DEC-087**.

---

## 0. Blocked on the owner — unblock these first

These gate a third of the list. Nothing else in section 1 or 2 can complete without them.

- [ ] **[needs you]** Decide and supply the three legal values: **app owner / controller name**,
      **support email address**, and **governing jurisdiction**.
- [ ] **[needs you]** Decide the Aladhan question: keep the network call and disclose it, or drop it
      and rely on the offline calculation only. See item 1.2 for the trade-off.
- [ ] **[needs you]** Decide the audio question: gate the reciter UI until recordings exist (item
      3.1), or commit to sourcing licensed recordings.

---

## 1. Live in production — fix first

### 1.1 Fill in the legal pages

Currently every visitor is served an unapproved draft with bracketed placeholders. This fails
GDPR Art. 13(1)(a)–(b) and would be rejected by app-store review.

- [ ] Replace `[APP OWNER]`, `[SUPPORT EMAIL]`, `[JURISDICTION]` in `public/privacy.html:56`
- [ ] Replace the same three in `public/terms.html:53`
- [ ] Replace `[SUPPORT EMAIL — OWNER APPROVAL REQUIRED]` in `public/account-deletion.html:31`
- [ ] Remove the "Draft requiring owner approval" banner from `public/privacy.html:31`
- [ ] Remove the same banner from `public/terms.html:31`
- [ ] Remove the in-app `legal.reviewNotice` banner from both i18n bundles and its render site
- [ ] Add a signed-out deletion route to `account-deletion.html` — a working support address is the
      minimum store policy accepts, since a user who cannot sign in currently has no route at all

**Acceptance:** no `[A-Z ]`-bracketed placeholder remains in `public/*.html` or `dist/*.html`; the
deletion page names a reachable contact; no draft banner renders in either language.

**Test:** extend an e2e spec to fetch all three pages and assert no bracketed placeholder and no
draft-banner string appears.

---

### 1.2 Resolve the undisclosed GPS egress

`prayerCalculation.ts:397` sends untruncated `latitude`/`longitude` (built at line 389) to
`https://api.aladhan.com` in a query string, on location grant and on uncached Home/Progress
mounts. Aladhan is named in `docs/ARCHITECTURE.md` and `docs/PRAYER_TIMES.md` and nowhere a user
can see. `public/privacy.html:38` currently reads as a promise that coordinates never leave the
device.

Pick **one** path.

**Path A — keep the call, disclose it properly**

- [ ] Name Aladhan as a third-party recipient in `public/privacy.html`
- [ ] Name it in the in-app legal panel (`legal.localBody` / `legal.permissionsBody`, both bundles)
- [ ] Add Aladhan to `ATTRIBUTIONS.md`
- [ ] Correct the "device-local" wording at `public/privacy.html:38` so it is not misleading
- [ ] Truncate coordinates to 2–3 decimals before the request — well inside prayer-time accuracy,
      and it removes street-level precision. The cache keys at `prayerCalculation.ts:74,78` already
      use `toFixed(3)`; match that.

**Path B — drop the network path**

- [ ] Remove `fetchAladhanPrayerTimes` and its call sites; rely on `calculateOfflinePrayerTimes`,
      which `81996a3` already hardened for the high-latitude case
- [ ] Remove the now-dead exports flagged in item 4.2

**Either path**

- [ ] Record the outcome as **DEC-087**. Offline-first is a constitutional rule in `AGENTS.md` §1
      and no existing decision covers this egress.
- [ ] Update `docs/PRAYER_TIMES.md` to match whichever path shipped

**Acceptance:** either no coordinate leaves the device, or every user-facing legal surface names the
recipient and the transmitted precision is reduced.

**Test:** if Path A, assert the outbound query string carries no more than 3 decimal places.

---

### 1.3 Add a Content-Security-Policy

GitHub Pages cannot set response headers, so a `<meta>` tag in `index.html` is the only mechanism.
This matters more once section 2 ships tokens into localStorage.

- [ ] Add `<meta http-equiv="Content-Security-Policy">` to `index.html`
- [ ] Start from: `default-src 'self'`; `connect-src 'self' https://*.supabase.co https://api.aladhan.com`;
      `img-src 'self' data:`; `font-src 'self'`; `object-src 'none'`; `base-uri 'self'`;
      `frame-ancestors 'none'`
- [ ] Add `style-src 'self' 'unsafe-inline'` — Tailwind 4 needs it unless styles are hashed
- [ ] Drop `https://api.aladhan.com` from `connect-src` if item 1.2 took Path B
- [ ] **Verify the PWA still works under the policy** before shipping: service-worker registration,
      Workbox precache, the `/data/mushaf/*.json` runtime route, and the release-notes fetch. A CSP
      that breaks the service worker is worse than no CSP.

**Acceptance:** `pnpm test:e2e` passes with the policy in place, including `offline-core.spec.ts`
and `pwa-update.spec.ts`; no CSP violation appears in the console during an e2e run.

---

## 2. Latent — complete before enabling sign-in

Supabase is env-flag gated and currently off in production (the deployed bundle carries no project
URL and no key), so none of these is a live defect. All four are in the path that runs the first
time `VITE_EMAIL_AUTH_ENABLED` flips to true.

**Do not flip the auth flags until every box in this section is ticked.**

### 2.1 Make "Erase local data" actually erase

`clearAllLocalData()` at `hooks/useSettingsHandlers.ts:19` removes downloaded audio and calls
`clearStoredAppData()`, nothing more. `OWNED_STORAGE_PREFIXES` at `state.ts:712` does not match the
`sb-<ref>-auth-token` key supabase-js writes, so the session survives the reload and
`useRemoteAccountSync` pulls everything straight back down.

- [ ] `await signOutSupabase()` inside `clearAllLocalData()` before `clearStoredAppData()`,
      guarded by `isSupabaseConfigured` and tolerant of failure so an offline user can still erase
- [ ] Add `sb-` to `OWNED_STORAGE_PREFIXES` as a belt-and-braces sweep for a revoked-but-unremoved token
- [ ] Add the unswept `azkar.audio-content-review.v1` key to the sweep
- [ ] Apply the same sign-out to `handleDeleteAccount` (`useSettingsHandlers.ts:84`), which
      currently leaves a live JWT and refresh token on a deleted account
- [ ] Update the DEC-049 entry: its claim that the sweep "cannot fall behind again" holds only for
      keys the app writes itself, and a dependency writing to the same origin defeats it

**Test:** seed an `sb-<ref>-auth-token` key in `state.test.ts` and assert it is gone after erase.
The existing 13-key assertion cannot catch this because it never seeds one.

---

### 2.2 Fix the saved-zikr upsert

`lib/auth.ts:530` uses `.upsert()` with default options, which makes PostgREST emit
`INSERT … ON CONFLICT DO UPDATE`. `supabase/schema.sql:178` grants only `select, insert, delete`,
and the policies define no UPDATE path. Either it fails immediately with `42501`, or it fails on a
real conflict — two devices saving the same zikr. Both throw inside `syncRemoteState` and stick the
Account panel on "Needs attention".

- [ ] Change to `.upsert(…, { ignoreDuplicates: true })` or a plain `.insert()`. The `additions`
      array is already diffed against the server, so merge semantics are never wanted.
- [ ] Do **not** add an UPDATE grant or policy — that widens the table's write surface for no benefit

**Test:** cover the duplicate-save path and assert no error is thrown.

---

### 2.3 Clear private local data on sign-out

`clearPrivateAppData` at `state.ts:897` resets the in-memory snapshot only and never touches
localStorage. Recent searches live at `azkarapp_recent_searches_<lang>` (`SearchScreen.tsx:18`),
and prayer caches at `azkarapp.prayer_times_cache.<date>.<lat>.<lon>` — key names that embed the
previous user's coordinates. On a shared device the next person sees the last person's queries,
which in this app skew health-adjacent.

- [ ] On sign-out, additionally clear the `azkarapp_recent_searches_` prefix
- [ ] Clear the `azkarapp.prayer_times_cache.` and `azkarapp.prayer_time_zone.` prefixes
- [ ] Use a narrow prefix sweep, **not** full `clearAllLocalData()` — device preferences and
      downloaded audio should survive a sign-out

**Test:** add the assertion to the existing sign-out coverage in `useAuthHandlers.test.ts`.

---

### 2.4 Make the migrations reproduce the security baseline

No file in `supabase/migrations/` creates `profiles`, `user_settings`, `user_progress`, or
`session_history`, nor enables RLS on them — those live only in `schema.sql:82–133`. A fresh
`supabase db push` following `docs/SUPABASE_SETUP.md` literally produces four tables with
Supabase's default `grant all to authenticated` and no row policies: a full cross-tenant read.

- [ ] Add an initial-schema migration holding the base tables, RLS enables, policies and grants
- [ ] Make `schema.sql` a generated artifact rather than a parallel source of truth
- [ ] At minimum, name `schema.sql` explicitly as step 0 in `docs/SUPABASE_SETUP.md`, which
      currently disagrees with `README.md:169` about how RLS gets applied

**Acceptance:** `supabase db push` against an empty project produces every table with RLS enabled
and `anon` revoked, with no manual `schema.sql` step.

---

### 2.5 Then, and only then, enable sign-in

- [ ] Confirm every box in sections 1 and 2 is ticked
- [ ] Run the RLS isolation checks as anonymous, User A, and User B (step 6 of the setup runbook)
- [ ] Set the repository variables `VITE_SUPABASE_URL`, `VITE_EMAIL_AUTH_ENABLED`, and the
      `VITE_SUPABASE_PUBLISHABLE_KEY` secret
- [ ] Remove the "Sign-in is not available yet" gate in `screens/auth/RevampedAuthScreens.tsx:96`
- [ ] Verify the five previously unreachable views — `login`, `email`, `otp`, `auth-callback`,
      `profile-completion` — are reachable and covered by e2e
- [ ] Record as a decision entry

---

## 3. Features promising what the app cannot deliver

### 3.1 Gate the audio UI on a non-empty manifest

`AUDIO_SOURCES`, `AUDIO_ASSETS`, and `APPROVED_AUDIO_ASSIGNMENTS` are all empty frozen objects —
deliberately, pending licensing and review. But `audioVoices.ts` still hard-codes three named
reciters that the Downloads panel renders as a live choice, so a user picks عبد الله محمد and finds
nothing to play.

- [ ] Hide the reciter picker in `screens/settings/DownloadsPanel.tsx` when
      `Object.keys(AUDIO_ASSETS).length === 0`
- [ ] Hide the audio download rows under the same condition
- [ ] Keep the engine — the gate is content, not code, and the subsystem is sound work

**Acceptance:** with an empty manifest no reciter or audio-download control is reachable; with a
seeded manifest both appear without further change.

**Test:** render the panel under both manifest states and assert the controls appear/disappear.

---

### 3.2 Remove committed scratch files

- [ ] Delete `hadith_dump.txt` (96 KB), `hadith_no_an.txt` (52 KB), and `scripts/dump_missing.ts`,
      or move them under `docs/audits/` if they are evidence worth keeping. Nothing references them.

---

## 4. Accumulated dead weight

Mechanical and safe. None of it is broken; the cost is that every future reader has to tell the
live code from the leftovers.

### 4.1 Sweep dead i18n keys

287 of 1,099 keys in `en.ts` are referenced nowhere in `src/` or `e2e/`. Parity is exact, so the
same 287 are dead in `ar.ts` — roughly 574 entries. Concentrated in `reader` (53), `garden` (45),
`home` (44), `friday` (24), `benefits` (19), `audioPlayer` (17), `library` (14).

- [ ] Remove the dead keys from both bundles, keeping them in exact parity
- [ ] Exclude `home.fridayStart` / `fridayContinue` / `fridayReview` — these are built dynamically
      at `components/HomeCards.tsx:296` and are live
- [ ] Leave the `audioPlayer` group in place if 3.1 keeps the engine for a future release; delete it
      if audio is being abandoned
- [ ] Add a guard so this cannot silently return — either a `knip` step or a custom rule alongside
      the existing `azkar/*` rules, wired into `pnpm check`

**Acceptance:** dead-key count is zero or explicitly allow-listed; `ar.ts` and `en.ts` key sets stay
identical; `pnpm check` fails if a key is added and never referenced.

---

### 4.2 Sweep unreferenced exports

113 exported symbols across 59 files have no reference outside their own module, counting `src/`,
`e2e/`, `scripts/` and the config files — so test-only usage is correctly treated as usage.

- [ ] Drop the `export` keyword from types used only within their own module (the majority — low risk)
- [ ] Review and remove the runtime ones: `renderZikrShareCard`, `copyZikrShareCardFile`,
      `downloadZikrShareCardFile`; the `RepBadge` / `PulseRings` / `CounterRing` /
      `CounterOutlineProgress` / `WaveformBars` cluster in `components/ZikrComponents.tsx`;
      `getUsageStreakSummary`, `formatDayKey`, `getSurahMeta`, `QuranSurahHeader`
- [ ] Check whether `content/authenticAzkar.ts` (182 lines) is entirely unused —
      `getAuthenticZikrCategories` has no external reference
- [ ] Remove `fetchAladhanPrayerTimes` and friends if item 1.2 took Path B

---

### 4.3 Pin the four caret-ranged dependencies

`@fontsource/amiri-quran`, `@radix-ui/react-popover`, `@radix-ui/react-switch`, and
`workbox-window` use `^` against twenty exact-pinned siblings. The lockfile holds them today, but
`workbox-window` controls the service worker mediating every cached response, and a plain
`pnpm update` moves it past DEC-056's quarantine window without review.

- [ ] Pin all four to exact versions in `package.json`
- [ ] Confirm `pnpm install --frozen-lockfile` still succeeds

---

### 4.4 Continue the App.tsx extraction

`App.tsx` is 1,589 lines holding 51 `useState`. The effect count is down to 7, so the
`usePwaLifecycle` extraction worked. The plan in
`docs/agent/evidence/pre-phase-ten/APP_TSX_EXTRACTION_PLAN.md` is sound.

- [ ] Take **one** seam, in a quiet window with no concurrent UI work
- [ ] Judge it on the full e2e suite passing with **zero spec edits**; if a spec needs editing, the
      seam changed behaviour and should be reconsidered
- [ ] Decide whether to continue based on that result — do not batch several seams

---

## 5. Verification gaps to close

The review could not cover these. Treat their absence from the findings as "not examined", not
"clean".

- [ ] Deep correctness review of the Mushaf paging and Khatmah state machine
- [ ] Line-by-line audit of prayer-time calculation against the methods documented in
      `docs/PRAYER_TIMES.md`, including DST and high-latitude behaviour after `81996a3`
- [ ] Systematic reachability check on all 26 views in the `View` union
- [ ] **Real screen-reader session** (VoiceOver / NVDA / TalkBack). Automated axe scans pass, which
      `AGENTS.md` §6 itself says is necessary and not sufficient. This is the largest gap between
      "passes axe" and "is accessible", and it needs a human.
- [ ] **Lighthouse run on a throttled mid-range profile.** Runtime performance is still unmeasured;
      bundle budget passing tells you nothing about how the app feels on a mid-range Android.
- [ ] Safe-area behaviour on notched hardware
- [ ] Manual review of 200% zoom / largest text setting for sense, not just for passing
- [ ] Confirm notifications work end-to-end. A PWA cannot schedule background notifications without
      a push service or an open tab — verify the UI does not promise more than the platform allows.

---

## 6. Candidate features — not defects

Verified absent by grep. These are scope decisions, and the app is coherent without them.

- [ ] **Qibla direction.** Best ratio of user value to remaining work: coordinates, a location
      picker and a 491-city offline catalogue already exist, so the work is one great-circle bearing
      and a compass dial.
- [ ] **Progress backup / export.** With sync off, a user's entire history lives in one browser's
      localStorage and dies with a cache clear. A JSON export is a modest, offline-friendly safety net.
- [ ] **Ramadan / fasting support.** Imsak and iftar timings plus fasting duas — the seasonal
      expectation for this app category.
- [ ] **Quran translation / tafsir in the Mushaf.** Word-meanings partly cover this; full ayah
      translation is a larger content decision.

Hijri dates already exist (`formatHijriDate`) — not a gap.

---

## Gate to run before any push in this list

Per `AGENTS.md`, and unchanged by this checklist:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:e2e
pnpm build:pages
```

Rewrite `public/release-notes.json` for every deploying push — `pnpm run check:release-notes`
prints the commit range, and the pre-push hook fails on a stale manifest before the slow gates run.
Most items in sections 2, 4 and 5 are internal and produce nothing a reader would notice; for those,
`ALLOW_STALE_RELEASE_NOTES=1` is the correct escape, declared in the phase report.
