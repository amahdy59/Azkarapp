export type AppLanguage = "en" | "ar" | "fr" | "ur" | "tr" | "id" | "ml" | "ha";
export type CategoryId = "morning" | "evening" | "before_sleep";

export interface Zikr {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  benefit: string;
  repetitionCount: number;
  sourceReference: string;
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
  showTransliteration: boolean;
  showTranslation: boolean;
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
