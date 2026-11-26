# Learn library and integrated books — local, 2026-11-25

## Approved objective and placement

The owner approves integrating the three enhanced publications into a native HTML reader, with optional PDF editions, remembered reading position, bookmarks, search and explicit offline management. The owner also plans prayer, ablution and Forty Nawawi Hadith modules. On 2026-11-25 they select **Learn under More, with an Azkar shortcut**. Preserve the main navigation and daily remembrance taxonomy.

## Implementation plan

1. Add a typed Learn catalogue and stable resource/unit routes. Model books, practical guides and hadith collections separately; show only available publications. Generate safe semantic content packs from the finished Arabic HTML without editing source wording. Use existing icons, fonts, tokens and protected overlay primitives.
2. Add the integrated responsive reader, contents/search, source-page references, reading preferences, locally normalized position/bookmarks, explicit verified offline saving/removal and optional PDF downloads. Use immutable, checksum-addressed optional assets outside the installation bundle. Serve identical repository assets locally for development/browser tests; public asset publication remains held with the application release.
3. Verify extraction integrity, cache corruption/eviction/recovery, persistence, routing, keyboard/overlay geometry, Arabic/English UI, themes, narrow/enlarged text and offline reading. Run the complete non-browser gate plus affected browser tests and Pages build; record screenshots and limitations.

## Boundaries

No new runtime dependency, iframe reader, religious-content rewrite, future-module placeholder, primary-nav replacement, synchronization/schema change, commit, push, deployment or release-note rewrite. Preserve concurrent Home and Settings work. Existing source-review and physical assistive-technology limitations remain explicit. Learn progress is device-local, separate from devotional completion/streaks.

## Acceptance

Both entries lead to the same catalogue; direct/reloaded resource links and browser Back work. Arabic source remains Arabic/RTL in either UI language. Native content reflows with text preferences and 320px/200% text. Controls have visible labels/focus and ordinary 44px targets. A protected contents/options surface restores focus. Offline status reflects verified current bytes, survives reload and detects removal/corruption; removing downloaded content retains bookmarks/position. Optional PDFs never enter the initial app installation. Report exact validation and remaining manual review.
