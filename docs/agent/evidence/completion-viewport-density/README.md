# Completion density follow-up — actual application screenshots

These 2026-11-27 screenshots show the owner's follow-up: remove blank bands inside the reminder and increase outer top/bottom breathing room. They are actual application captures, copied without editing. [capture-manifest.json](capture-manifest.json) records original browser artifact paths and SHA-256 values. The [earlier gallery](../completion-viewport/README.md) preserves the superseded stretched-card checkpoint for comparison.

The desktop follow-up uses the shared protected modal, with a dedicated check/Close row outside scrolling text. Sixteen selected screenshots cover the final phone/tablet/page and desktop/modal presentations.

The selected images use Chromium. The nineteen-day streak is synthetic test data; short-phone examples simulate native 28px top / 20px bottom insets while the screen's own minimum bottom padding is now 24px. They do not establish physical-device or screen-reader acceptance.

## Arabic phone

390 × 844, Midnight / Glass. The quotation follows the heading directly; source and Benefits follow the quotation. All available actions remain on the screen.

![Compact Arabic card and larger outer padding](ar-phone-streak.png)

## Short phone: internal scrolling

360 × 650 with simulated insets. The quotation scrolls; surrounding card, source and actions retain their bounds.

![Quotation start](ar-short-phone-quote-start.png)

![Quotation end](ar-short-phone-quote-end.png)

![Session details dialog](ar-session-details.png)

## Desktop modal with Close

At 900px and wider, completion appears as a centered protected modal. Close and Escape return Home; dismissing Session details or sharing restores the completion action instead. The check/Close row remains outside scrolling content so enlarged text cannot pass beneath Close.

![Arabic desktop completion modal](ar-desktop-modal.png)

![English desktop completion modal](en-desktop-modal.png)

![Arabic short desktop at 200% text: scrolled to actions, Close still clear](ar-desktop-short-enlarged.png)

![English short desktop at 200% text: scrolled to actions, Close still clear](en-desktop-short-enlarged.png)

## English and responsive composition

![English Light phone with Arabic Quran and reviewed meaning](en-phone-light.png)

![Arabic tablet](ar-tablet-midnight.png)

![English desktop modal in the responsive theme sweep](en-desktop-midnight.png)

## Narrow, enlarged and alternative actions

![Ordinary 320px phone](ar-narrow-phone.png)

![320px at 200% text: top of intrinsic scrolling recovery](ar-200-percent-top.png)

![Abbreviated routine: Continue remains primary](ar-core-routine.png)

![Completed situational collection after local-origin outage, with New session](ar-offline-new-session.png)

[Ordinary phone without a streak](ar-phone-midnight.png) is retained too. The [follow-up report](../../reports/COMPLETION_DENSITY_LOCAL_2026_11_27_REPORT.md) records verification and remaining repository-gate limitations.
