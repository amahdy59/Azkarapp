# Phase 81 — Header contrast and progressive counter guidance

## Objective

Keep reader headers legible across themes and device sizes, and reduce repeated counting help after the user has learned the interaction without hiding a recovery path.

## Scope completed

- Strengthened the shared compact header with an opaque semantic background, backdrop treatment, border and balanced title wrapping.
- Added device-local first-use guidance state. The full hint is shown until the first count, then collapses to a compact hand button.
- Added a 44px hand-button restore action that reopens the explanation without changing counter state.
- The hand control is a real toggle, so users can hide and restore the explanation deliberately.
- Added a page-shaped 15-line Mushaf placeholder that reserves one or two equal leaves before the first page pair resolves.
- Applied the behavior consistently to Reader, Custom Counter and Friday Salawat.

## Files changed

- Shared header, guidance component, Mushaf placeholder, guidance hook and reader/counter screens.
- Arabic and English reader translations.

## User-visible behavior changed

Headers remain readable over optional artwork and high-contrast themes. Counting guidance teaches new users once per device, then leaves a small hand control in the same area for reopening or hiding. Mushaf first paint reserves the final page geometry rather than showing a generic spinner.

## Accessibility work

The restore affordance is a native button with a localized accessible name, title and visible focus ring. It retains a 44px target and does not rely on color alone.

## Tests added or updated

Added coverage for automatic collapse, device-local dismissal, explicit toggle, reopening and equal Mushaf placeholder leaves. Existing shared-header assertions remain intact.

## Commands run

| Command          | Result    |
| ---------------- | --------- |
| `pnpm typecheck` | Passed    |
| Focused Vitest   | 11 passed |

## Visual/manual evidence

The shared header keeps its existing layout while adding a solid contrast surface; the guidance collapses in place rather than moving the footer.

## Documentation updated

Architecture and agent index entries added.

## Known limitations or remaining risks

Manual physical-device verification is still recommended for OLED and enlarged-text combinations.

## Recommended next step

Capture visual snapshots on a light theme, OLED theme, 320px viewport and 200% text size.
