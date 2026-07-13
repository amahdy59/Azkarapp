export type AppLanguage = "en" | "ar" | "fr" | "ur" | "tr" | "id" | "ml" | "ha";
export type CategoryId = "morning" | "evening" | "before_sleep";
export type TextSizeOption = "small" | "medium" | "large";
export type AudioQuality = "standard" | "high";
export type ColorBlindSupport = "none" | "deuteranopia" | "protanopia" | "tritanopia";
export type ThemeMode = "midnight" | "light" | "dark";

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

export interface UserSettingsState {
  language: AppLanguage;
  darkMode: boolean;
  themeMode: ThemeMode;
  showTransliteration: boolean;
  showTranslation: boolean;
  textSize: TextSizeOption;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  voiceOver: boolean;
  audioQuality: AudioQuality;
  colorBlindSupport: ColorBlindSupport;
}

export interface UserProfileState {
  displayName: string;
  lastPhoneNumber: string;
  isGuest: boolean;
}

export interface AppStateSnapshot {
  settings: UserSettingsState;
  profile: UserProfileState;
  completed: Record<CategoryId, number[]>;
  sessions: StoredSession[];
}
