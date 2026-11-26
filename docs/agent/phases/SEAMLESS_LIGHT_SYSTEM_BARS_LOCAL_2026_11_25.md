# Seamless light system bars — local, 2026-11-25

## Approved objective

The owner selects the Seamless light concept and requests applying it locally. Preserve the continuous warm reader canvas and existing controls/content. Correct faint Android system icons through the existing native boundary; no commit, push, deployment or religious-content change.

## Plan before editing

1. Keep the current compact reader surface and shared Header. Give the light progress track a visible semantic neutral ground.
2. Add a small custom native system-bar adapter without dependencies. Resolve the actual protected system-bar surface from CSS, including paper texture, Glass, high contrast and forced colors. Apply matching native backgrounds and contrasting status/navigation icons; retain the last native presentation on focus return/cold launch.
3. Protect only the existing native status inset with that same surface. Do not add another inset or change reader/Mushaf geometry.
4. Add native contrast/input regressions, bridge and appearance tests, and actual browser screenshots/geometry checks across themes, materials, RTL/LTR and narrow/enlarged text. Compile/lint/test Android and run the complete non-browser gate, relevant browser tests and Pages build.
5. Record exact results and physical-device limitations in the phase report. Preserve independent Home/Settings/Learn work and the local publication hold.

## Boundaries

No new runtime dependency, persisted application-state field, content/count/progress/audio/prayer behavior change, shell-tier replacement, APK installation, release-note edit, commit or publication. Native Java changes require rebuilding/installing a new APK; browser and mocked native evidence do not establish real-device acceptance.

## Desktop evidence correction

The owner identifies the 32px blank strip in the desktop review image and requests local improvements, reserving the combined push for later. That strip came from the evidence script applying a simulated Android safe area at all widths. Ordinary browser rendering must retain its real zero top inset. Correct the actual desktop/tablet captures without simulation, retain separate clearly labelled native-inset evidence, and add RTL/LTR wide-browser regressions. Preserve genuine safe areas on Android/tablet devices rather than removing mobile inset support to match a flawed screenshot.

## Completed local checkpoint

The seamless mobile/native implementation, browser adapter, corrected wide evidence and scoped verification are complete. Six ordinary wide-browser cases pass across three engines; 28 targeted appearance tests and the native compile/lint/policy checks pass, and a rebuilt debug APK is available locally. Pages and every non-unit stage of the final complete gate pass. The complete unit stage still reports 12 failures in four independent sharing/counter/Mushaf suites; the report retains those results and no release readiness is claimed. See [phase report](../reports/SEAMLESS_LIGHT_SYSTEM_BARS_LOCAL_2026_11_25_REPORT.md) and [corrected gallery](../evidence/seamless-system-bars/README.md). The owner will push the combined changes later.
