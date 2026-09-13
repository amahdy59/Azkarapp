# Information Architecture and Content Model

## Top-level destinations

Recommended stable top-level structure:

1. Home
2. Azkar Library
3. Progress
4. More

More groups Qibla, Masbaha, and Settings behind clearly labelled cards. These utilities remain directly linkable, but they do not compete for separate bottom-navigation positions. Quran remains part of Today's Wird and the Mushaf flow rather than becoming a fifth tab.

## Home information model

Home should contain contextual modules, not become a second copy of every section:

- Current time/prayer context
- Recommended routine
- Today’s routine states
- Resume point
- Weekly summary
- Contextual Friday content
- Secondary utility

## Library taxonomy

Recommended user-facing grouping:

Collections and Saved are two visible peer tabs below Search. Collections stay
primary and render before secondary destinations. Zikr Benefits follows the
collection groups as one labelled lightbulb row. Quran is reached from Today's
Wird and the Mushaf flow; Masbaha is reached from More, so neither is duplicated
inside the Azkar Library.

### Day and worship

- Morning
- Evening
- Sleep and waking
- After prayer
- Friday

### Daily life

- Home
- Mosque
- Food and drink
- Clothing
- Travel

### Need and supplication

- Distress and worry
- Illness and ruqyah
- Purification and restroom
- Community and others
- Natural events
- Other reviewed collections only when a clearer group is not possible

Keep internal IDs stable even when labels or presentation grouping change.

## Settings IA

### General

- Appearance
- Language
- Date/calendar
- Text size shortcut

### Prayer times and reminders

- Location
- Calculation method
- Timezone and DST status
- Manual adjustments
- Notifications

### Reading and audio

- Translation/transliteration preferences
- Audio
- Downloads
- Autoplay preference if supported
- Offline availability

### Accessibility

- Contrast
- Bold text
- Reduce motion
- Reduce transparency
- Color-friendly palette
- Reset

### Account and data

- Guest/account state
- Sync state
- Backup/restore behavior
- Export
- Clear private data
- Delete account

### Support and legal

- Sources and corrections
- Help
- Privacy
- Terms
- About

## Naming rules

- Use task-oriented labels.
- Avoid internal system terminology.
- Avoid vague labels such as “Setup” when the current state can be shown.
- Prefer concrete values in secondary text.
- Keep Arabic labels natural rather than literal translations.

## State model rules

For each user-facing item, distinguish:

- Not available
- Available but not started
- In progress
- Completed
- Saved
- Downloaded
- Pending sync
- Sync failed

Do not overload one color or one icon to represent several unrelated states.

## Search model

Search should support:

- Category names
- Zikr text
- Reviewed keywords where appropriate
- Arabic diacritic-tolerant matching without altering rendered source text
- Clear result counts
- Empty result guidance
- Keyboard and screen-reader announcement

Search must not rewrite or normalize displayed religious text.
