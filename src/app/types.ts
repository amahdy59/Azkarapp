import type { FridayCycleProgress } from "./fridayProgress";

export type AppLanguage = "en" | "ar";

/** The five daily prayers. Canonical here so persisted records and the prayer
 *  time helpers cannot drift apart. */
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export const CATEGORY_IDS = [
  "morning",
  "evening",
  "before_sleep",
  "waking_up",
  "after_prayer",
  "comprehensive_duas",
  "friday_kahf",
  "home",
  "mosque",
  "food_drink",
  "restroom",
  "clothing",
  "travel",
  "distress_anxiety",
  "illness_ruqyah",
  "social_community",
  "natural_events",
  "miscellaneous",
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];
export type TextSizeOption = "small" | "medium" | "large";

/**
 * The face the zikr text is set in.
 *
 * All three families already ship with the app — `humanist` is what every
 * reader has been reading in, `clear` is the UI face, and `naskh` is the
 * Mushaf's. Nothing new is downloaded and nothing new enters the precache,
 * which is why the choice can be offered at all: an Arabic face is a large
 * asset, and a fourth would cost every reader bytes to serve a preference most
 * of them will not change.
 */
export type ZikrFontOption = "humanist" | "clear" | "naskh";
export type ColorBlindSupport = "none" | "deuteranopia" | "protanopia" | "tritanopia";
export type ThemeMode = "midnight" | "light" | "dark";
export type RoutineCategoryId = "morning" | "evening" | "before_sleep" | "after_prayer";
export type RoutineMode = "core" | "complete";
export type ZikrGroupId =
  "begin" | "quran_protection" | "dua_protection" | "renew" | "ask" | "repeat" | "prepare" | "settle" | "final";
export type RitualGroupId = "three_quls" | "tasbih_fatimah";
export type ZikrAudioMode = "play-once" | "repeat-prescribed-count" | "repeat-custom";
export interface ZikrAudioBehavior {
  defaultMode: "play-once";
  supportedModes: ZikrAudioMode[];
  repetitionUnit?: "zikr" | "ritual-round";
  recommendedMaxAutoRepeat?: number;
}
export type ZikrAttributionType =
  | "said_by_prophet"
  | "taught_by_prophet"
  | "approved_by_prophet"
  | "reported_by_prophet_from_another_prophet"
  | "quranic_supplication"
  | "companion_supplication";

export type View =
  | "khatmah_overview"
  | "khatmah"
  | "home"
  | "library"
  | "progress"
  | "benefits"
  | "wird_benefits"
  | "friday"
  | "friday_salawat"
  | "category"
  | "reader"
  | "completion"
  // Phase 2 — English onboarding
  | "splash"
  | "onboard1"
  | "language"
  | "login"
  | "email"
  | "otp"
  | "auth-callback"
  | "profile-completion"
  // Phase 2 — Arabic onboarding (shown when device locale is Arabic)
  | "ar_onboard1"
  // Phase 3
  | "settings"
  // Phase 4
  | "search"
  | "custom_counter";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export interface ReminderSchedule {
  enabled: boolean;
  time: string;
}

export interface ReminderSettings {
  morning: ReminderSchedule;
  evening: ReminderSchedule;
  before_sleep: ReminderSchedule;
  after_prayer: ReminderSchedule;
  onlyWhenIncomplete: boolean;
}

/** One idempotent collection completion in the user's resolved progress day. */
export interface DailyCollectionCompletion {
  dayKey: string;
  category: CategoryId;
  timeZone: string;
  /** Core earns the category leaf; Complete upgrades that same leaf. */
  completionLevel?: RoutineMode;
  subCategory?: string;
}

/** A reviewed Madani Mushaf page boundary for one complete surah. */
export interface MushafPageRange {
  page: number;
  startAyah: number;
  endAyah: number;
}

export interface Zikr {
  id: string;
  /** Stable content identity shared by category-specific instances with identical wording. */
  canonicalKey: string;
  /** Exact approved manifest reference. Never inferred from text, citations, or ordering. */
  audioAssetId?: string;
  audioBehavior: ZikrAudioBehavior;
  arabicText: string;
  transliteration: string;
  translation: string;
  benefit: string;
  /** Reviewed Arabic copy for the benefit UI; falls back to the legacy localization table. */
  benefitArabic?: string;
  repetitionCount: number;
  countLabel?: string;
  sourceReference: string;
  /** Reviewed Arabic source copy; falls back to localized source-name replacement. */
  sourceReferenceArabic?: string;
  preferredTiming?: string;
  hadithText?: string;
  authenticityNote?: string;
  attributionType?: ZikrAttributionType;
  notes?: string;
  sourceUrl?: string;
  category: CategoryId;
  orderIndex: number;
  groupId?: ZikrGroupId;
  groupOrder?: number;
  itemOrder?: number;
  includedInCore?: boolean;
  ritualGroupId?: RitualGroupId;
  isCollectionIntroduction?: boolean;
  isSurah?: boolean;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  surahType?: "Meccan" | "Medinan" | "مكية" | "مدنية";
  verseCount?: number;
  /** Optional structural metadata; Quran text remains in `arabicText` unchanged. */
  mushafPages?: readonly MushafPageRange[];
  hasBasmalah?: boolean;
  hasSeekRefuge?: boolean;
}

/** Authoring shape; content is finalized and validated before it reaches the application. */
export type ZikrDraft = Omit<Zikr, "canonicalKey" | "audioBehavior"> &
  Partial<Pick<Zikr, "canonicalKey" | "audioBehavior">>;

export interface StoredSession {
  id: string;
  category: CategoryId;
  completedAt: string;
  completedCount: number;
  totalCount: number;
  durationSeconds: number;
  isComplete: boolean;
  completionLevel?: RoutineMode;
}

export interface LocationSettings {
  latitude?: number;
  longitude?: number;
  cityName?: string;
  calculationMethod: number;
  autoDetect: boolean;
  timeZone?: string;
  adjustments?: {
    fajr?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
}

export interface UserSettingsState {
  language: AppLanguage;
  darkMode: boolean;
  themeMode: ThemeMode;
  showTransliteration: boolean;
  showTranslation: boolean;
  textSize: TextSizeOption;
  /** Which family the zikr text itself is set in. Defaults to `humanist`. */
  zikrFont?: ZikrFontOption;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  reminders: ReminderSettings;
  weeklyGoalDays: number;
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  location?: LocationSettings;
}

export interface UserProfileState {
  displayName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isGuest: boolean;
  /** Supabase user ID that owns the locally cached private progress. Empty for guest data. */
  accountUserId: string;
}

/**
 * Two independent booleans per prayer, per day.
 *
 * Keyed by a stable prayer id rather than a card index, so reordering the cards
 * or changing how many are shown can never re-point yesterday's record at a
 * different prayer. Timing state (which prayer is current) is derived from the
 * clock and is deliberately not stored here.
 */
export interface PrayerTrackingRecord {
  dayKey: string;
  prayer: PrayerName;
  /** Prayed in congregation at the mosque. */
  mosque: boolean;
  /** Completed the adhkar that follow the prayer. */
  adhkar: boolean;
}

/** The Mushaf follows the app by default, while OLED remains an explicit
 * high-contrast reading override rather than a fourth product theme. */
export type MushafTheme = "follow-app" | ThemeMode | "oled";
export type MushafPageTheme = ThemeMode | "oled";
export type MushafLayout = "auto" | "single" | "spread";

/**
 * Which edge of a wide reading surface carries the vertical tool rail.
 *
 * A rail is held with one hand; whether that hand is on the right or the left
 * is the reader's, not the interface language's, so this is a stored choice
 * rather than something derived from direction.
 */
export type MushafToolbarSide = "right" | "left";

/**
 * How much of each line slot the Quranic type is allowed to claim.
 *
 * This scales the ink inside the fifteen slots; it never changes the slot
 * count, the line breaks, or the pagination, all of which are page data.
 */
export type MushafTextScale = "small" | "medium" | "large";

export type QuranWirdPlanKind = "khatmah30" | "daily" | "custom" | "hijriMonth" | "gregorianMonth" | "free";

/** The last verified page the reader opened, with enough context for a useful resume label. */
export interface QuranReadingPosition {
  page: number;
  surahNumber?: number;
  ayahNumber?: number;
  juzNumber?: number;
}

/** A saved verse is separate from the one intentional continue-reading place. */
export interface QuranVerseBookmark {
  verseKey: string;
  page: number;
}

/** The last forward page-turn event, retained so Undo removes a whole spread. */
export interface QuranReadingEvent {
  dayKey: string;
  pages: number[];
}

/** One active plan keeps the daily reading decision clear rather than competing plans. */
export interface QuranWirdPlan {
  kind: QuranWirdPlanKind;
  dailyPages: number;
  durationDays?: number;
  startedDayKey?: string;
  startPage?: number;
  targetPage?: number;
}

export interface AppStateSnapshot {
  settings: UserSettingsState;
  profile: UserProfileState;
  /** Stable zikr IDs; legacy numeric indexes are migrated when state is loaded. */
  completed: Record<CategoryId, string[]>;
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  /** Per-prayer mosque/adhkar tracking, by day and stable prayer id. */
  prayerTracking: PrayerTrackingRecord[];
  /** Stable content IDs saved by the user for quick return and account sync. */
  savedZikrIds: string[];
  /** Day key for the last active progress day to auto-reset routine sessions on a new day. */
  lastActiveDayKey?: string;
  /**
   * The Friday companion's progress for the current cycle.
   *
   * Only the current Friday is carried: older cycles are pruned locally and
   * have no meaning once the day has passed, so syncing them would be payload
   * for nothing. Before this existed, Friday was the one progress surface that
   * lived purely in `localStorage`, which meant reading Al-Kahf on a phone left
   * no trace on a tablet an hour later while every other routine followed the
   * account across.
   */
  fridayProgress?: FridayCycleProgress;
  /** User's current reading position in the Quran Khatmah (page number 1-604). */
  khatmahPage?: number;
  /** Mushaf color preference; follows the app theme unless explicitly overridden. */
  mushafTheme?: MushafTheme;
  mushafLayout?: MushafLayout;
  /** Which edge of a wide reading surface carries the vertical tool rail. */
  mushafToolbarSide?: MushafToolbarSide;
  /** Reading type size inside the fixed fifteen-line geometry. */
  mushafTextScale?: MushafTextScale;
  /** Bookmarked Mushaf pages (1-604). */
  mushafBookmarks?: number[];
  /** User-curated verse bookmarks, distinct from the continue-reading place. */
  mushafVerseBookmarks?: QuranVerseBookmark[];
  /** Daily Quran reading goal in pages (default: 4). */
  dailyWirdGoal?: number;
  /** Map of date key (YYYY-MM-DD) to list of pages read on that day. */
  wirdHistory?: Record<string, number[]>;
  /** Snapshot of the goal shown on each reading day for truthful weekly history. */
  quranWirdDailyGoals?: Record<string, number>;
  /**
   * The day whose wird completion has already been announced.
   *
   * The notice congratulated the reader once per visit rather than once per
   * day, because it lived in component state and every return to the Mushaf
   * was a fresh mount. Congratulating someone repeatedly for the same thing
   * stops reading as congratulation.
   */
  quranWirdCompletionAnnounced?: string;
  /** Most recent forward page-turn event, used by spread-aware Undo. */
  quranLastReadingEvent?: QuranReadingEvent;
  /** Context shown before opening the Mushaf. */
  quranReadingPosition?: QuranReadingPosition;
  /** The single active daily Quran plan. */
  quranWirdPlan?: QuranWirdPlan;
}
