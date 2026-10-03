# Phase report — Release keyboard-help remediation

## Objective

Repair the repeated Linux WebKit failure after the sharing release without including the saved sharing-content draft.

## Scope completed

The compact keyboard-help modal has a definite viewport-bounded height. Its content fills the remaining space and scrolls independently beneath the close-button gutter. Desktop retains automatic height.

## Files changed

- `src/app/components/CounterKeyboardHelp.tsx`
- `src/app/screens/settings/DownloadsPanel.test.tsx`
- `public/release-notes.json`
- This report.

## Components added or modified

CounterKeyboardHelp.

## User-visible changes

Keyboard help remains scrollable on short phones with enlarged text.

## Accessibility work

Preserves keyboard operation, close-button visibility, and access to the character-shortcut checkbox. No claim of full WCAG compliance.

## Tests added or updated

The download failure test waits for the download action to become enabled before clicking. Assertions remain intact. Existing enlarged Arabic phone coverage exercises the modal.

## Commands run

- Frozen install: passed.
- Targeted unit tests: 7 passed.
- WebKit practical access tests: 3 passed.
- Pages build and bundle budget: passed.
- Full check and E2E: results recorded in the release tool output; required pre-push hook repeats these gates.

## Visual/manual evidence

Existing test captures the enlarged Arabic phone keyboard-help screenshot.

## Documentation updated

This report and release notes.

## Decisions recorded

No religious content, persistence, or architecture change.

## Known limitations or remaining risks

Windows WebKit passed before the repair, while Linux CI reproduced the failure twice. Final Linux CI is the decisive verification.

## Out-of-scope findings

Sharing source, vocabulary, and benefit controls are saved in a separate stash and excluded from remediation.

## Recommended next step

Verify Quality and Pages for the remediation commit, then restore and complete the sharing-content phase.
