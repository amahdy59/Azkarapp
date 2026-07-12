# Plan: Azkar — Daily Islamic Remembrance App

## Context

Building a complete Azkar (أذكار) daily dhikr app as a React web app from the attached spec + detailed design tokens provided by the user. The app simulates a mobile experience rendered in a centered phone frame (390px wide). All navigation is view-state driven — no URL routing. The full onboarding flow, main app, and all settings sub-screens are implemented.

---

## Aesthetic Direction

**Stance:** Archival-spiritual — calm, reverent, typographically precise. Full commitment to dark navy + gold palette.

### Colors

**Dark mode (default):**

| CSS var                    | Value     | Usage                            |
| -------------------------- | --------- | -------------------------------- |
| `--background`             | `#0A1228` | Page bg                          |
| `--card`                   | `#111B35` | Card surface                     |
| `--card-foreground`        | `#D4D0E0` | Secondary text                   |
| `--primary`                | `#C8941A` | Gold — CTAs, active state, rings |
| `--primary-foreground`     | `#0A1228` | Text on gold                     |
| `--secondary`              | `#1A7060` | Teal — audio, badges             |
| `--secondary-foreground`   | `#F5F0E8` | Text on teal                     |
| `--foreground`             | `#F5F0E8` | Main text                        |
| `--muted`                  | `#182040` | Elevated surfaces, borders       |
| `--muted-foreground`       | `#9290B0` | Captions, hints, inactive        |
| `--accent`                 | `#E8B420` | Gold hover/light                 |
| `--accent-foreground`      | `#0A1228` | Text on accent                   |
| `--border`                 | `#182040` | Hairlines                        |
| `--destructive`            | `#C0392B` | Danger                           |
| `--destructive-foreground` | `#F5F0E8` |                                  |
| `--ring`                   | `#C8941A` | Focus rings                      |
| `--radius`                 | `1rem`    | Base radius                      |

**Light mode:**

| CSS var                | Value     |
| ---------------------- | --------- |
| `--background`         | `#F8F5F0` |
| `--card`               | `#FFFFFF` |
| `--card-foreground`    | `#4A4570` |
| `--primary`            | `#A87614` |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary`          | `#1A7060` |
| `--foreground`         | `#1A1228` |
| `--muted`              | `#F2EEE9` |
| `--muted-foreground`   | `#8E8AAA` |
| `--accent`             | `#C8941A` |
| `--border`             | `#E5E0D8` |

### Typography (Google Fonts — `src/styles/fonts.css`)

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;700&family=DM+Mono:wght@400;500&display=swap");
```

Scale applied via Tailwind utility classes:

- Display/H1: `font-inter font-extrabold text-[28px] leading-[36px] tracking-[-0.01em]`
- Arabic Display: `font-naskh font-bold text-[28px] leading-[40px]` + `dir="rtl"`
- H2: `font-inter font-bold text-[22px] leading-[30px] tracking-[-0.005em]`
- H3: `font-inter font-semibold text-[17px] leading-[24px]`
- Body: `font-inter font-normal text-[14px] leading-[22px]`
- Caption: `font-inter font-normal text-[11px] leading-[16px]`
- Micro label: `font-inter font-bold text-[9px] leading-[13px] tracking-[0.08em] uppercase`
- Nav: `font-inter font-medium text-[10px] leading-[14px]`
- Transliteration: `font-inter font-normal italic text-[13px] leading-[20px]`

### Motion (via CSS variables + Tailwind `transition` utilities)

- Fast: 150ms — tap feedback, button press
- Default: 300ms — view transitions, accordion
- Slow: 500ms — dissolve
- Very slow: 800ms — splash → onboard
- Counter pulse: 600ms ease-out — ripple rings
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Full Navigation Tree

```
splash (2s auto-advance via useEffect/setTimeout)
└── onboard1 → onboard2 → onboard3
    └── language (8 options, gold checkmark)
        └── login (Phone · Apple · Guest)
            ├── phone → otp → home
            └── home (guest mode)

home (Tab: Home)
├── category (morning | evening | sleep)
│   └── reader (azkarIndex)
│       ├── [tap counter zone] → counter increments → auto-advance → completion
│       └── [tap benefit row] → benefit expanded (accordion, same view)
└── search

settings (Tab: Settings — two-column layout)
├── settingsPanel: 'theme'          (Display Theme — inline toggle)
├── settingsPanel: 'accessibility'  (font size slider, contrast, RTL, haptic toggles)
├── settingsPanel: 'downloads'      (3 category download cards, storage meter)
├── settingsPanel: 'notifications'  (per-reminder toggles + time pickers)
└── settingsPanel: 'progress'       (streak, recharts BarChart, category breakdown, sessions list)
```

---

## State Shape

```ts
type View =
  | 'splash' | 'onboard1' | 'onboard2' | 'onboard3'
  | 'language' | 'login' | 'phone' | 'otp'
  | 'home' | 'category' | 'reader' | 'completion'
  | 'search'
  | 'settings'

type Category = 'morning' | 'evening' | 'sleep'
type SettingsPanel = 'theme' | 'accessibility' | 'downloads' | 'notifications' | 'progress'

// Navigation
const [view, setView] = useState<View>('splash')
const [history, setHistory] = useState<View[]>([])   // back stack
const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('theme')

// Session
const [activeCategory, setActiveCategory] = useState<Category>('morning')
const [azkarIndex, setAzkarIndex] = useState(0)
const [tapCount, setTapCount] = useState(0)
const [pulseKey, setPulseKey] = useState(0)       // increments on tap to re-trigger animation
const [benefitOpen, setBenefitOpen] = useState(false)
const [isPlaying, setIsPlaying] = useState(false)
const [audioSpeed, setAudioSpeed] = useState<0.75 | 1 | 1.25>(1)

// Persistence (localStorage on change)
const [completedAzkar, setCompletedAzkar] = useState<Record<Category, Set<number>>>({...})
const [streak, setStreak] = useState(7)
const [totalCount, setTotalCount] = useState(1247)

// Display
const [darkMode, setDarkMode] = useState(true)
const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')
const [highContrast, setHighContrast] = useState(false)
const [selectedLanguage, setSelectedLanguage] = useState('English')
const [searchQuery, setSearchQuery] = useState('')

// Navigation helpers
const navigate = (to: View) => { setHistory(h => [...h, view]); setView(to) }
const goBack = () => { const prev = history[history.length - 1]; setHistory(h => h.slice(0,-1)); setView(prev ?? 'home') }
```

---

## Data Model (from data-model.md)

```ts
interface Zikr {
  id: string;
  arabicText: string; // full tashkeel/diacritics
  transliteration: string; // Latin phonetic
  translation: string;
  benefit: string; // spiritual reward description
  repetitionCount: number; // 1 | 3 | 7 | 33 | 100
  sourceReference: string; // "Bukhari · 6362"
  audioFileURL: string; // remote URL (simulated)
  category: "morning" | "evening" | "before_sleep";
  orderIndex: number;
}

interface Category {
  id: "morning" | "evening" | "before_sleep";
  name: string;
  nameArabic: string;
  icon: "sun" | "crescent" | "stars";
  totalCount: 15 | 15 | 10;
}

interface Session {
  id: string;
  category: string;
  date: Date;
  completedCount: number;
  totalCount: number;
  durationSeconds: number;
  isComplete: boolean;
}

interface UserSettings {
  theme: "dark" | "light" | "system";
  language: "en" | "ar" | "fr" | "tr" | "ur" | "id" | "ml" | "ha";
  fontSize: "small" | "medium" | "large" | "extra_large";
  highContrast: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  rtlLayout: boolean;
  audioAutoplay: boolean;
  audioSpeed: 0.75 | 1.0 | 1.25 | 1.5;
  morningReminder: { enabled: boolean; time: string };
  eveningReminder: { enabled: boolean; time: string };
  sleepReminder: { enabled: boolean; time: string };
  downloadedCategories: string[];
}

interface UserProgress {
  totalAzkarCompleted: number;
  currentStreak: number;
  longestStreak: number;
  sessions: Session[];
  categoryStats: Record<"morning" | "evening" | "before_sleep", { completed: number; total: number }>;
}
```

**Inline seed data:** 15 morning azkar, 15 evening azkar, 10 before-sleep azkar from Hisnul Muslim (authentic Arabic text with tashkeel, transliterations, English translations, hadith sources). All content attributed to Hisnul Muslim by Said bin Ali bin Wahf Al-Qahtani in the About section.

## Key Interaction Patterns (from data-model.md)

**Counter Flow:**

1. User is in ReaderScreen, lower 38% = CounterZone
2. Tap → `tapCount++`, gold ring animates via `strokeDashoffset`, 3 pulse rings radiate (staggered 0/100/200ms), count label updates
3. `tapCount === repetitionCount` → Smart Animate transition to next zikr (CSS slide + fade, 300ms)
4. Last zikr completes → navigate to CompletionScreen

**Session Resume:**

- `completedAzkar[category]` Set stored in `localStorage` on every completion
- `resumeIndex` = first index NOT in completed Set
- Category screen shows "Resume Session" CTA pointing to `resumeIndex`

**Benefit Expand/Collapse:**

- Single tap on row → `benefitOpen = true`, panel slides down 200ms dissolve
- Tap chevron → `benefitOpen = false`

**Theme Switch:**

- Toggle → sets `darkMode` state → `document.documentElement.classList.toggle('dark')` instantly

**Accessibility:**

- `reduceMotion` setting → disables pulse rings and transitions (sets CSS `--duration-*: 0ms`)
- `fontSize` setting → maps to Tailwind text-size modifier on root wrapper div
- All touch targets ≥ 44×44px enforced via `min-h-[44px] min-w-[44px]`

---

## Component Library (all in App.tsx)

### Layout

- **PhoneFrame** — `max-w-[390px] h-[844px]` centered container, `overflow-hidden`, clips all content
- **TopHeader** — back chevron + title + optional action. `h-[56px]`
- **BottomNav** — `h-[83px]` fixed bottom. 3 tabs: Home / Azkar (opens last category or category picker) / Settings. Active tab = gold icon + gold label

### Screens

**SplashScreen**

- Full `#0A1228` bg
- SVG crescent moon (gold, hand-drawn arc)
- Arabic "أذكار" in Noto Naskh, 48px, gold
- "AZKAR" in Inter ExtraBold, 14px, tracking-widest, muted
- Subtle fade-in via CSS animation
- `useEffect(() => { setTimeout(() => navigate('onboard1'), 2000) }, [])`

**OnboardingScreens (1–3)**

- Step dots indicator
- Full-height illustration area (abstract SVG or geometric shape)
- Headline + body copy
- "Next" / "Get Started" gold primary button
- "Skip" ghost text link

**LanguageScreen**

- Scrollable list of 8 language options
- Gold checkmark on selected row
- "Continue" gold button

**LoginScreen**

- Phone number button (flag + country code)
- Apple Sign-In button (outline)
- "Continue as Guest" ghost button + sync warning caption

**PhoneInputScreen** + **OTPScreen**

- Standard input fields
- OTP: 6 individual digit boxes, auto-submit on fill
- Resend countdown timer

**HomeScreen**

- Greeting: "السَّلَامُ عَلَيْكُم" in Arabic + "Good morning, [name]" in English
- 3 `CategoryCard` components (Morning, Evening, Sleep)
  - Category icon (SVG sun/moon/stars)
  - Arabic subtitle
  - 8px gold progress bar
  - Completion chip or "Start" label
- First-run: instructional card below categories when all at 0%

**CategoryScreen**

- `TopHeader` with back + category name + progress pill ("4 of 15")
- Gold "Resume Session" CTA at top
- Scrollable `ZikrListItem` list
  - Completed: gold filled checkmark
  - Pending: outline circle + teal ×N rep badge on right

**ReaderScreen** (also handles Counter and Benefit Expanded states)

- `TopHeader`: back + "Zikr 4 of 15"
- Arabic text block: Noto Naskh Bold, 28px, RTL, centered, `text-foreground`
- Transliteration: Inter Italic 13px, `text-muted-foreground`
- Translation: Inter Regular 14px, `text-card-foreground`
- **BenefitRow**: collapsed by default. Tap expands inline to show hadith + source chip (teal outline pill)
- **AudioPlayer**: teal `#1A7060` bg bar. Play/pause circle button + 5 animated waveform bars (CSS keyframes) + speed cycle button (0.75× / 1× / 1.25×)
- **CounterZone**: bottom 38% of screen. Full-width tap target. Gold SVG ring (r=60, strokeDasharray animated). "TAP ANYWHERE TO COUNT" micro label. "N of M" progress pill. On tap: `tapCount++`, `pulseKey++`, haptic-style CSS scale flash. On completion (tapCount === reps): auto-advance to next zikr or show Completion

**CounterPulse** (rendered inside CounterZone)

- 3 `<div>` rings at 120/160/200px, gold border, `opacity-0 scale-100`
- On `pulseKey` change: CSS animation class added → scale to 200%, fade out, 600ms ease-out

**CompletionScreen**

- Gold circle with checkmark SVG
- "مَاشَاء الله" Arabic display
- "Masha'Allah!" H2
- Two `StatCard`: "15 azkar" + "8 min"
- "Share Progress" secondary button + "Return Home" primary button

**SearchScreen**

- Search input (magnifier icon, gold focus border)
- Recent searches: horizontal chip row
- Category filter chips (Morning / Evening / Sleep / All)
- Results: `ZikrListItem` rows filtered from data

**SettingsScreen** (two-column layout, desktop-ish inside phone frame)

- Left nav rail: 5 settings rows with chevrons, active row gold
- Right panel: renders the selected panel component

  - **ThemePanel**: dark/light toggle (51×31px iOS switch) + preview swatch row
  - **AccessibilityPanel**: font-size selector (4 preset buttons), High Contrast toggle, RTL Layout toggle, Haptic Feedback toggle
  - **DownloadsPanel**: 3 download cards (Morning/Evening/Sleep) with progress bar or complete state. Storage meter bar. "Clear All" destructive button
  - **NotificationsPanel**: Morning / Evening / Sleep reminder rows with toggle + time picker input
  - **ProgressPanel**: Streak badge (7 days, gold flame icon), total count stat, `recharts` BarChart (7-day azkar counts), 3 category progress bars, recent sessions list

---

## Gold SVG Counter Ring

```tsx
const circumference = 2 * Math.PI * 60  // ≈ 376.99
const offset = circumference * (1 - tapCount / currentZikr.reps)

<svg viewBox="0 0 140 140" className="w-[140px] h-[140px]">
  <circle cx="70" cy="70" r="60" stroke="#182040" strokeWidth="8" fill="none" />
  <circle
    cx="70" cy="70" r="60"
    stroke="#C8941A" strokeWidth="8" fill="none"
    strokeLinecap="round"
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    transform="rotate(-90 70 70)"
    style={{ transition: 'stroke-dashoffset 150ms cubic-bezier(0.4,0,0.2,1)' }}
  />
</svg>
```

---

## Pulse Ring Animation (CSS)

```css
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
.pulse-ring {
  animation: pulse-ring 600ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
```

Three rings staggered: delay 0ms / 100ms / 200ms. Triggered by `key={pulseKey}` forcing remount.

---

## Files to Modify

| File                   | Change                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `src/app/App.tsx`      | Full replacement — all screens, state, data, components            |
| `src/styles/theme.css` | Update all color tokens (dark + light blocks) to spec values above |
| `src/styles/fonts.css` | Add Inter + Noto Naskh Arabic + DM Mono Google Fonts import        |

---

## Verification Checklist

- [ ] Splash renders and auto-advances to onboard1 after 2s
- [ ] Onboarding steps progress (1→2→3→language→login→home)
- [ ] "Continue as Guest" skips phone/OTP and goes to home
- [ ] Home shows 3 category cards with progress bars
- [ ] Category card tap → category screen with zikr list
- [ ] Zikr list item tap → reader with Arabic text RTL
- [ ] Tap counter zone → ring animates + pulse rings fire
- [ ] Completing all reps on a zikr → next zikr auto-loads
- [ ] Completing all azkar → completion screen
- [ ] Back button on every screen returns to previous
- [ ] Bottom nav switches between Home / Azkar / Settings
- [ ] Settings left rail selects right panel
- [ ] Dark/light toggle switches `.dark` class on root
- [ ] Progress panel renders recharts BarChart
- [ ] Search filters zikr by text query
