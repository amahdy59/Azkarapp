# Image-first sharing review

The image should be the product people see and prepare. Text and Link remain useful alternatives, particularly for accessibility and opening a long passage, but do not need equal visual weight.

## Dialog organization

1. A concise title identifies the shared content.
2. Image is the larger filled choice; Text and Link are quiet direct alternatives.
3. The real export preview comes next, with a visible enlargement action and accessible matching text.
4. Artwork choice, card overview, size, palette and additions follow the preview on phones; desktop uses the existing mirrored preview/settings columns.
5. A fixed footer keeps Share and Save prominent, with quiet Copy. Its hints describe the actual selection, including ZIP saving for multiple files.

Ready-made packs and generated cards serve different purposes. Ready-made cards preserve the owner's exact artwork. The studio creates cards from the selected content and supports palette, size and additions. Settings that cannot affect a ready-made image should not be shown for it. Preserve the existing generated-studio default rather than silently changing users' expected export.

## Card appearance

Keep the three established palettes and botanical identity. Prioritize devotional text over decoration; use opaque reading panels, generous line spacing, a clear title and count, concise source lines and quiet branding. Keep ornament away from text. Do not add Glass blur to exported reading text or shrink complete passages to fit an attractive mockup. Preserve the renderer's measured font minima, panel spacing, original text, sources policy and pagination. The preview should show the actual exported file rather than an approximate HTML imitation.

The supplied image in the request already has a strong visual identity. Its main presentation problem is that equal-weight controls and nested preview borders compete with it. Removing that competition improves its appearance without regenerating or altering approved artwork.

| Format              | Appropriate use                                                         |
| ------------------- | ----------------------------------------------------------------------- |
| Story, 1080×1920    | Status/story-style cards and the current collection default             |
| Portrait, 1080×1350 | A single passage, reading reminder or concise progress summary          |
| Square, 1080×1080   | Short content when the complete measured text fits                      |
| Tall, 1080×2920     | Longer reading images; offer compatible alternatives when it cannot fit |

Do not force an entire collection into one increasingly tall image. Keep each zikr and its selected supporting text together, paginate in order, show the card count and save multiple images as one ZIP. Destination apps may compress images differently; actual Android/iPhone checks are still needed before claiming platform-specific readability or delivery.

## Consistency across the application

Collections, single azkar and evidence use the shared studio. Milestones should export a real image through that same boundary, preserving the exact recorded counts/date and avoiding devotional repetition badges. Ayah sharing already prioritizes image export and keeps copyable text secondary; retain its dedicated Quran layout and source/word-meaning controls. Quick routine sharing already uses image files; preserve its direct path.

## Reliability and accessibility

Share invokes the device's file-sharing capability for the actual selection. Save remains explicit when file sharing is unsupported. Cancellation must never start a download. Image mode must not silently copy words: explain Save or explicit Text recovery when copying an image is unavailable. A failed operation needs an actionable message, not a success claim.

Keep native buttons, named groups, pressed states, visible focus, at least 44px targets, safe-area clearance, keyboard navigation, RTL/LTR and 200% text reflow. Images need matching readable HTML alternatives. Automated contrast/keyboard checks supplement physical-device and screen-reader acceptance.

## Performance and storage

Reuse local canvas rendering, existing cached fonts, approved artwork and the current dispatcher. No image-generation service, cloud upload, new runtime dependency or new paid plan is needed. Load an alternate ready-made pack when the user selects it. Keep generated blobs transient and revoke their URLs using the existing ownership/cleanup boundary. Share links must not contain private progress or device identifiers.

A worthwhile subsequent optimization is to measure memory and generation time for the largest collections on real older devices, then consider generating the initial preview before preparing the remainder on demand. That changes pagination/export orchestration and should follow measured evidence, with cancellation, offline and complete-content tests intact.

## Implementation and review evidence

The bounded implementation and exact verification results are recorded in [the phase report](../phases/IMAGE_FIRST_SHARING_2026_10_17.md). New artwork and a new export engine are unnecessary for this pass. Physical destination-app compression, QR scanning and assistive-technology acceptance remain explicit follow-ups.
