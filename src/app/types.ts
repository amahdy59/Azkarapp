export type AppLanguage = "en" | "ar";
export type CategoryId =
  | "morning"
  | "evening"
  | "before_sleep"
  | "waking_up"
  | "home"
  | "mosque"
  | "after_prayer"
  | "restroom"
  | "food_drink"
  | "clothing"
  | "travel"
  | "distress_anxiety"
  | "illness_ruqyah"
  | "social_community"
  | "natural_events"
  | "miscellaneous";
export type TextSizeOption = "small" | "medium" | "large";
export type ArabicFontOption = "ibm_plex" | "noto_sans";
export type ColorBlindSupport = "none" | "deuteranopia" | "protanopia" | "tritanopia";
export type ThemeMode = "midnight" | "light" | "dark";

export type View =
  | "home"
  | "library"
  | "progress"
  | "friday"
  | "category"
  | "reader"
  | "completion"
  // Phase 2 — English onboarding
  | "splash"
  | "onboard1"
  | "language"
  | "login"
  | "phone"
  | "otp"
  // Phase 2 — Arabic onboarding (shown when device locale is Arabic)
  | "ar_onboard1"
  // Phase 3
  | "settings"
  // Phase 4
  | "search";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export interface ReminderSchedule {
  enabled: boolean;
  time: string;
}

export interface ReminderSettings {
  morning: ReminderSchedule;
  evening: ReminderSchedule;
  before_sleep: ReminderSchedule;
  onlyWhenIncomplete: boolean;
}

/** One idempotent collection completion in the user's resolved progress day. */
export interface DailyCollectionCompletion {
  dayKey: string;
  category: CategoryId;
  timeZone: string;
}

export interface Zikr {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  benefit: string;
  repetitionCount: number;
  countLabel?: string;
  sourceReference: string;
  preferredTiming?: string;
  hadithText?: string;
  authenticityNote?: string;
  notes?: string;
  sourceUrl?: string;
  category: CategoryId;
  orderIndex: number;
  isSurah?: boolean;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  surahType?: "Meccan" | "Medinan" | "مكية" | "مدنية";
  verseCount?: number;
  hasBasmalah?: boolean;
  hasSeekRefuge?: boolean;
}

export interface StoredSession {
  id: string;
  category: CategoryId;
  completedAt: string;
  completedCount: number;
  totalCount: number;
  durationSeconds: number;
  isComplete: boolean;
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
  arabicFont: ArabicFontOption;
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
  location?: LocationSettings;
}

export interface UserProfileState {
  displayName: string;
  lastPhoneNumber: string;
  isGuest: boolean;
  /** Supabase user ID that owns the locally cached private progress. Empty for guest data. */
  accountUserId: string;
}

export interface AppStateSnapshot {
  settings: UserSettingsState;
  profile: UserProfileState;
  completed: Record<CategoryId, number[]>;
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  /** Stable content IDs saved by the user for quick return and account sync. */
  savedZikrIds: string[];
  /** Day key for the last active progress day to auto-reset routine sessions on a new day. */
  lastActiveDayKey?: string;
}
