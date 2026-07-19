Azkar App — Complete Application Specification
App Overview
App Name: Azkar (أذكار) Tagline: Daily Islamic Remembrance Platform: iOS + Android (React Native) · iPad (tablet-optimized) · future web Category: Islamic / Lifestyle / Productivity Target Audience: Muslim users, ages 18–55, smartphone-fluent, pray 5× daily, seeking a daily dhikr habit Language Support: English (primary), Arabic (full RTL interface), French, Turkish, Urdu, Indonesian, Malayalam, Hausa Monetization: Free, no ads, no in-app purchases. Optional account sync.

Core Purpose
Azkar is a daily Islamic remembrance (dhikr) app. It helps Muslims recite their morning, evening, and before-sleep azkar from the authenticated collection Hisnul Muslim. The core experience is: open the app → select a category → read each zikr in Arabic with translation → tap the screen to count repetitions → complete the session.

Key Features
3 Azkar Categories: Morning (أذكار الصباح) · Evening (أذكار المساء) · Before Sleep (أذكار النوم)
Tap-to-Count Counter: Full-screen tap zone, haptic feedback on each tap, gold circular progress ring, auto-advances to next zikr on completion
Audio Recitation: One-tap play, speed control (0.75× / 1× / 1.25×), background audio support
Benefit / Virtue Panel: Expandable section showing the hadith source and spiritual reward for each zikr
Offline Support: Full audio and text download per category, works without internet
Progress Tracking: Session history, current streak (days), total azkar count, category completion rates
Accessibility: Font size control (Small/Medium/Large/Extra Large), High Contrast mode, RTL layout, VoiceOver/TalkBack support, Reduce Motion
Dark + Light Mode: Full dark navy theme (default) and warm cream light theme, switchable in Settings
Arabic RTL Interface: Complete UI mirror for Arabic speakers, Arabic labels in bottom navigation
Push Notifications: Morning, evening, sleep reminders at user-set times. Completion celebrations. Streak milestones.
Screen Inventory — 28 Screens
Group A: Onboarding & Auth
Screen	Description
Splash	Auto-advances after 2s. Gold crescent moon + Arabic "أذكار" + "AZKAR"
Onboarding 1 — Welcome	"Daily Azkar" headline. Feature intro. Step 1 of 3. "Get Started" CTA
Onboarding 2 — Counter	"Count Every Remembrance" — counter ring demo, feature checklist
Onboarding 3 — Benefits	"Know the Benefit of Each Zikr" — offline + accessibility features
Language Selection	8 languages in a scrollable list. English pre-selected with gold checkmark
Login / Guest Mode	Phone number auth · Apple Sign-In · Continue as Guest (progress won't sync)
Phone Input	Country code picker + number field. "Send Verification Code" CTA
OTP Verification	6-digit code input. Auto-submit on completion. Resend countdown
Group B: Main App Flow
Screen	Description
Home Screen	Greeting + male avatar. 3 category cards (Morning/Evening/Sleep) with gold progress bars. Bottom nav: Home (active) · Azkar · Settings
Category Screen	Header + progress bar + scrollable azkar list (gold checkmarks for completed, teal rep-count badges for pending). "Resume Session" gold CTA
Zikr Reader	Arabic text (RTL, large) + transliteration + translation + collapsed Benefit row + teal audio player + counter zone
Counter During Zikr	Same reader layout but counter zone occupies bottom 38%. Full-width tap area. Gold progress ring "7 of 33". "TAP ANYWHERE TO COUNT"
Counter Active State	Same as Counter During Zikr but with 3 concentric gold pulse rings radiating from center on tap
Benefit Expanded	Reader screen with the Benefit & Virtue section fully open, showing hadith text + source chip
Completion Screen	Celebration. "Masha'Allah!" Gold circle with checkmark. Stats: 15 azkar / 8 min. "Share Progress" + "Return Home"
Group C: Settings & Utilities
Screen	Description
Settings Root	Two-column: left settings nav groups + right panel (Display Theme selected by default)
Accessibility Settings	Text size slider + preset buttons. High Contrast toggle. Reduce Motion toggle. RTL Layout toggle. Haptic Feedback toggle
Download Manager	3 category download cards with progress. Storage meter. "Clear All" destructive button
Notification Settings	Per-reminder toggles with time pickers (Morning/Evening/Sleep). General notification toggles
My Progress / Stats	Total 1,247 azkar. 7-day streak. Week bar chart. Category breakdown. Recent sessions list
Search Screen	Search bar + recent searches chips + category filter chips + search results list
About & Help	App info + Hisnul Muslim attribution + support links + legal
Error & Edge States
Screen	Description
Network Error	"No Connection" illustration. "Try Again" + "Go Offline" CTAs
Offline Mode	Expected offline state. "Showing downloaded content" notice. Downloads summary
First Run Empty Home	Home with 0% progress on all cards + instructional card below categories
Audio Load Failed	Reader layout with audio player showing error state. "Retry" pill. Counter still works
Download Failed	Download Manager with one item showing failure + "Retry" button
Session Interrupted	Counter screen blurred behind bottom sheet modal. "Resume from Zikr 8" + "Start Over"
Skeleton Loading	Category screen with shimmer placeholder bars replacing all content
Empty Search Results	"No results for X" illustration with suggestion chips