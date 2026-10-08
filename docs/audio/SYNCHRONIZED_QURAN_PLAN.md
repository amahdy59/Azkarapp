# Qur'an listening typography and synchronization proposal — 2026-10-08

This is a design and engineering proposal, not an implemented feature or a claim that the current recordings have timing annotations. The owner asked about embedded Mushaf pages, learner-oriented highlighting and consistent Qur'an typography while authorizing the separate usability fixes.

## Current evidence

The app already has the 604-page semantic word inventory and page-specific QCF v2 glyph/font loader, an accessible Mushaf renderer, offline page/font caches, one AudioProvider and reviewed Qur'an recording ranges. Al-Baqarah and Al-Kahf are each represented by one complete-surah recording segment; Al-Mulk (Tabarak) and As-Sajdah also use complete-range recordings. `AudioVariant` identifies exact bytes by SHA-256. No verse/phrase/word timing annotation exists in the current playback types. A recording duration and verse range cannot establish when any particular word was recited.

## Recommended delivery order

| Step                   | Reader outcome                                                                                          | Prerequisite                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1. Qur'an presentation | Expanded listening can show the same Mushaf pages; short Quran passages use a dedicated Quran text role | A reusable read-only page adapter and explicit reviewed Quran range in the playback snapshot |
| 2. Verse following     | The playing verse is marked; the reader can follow playback or browse freely                            | Human-verified verse timestamps for the exact selected recording                             |
| 3. Learner mode        | Optional word emphasis, verse replay and slower recitation                                              | Verified word timings and stable word-position mappings                                      |
| 4. Phrase practice     | Repeat a meaningful phrase without cutting a word or inappropriate boundary                             | Reviewer-approved phrase groups and verified timestamps                                      |

Do not ship approximate or demonstration timing as production synchronization.

## Typography and embedded layout

Use the existing Mushaf page renderer for full pages. QCF fonts encode page-specific glyphs; applying them to an ordinary Unicode paragraph does not recreate the Mushaf. Pass each page's matching `qcfCode` and font together. Reuse the existing atomic font/fallback contract, cache, late-font notification and fixed 15-line geometry.

For short Quran passages, accessible fallbacks and Quran quotations with explicit content metadata, use the existing `--font-mushaf` (Amiri Quran) independently of `--font-zikr`. Keep the exact reviewed Unicode text and diacritics. Do not infer Quran identity from an Arabic string or citation. Mixed devotional prose needs an explicit Quran run; applying a Quran font to every Arabic paragraph would also change ordinary duas and interface labels.

Embed a read-only page adapter inside the expanded player, with manual Previous/Next page controls and the existing transport below. Load only the displayed page and a bounded neighbor. Al-Baqarah must not render all its pages at once. On short landscape windows, retain the existing reading/transport columns; on phones, show one readable page and allow normal scrolling when enlarged text requires it. A small player must not shrink a whole page below a useful reading size merely to fit.

Listening-page position is temporary and independent of the user's reading bookmark, completed pages, reading plan and saved progress. Automatic following never marks a page as read. The player keeps the sole audio controller; the embedded page has no new audio element, router or persistence owner. Collapse/expand and font loading must not restart audio. Text remains available when timings or QCF fonts cannot be loaded.

## Accurate timing

Prefer verified timing data supplied with the exact existing master, or author/review annotations against the immutable hosted bytes. A provider's timing data is usable only with its corresponding recording; reciter name or surah identity is insufficient. Quran Foundation documents verse timestamps and optional word segments, but coverage for the owner's exact Muhammad Al-Shara and Abdullah Muhammad files has not been established. Replacing approved recordings with a different provider/reciter requires a separate content/audio review and rights decision.

Store versioned annotation JSON with `variantId`, `audioSha256`, timing unit `ms`, source/reviewer, review date, and ordered verse keys plus optional one-based word positions and start/end offsets. Validate the byte identity, monotonic ranges, media duration, Quran range, existing semantic word positions, silence, repeats, basmalah and seeking-refuge scope. Human review must listen to difficult boundaries and representative passages, including long verses. Machine alignment can suggest timings but must not rewrite the reviewed transcript or approve its own output.

Derive active verse/word from `HTMLAudioElement.currentTime`, converted to milliseconds. That clock already accounts for playback speed: never multiply timestamps by playbackRate. Reconcile on seek, seek completion, source/voice changes, replay, pauses, buffering, visibility return and natural endings. Use a bounded binary search and update React only when the active token changes. Run fine highlighting updates while playing and visible, not a permanent background polling loop. Dispose callbacks on source change and keep existing natural-ending completion rules.

## Calm, accessible learner experience

- Default to a quiet verse background/outline with a distinct marker; word highlighting is optional. Keep glyph shape, spacing and size stable, with clearance around Quran marks. Emphasis must not rely on color alone.
- Offer a clear Follow playback toggle. Manual page navigation or scrolling pauses following and exposes Return to playing verse. Following never steals keyboard focus. Reduced motion uses immediate page/scroll updates.
- Expose the current verse semantically; avoid announcing every word in a live region. Screen-reader users retain the complete semantic Arabic text, labelled transport, verse reference and a deliberate current-verse status.
- Provide keyboard actions with visible focus and 44px targets. Verse replay and explicit seek actions should be discoverable without making every printed word a tiny standalone button.
- Keep translation and existing word meanings as optional learner supports. Verify RTL/LTR, high contrast, 200% text, all themes and manual assistive-technology behavior.
- Preserve pause/stop and an option to turn following/highlighting off. No flashing, pulsing, font-size animation or forced page movement while the reader is inspecting a passage.

## Verification before release

Unit-test timing validation, exact checksum rejection, word lookup, silence gaps, seeking, playback rate, replay and source changes. Browser-test the actual embedded page in Arabic/English, offline cached fonts/data, font failure/recovery, narrow/short/enlarged layouts, keyboard and focus, highlights during seeks, and independent reading progress. Measure long-surah memory, startup bundle impact and representative-device performance. Human Quran/audio timing review and VoiceOver/TalkBack/NVDA evidence remain explicit release inputs.

## Primary references

- [Quran Foundation Audio API](https://api-docs.quran.com/docs/sdk/javascript/audio/) — chapter/ayah recordings, verse timestamps and optional word segments.
- [Quran Foundation content sync](https://api-docs.quran.foundation/docs/tutorials/content-sync/getting-started/) — permitted offline data synchronization and font/CDN conditions. Review these terms/account requirements before importing new provider content.
- [Quran Foundation chapter timing schema](https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/chapter-reciter-audio-file/) — segment offsets and one-based word timing tuples.
- [W3C: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).
- [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
