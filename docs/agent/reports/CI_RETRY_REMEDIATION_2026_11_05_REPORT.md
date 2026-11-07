# CI retry remediation

## Objective and scope

Investigate the three automatic retries in [Quality 42009521896](https://github.com/amahdy59/Azkarapp/actions/runs/42009521896) and repair the confirmed causes. The Chromium Counter and WebKit Salawat tests sent Escape after selecting an item that had already closed its menu. The Firefox sharing test clicked an artwork choice while the preview above it was changing height. A controlled reproduction measured a 105px shift and recorded the pointer release landing on a heading.

## Components and visible behavior

`CollectionShareModal` and `sharing-steps.css` reserve the initial preview space on the compact Content step for collections with supplied cards. The existing enlargement action takes its place when the image is ready. The supplied artwork choice stays reachable while generation runs. The normal wide layout, image proportions, selection and export behavior use their existing paths.

## Accessibility and regression coverage

The reserved enlargement button is invisible and disabled until an image exists. The loading message keeps its status role. `reader-focus-intent.spec.ts` checks automatic menu closure and trigger focus after selection, then opens the menu again and checks Escape and the unchanged reading route. Existing Tab, Space, device key and Forced Colors assertions remain. `sharing-curated.spec.ts` releases delayed fonts between pointer-down and pointer-up and checks stable position, successful selection and the decoded supplied image. Coverage includes 390px Arabic and 320px English at 200% text in Chromium, Firefox and WebKit. Original preview, archive pixels, offline assets and axe assertions remain.

## Verification and visual evidence

The unchanged diagnostic run produced 25 passes and two failures over 27 cases. The two failures matched the earlier CI signatures. Four separate Chromium/WebKit menu probes confirmed selection and Escape focus recovery on both affected readers. CI artifacts, local traces and the controlled lost-click reproduction are retained under `output/ci-retry-inspection`. The fixed regression saves the selected supplied card after the same pointer journey. Final test logs, inventory, hook output and live checks are retained under that directory for the release.

## Documentation and release

Updated the design system, quality checklist and retry ledger. Bilingual release notes describe the compact sharing improvement. No new dependency, persistence change, native change or content review is involved. Publication uses the existing exact-commit Quality and Pages gates. Browser evidence covers the reproduced pointer sequence and keyboard tests. Physical device and assistive technology checks are separate.
