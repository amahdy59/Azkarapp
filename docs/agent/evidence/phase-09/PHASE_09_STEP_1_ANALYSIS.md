# Phase 09 — Step 1 analysis (settings and accessibility preferences)

**Status:** Superseded by implementation. The user approved all five questions on 2026-08-10 and the work landed under **DEC-050**; see the Decision Log for what was decided and why. This document is kept as the record of what the settings screens looked like _before_ Phase 09, and of how each finding was reached.

**Produced:** 2026-08-09, against `0d1a7c9` plus the working-tree robustness pass.

---

## 1. Current implementation summary

Settings is a root list (`SettingsRootPanel`) plus nine sub-panels, rendered by `SettingsScreen` as a stacked flow on compact and a two-pane layout on wide viewports. Preferences persist through `state.ts` normalization; nothing in Settings writes storage directly.

Root groups today, in render order:

| Group          | Rows                                   | Control type              |
| -------------- | -------------------------------------- | ------------------------- |
| Preferences    | Display theme, Language                | Theme selector, segmented |
| _(unlabelled)_ | Prayer Times & Location, Notifications | Navigation rows           |
| Content        | Offline access, Content sources        | Navigation rows           |
| Accessibility  | Accessibility                          | Navigation row            |
| Progress       | My Progress                            | Navigation row            |
| Account        | Account & Data                         | Navigation row            |
| Support        | Help & FAQ, Privacy & Terms, About     | Navigation rows           |

The Accessibility sub-panel holds: Calendar system, Text size, High contrast, Bold text, Colour-blind support, Reduce motion, Haptic feedback, Show translation, Show transliteration, RTL layout, and a read-only "Screen reader — Always on" row.

## 2. Relevant files and components

`SettingsScreen.tsx` (344), `SettingsRootPanel.tsx` (235), `AccessibilityPanel.tsx` (263), `NotificationsPanel.tsx` (600), `DownloadsPanel.tsx` (264), `ProgressPanel.tsx` (225), `AccountDataPanel.tsx` (200), `AboutPanel.tsx` (198), `LegalPanel.tsx` (92), `HelpPanel.tsx` (69), `SourcesPanel.tsx` (46), `ThemeModeSelector.tsx` (60), `SettingsPrimitives.tsx` (88), plus shared `SettingsRow.tsx`, `SegmentedControl.tsx`, `Tabs.tsx`.

## 3. Existing tests

`SettingsSection.test.tsx`, `InformationCard.test.tsx`, `ProgressPanel.test.ts`, `SettingsRow.test.tsx`, `state.test.ts` (normalization/persistence/corruption recovery), and `e2e/settings-experience.spec.ts`. Coverage of the panels themselves is thin — `SettingsPrimitives.tsx` sits at 37.5%.

## 4. Findings (defects against the phase's own acceptance criteria)

### 4.1 Two rows navigate to the same destination

`SettingsRootPanel.tsx` — "Prayer Times & Location" and "Notifications" both call `onNav("notifications")`. Two labels, two different value displays, one panel. This is the duplicated-control / ambiguous-chevron problem named in AGENTS.md §7 and in the phase's "reduce duplicated controls" goal.

### 4.2 Only 2 of 10 root rows show a real current value

- **Prayer Times** shows `locationSettings?.cityName || "Cairo"` — a _default_, so a user who has never set a location is shown "Cairo" as though it were configured.
- **Notifications** always renders the constant `settings.notificationsSetup`, never the actual enabled/disabled state.
- **Offline access** always renders the constant `settings.included`.
- **Content sources, Accessibility, Help, Privacy, About** show a chevron and no value at all.
- Correct today: **My Progress** (shown/hidden) and **Account & Data** (guest / syncing / needs attention / up to date).

Directly contradicts the acceptance criterion "Current values are visible".

### 4.3 Colour-blind support has the wrong control semantics

`AccessibilityPanel.tsx:197-206` renders a single-choice group as plain `PanelOptionButton`s inside a bare `<div aria-label=…>`. There is no `role="radiogroup"`, no `role="radio"`, and no `aria-checked`. Both sibling single-choice groups in the same panel (Calendar system, Text size) correctly use Radix `RadioGroupPrimitive`. Fails "Radio/switch/tab semantics are correct".

The `aria-label` on a roleless `<div>` is also the same defect class already fixed on the Home header this session — such a label is ignored by most screen readers.

### 4.4 Calendar system is misclassified

Calendar system is the first control in the Accessibility panel, under the "Visual" section label. It is neither an accessibility aid nor a visual preference — it is a locale/date preference. Phase 09 Step 3 item 4 already calls for moving it to General. Its two radio items also lack the `focus-visible:ring-[3px]` treatment that DEC-013 standardised and that the adjacent Text size items do carry.

### 4.5 Language and RTL are split across two screens

Language sits at the root; "RTL layout" (`forceRtl`) sits under Accessibility → Reading. They are the same concern and should be found together.

### 4.6 "Screen reader — Always on" reads as a setting but is inert

A non-interactive `SettingsRowItem` sits in a list of working toggles. It looks operable and is not.

### 4.7 Duplicate theme and language controls in navigation

`NavSidebar` (≥1200px) carries its own language toggle and theme cycler, duplicating the root Settings controls. DEC-027 recorded the user's choice to keep them, so this is a **recorded decision, not drift** — but the phase's prohibited list names it explicitly, so Phase 09 should either re-affirm DEC-027 or remove them.

Separately, the sidebar language button is genuinely confusing regardless of that decision: it shows the **target** language as its label ("English") next to a badge showing the **current** one ("AR"). Two opposite mental models in one control.

### 4.8 Inline bilingual strings bypass i18n

`SettingsRootPanel.tsx` ("مواقيت الصلاة والموقع" / "Prayer Times & Location", "القاهرة" / "Cairo") and `AccessibilityPanel.tsx` (calendar heading and both radio labels) are inline ternaries rather than i18n keys, so `parity.test.ts` cannot verify them. `NotificationsPanel.tsx` has 20 more. Part of the wider sweep tracked separately.

## 5. Contract conflicts

None blocking. DEC-027 (sidebar controls) intersects the phase's prohibited list and needs an explicit re-affirmation or reversal. Everything else is defect repair inside the phase's stated scope.

## 6. Risks and regression areas

- Reordering root rows will move e2e selectors in `settings-experience.spec.ts` — the same selector-drift class as DEC-022/DEC-027, which failed loudly rather than silently both times.
- Changing colour-blind support to a real radio group changes its accessibility tree; `accessibility.spec.ts` assertions need review.
- Moving calendar system between panels must not change the persisted `calendarType` field or its normalization — presentation move only.
- Panel coverage is thin, so changes here are under-protected. Worth adding panel tests alongside, not after.

## 7. Decisions that required user approval — all resolved 2026-08-10

| #   | Question                        | Resolution (DEC-050)                                                                     |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Merge or separate the two rows  | **Merged** into "Prayer Times & Reminders" — one row, one destination                    |
| 2   | Sidebar theme/language controls | **Kept** (re-affirms DEC-027); the target-vs-current label contradiction fixed instead   |
| 3   | Where calendar system lands     | **Preferences**, beside Language — no new group needed, and locale settings sit together |
| 4   | "Screen reader — Always on"     | **Help text.** It was already a non-interactive div, so the defect was affordance only   |
| 5   | Prayer-times unset state        | **Shows "Not set"** rather than presenting the "Cairo" fallback as a user choice         |

One correction to §4.3 and §4.6, found when implementing: the colour-blind buttons do carry `aria-pressed` (wrong pattern for an exclusive choice, but not unlabelled), and the screen-reader row was never a fake button — `SettingsRowItem` renders a plain `<div>` without `onPress`. Both findings stand; both were less severe than written here.

## 8. Acceptance-criteria mapping

| Criterion                                         | Today                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Users can find settings by intent                 | Partial — calendar and RTL are filed under Accessibility                   |
| Current values are visible                        | **Fails** — 2 of 10 rows                                                   |
| Radio/switch/tab semantics are correct            | **Fails** — colour-blind support                                           |
| Preferences persist safely                        | Passes — normalization and corruption recovery already covered             |
| Guest mode remains fully usable                   | Passes — Account & Data reports guest state and no feature is gated        |
| Accessibility settings don't excuse a bad default | Passes — DEC-035 automates per-mode contrast                               |
| Arabic/English copy is complete                   | Passes for the i18n bundle (DEC-039); inline strings sit outside its guard |
