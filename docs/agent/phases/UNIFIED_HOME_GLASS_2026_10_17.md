# Phase plan — Home glass across the app

## Objective and owner decision

The owner supplies Library/Home screenshots and explicitly requires all Glass-mode screens, cards and layouts to match Home's translucency and glassmorphism. This supersedes the prior 88% interface-card fill, extra 78% scene veil, chrome-only blur and reading-layout exclusion. Retain independently selectable App/Home preferences, sacred text, state and offline behavior. No planning approval gate requested.

## Inspection and implementation plan

1. Reuse the existing shared scene and Home scrim, removing the extra interface veil. Mount the shared scene at the application shell so navigation and full-screen layouts have the same photographic ground.
2. Scope a shared on-media palette and Home's 18% tint, 16px/135% frost, directional sheen, inset edge and shadow to Glass interface surfaces, including headers, cards and dialogs. Long reading layouts use the existing Home reading 28% tint. Preserve printed Mushaf typography/page geometry, selected-action contrast and native semantics. Avoid nested blur layers.
3. Leave Home's independent setting authoritative; Solid mode, high contrast, forced colors, unsupported blur, image-failure/offline and data-saving fallbacks remain legible. No new assets, runtime dependencies or persistent schema.
4. Verify computed material parity, loaded scene, actual screenshots, text contrast, bilingual phone/desktop, all routes including reading, overlays, Solid/Home independence and scrolling. Update affected prior assertions to the new owner contract without reducing accessibility or coverage requirements.
5. Run targeted tests plus intact release gates; update release notes, commit/push and verify exact-commit Quality/Pages and both live endpoints under standing release authority.

## Scope and reusable components

App shell, AppSceneBackground, materials.css, existing screen/container/card/overlay classes and appearance copy. Reuse Home photography and material primitives; keep religious content, reading functionality, prayer/audio/progress and persistence unchanged.

## Evidence and phase report

Record files/components, accessibility, exact test outcomes, screenshots, documentation and risks in the final phase report. Broad blur can affect older-device scrolling; use one layer per outer surface, no animated blur, and test browser scrolling. Physical device/assistive-technology performance remains manual acceptance.

## Phase report

### Objective and files/components

Unify Glass styling with Home across cards, headers, navigation, Reader/Mushaf/listening layouts, dialog/menu overlays, floating audio and update notices. Changes reuse AppSceneBackground, App shell, semantic material tokens, Home material CSS, app material CSS and opt-in outer-surface attributes on FloatingAudioPlayer/PwaNotice. No new image, runtime dependency, state shape or network boundary. Existing bilingual appearance guidance remains accurate.

### Behavior, accessibility and performance

Remove the interface-only veil and 88% fill. Both modes consume shared 18% card tint, 28% reading tint and 16px/135% frost; Home retains its existing focus-specific sheen. One stationary cached scene sits behind non-Home layouts/navigation. Home remains independently selected and owns its existing scene without duplicate images. Dialog/menu and reading surfaces retain stronger tint, on-media ink and semantic action colors. No sacred text, counts, audio behavior or layout order changed. No animated blur; nested controls use the outer surface's frost. High contrast, forced colors, unsupported filters, data saving and failed/offline photos have a stable dark/opaque recovery. Browser checks complement manual visual review; physical older-device/assistive-technology performance remains manual acceptance.

### Tests and evidence

AppSceneBackground/AppearancePanel/theme unit suites: 16 passed, 17.66s. Typecheck passed. Added home-glass-parity browser coverage compares actual Home tint/filter to Library, checks the loaded identical scene, eight interface routes, reading card, benefit dialog and Mushaf, with axe, overflow and Arabic/English phone/desktop screenshots. Updated previous assertions for the owner's new material/reading-scene contract. Independent settings, reduced transparency and audio lock coverage remain intact.

Initial browser checks exposed and repaired a light-theme predecode ground and a material-specificity bug that selected 18% tint instead of the required 28% reading tint. Assertions were kept. Corrected Arabic-phone/English-desktop parity, dialog and Mushaf checks passed (2 tests, 1.1m). The expanded three-engine regression and intact quality/release gates are recorded with exact outcomes in output/UNIFIED_HOME_GLASS_FINAL_RELEASE_REPORT.md after completion.

Reviewed the first desktop Library, Settings, Progress, Qibla and Reader captures in output/unified-glass-first. Final bilingual loaded-scene route/overlay/reading captures are in output/unified-glass-engines. Release notes 2026-10-17.5 describe only the new visual parity since the deployed .4 release. Architecture/design contracts, decision log, index and this phase replace the earlier dense-interface/reading-exclusion rule.

### Risks and recommended next phase

A full Glass card inventory uses more compositor layers than the previous static translucent cards, as explicitly requested. Keep a single layer per outer surface, test scrolling and retain Solid/accessibility fallbacks. Measure physical older-phone scrolling before adding any further effects. The complete automated release matrix does not certify all physical devices or assistive technologies.

### Apple material hierarchy clarification

The owner asks for current Apple-inspired material quality. Consulted Apple's official Materials HIG (https://developer.apple.com/design/human-interface-guidelines/materials) on 2026-10-17: expressive glass is for functional navigation; content uses quieter standard frosted materials, with stronger material for text-heavy controls. Implement the owner's visible translucency throughout with ordinary card 16px frost, stronger 22px stationary navigation/header frost and existing 28% reading tint. These web values are app-specific, not values prescribed by Apple. App-only material CSS loads with the existing lazy App module rather than the marketing/startup global stylesheet; all per-file, initial-route and baseline bundle gates remain unchanged. No new runtime dependency or native-shader claim.
