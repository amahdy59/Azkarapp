ata Model
Zikr (single remembrance entry)
Code block
id:              string (unique)
arabicText:      string (RTL, with full tashkeel/diacritics)
transliteration: string (Latin phonetic)
translation:     string (English)
benefit:         string (spiritual reward description)
repetitionCount: integer (e.g. 1, 3, 7, 33, 100)
sourceReference: string (Hadith citation, e.g. "Bukhari · 6362")
audioFileURL:    string (remote URL, downloadable)
category:        enum: morning | evening | before_sleep
orderIndex:      integer (position in category)
Category
Code block
id:    morning | evening | before_sleep
name:  string (English)
nameArabic: string (Arabic)
icon:  sun | crescent | stars
totalCount: 15 | 15 | 10
Session
Code block
id:              string
category:        Category.id
date:            Date
completedCount:  integer
totalCount:      integer
durationSeconds: integer
isComplete:      boolean
UserSettings
Code block
theme:              dark | light | system
language:           en | ar | fr | tr | ur | id | ml | ha
fontSize:           small | medium | large | extra_large
highContrast:       boolean
reduceMotion:       boolean
hapticFeedback:     boolean
rtlLayout:          boolean
audioAutoplay:      boolean
audioSpeed:         0.75 | 1.0 | 1.25 | 1.5
morningReminder:    { enabled: boolean, time: HH:MM }
eveningReminder:    { enabled: boolean, time: HH:MM }
sleepReminder:      { enabled: boolean, time: HH:MM }
downloadedCategories: string[] (category IDs)
UserProgress
Code block
totalAzkarCompleted: integer
currentStreak:       integer (days)
longestStreak:       integer
sessions:            Session[]
categoryStats: {
  morning:  { completed: integer, total: integer }
  evening:  { completed: integer, total: integer }
  sleep:    { completed: integer, total: integer }
}
Key Interaction Patterns
Counter Flow (most important)
User is on Zikr Reader screen
Taps anywhere in the lower 38% of the screen (counter zone)
Haptic feedback fires on each tap
Gold arc progress ring increments by 1/total
Count number updates (e.g. 7 → 8 of 33)
3 concentric gold pulse rings radiate outward from center
When count reaches target: auto-advances to next zikr with Smart Animate transition
When last zikr completes: navigates to Completion screen
Mode Switching (theme)
Settings → Display Theme → tap "Light Mode" → all screens switch to warm cream palette
Implemented via Figma Variables collection "Azkar / Colors" with Dark/Light modes
No reload required — instant switch
Benefit Expand/Collapse
Single tap on "Benefit & Virtue" row → panel expands with hadith text
Double tap or tap "∧" chevron → collapses back
Animated with Dissolve 200ms transition
Session Resume
User exits app mid-session
Returns → Home → taps same category → Category screen shows "X of Y done"
"Resume Session" button → returns to exact zikr they left on
Accessibility Requirements (WCAG 2.1 AA)
Contrast: All text ≥ 4.5:1 ratio on backgrounds (fixed from #7B789A → #9290B0)
Touch targets: All interactive elements ≥ 44×44dp
Font scaling: Supports 100%–200% system font scale without loss of content
Screen readers: TalkBack (Android) + VoiceOver (iOS) Arabic support
RTL: Full layout mirror for Arabic interface
No time-based actions: Counter is fully user-paced, no forced timeouts
Reduce Motion: All animations disabled when system preference is set
Color independence: Information never conveyed by color alone (icons + labels always paired)
Content Source
All azkar content is sourced from Hisnul Muslim (حصن المسلم) — "Fortress of the Muslim" by Said bin Ali bin Wahf Al-Qahtani. This is the most widely used authenticated collection of Islamic daily supplications, available in the public domain. The app should display source attribution in the About screen.

Notification Strategy
Notification	Trigger	Title	Body	Actions
Morning Reminder	6:30 AM (user-set)	Time for Morning Azkar	Your morning remembrance is waiting	Open · Snooze 30min
Evening Reminder	5:00 PM (user-set)	Time for Evening Azkar	Don't miss your evening remembrance	Open · Dismiss
Sleep Reminder	10:00 PM (user-set)	Before Sleep Azkar	Wind down with your nightly dhikr	Open · Tomorrow
Session Complete	After last zikr	Masha'Allah!	You completed [Category] in [X] min	Share · Return Home
Streak Milestone	7/14/30/100 days	[X]-Day Streak!	Your consistency is a form of worship	View Progress
iPad-Specific Layout (1024×1366)
All iPad screens use a persistent left sidebar (280px) with the app logo, nav links, and user avatar. Main content uses master-detail split-pane patterns:

Category screen: left list (300px) + right reader (443px)
Settings: left nav groups + right detail panel
Search: left filters + right results
Counter Focus Mode: full-screen split (left reading / right counting)
File Structure (Figma Pages)
Code block
00 · Market Research      → Research findings, competitor analysis
01 · Information Architecture → Content model, navigation structure
02 · User Flows           → 4 user journey diagrams
03 · Wireframes           → Lo-fi greyscale, 5 mobile screens
04 · Hi-Fi Design         → 5 polished dark-mode screens
05 · Component Library    → 18 component sets, 71 variables, Dark+Light modes
06 · Missing Screens      → 10 screens (onboarding, settings sub-screens)
07 · Prototype            → 28 screens, 55 interactions, 14 animations
08 · Accessibility Audit  → WCAG report, contrast fixes, touch target audit
09 · Developer Handoff    → Color tokens, type scale, spacing, motion tokens
This file is ready for Figma Make implementation. The recommended starting point is Page 07 · Prototype — it contains the complete interactive flow. Start with the Home Screen and follow the navigation connections to implement each flow one at a time.