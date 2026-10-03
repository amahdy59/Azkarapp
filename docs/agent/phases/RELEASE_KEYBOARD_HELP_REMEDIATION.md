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

The download failure test waits for the download action to become enabled before clicking. Assertions remain intact. The enlarged Arabic phone test now compares the focused checkbox and scrollport using DOM rectangles in the same coordinate system. Mobile WebKit's locator bounding box reported the checkbox below the dialog even when its DOM rectangle and screenshot placed it inside the scrollport.

## Commands run

- Frozen install: passed.
- Targeted unit tests: 7 passed.
- WebKit practical access tests: 3 passed.
- Pages build and bundle budget: passed.
- Before commit `ed813de`, frozen install, `pnpm check`, `pnpm test:e2e` and `pnpm build:pages` passed locally.
- The subsequent Linux Quality workflow failed on the keyboard-help geometry check; Pages build, deploy and production verification succeeded.
- The local test correction passed the focused check on Chromium, Firefox and WebKit (3 passed, 26.5 seconds). Linux CI verification remains pending because this correction is local and unpublished.

## Visual/manual evidence

The focused test captures the enlarged Arabic phone keyboard-help screenshot in `output/playwright/phase78/keyboard-help-ar-enlarged.png`. The checkbox is within the scroll area; long enlarged text remains scrollable.

## Documentation updated

This report and release notes.

## Decisions recorded

No religious content, persistence, or architecture change.

## Known limitations or remaining risks

The pushed modal repair is live, but Quality failed on the checkbox geometry assertion. The local test correction has not run in Linux CI. Full screen-reader and physical-device verification also remain open.

## Out-of-scope findings

Sharing source, vocabulary, and benefit controls are committed in a separate local worktree and excluded from this published remediation.

## Recommended next step

Keep the test correction local until the owner resumes release work. Then run the required push gates and verify Linux Quality, Pages and production again. Review the finished sharing-content samples in the separate local worktree.
