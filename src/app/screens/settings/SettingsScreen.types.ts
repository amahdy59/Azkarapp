import type { AudioController } from "../../audio/AudioProvider";
import type {
  AppLanguage,
  ColorBlindSupport,
  DailyCollectionCompletion,
  LocationSettings,
  ReminderSettings,
  StoredSession,
  TextSizeOption,
  ThemeMode,
  ZikrFontOption,
} from "../../types";
import type { SettingsSubScreen } from "./SettingsPanels";

/** The screen's application-facing contract, kept separate from its responsive panel composition. */
export interface SettingsScreenProps {
  audioController: AudioController | null;
  themeMode: ThemeMode;
  language: AppLanguage;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  syncStatus: "offline" | "needs-attention" | "syncing" | "up-to-date";
  lastSuccessfulSyncAt: string;
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  savedCount: number;
  textSize: TextSizeOption;
  showTranslation: boolean;
  showTransliteration: boolean;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  reminders: ReminderSettings;
  locationSettings?: LocationSettings;
  weeklyGoalDays: number;
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  hijriDateOffset?: number;
  direction: "ltr" | "rtl";
  onLanguageChange: (value: AppLanguage) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onCalendarTypeChange?: (value: "hijri" | "gregorian") => void;
  onHijriDateOffsetChange?: (value: number) => void;
  zikrFont?: ZikrFontOption;
  onTextSizeChange: (value: TextSizeOption) => void;
  onZikrFontChange: (value: ZikrFontOption) => void;
  onShowTranslationChange: (value: boolean) => void;
  onShowTransliterationChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onReduceTransparencyChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onRemindersChange: (value: ReminderSettings) => void;
  onLocationChange?: (value: LocationSettings) => void;
  onWeeklyGoalDaysChange: (value: number) => void;
  onQuietProgressEnabledChange: (value: boolean) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onExportData: () => void;
  onRestoreData: (raw: string) => void;
  onResetPreferences: () => void;
  onClearLocalData: () => void;
  onDeleteAccount: () => void;
  initialSub?: SettingsSubScreen;
  onSubChange?: (panel: SettingsSubScreen) => void;
  onSubBack?: () => void;
}
