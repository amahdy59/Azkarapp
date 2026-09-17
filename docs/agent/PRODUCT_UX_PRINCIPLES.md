# Product and UX Principles

## Product promise

Azkarapp should help people reach the correct devotional content quickly, read it comfortably, complete it confidently and return consistently without distraction, guilt or unnecessary account dependence.

## Primary user outcomes

1. Start the appropriate azkar for the current time.
2. Resume an unfinished session.
3. Find a specific collection or zikr.
4. Read, count and complete a session without confusion.
5. Understand personal consistency without pressure.
6. Configure language, appearance, location, reminders and accessibility safely.
7. Continue using core features offline.

## Experience principles

### 1. One dominant next action

Each screen should communicate one primary next step. Secondary actions must not visually compete with it.

### 2. Recognition over recall

Show:

- Current mode
- Current routine state
- Continue point
- Selected location and prayer-time source
- Notification state
- Account/sync state
- Download/offline availability

### 3. Calm hierarchy

Sacred text and the immediate devotional task should dominate. Decoration, analytics and gamification remain secondary.

### 4. Gentle progress

Use progress to encourage continuation. Avoid language or visuals that imply moral failure, punishment, loss aversion or competitive pressure.

Preferred language:

- “عدت اليوم، وهذا هو المهم.”
- “أكملت وردين هذا الأسبوع.”
- “يمكنك المتابعة من حيث توقفت.”

Avoid:

- Threatening streak-loss language
- Red failure states for missed routines
- Excessive celebration after every small action

### 5. Progressive disclosure

Show the minimum needed to act, then reveal detail on request. This is especially important for settings, benefits, sources, prayer-time configuration and analytics.

### 6. Predictable interaction

- Rows that navigate should behave consistently.
- Buttons perform actions; links navigate.
- Tabs switch related panels.
- Radio groups select one option.
- Switches control binary on/off state.
- Chevrons should not duplicate an adjacent button that performs the same action.

### 7. Recoverability

Provide undo, confirmation or safe reversal for:

- Resetting progress
- Clearing data
- Removing downloaded audio
- Signing out with unsynchronized changes
- Changing location/time settings that affect recommendations
- Accidental repetition increments where practical

### 8. Offline confidence

Tell the user what remains available offline. Do not make core reading feel broken because remote sync or prayer-time refresh is unavailable.

### 9. Arabic-first, bilingual-quality

Arabic is not a mirrored English skin. Validate:

- Reading order
- Mixed-direction numbers and Latin text
- Icon direction
- Natural Arabic labels
- Line wrapping
- Numeric formatting
- English layout independently

### 10. Respectful personalization

Personalization should help users reach relevant content, not hide the full library or create opaque recommendations. Explain why a recommendation appears when needed.

## Usability success measures

For moderated or internal tests, measure:

- Time to start morning/evening/sleep azkar
- Task completion rate
- Wrong-target clicks on Home
- Search success rate
- Session abandonment point
- Ability to resume interrupted reading
- Ability to find notification and accessibility settings
- Keyboard-only completion rate
- Screen-reader completion rate
- Errors caused by RTL or mixed-direction controls
