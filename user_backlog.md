<USER_REQUEST>
I consolidated **both agents’ reports + my own audit against the current `main`**, removed duplicates, reconciled contradictions, and separated **correctness problems from UX improvements and feature expansion**.

A few important corrections before the backlog:

- **Theme unification is not actually complete in the current code I can inspect.** The app has `midnight / light / dark`, while `MushafTheme` is still `parchment / dark / oled / white`, with hard-coded reader colors.
- **The richer `QuranWordPopover` exists, but the Khatmah Mushaf does not currently reuse it.** `MushafPageViewer` still implements its own simpler Radix popover. So consolidation remains valid work.
- The Quran progress system still ignores the user's configured `progressDayStartHour` in several places. That is a real correctness issue.
- The current Mushaf reader still records only `currentPage` after a four-second dwell and prefetches only `currentPage ± 1`, so the spread-progress/prefetch issues remain.

---

# 1. Entire application

These are **cross-application UX, accessibility, consistency, architecture, and performance improvements**, not Mushaf-specific features.

## A. Design-system and visual consistency — High priority

### 1. Enforce one theme architecture across the application

The current application theme is:

- Midnight
- Dark
- Light

while the Mushaf separately has:

- Parchment
- Dark
- OLED
- White.

Change this to:

**Default: Follow app theme**

with mapped reading surfaces:

| App                    | Mushaf paper |
| ---------------------- | ------------ |
| Light                  | warm ivory   |
| Dark                   | charcoal     |
| Midnight               | deep navy    |
| Accessibility override | OLED black   |

OLED can remain, but it should be an explicit reader accessibility preference rather than effectively a fourth application theme.

Also migrate existing saved preferences safely.

---

### 2. Formalize typography roles

There should be defined type roles for:

- App UI Arabic
- App UI English
- Zikr Arabic
- Quran/Mushaf text
- Labels/captions
- Numeric progress
- Source/reference text

Do not let individual screens invent font weights/sizes.

The **QCF Quran font is an exception** because it serves manuscript fidelity, but the surrounding UI should still follow application typography.

This will help with the font-style inconsistencies you've noticed elsewhere in the app.

---

### 3. Standardize control anatomy

You currently have situations where similar actions use:

- circles,
- pills,
- flat icon+label controls,
- border buttons,
- icon-only controls.

Create canonical primitives for:

**Primary action**
**Secondary action**
**Toolbar action**
**Icon action**
**Toggle**
**Segmented control**
**Navigation item**

The Mushaf top and bottom chrome currently look somewhat like two separate component systems.

---

## B. Accessibility — High priority

### 4. Establish a 44×44 preferred target-size rule

WCAG 2.2 AA technically requires at least 24×24 CSS px in most situations, while 44×44 is the stronger enhanced target recommendation. Since your application already frequently uses 44px targets, I would make **44×44 your design-system target**. ([W3C][1])

Audit:

- modal close controls,
- clear buttons,
- small bookmarks,
- inline settings controls,
- icon buttons,
- switches,
- word-meaning controls where feasible.

The Mushaf navigation clear button is currently `size-8`, for example.

---

### 5. Run all accessibility settings through every major feature

The global app supports settings such as:

- text size,
- high contrast,
- bold text,
- reduced motion,
- RTL,
- color-blind support.

Create tests ensuring these affect all relevant screens.

Right now the Mushaf intentionally exists somewhat outside those systems.

---

### 6. Audit text enlargement to 200%

WCAG requires ordinary text to remain usable when enlarged to 200%. ([W3C][2])

This doesn't mean distorting the traditional Madani Mushaf.

Instead:

- App UI should genuinely resize.
- Mushaf Page mode can retain manuscript fidelity.
- Provide a separate adaptive/Comfort Quran reading mode for users needing larger Arabic text.

That is the cleaner accessibility solution.

---

### 7. Improve screen-reader announcements consistently

Use standardized announcements for:

- completion,
- errors,
- page changes,
- surah changes,
- progress changes,
- downloaded/offline state,
- bookmark saved/removed.

Avoid either silence or excessive announcements.

---

## C. Motion and interaction consistency

### 8. Complete the completion-card animation system

Your first agent's recommendation is correct.

Use a consistent choreography:

**Entry**

card expands → content reveals → icon settles

**Exit**

icon contracts → text fades/masks → card collapses → following content moves naturally

Avoid character-by-character disappearing Arabic text.

Respect `prefers-reduced-motion` / your application Reduced Motion preference.

---

### 9. Keep motion functional rather than decorative

Use animation primarily for:

- hierarchy,
- continuity,
- confirmation,
- spatial navigation.

Avoid generalized page slides that make unrelated screens look as if they're part of a carousel.

---

## D. Existing Azkar improvements

### 10. Finish the zikr number indicator

The current indicator remains:

`bg-primary/15`

with a border.

Make the tonal surface opaque enough to maintain reliable contrast across Light, Dark, and Midnight, without turning it into a primary action.

The numeral itself should continue carrying meaning, so color isn't the only indicator.

---

### 11. Keep the current Palm information-banner approach

I would **not redesign it again** if it is now in-flow and responsive.

The current architecture—content participates in normal layout rather than an absolutely positioned floating element—is the right one.

This item should be closed after device QA.

---

## E. Application architecture

### 12. Reduce duplicate Quran systems

This is more important than it initially appears.

You currently have:

- `MushafImmersiveReader`
- `KhatmahReaderScreen`

and both implement Quran reading with different:

- page models,
- controls,
- auto-hide behavior,
- fitting,
- meaning interactions,
- keyboard handling.

Do **not necessarily merge them into one giant component**.

Instead extract shared foundations:

`QuranReaderChrome`

`QuranWordInteraction`

`QuranNavigation`

`QuranReaderSettings`

`QuranKeyboardControls`

`QuranPageProgress`

Then let the two experiences render different content if genuinely required.

---

### 13. Consolidate Quran word-meaning infrastructure

You effectively have multiple presentation/data paths.

Create one authoritative API:

`getWordMeaning()`

`getWordMeaningSource()`

`WordMeaningPopover`

`WordMeaningSheet`

with explicit override support for reviewed custom wording.

The source metadata already exists and identifies the King Fahd Complex resource.

---

## F. Performance and reliability

### 14. Keep large Quran assets on demand

Your build gate enforces:

- 450 KB JS file
- 130 KB gzip JS
- 200 KB initial gzip
- **8 MB entire dist**
- 2 MB maximum single file.

Therefore audio, tafsir, translations, Tajweed metadata, etc. must **not become initial application payload**.

Use:

- lazy route chunks,
- per-surah/per-page data,
- streaming audio,
- optional offline downloads,
- Cache Storage / IndexedDB where appropriate.

---

### 15. Route production errors through observability

`KhatmahReaderScreen` still directly calls:

`console.error("Failed to load Mushaf page"...`

You already have proper observability infrastructure in `App.tsx`.

Use that consistently.

---

### 16. Expand automated responsive/accessibility QA

At minimum test:

- 320×568
- 360×800
- 390×844
- 430×932
- phone landscape
- 768px tablet portrait
- tablet landscape
- 1024 desktop
- 1440 desktop
- 1920 desktop

For each:

- Arabic
- English
- Light
- Dark
- Midnight
- 200% browser zoom
- reduced motion
- keyboard only
- screen-reader semantics via automated assertions where possible.

---

# 2. Mushaf tracker, Wird, and progress system

This is the area I would prioritize **before visual feature additions**.

---

## A. Correctness — P0

### 1. Fix the application's definition of “today”

This should be the **first tracker fix**.

The main app respects:

`progressDayStartHour`

but:

`QuranWirdScreen`

`KhatmahReaderScreen`

and the Quran Undo path

currently call `getProgressDayKey()` without it.

Example:

User's devotional day starts at **3:00 AM**.

At **1:30 AM**:

- Azkar → yesterday
- Quran → today

That is inconsistent.

Create one canonical value:

```text
activeDevotionalDayKey
```

and pass/use it everywhere.

---

### 2. Make progress spread-aware

This is also P0.

Desktop can show:

**141 + 142**

but the tracker currently records only `currentPage`.

If the user turns to the next spread:

**143 + 144**

page 142 may never count.

Create:

```text
visiblePages = [141, 142]
```

rather than treating the entire reader as one `currentPage`.

Use that same model for:

- completion,
- prefetch,
- bookmarks,
- screen-reader status,
- page-turn logic.

---

### 3. Separate four concepts that are currently too closely coupled

Store separately:

**Current location**

> page currently open

**Reading bookmark**

> intentional “continue from here”

**Completed pages**

> pages counted toward Wird

**Saved bookmarks**

> user-curated saved locations

Loading a page should not imply completing it.

Opening a page should not imply the user read its final ayah.

Quran.com likewise distinguishes its reading bookmark as a specific resume mechanism and supports verse or page positions. ([Quran.com][3])

---

### 4. Stop setting reading position to the last ayah merely because a page loaded

Current logic takes approximately:

`pageData.at(-1)`

and stores its ayah as the reading position.

Opening page 142 does not mean the user reached the final ayah rendered on page 142.

For a page-based reader, safest state is initially:

> Al-Baqarah · Page 142 · Juz 2

Only persist exact ayah when user interaction genuinely gives you exact ayah-level position.

---

### 5. Fix Khatmah-plan calculations to use the actual starting range

The current adaptive algorithm subtracts completed pages from all **604 pages**.

But imagine:

User is at page **300**.

They choose:

> Finish in 30 days.

The remaining target should be approximately:

304 ÷ 30 ≈ **10 pages/day**

not:

604 ÷ 30 ≈ **20 pages/day**.

Store:

```text
startPage
targetPage
startedDayKey
targetDayKey
```

or equivalent.

---

### 6. Handle expired plans explicitly

Don't allow an expired deadline to collapse down to a denominator of one day and produce an absurd daily target.

Use:

> **Your plan has ended. Choose a new completion date.**

with:

**Adjust plan**

---

## B. Progress-recording behavior — P0/P1

### 7. Replace “4 seconds = read”

Current logic:

> page loaded → 4 second timer → mark page read.

This is too weak.

A user may:

- open the page,
- put the phone down,
- open a popup,
- switch tabs,
- get interrupted.

### Better model

Count a page/spread when the reader **deliberately advances forward from it**.

Optionally require:

- document visible,
- page visible for minimum duration.

For two-page mode:

turning forward from:

**141–142**

records both.

Returning backwards shouldn't create new progress.

Tarteel's current goals system explicitly supports reading-session progress from page flipping, with reading tracking separately configurable. ([Tarteel Help Center][4])

---

### 8. Keep Undo, but make it stronger

You already have **Undo last page**, which is a good concept.

After spread-aware recording, Undo should undo the last **reading event**, e.g.:

> Undo pages 141–142

rather than arbitrary array slicing.

---

### 9. Consider “Auto-track Quran reading” as a preference

Default can remain enabled if you want.

But for user trust:

> Automatically count pages when I advance

On / Off

Manual users could mark today's portion complete themselves.

---

## C. Home → progress → reader information architecture

### 10. Replace the basic Home Quran card with a useful resume card

The Home card currently contains mainly:

- icon,
- Khatmah title,
- description,
- arrow.

This wastes a major opportunity.

### Returning user

Show:

**Quran**

Al-Baqarah · Page 142

**Today's Wird**
2 / 4 pages

`● ● ○ ○`

**Continue reading**

secondary:

**Plan & progress**

---

### 11. Continue Reading should go directly to the Mushaf

Don't force repeat users through:

Home → overview → Continue → Mushaf

every time.

Use:

**Continue reading → Mushaf**

and:

**Plan & progress → QuranWirdScreen**

Tarteel similarly makes current goals/actionable reading portions accessible from its goal experience rather than forcing unnecessary planning steps. ([Tarteel Help Center][4])

---

### 12. First-time users should get a different card state

Instead of empty progress:

> **Start your Quran Wird**

Choose a simple plan and build a consistent reading routine.

**Set reading plan**

---

## D. Improve the Quran progress screen itself

### 13. Show the exact daily reading portion

Current UI says roughly:

> 2 / 4
> 2 pages remaining.

Better:

> **Today's reading**
> Pages **142–145**
> Al-Baqarah · Juz 2
> **2 of 4 completed**

Then:

> Continue from **page 144**

This answers both:

**How much?**

and

**What exactly?**

---

### 14. Distinguish plan types by user intent

Don't expose algorithm language.

Use:

**Pages per day**

> Read the same amount every day.

**Finish by a date**

> The daily amount adapts if you read more or less.

This closely matches Tarteel's useful distinction between portion-based and flexible goals. ([Tarteel Help Center][4])

---

### 15. Use draft → preview → save for plan changes

Currently changing a Select or duration input immediately alters plan state.

Instead:

**Finish in:** 45 days

preview:

> Around 7 pages/day
> Estimated completion: October 8

then:

**Save plan**

Much safer.

---

### 16. Show completion date, not only days

People reason better about:

> Finish by **September 23**

than:

> 30 days

Allow both.

---

### 17. Make weekly progress quantitative

The current week graphic effectively shows:

**read anything? yes/no**

because every active day receives the same filled bar.

Instead:

| Day | Progress |
| --- | -------: |
| Sat |    ✓ 4/4 |
| Sun |      3/4 |
| Mon |    ✓ 5/5 |
| Tue |        — |

If adaptive targets differ by day, compare against that day's actual target.

---

### 18. Show Khatmah-level progress separately

Don't overload daily progress.

Have:

**Today**

2 / 4 pages

and separately:

**Current Khatmah**

142 / 604
23%

These communicate different things.

---

### 19. Make goal-completion feedback persistent enough

The current completion concept is intentionally lightweight, which is good.

But don't rely only on a four-second message.

After goal completion, persistent state should become:

> ✓ Today's Wird complete

and stay visible in:

- Home card
- Quran overview
- reader footer/status.

---

### 20. Avoid making streaks the main Quran metric

I disagree slightly with Agent 2's recommendation for a prominent progress ring/streak.

Your application already has habit-oriented Azkar progress.

For Quran, prioritize:

- today's portion,
- Khatmah progress,
- consistency calendar.

A decorative progress ring is fine if useful, but **do not turn the Quran reader into a gamification dashboard**.

---

## E. Useful later tracker features

### 21. Reading history

Eventually show:

> Al-Baqarah · pages 140–151
> 23 min
> Yesterday

Useful but not required for the first refinement.

---

### 22. Manual/off-platform reading

Eventually:

> Add reading done outside the app

Tarteel supports off-platform sessions for some goal workflows. ([Tarteel Help Center][4])

Not first priority.

---

# 3. Mushaf view itself — all screen sizes

This includes the actual reading surface, responsive behavior, reader chrome, accessibility, Quran features, performance, and code.

---

# A. Responsive layout and spread geometry — P0/P1

### 1. Fix the perceived desktop spread gutter

This is not about the CSS `gap`.

Your two pages are separated by a 1px divider.

The problem is the distance between the **actual rendered Quran text** on either side.

The layout should constrain:

> nearest text bound ← **≤64px visual gutter** → nearest text bound

Do not measure only the divider.

---

### 2. Preserve natural page proportions

On large displays, do not stretch each Mushaf page to consume arbitrary available width.

Use a bounded page ratio derived from the intended Madani page.

Then center the **whole spread**, not two independently expanding halves.

---

### 3. Align pages toward the spine

Right page content should feel anchored toward its left inner edge.

Left page should feel anchored toward its right inner edge.

The outer margins can absorb remaining space.

That produces a real-book spread rather than two website columns.

---

### 4. Give users page-layout control

Reader setting:

**Page layout**

- Auto
- Single page
- Two-page spread

Do not force two-page mode merely because dimensions technically qualify.

---

# B. Screen-size strategy

I would use this responsive model.

### Mobile portrait — roughly < 600px

**Single page only**

- edge-to-edge reading surface,
- compact controls,
- 44px targets,
- no overcrowded toolbar,
- safe-area padding,
- swipe + buttons,
- one page progress,
- navigation opens effectively full-screen.

---

### Mobile landscape

Do **not automatically assume two-page mode**.

An 844×390 phone is wide but extremely short.

Prefer:

- single-page Fit mode,
- Comfort/scroll mode,
- collapsible chrome.

The current two-page requirement `width >= 1024` prevents spread mode here, which is reasonable, but the **single-page fitting itself must be tested carefully**.

---

### Tablet portrait

Default:

**single page centered**

Give the Quran text generous width without stretching it.

Optional user-controlled Comfort mode.

---

### Tablet landscape / small desktop

Two-page spread can begin here **only if both pages retain a validated minimum readable size**.

Don't rely only on:

`width / height >= 1.4`

Use actual page fit/readability.

---

### Desktop / large desktop

Default:

**two pages**

but cap:

- page width,
- outer measure,
- spine gutter,
- typography scale.

The spread should not become enormous simply because the monitor is 2560px wide.

---

# C. Spread correctness

### 5. Treat a spread as a first-class model

Instead of:

```text
currentPage
otherPage
```

use something conceptually like:

```text
spread = {
  right: 141,
  left: 142
}
```

This simplifies:

- loading,
- tracking,
- announcements,
- prefetch,
- pagination.

---

### 6. Test all spread edge cases

Explicitly test:

- page 1,
- page 2,
- jump to an even page,
- jump to an odd page,
- page 603,
- page 604,
- switching single → spread,
- switching spread → single,
- orientation change.

---

# D. Typography, spacing, and accessibility

### 7. Keep the faithful 15-line Mushaf as the default

I would **not casually change line spacing** on the canonical page.

Your code intentionally keeps fifteen line slots for page fidelity.

That is valuable.

---

### 8. Add a separate Comfort/Adaptive reading mode

This is better than compromising the printed-page layout.

Interestingly, your other `MushafImmersiveReader` **already has Fit and Comfort modes**.

Bring the concept into the main Quran reader.

**Mushaf Page**

- exact page geometry,
- 15 lines,
- faithful Madani visual.

**Comfort Reading**

- reflowable Arabic text,
- adjustable text size,
- line height,
- continuous or paged display.

Tarteel similarly provides adaptive Quran layouts and text-size control. ([Tarteel Help Center][5])

---

### 9. Add user-controlled Arabic reading size in Comfort mode

At minimum:

A− · A · A+

or a slider.

Do **not** distort QCF page geometry in faithful mode.

---

### 10. Add “Keep controls visible”

The current Khatmah chrome hides after **4.5 seconds**.

The keyboard mitigation is thoughtful, but motor-impaired pointer users may prefer persistent targets.

Setting:

> Keep reading controls visible

---

# E. Simplify the reader chrome

### 11. Reduce top-bar competition

Current header can contain:

- Back
- Surah/Juz
- Difficult Words
- Bookmark
- theme menu.

On small screens this is too much.

I recommend:

```text
Back      Al-Baqarah · Juz 2      Bookmark   •••
```

Tap the center to open navigation.

`•••` opens **Reading Settings**.

---

### 12. Put reader preferences in one Reading Settings menu

Include:

**Appearance**

- Follow app theme
- OLED
- maybe reading warmth later

**Layout**

- Auto / single / spread
- Mushaf / Comfort
- text size if Comfort

**Reading assistance**

- Difficult word meanings
- translation
- Tajweed later

This is more scalable.

---

### 13. Keep Bookmark directly accessible

Bookmarking is:

- frequent,
- reversible,
- meaningful.

So I agree with your current design decision to leave it in the main chrome rather than bury it.

---

### 14. Harmonize header and footer controls

Use the same:

- radius,
- icon size,
- label style,
- active treatment,
- focus treatment.

Right now header and footer communicate slightly different design systems.

---

# F. Navigation

### 15. Implement actual accessible tabs

The navigation modal's four visual tabs are currently ordinary buttons.

Implement:

`role="tablist"`

`role="tab"`

`aria-selected`

`role="tabpanel"`

and keyboard:

Left / Right
Home / End

This matches the WAI-ARIA tabs pattern. ([W3C][6])

---

### 16. Synchronize Jump-to-page state

`inputPage` initializes from `currentPage`, but isn't shown syncing when `currentPage` later changes.

When opening the navigator, initialize the input with the actual current page.

---

### 17. Add a persistent search label

The Surah search currently relies heavily on placeholder text.

Give it an accessible label.

---

### 18. Add jump-to-ayah

Support:

> 2:255

or:

> Al-Baqarah · Ayah 255

Then jump to the appropriate page and, where possible, highlight/locate the verse.

---

### 19. Add Quran text search

Not only Surah search.

Support Arabic word/phrase queries:

> الكرسي

results:

> Al-Baqarah 2:255
> Page 42

Tap → page.

---

# G. Meanings and study interactions

### 20. Actually reuse the richer Quran word-popover system

This disagreement between the agents can now be resolved.

The `QuranWordPopover` component exists and already handles:

- anchored positioning,
- viewport collision behavior,
- scroll dismissal,
- Escape,
- ayah reference.

But `MushafPageViewer` still builds a different Radix popover itself.

Consolidate them.

---

### 21. Improve the content hierarchy of the meaning card

Recommended:

**selected word**

**Concise meaning**
meaning

**Al-Baqarah · Ayah 255**

Source:

> Muyassar of Ghareeb Al-Qur'an — King Fahd Complex

The authoritative source metadata is already available in your code.

---

### 22. Don't add morphology/root information until reviewed

Roots can be highly useful.

But don't infer them dynamically or add questionable linguistic metadata.

Only show them when backed by an authoritative reviewed dataset.

---

# H. Verse-level interaction — High-value feature

### 23. Make the ayah number interactive

The biggest interaction gap after the current word-meaning feature is **ayah-level actions**.

Tap ayah marker → lightweight bottom sheet:

> Play
> Bookmark verse
> Copy verse
> Share
> Translation
> Tafsir

Quran.com's current Study Mode similarly opens deeper tools from an ayah and provides tafsir, word details, bookmark, copy, share and continued reading. ([Quran.com][7])

---

### 24. Fix copying properly rather than simply removing `select-none`

The outer reader currently has:

`select-none`.

Agent 2 is correct that copying is affected.

But simply enabling arbitrary text selection is **not enough**, because QCF visually rendered glyphs are not normal Quran Unicode selection content.

Best solution:

> Tap ayah → **Copy ayah**

Then copy canonical reviewed Unicode Quran text.

This is safer and more predictable.

---

# I. Bookmarks

### 25. Separate Reading Bookmark from Saved Bookmarks

Have:

**Continue-reading bookmark**

One canonical place.

Then:

**Saved bookmarks**

Potentially many.

Quran.com has recently made exactly this distinction useful by supporting a dedicated reading bookmark separate from general collections. ([Quran.com][3])

---

### 26. Add ayah bookmarks before complex bookmark collections

First:

> Bookmark this ayah

Later:

- collections,
- labels,
- notes.

Do not build full tagging infrastructure before basic verse bookmarking works.

---

# J. Audio — High-value, but after correctness/refactor

### 27. Add Quran recitation

Agent 2 is right that this is one of the largest competitive gaps.

You already have an application audio architecture.

Initial scope:

- play current ayah,
- play from this ayah,
- pause/resume,
- reciter selection,
- repeat ayah/range,
- optional offline download.

Don't start with 30 reciters.

Start with a small, licensed/reviewed set and good UX.

---

### 28. Keep audio controls out of permanent Mushaf chrome

Use an audio player surface.

Quran.com likewise separates broader audio controls and settings rather than filling the reading toolbar with every audio option. ([Quran.com][8])

---

# K. Translation and Tafsir

### 29. Add a Study drawer, not permanent translation below the page

Default Mushaf should remain visually pure.

Tap ayah → Study.

Study panel can contain:

**Translation**
**Tafsir**
**Word meanings**
**Related content later**

Quran.com's 2026 Study Mode is a good reference here. ([Quran.com][7])

---

### 30. Eventually provide a separate Translation Reading mode

For non-Arabic users:

> Arabic Mushaf

and:

> Translation reading

should be separate reading modes.

Quran.com similarly introduced a dedicated continuous translation-reading experience rather than forcing translations into the traditional Mushaf canvas. ([Quran.com][9])

---

# L. Quran page metadata

### 31. Add authentic margin markers if authoritative data is available

Useful:

- Sajdah
- Hizb
- Rubʿ al-Hizb

Particularly valuable for users accustomed to printed Mushafs.

But source them authoritatively.

---

### 32. Tajweed colors should be optional

Later feature:

**Tajweed colors**

On / Off

with:

- visible legend,
- accessible non-color explanation,
- color-blind validation.

Do not make them part of the default text unless your chosen Mushaf standard calls for it.

---

# M. Keyboard and assistive technology

### 33. Expand reader keyboard shortcuts

Current Khatmah reader handles primarily:

Left Arrow
Right Arrow.

Add:

**PageUp / PageDown**
previous/next

**Home**
page 1

**End**
page 604

**Escape**
leave reader / close reader UI appropriately

possibly:

**B**
bookmark, if you want power-user shortcuts.

---

### 34. Scope keyboard handling to the reader

Current listener attaches to `window`.

Scope actions so another overlay/component cannot unexpectedly trigger page navigation.

---

### 35. Represent each spread page separately to screen readers

Currently a two-page display is represented by one article with a spread-level label.

Better:

```text
Quran spread
  Page 141 region/article
  Page 142 region/article
```

This gives meaningful boundaries.

---

### 36. Fix ayah-marker semantics/localization

The marker currently includes hard-coded Arabic accessible text such as:

`آية ...`

even for English UI.

Use localized strings.

Also reconsider whether every marker needs `role="img"`.

Ideally it becomes part of the accessible Quran verse representation rather than dozens of isolated “images.”

---

# N. Offline UX

### 37. Surface offline readiness inside the Quran reader

Don't require users to discover downloads in Settings only.

Examples:

> Available offline ✓

or:

> Pages 120–160 downloaded

When offline content is missing:

> This page isn't available offline.
> Download this Juz when connected.

---

### 38. Let users download meaningful ranges

Not obscure technical resources.

Allow:

- Current Surah
- Current Juz
- Full Quran text
- Recitation for current Juz
- Translation

---

# O. Performance and code architecture

### 39. Introduce a proper spread loader

Something conceptually like:

```text
useMushafSpread(page)
```

returns:

```text
current
facing
previousSpread
nextSpread
```

---

### 40. Unify the two page-loading effects

Current page loader:

load page → meanings → font → resolve.

Facing page loader independently:

load page → font → resolve.

The second path even lacks the same explicit 1.2s QCF timeout used by the first.

Use one loader.

---

### 41. Prefetch spreads rather than ±1

Current:

```text
currentPage + 1
currentPage - 1
```

For spread:

141–142

prefetch:

**143 + 144**

and optionally:

**139 + 140**

---

### 42. Don't warm word meanings unnecessarily on constrained connections

The current primary loader still begins loading Surah glosses even when meanings are turned off, although it doesn't block rendering on them.

Better policy:

**meanings on** → load immediately

**meanings off + normal network** → requestIdleCallback / low priority

**Save Data** → don't load until requested

---

### 43. Replace raw resize listening

Current reader reacts on every `window.resize`.

Prefer:

- `ResizeObserver`,
- `requestAnimationFrame` batching,
- or debounced measurement.

Your older immersive reader already uses `ResizeObserver`, so there is an internal precedent.

---

### 44. Measure the fitter before rewriting it

Agent 2 is correct that page fitting can force layout measurement.

But don't optimize merely because it “looks expensive.”

Instrument:

- page-turn latency,
- forced-layout duration,
- long tasks,
- font-load timing,
- 95th percentile on mobile hardware.

Then optimize where profiling proves it necessary.

---

### 45. Refactor `KhatmahReaderScreen`

It is still about **754 lines** and owns too many responsibilities.

Extract:

```text
useMushafNavigation
useMushafSpread
useMushafProgress
useMushafChrome
useMushafGestures
useMushafKeyboard
useMushafPreferences
```

Then `KhatmahReaderScreen` becomes orchestration rather than the entire feature.

Do this **before audio + Study mode**.

---

# 4. What I would _not_ prioritize yet

Several competitor features are valid ideas but would distract from your current problems.

I would postpone:

1. **Multiple qira'at / riwayat**
2. **Madani + IndoPak + Warsh page engines**
3. **AI mistake detection**
4. **Voice Quran search**
5. **Memorization hidden-ayah mode**
6. **Complex bookmark collections**
7. **Quran social/reflection system**
8. **Reading streak gamification**
9. **Brightness/warmth slider**
10. **Rich Arabic morphology/root analysis**
11. **Multiple dozen reciters**
12. **Advanced Tajweed before authoritative data/licensing is settled**

Those could all become legitimate future projects, but they should not delay getting the current reader fundamentally correct.

---

# Final implementation order I recommend

## Phase 1 — Correctness

1. Unified devotional day key.
2. Spread-aware progress.
3. Separate resume/completion/bookmark states.
4. Replace 4-second completion model.
5. Fix Khatmah plan start-range/deadline calculations.
6. Fix spread prefetch/loading.
7. Test pages 1, 2, 603, 604 and even-page jumps.

**Do not move to major feature additions until these are trustworthy.**

---

## Phase 2 — Home and progress UX

8. Intelligent Quran Home card.
9. Direct Continue Reading.
10. Exact today's portion.
11. Better plan creation/editing.
12. Quantitative weekly progress.
13. Persistent completion state.
14. Proper current-Khatmah progress.

---

## Phase 3 — Mushaf visual refinement

15. Fix desktop spread geometry.
16. Auto/single/spread preference.
17. Follow app theme.
18. Consolidate Reading Settings.
19. Simplify top chrome.
20. Harmonize top/footer controls.
21. Real navigation tab semantics.
22. Better responsive behavior at all breakpoints.
23. Keep-controls-visible setting.

---

## Phase 4 — Reading accessibility

24. Comfort/adaptive Quran mode.
25. User text scaling.
26. Page-level screen-reader structure.
27. Better page/surah/juz announcements.
28. Keyboard improvements.
29. Reliable Copy Ayah action.
30. Target-size audit.

This also brings the product closer to the direction already used by Tarteel's adaptive Quran layout while preserving your faithful 15-line Mushaf. ([Tarteel Help Center][5])

---

## Phase 5 — Quran study functionality

31. Consolidated richer word popover.
32. Ayah interaction sheet.
33. Reading bookmark + verse bookmarks.
34. Quran text search.
35. Translation.
36. Tafsir / Study drawer.

Quran.com's recent product direction strongly supports keeping these deeper tools **one interaction away from the clean reader** instead of showing them permanently. ([Quran.com][7])

---

## Phase 6 — Audio and offline

37. Quran recitation.
38. Repeat/range.
39. Limited reciter selection.
40. Offline audio.
41. Better Quran download state.
42. Download Surah/Juz ranges.

---

### The four things I'd tell your coding agent to do **next**

If you're about to hand another agent a task, I would **not** give it all 42 items.

The next development batch should be:

> **1. Fix Quran progress/day correctness and make progress spread-aware. 2. Fix Khatmah calculations so a plan begins from the user's actual current position. 3. Redesign Home → Quran so progress and Continue Reading are visible before entering the overview. 4. Rework two-page spread geometry/loading so the desktop Mushaf behaves as a real spread, including ≤64px perceived gutter and correct next-spread prefetch.**

Those four fixes have substantially more product value right now than adding audio, Tajweed, tafsir, or another visual feature.

[1]: https://www.w3.org/TR/wcag/?utm_source=chatgpt.com "Web Content Accessibility Guidelines (WCAG) 2.2"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html?utm_source=chatgpt.com "Understanding Success Criterion 1.4.4: Resize Text | WAI | W3C"
[3]: https://ssr.quran.com/product-updates/reading-bookmark-easily-track-your-quran-progress?utm_source=chatgpt.com "Reading Bookmark; Easily Track Your Quran Progress - Quran.com"
[4]: https://support.tarteel.ai/en/articles/12782033-how-do-i-use-the-goals-feature?utm_source=chatgpt.com "How do I use the Goals feature? | Tarteel Help Center"
[5]: https://support.tarteel.ai/ar/articles/12414375-%D8%AE%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D8%AE%D8%B7%D9%8A%D8%B7?utm_source=chatgpt.com "خيارات التخطيط | مركز مساعدة ترتيل"
[6]: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/?utm_source=chatgpt.com "Tabs Pattern | APG | WAI | W3C"
[7]: https://quran.com/en/product-updates/new-study-mode-on-quran-com?utm_source=chatgpt.com "New Study Mode on Quran.com - Quran.com"
[8]: https://quran.com/en/product-updates/simplifying-word-by-word-and-audio-settings?utm_source=chatgpt.com "Simplifying Word by Word and Audio Settings - Quran.com"
[9]: https://quran.com/product-updates/new-translation-reading-mode-read-like-a-book?utm_source=chatgpt.com "New Translation Reading Mode (Read Like a Book) - Quran.com"

let's apply the recommendations found within this document one by one and consider the following while applyings. make application great. once deployment running on another session is done, you can continue with the list here.

**§2.D.20 — streaks.** You disagree with my progress-ring suggestion. I partly accept the correction: I listed it under "familiar UI" as a peer-parity observation without weighing it against the product's character, and you're right that the app already carries habit mechanics in Azkar. But I'd separate two things you've merged — a _Khatmah completion_ indicator (142/604, 23%) is orientation, not gamification, and you yourself want it in §2.D.18. The thing to reject is the streak, not the ring.

**§3.D.7 vs §3.D.8 — I'd sharpen the framing.** You say don't change line spacing on the canonical page, then add a Comfort mode. Agreed. Worth stating the rule that makes it non-negotiable: _the 15-line page is a facsimile and its geometry is data, not styling._ That single sentence prevents the next person from "just nudging" leading — which is exactly what I was asked to do earlier in this session and did, via `SLOT_INK_ALLOWANCE`. That change is defensible (it adjusts ink-to-slot ratio, not line count) but it sits close to a line that should be explicit.

**§3.H.24 — copy.** Your fix is better than mine and I'd adopt it. But add one detail: in QCF mode the visible glyphs are PUA codepoints, and the real Uthmani text is in `sr-only` spans. So a naive selection copy yields _garbage or nothing_, not merely awkward text. That strengthens your "tap ayah → copy canonical text" conclusion — selection-based copy isn't just worse, it's broken by construction.

**One gap in both lists: RTL/LTR correctness at the seams.** Neither of us audited what happens when an English-UI user reads the Mushaf. The reader hard-codes `dir="rtl"` on the `article` while the app is LTR; the footer is `dir="ltr"` inside that; the header takes `dir={direction}`. Three nested direction contexts is where mirroring bugs live, and there's no test for it.

---

## 5. Two things I'd add to yours

**A. A "verify before you build" step at the top of Phase 1.** Your document opens with corrections to _my_ claims — good. But the same risk applies to the plan itself: several items assert current behaviour ("still records only `currentPage`", "still \~754 lines"). Before Phase 1 starts, someone should confirm each P0 against `main` and note the commit. I got this wrong twice in one session; it's a cheap guard.

**B. Acceptance criteria for the P0s.** Phase 1 items are testable in a way the later phases aren't. E.g. for the day-key fix: _"with&#x20;**`progressDayStartHour = 3`**, a page read at 01:30 records against the previous day, and an azkar completion at 01:30 records against the same day."_ That belongs in a decision record — the repo already has DEC-089 through DEC-096 for exactly this.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-08-24T12:06:13+03:00.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>
