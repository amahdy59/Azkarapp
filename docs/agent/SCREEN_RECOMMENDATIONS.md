# Screen Recommendations and Target States

## 1. Global shell and navigation

### Problems to resolve

- Wide screens can either waste space or over-expand reading content.
- Language and appearance controls may be duplicated between navigation and Settings.
- Active-state contrast and semantics must be reliable.
- The navigation pattern must adapt across mobile, tablet and desktop.

### Target

- Desktop: persistent right-side navigation around 248–280 px, with a centered content container.
- Tablet: compact rail or drawer.
- Mobile: bottom navigation for top-level destinations.
- Use `aria-current="page"` for the current destination.
- Keep utility settings in Settings; do not duplicate full controls in the sidebar.
- Preserve logical DOM order and mirror only directional visuals.

## 2. Home

### Target hierarchy

1. Utility header: date and next-prayer context
2. Current recommended azkar
3. One primary start/continue action
4. Today’s routines
5. Continue interrupted session when present
6. Weekly summary
7. Contextual Friday content
8. Secondary utility such as tasbeeh

### Required improvements

- Limit decorative photography to a controlled hero region.
- Use stable opaque surfaces for functional content.
- Remove duplicate primary actions for the same routine.
- Make each routine row use one clear interaction model.
- Show title, item count, estimated duration and state.
- States: not started, in progress, complete.
- Make complete/short mode clear and update count/duration immediately.
- Separate devotional action from progress/garden metrics.
- Show Friday content prominently only when contextually relevant.

## 3. Azkar Library

### Target hierarchy

1. Page title and explanation
2. Search
3. Collections/Saved tabs
4. Grouped categories
5. Results or empty state

### Required improvements

- Use one consistent category-card anatomy.
- Do not use a progress bar for a never-started collection.
- Show explicit states: not started, in progress, complete.
- Group categories by user intent rather than one undifferentiated grid.
- Remove roadmap/internal messaging from production UI.
- Search must announce result count and preserve clear empty states.
- Tabs must have correct semantics and keyboard behavior.

## 4. Reader / Session

### Target hierarchy

1. Session header and progress
2. Zikr text
3. Optional translation/transliteration according to preference
4. Repetition control
5. Save, benefit, source and share actions
6. Completion and continuation actions

### Required improvements

- Keep the reading column constrained on large screens.
- Maintain generous Arabic line height and text scaling.
- Avoid uncontrolled imagery behind long text.
- Ensure counting is explicit, keyboard-operable and undoable where practical.
- Announce repetition and completion changes appropriately.
- Prevent accidental count changes from unrelated interactive areas.
- Respect reduced motion and avoid autoplay.
- Preserve content/source integrity.

## 5. Progress

### Target purpose

Answer:

- What did I complete?
- What can I resume?
- How consistent have I been?
- Which routine is commonly missed?
- What is the next gentle action?

### Views

- Day: routine completion, timeline and continuation
- Week: seven-day overview and routine breakdown
- Month: calendar/heatmap plus textual equivalent
- Year: monthly trend and milestones

### Required improvements

- Do not simply repeat the Home routine card.
- Provide useful empty states for new users.
- Ensure charts have text and table/list equivalents.
- Avoid color-only meaning.
- Avoid punitive streak language.
- Use explicit labels for previous/next period controls.

## 6. Settings Overview

### Recommended groups

- General
- Prayer times and reminders
- Reading and audio
- Accessibility
- Account and data
- Support and legal

### Required improvements

- Show current values in rows.
- Use radio semantics for appearance choices.
- Use switches only for binary preferences.
- Move calendar system to General/Date rather than Accessibility.
- Keep account optional and explain local guest behavior.
- Make offline and synchronization states understandable.

## 7. Accessibility Settings

### Target controls

- Text size
- Bold text
- Enhanced contrast
- Reduce motion
- Reduce transparency
- Icon labels where relevant
- Color-friendly palette
- Reset accessibility preferences

### Rules

- Default themes must already meet accessibility requirements.
- Color-vision support must not rely on global filters alone.
- App presets must not block browser/OS text scaling.
- Changes should preview clearly and be reversible.

## 8. System states

Every major asynchronous surface should define as applicable:

- Initial loading
- Refreshing
- Empty
- Offline
- Permission denied
- Recoverable error
- Unrecoverable error
- Success confirmation
- Update available
- Synchronizing
- Sync conflict or retry

Do not use a generic spinner and generic “something went wrong” message for every situation.
