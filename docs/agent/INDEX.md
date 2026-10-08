# AI Improvement System Index

[Phase 90](phases/PHASE_90_FIRST_REVIEWED_WORD_TIMING.md) activates the owner's exported, reviewed Friday dua word timings through the existing exact-recording registration contract.

[Phase 89](phases/PHASE_89_ALL_AUDIO_WORD_ALIGNMENT.md) records the owner-approved extension to timestamp drafting and accessible word following for every approved Arabic and English recording. Phase 88's layout release completes independently.

[Phase 88](phases/PHASE_88_QURAN_LISTENING.md) is the owner-approved Mushaf listening and review-ready synchronization phase.

[Phase 87](phases/PHASE_87_INTERACTION_AND_SEARCH_RELIABILITY.md) covers owner-authorized guidance and search/navigation reliability fixes. [Synchronized Quran listening proposal](../audio/SYNCHRONIZED_QURAN_PLAN.md) separates reusable Mushaf presentation from the verified timing annotations required for learner highlighting.

[Pending changes review and release, 2026-10-06](phases/PENDING_CHANGES_REVIEW_2026_10_06.md) records the combined review, lifecycle-safe persistence, daily streak refresh, keyboard and touch-gesture repairs, preserved owner refinements, and release verification.

[Reader collection scenes](phases/READER_COLLECTION_SCENES.md) records the owner-approved static gradient/SVG header refinement, unchanged sizing, accessibility fallbacks and local-only verification.

[Compact combined shared cards](phases/COMPACT_COMBINED_SHARED_CARDS.md) records the active owner-approved combined-card density, citation/repetition row, plain footer and Arabic-Indic export numeral refinement.

[Reading, update and sharing reliability](phases/READING_AND_UPDATE_RELIABILITY.md) is the active owner-approved follow-up for rapid navigation/counting, release-specific update deferral, sharing geometry, encouraging copy and device/accessibility evidence.

[Scoped Arabic audio restoration](phases/SCOPED_AUDIO_RESTORATION.md) records the owner-reviewed three-recording repair at new R2 paths, with other audio untouched and publication reserved for the owner's other session.

[Navigation flake and browser timings](phases/NAVIGATION_FLAKE_AND_BROWSER_TIMINGS.md) records the WebKit deadline investigation, independent navigation cases, capture ownership and retained retry evidence.

[Latest changes and testing release review](phases/LATEST_CHANGES_RELEASE_REVIEW.md) records the owner-approved integrated release, citation and repetition repairs, and deterministic local testing with mandatory live audio release verification.

[English audio and refinements release](phases/ENGLISH_AUDIO_AND_REFINEMENTS_RELEASE.md) records the owner-approved English-first audio disclosure and review/publication of all pending refinements.

## Purpose

[Essential local testing and quality](phases/ESSENTIAL_LOCAL_TESTING.md) records the owner-authorized local tooling improvements while application edits continue in another session.

This folder converts the Azkarapp UX and visual-design review into a controlled, testable delivery program.

## Reading order

1. `BASELINE_AND_GOVERNANCE.md`
2. `PRODUCT_UX_PRINCIPLES.md`
3. `SCREEN_RECOMMENDATIONS.md`
4. `ACCESSIBILITY_REQUIREMENTS.md`
5. `IA_AND_CONTENT_MODEL.md`
6. `DESIGN_SYSTEM_DELTA.md`
7. `COMPONENT_ARCHITECTURE.md`
8. `ROADMAP.md`
9. `DEFINITION_OF_DONE.md`
10. `TEST_STRATEGY.md`
11. `AGENT_WORKFLOW.md`
12. `PROMPT_LIBRARY.md`
13. `DECISION_LOG.md`
14. `RELEASE_EVIDENCE.md`

## Existing repository sources of truth

These files already exist and must not be ignored:

- `README.md` — product, setup, commands, architecture overview, deployment
- `docs/ARCHITECTURE.md` — runtime boundaries, state ownership, navigation, sync, offline behavior
- `docs/DESIGN_SYSTEM.md` — current implemented visual and interaction contracts
- `docs/QUALITY_CHECKLIST.md` — automated and manual release gates
- `docs/CONTENT_AUTHORING.md` — reviewed content rules
- `docs/MOTION_SYSTEM.md` — motion requirements where applicable
- `docs/PRAYER_TIMES.md` — location, timezone, DST, calculation and caching behavior

`docs/agent/` does not automatically replace those files. It defines the improvement program and the proposed target state. Approved implementation phases must update the existing authoritative files when a contract changes.

## Phase files

Run the phase files in numerical order unless the decision log explicitly records a justified change.

| Phase | File                                                     | Result                                                                                   |
| ----- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 00    | `phases/PHASE_00_REPOSITORY_AUDIT.md`                    | Verified current-state map and conflict register                                         |
| 01    | `phases/PHASE_01_BASELINE_CAPTURE.md`                    | Reproducible visual, accessibility, performance and behavior baseline                    |
| 02    | `phases/PHASE_02_DESIGN_FOUNDATIONS.md`                  | Approved tokens and global interaction foundations                                       |
| 03    | `phases/PHASE_03_SHARED_COMPONENTS.md`                   | Reusable component primitives and states                                                 |
| 04    | `phases/PHASE_04_SHELL_NAVIGATION.md`                    | Responsive application shell and navigation                                              |
| 05    | `phases/PHASE_05_HOME.md`                                | Focused time-aware home page                                                             |
| 06    | `phases/PHASE_06_LIBRARY.md`                             | Scannable, searchable azkar library                                                      |
| 07    | `phases/PHASE_07_READER.md`                              | Accessible and calm core reading session                                                 |
| 08    | `phases/PHASE_08_PROGRESS.md`                            | Useful, non-punitive progress experience                                                 |
| 09    | `phases/PHASE_09_SETTINGS.md`                            | Clear settings IA and controls                                                           |
| 10    | `phases/PHASE_10_SYSTEM_STATES.md`                       | Loading, empty, error, offline, update and sync states                                   |
| 11    | `phases/PHASE_11_RESPONSIVE_I18N.md`                     | Full viewport, language and direction validation                                         |
| 12    | `phases/PHASE_12_ACCESSIBILITY_REMEDIATION.md`           | WCAG-focused remediation and manual evidence                                             |
| 13    | `phases/PHASE_13_RELEASE_HARDENING.md`                   | Performance, security, PWA and release readiness                                         |
| 14    | `phases/PHASE_14_CI_CD_FIX.md`                           | Stable CI/CD and green deployment pipeline                                               |
| 15    | `phases/PHASE_15_CSS_DELIVERY_REPAIR.md`                 | Design-system primitives reach the compiled stylesheet                                   |
| 16    | `phases/PHASE_16_ELEVATION_AND_SURFACES.md`              | Elevation works in every theme; one definition per surface                               |
| 17    | `phases/PHASE_17_MENU_UNIFICATION.md`                    | One menu appearance, anatomy and direction rule                                          |
| 18    | `phases/PHASE_18_BUILD_WEIGHT.md`                        | Only referenced assets ship; the budget gate can see them                                |
| 19    | `phases/PHASE_19_TOKEN_DISCIPLINE.md`                    | Colour, radius and spacing back on scale, with lint enforcement                          |
| 20    | `phases/PHASE_20_MOTION_AND_STRUCTURE.md`                | Real motion system and navigable stylesheets                                             |
| 23    | `phases/PHASE_23_PRAYER_HOME_AND_REMINDERS.md`           | Responsive prayer dashboard and efficient opt-in reminders                               |
| 24    | `phases/PHASE_24_KAHF_AUDIO_AND_PRAYER_NAV.md`           | Recoverable Al-Kahf playback and prayer-detail navigation                                |
| 24B   | `phases/PHASE_24B_INSTALLED_AUDIO_AND_PRAYER_NOTCH.md`   | Immediate installed-app update discovery and in-place prayer disclosure                  |
| 25A   | `phases/PHASE_25A_PUSH_SECURITY_FOUNDATION.md`           | Reproducible RLS baseline before server-backed push subscriptions                        |
| 26    | `phases/PHASE_26_HOME_PRAYER_COMPOSITION.md`             | Focused Home IA and one integrated prayer-detail surface                                 |
| 27    | `phases/PHASE_27_PRODUCTION_VISUAL_AUDIT.md`             | Fresh production visual audit across responsive matrix                                   |
| 28    | `phases/PHASE_28_BEFORE_SLEEP_AUDIO.md`                  | Verified owner-supplied audio for exact before-sleep content                             |
| 29    | `phases/PHASE_29_CORE_SLEEP_SAJDAH.md`                   | As-Sajdah in both sleep modes with verified audio and honest recovery                    |
| 30    | `phases/PHASE_30_HOME_GLASS_AND_PRAYER_WIDTH.md`         | Visible Home glass depth and half-width tablet/desktop prayer detail                     |
| 31    | `phases/PHASE_31_ADAPTIVE_AUDIO_PLAYER.md`               | Responsive audio dock, RTL timeline, and input-aware volume control                      |
| 32    | `phases/PHASE_32_HOME_GLASS_AND_AUDIO_POLISH.md`         | Transparent Home composition and reachable native audio controls                         |
| 33    | `phases/PHASE_33_MORE_AND_QIBLA.md`                      | Four-item navigation with accessible local Qibla guidance                                |
| 34    | `phases/PHASE_34_AZKAR_LIBRARY_HIERARCHY.md`             | Collections-first Library and unambiguous benefit/reference actions                      |
| 35    | `phases/PHASE_35_RESPONSIVE_UTILITY_AND_LISTENING.md`    | Filled Home composition, direct desktop utilities, and synced listening                  |
| 36    | `phases/PHASE_36_ENGLISH_AUDIO_SEPARATION.md`            | Verified English audio inventory and language-locked playback controls                   |
| 37    | `phases/PHASE_37_READER_COLLECTION_NAVIGATOR.md`         | Wide collection navigation and in-place compact disclosure                               |
| 38    | `phases/PHASE_38_QIBLA_RESPONSIVE_RELEVANCE.md`          | Reachable mobile Qibla and practical desktop bearing guidance                            |
| 39    | `phases/PHASE_39_SINGLE_PAGE_MUSHAF.md`                  | One full-screen Mushaf page and focused navigation at every width                        |
| 40    | `phases/PHASE_40_AUDIO_DOCK_REFINEMENT.md`               | Stable audio controls, bottom docking, and visible listening progress                    |
| 41    | `phases/PHASE_41_LIBRARY_FILTER_DISCLOSURE.md`           | Compact mobile filters and responsive Library hierarchy                                  |
| 42    | `phases/PHASE_42_MUSHAF_DESKTOP_RAIL.md`                 | Right-side wide-screen Mushaf tools with mobile corner controls                          |
| 43    | `phases/PHASE_43_MUSHAF_RESPONSIVE_REFINEMENT.md`        | Borderless pages, focused tools, and optional comfortable spreads                        |
| 44    | `phases/PHASE_44_MOBILE_QIBLA_RELIABILITY.md`            | Reliable absolute mobile compass headings without relative drift                         |
| 45    | `phases/PHASE_45_PROGRESS_PRIORITY_AND_DISCLOSURE.md`    | Prayer-first progress hierarchy with calmer progressive disclosure                       |
| 46    | `phases/PHASE_46_AUDIO_PLAYER_HARDENING.md`              | Narrow-screen containment and truthful background media controls                         |
| 47    | `phases/PHASE_47_QIBLA_AND_IOS_SHELL.md`                 | Explicit compass opt-in and single-owner bottom safe area                                |
| 48    | `phases/PHASE_48_QIBLA_COMPAT_AND_PROGRESS_CLARITY.md`   | Safari compass compatibility and summary-first Progress views                            |
| 49    | `phases/PHASE_49_HOME_WIRD_DENSITY.md`                   | Compact responsive Home Wird cards without smaller content                               |
| 50    | `phases/PHASE_50_QIBLA_PERMISSION_RECOVERY.md`           | Honest installed-app compass denial and reliable live-dial semantics                     |
| 51    | `phases/PHASE_51_CLOUDFLARE_SYNC_AND_VISITORS.md`        | Edge persistence, peer sync, and anonymous active visitor analytics                      |
| 52    | `phases/PHASE_52_SYNC_PRIVACY_BOUNDARY.md`               | Strict remote sync sanitization excluding coordinates and PII                            |
| 53    | `phases/PHASE_53_COUNTER_CONTINUITY.md`                  | Partial zikr count persistence across unmount and refresh                                |
| 54    | `phases/PHASE_54_WIRD_COMPLETION_CONSISTENCY.md`         | Unified Quran wird completion logic and fractional progress visibility                   |
| 55    | `phases/PHASE_55_QR_DEVICE_PAIRING_RELIABILITY.md`       | Localhost CORS regex, revision tracking, auto-purge, and pairing UX                      |
| 56    | `phases/PHASE_56_OFFLINE_DOWNLOADS_ISOLATION.md`         | Independent Mushaf/Audio downloads, font verification, and UX hierarchy                  |
| 57    | `phases/PHASE_57_QIBLAH_TASK_FIRST.md`                   | Task-first Qiblah direction, Kaaba distance, and progressive compass                     |
| 58    | `phases/PHASE_58_MUSHAF_MOBILE_POLISH.md`                | Library horizontal affordance, spread explanation, and skeleton stability                |
| 59    | `phases/PHASE_59_REVIEW_REMEDIATION.md`                  | Verification-led priority and deferred remediation                                       |
| 60    | `phases/PHASE_60_QIBLA_VISUAL_AND_MUSHAF_SPEED.md`       | Always-visible Kaaba direction and intent-led Mushaf warm-up                             |
| 61    | `phases/PHASE_61_PRAYER_AND_FASTING_COLLECTIONS.md`      | Reviewed in-prayer and year-round fasting reference collections                          |
| 62    | `phases/PHASE_62_ACTIVE_VISITOR_PRESENCE.md`             | Anonymous rolling presence instead of an all-time visitor total                          |
| 63    | `phases/PHASE_63_REVIEW_RECOMMENDATIONS.md`              | Evidence-led recommendations, local restore, audio settings, prayer depth                |
| 64    | `phases/PHASE_64_MASBAHA_AND_PROGRESS_REFINEMENT.md`     | Finite Masbaha goals, reviewed picker, and truthful Progress summaries                   |
| 65    | `phases/PHASE_65_NAVIGATION_AND_MICROINTERACTIONS.md`    | Linkable subroutes and calm, governed interaction feedback                               |
| 66    | `phases/PHASE_66_VISUAL_REMEDIATION.md`                  | Themed dropdowns, rounded statuses, and Light Home utility contrast                      |
| 67    | `phases/PHASE_67_ZIKR_DISCLOSURE_LAYOUT.md`              | Full-width zikr summaries with one stable, overflow-aware disclosure                     |
| 68    | `phases/PHASE_68_AUDIO_PROGRESS_CLARITY.md`              | One visible audio progress control with stable shell actions                             |
| 69    | `phases/PHASE_69_RECENT_CHANGES_REVIEW.md`               | Review-led hardening of recent reading, counter, Home, and audio changes                 |
| 70    | `phases/PHASE_70_UX_A11Y_AND_EFFICIENCY_IMPROVEMENTS.md` | Audit-driven UX, WCAG 2.2 AA target/focus, search highlight, and efficiency improvements |
| 71    | `phases/PHASE_71_AUDIT_REMEDIATION.md`                   | Responsive task priority, robust persistence, service boundaries, and startup reduction  |
| 72    | `phases/PHASE_72_WIRD_PLANNING_REDESIGN.md`              | Daily repeating Quran Wird plan architecture, isolated tracking, and intuitive restart   |

Phases 15–20 derive from `docs/audits/DESIGN_CONSISTENCY_AUDIT.md` (2026-08-15) and are
recorded in `DECISION_LOG.md` as DEC-064. Phase 15 is upstream of 16, 17 and 19 — its root
cause (F01) produces several of the findings those phases address, so re-measure after it
lands rather than working from the audit's pre-repair numbers. Phase 18 is independent and
may run in parallel.

## Latest Home refinement

[Audio player refinement](phases/AUDIO_PLAYER_REFINEMENT.md) records the owner-approved local audio review recommendations and verification, without pushing.

[Phase 73](phases/PHASE_73_PRAYER_INFORMATION_CLARITY.md) records the owner-requested prayer-information clarity and reminder-first Home ordering. Phase 72 remains the Quran Wird planning contract.

[Phase 74](phases/PHASE_74_RELEASE_REVIEW.md) records the latest Reader/audio review and push-readiness checks.

## Core rule

The latest review and hardening work is recorded in [Phase 72](phases/PHASE_72_WIRD_PLANNING_REDESIGN.md), adding support for daily repeating Quran sections (fixed Juz, Surah, or custom page range) with binary daily completion upon reading 100% of the section, isolated progress calculation, and one-tap section restart.

The agent must never interpret “perfect the application” as permission to rewrite the entire repository. Perfection is approached through evidence-backed iteration, not one-shot replacement.

[Phase 75](phases/PHASE_75_INTEGRATED_AUDIO_PLAYER.md) records the owner-requested integrated expanded audio surface, replacing the modal presentation under DEC-214.

[Phase 76](phases/PHASE_76_PENDING_CHANGES_RELEASE.md) records the review, repair, and authorized release of pending sharing, Mushaf, and audio changes under DEC-215.

[Phase 77](phases/PHASE_77_SHARING_REFINEMENT.md) is the active owner-approved sharing refinement: complete text, measured readable exports, coordinated designs, accessible previews and resilient sharing under DEC-216.

[Phase 77](phases/PHASE_77_HEADER_SCROLL_CONTAINMENT.md) records the local-only ordinary-header scroll repair under DEC-216-H.

[Phase 78](phases/PHASE_78_PRACTICAL_DEVOTIONAL_ACCESS.md) implements the selected practical devotional access recommendations under DEC-217, preserving reviewed content and local-only authority.

[Phase 78 material/mobile follow-up](phases/PHASE_78_MATERIAL_AND_MOBILE_HELP_FOLLOWUP.md) applies the owner's screenshot feedback to situational Home surfaces and shared keyboard-help visibility, locally only.

[Devotional footer redesign](phases/DEVOTIONAL_FOOTER_REDESIGN.md) records the owner-authorized local counter and Reader support-action refinement.

[Coordinated footer release](phases/DEVOTIONAL_FOOTER_RELEASE.md) records the final owner-approved hierarchy refinement, integration of concurrent work, and release verification.

[Counter progress follow-up](phases/COUNTER_PROGRESS_FOLLOWUP.md) records the owner's single-line text and truthful gradual-fill refinement.

[Sharing usability refinement](phases/SHARING_USABILITY_REFINEMENT.md) records the active owner-approved local-only sharing dialog recommendations, corrected native accessibility semantics, responsive evidence and verification.

[Verified audit remediation](phases/AUDIT_VERIFIED_REMEDIATION.md) records the owner-approved local-only fixes and qualified dispositions of the external audit.

[Devotional component and alignment refinement](phases/DEVOTIONAL_COMPONENT_REFINEMENT.md)
records roomier desktop Zikr navigation, shared counter footer actions, and
Apple/Microsoft-informed control spacing and alignment improvements.

[Shared-card hierarchy and content clarity](phases/SHARED_CARD_CONTENT_CLARITY.md) records the owner-approved logo, footer, title, spacing, presets and Arabic glossary refinement.

[Sharing footer and combined release](phases/SHARING_FOOTER_RELEASE.md) records the concise footer, accessible feedback and owner-authorized release of pending refinements.

[Efficient release verification](phases/RELEASE_VERIFICATION_EFFICIENCY.md) records the owner-approved removal of duplicate release suites, exact-snapshot quality reuse and full CI before deployment.

[Audio waveform and transport refinement](phases/AUDIO_WAVEFORM_TRANSPORT_REFINEMENT.md) records the owner-approved waveform seek control, stable media direction, independent continuation and vertical volume disclosure.

[Collapsed player waveform and edge controls](phases/AUDIO_COMPACT_WAVEFORM_REFINEMENT.md) records the owner-approved short waveform, dedicated edge chevron, title collision protection and keyboard/focus continuity.

[Latest changes review and release](phases/LATEST_CHANGES_REVIEW_RELEASE.md) records the combined review, necessary accessibility/build repairs and owner-authorized publication.

[Arabic audio direction and text transition release](phases/ARABIC_AUDIO_AND_TEXT_TRANSITIONS.md) records the owner-approved review repairs, revised RTL media contract, reading-only motion and release verification.

[Recent review hardening](phases/RECENT_REVIEW_HARDENING.md) records the owner-approved availability/identity and contrast fixes, footer queue position, selective audio quarantine and release verification while retaining the owner's current refinements.

[Expanded audio text centering](phases/EXPANDED_AUDIO_TEXT_CENTERING.md) records the owner-requested correction to both-axis alignment with accessible overflow recovery.

[Reader guidance and motion consistency](phases/READER_GUIDANCE_AND_MOTION_CONSISTENCY.md) records the owner-approved combined keyboard hint, responsive reading layout and animation audit refinements.

[Resizable Reader collection panel](phases/RESIZABLE_READER_COLLECTION_PANEL.md) records the owner-approved familiar sidebar, pointer/keyboard resizing and drawer fallback; verification is local only and publication is withheld.

[Compact prayer companion](phases/COMPACT_PRAYER_COMPANION.md) records the owner-approved local-only prayer card and summary-tile refinement, responsive reflow, native checklist semantics and verification.

[Phase 79](phases/PHASE_79_NOTIFICATION_REFINEMENT.md) records the owner-approved notification settings, reminder customization, test delivery and service-worker click-routing refinement.

[Phase 80](phases/PHASE_80_MUSHAF_SPREAD_RELIABILITY.md) records atomic facing-page font selection, equal spread geometry, late-font recovery, and responsive Mushaf verification.

[Phase 81](phases/PHASE_81_HEADER_AND_COUNTER_GUIDANCE.md) records contrast-safe shared headers and progressive first-use counting guidance with a persistent hand-button restore affordance.

[Phase 82](phases/PHASE_82_RESPONSIVE_READER_REFINEMENT.md) records the owner's wide Mushaf measure, opaque mobile header, compact guidance and shorter menu refinement.

[Phase 83](phases/PHASE_83_MUSHAF_SPACING_AND_BAQARAH_AUDIO.md) records natural Mushaf word spacing and the approved Al-Baqarah toolbar recitation action.

[Phase 84](phases/PHASE_84_HOME_PHOTO_LOADING.md) records atomic decoded Home photograph loading and scene recovery.

[Phase 85](phases/PHASE_85_STARTUP_PERFORMANCE.md) records throttled startup evidence, deferred cache maintenance and audio loading at reading intent.

[Phase 86](phases/PHASE_86_READER_OPTIONS.md) records the owner-approved compact Reader options sheet, explicit list selector and scoped action labels.
