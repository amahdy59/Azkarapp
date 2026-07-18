import type {
  AppLanguage,
  AppStateSnapshot,
  ArabicFontOption,
  CategoryId,
  ColorBlindSupport,
  ReminderSettings,
  StoredSession,
  ThemeMode,
} from "./types";
import {
  DEFAULT_PROGRESS_DAY_START_HOUR,
  deriveDailyCompletionsFromLegacySessions,
  mergeDailyCompletions,
  normalizeDailyCompletions,
} from "./progress";
import { getCategoryTotal } from "./content/azkar";

export type { AppLanguage, AppStateSnapshot, CategoryId, StoredSession } from "./types";

const STORAGE_KEY = "azkarapp.state.v1";
const LEGACY_SAVED_ZIKR_STORAGE_KEY = "azkarapp.saved-zikr.v1";

export const DEFAULT_APP_STATE: AppStateSnapshot = {
  settings: {
    language: "en",
    darkMode: true,
    themeMode: "midnight",
    showTransliteration: false,
    showTranslation: false,
    textSize: "medium",
    arabicFont: "ibm_plex",
    highContrast: false,
    boldText: false,
    reduceMotion: false,
    hapticFeedback: true,
    forceRtl: false,
    colorBlindSupport: "none",
    reminders: {
      morning: { enabled: false, time: "07:30" },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: false, time: "22:00" },
      onlyWhenIncomplete: true,
    },
    weeklyGoalDays: 4,
    quietProgressEnabled: true,
    progressDayStartHour: DEFAULT_PROGRESS_DAY_START_HOUR,
  },
  profile: {
    displayName: "Guest",
    lastPhoneNumber: "",
    isGuest: true,
    accountUserId: "",
  },
  completed: {
    morning: [],
    evening: [],
    before_sleep: [],
  },
  sessions: [],
  dailyCompletions: [],
  savedZikrIds: [],
};

function isLanguage(value: string): value is AppLanguage {
  return ["en", "ar"].includes(value);
}

function isTextSize(value: string): value is AppStateSnapshot["settings"]["textSize"] {
  return ["small", "medium", "large"].includes(value);
}

function isArabicFont(value: string): value is ArabicFontOption {
  return ["ibm_plex", "noto_sans"].includes(value);
}

function isWeeklyGoalDays(value: unknown): value is number {
  return typeof value === "number" && [3, 4, 5, 7].includes(value);
}

function isProgressDayStartHour(value: unknown): value is number {
  return typeof value === "number" && [0, 2, 4, 6].includes(value);
}

function isColorBlindSupport(value: string): value is ColorBlindSupport {
  return ["none", "deuteranopia", "protanopia", "tritanopia"].includes(value);
}

function isThemeMode(value: string): value is ThemeMode {
  return ["midnight", "light", "dark"].includes(value);
}

function isTime(value: unknown): value is string {
  if (typeof value !== "string" || !/^[0-9]{2}:[0-9]{2}$/.test(value)) {
    return false;
  }

  const [hour = -1, minute = -1] = value.split(":").map(Number);
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function normalizeReminders(
  value: unknown,
  fallback: Partial<ReminderSettings> = DEFAULT_APP_STATE.settings.reminders,
): ReminderSettings {
  const candidate = value as Partial<ReminderSettings> | undefined;
  const defaultReminders = DEFAULT_APP_STATE.settings.reminders;
  const morningFallback = {
    enabled:
      typeof fallback?.morning?.enabled === "boolean" ? fallback.morning.enabled : defaultReminders.morning.enabled,
    time: isTime(fallback?.morning?.time) ? fallback.morning.time : defaultReminders.morning.time,
  };
  const eveningFallback = {
    enabled:
      typeof fallback?.evening?.enabled === "boolean" ? fallback.evening.enabled : defaultReminders.evening.enabled,
    time: isTime(fallback?.evening?.time) ? fallback.evening.time : defaultReminders.evening.time,
  };
  const beforeSleepFallback = {
    enabled:
      typeof fallback?.before_sleep?.enabled === "boolean"
        ? fallback.before_sleep.enabled
        : defaultReminders.before_sleep.enabled,
    time: isTime(fallback?.before_sleep?.time) ? fallback.before_sleep.time : defaultReminders.before_sleep.time,
  };
  return {
    morning: {
      enabled: typeof candidate?.morning?.enabled === "boolean" ? candidate.morning.enabled : morningFallback.enabled,
      time: isTime(candidate?.morning?.time) ? candidate.morning.time : morningFallback.time,
    },
    evening: {
      enabled: typeof candidate?.evening?.enabled === "boolean" ? candidate.evening.enabled : eveningFallback.enabled,
      time: isTime(candidate?.evening?.time) ? candidate.evening.time : eveningFallback.time,
    },
    before_sleep: {
      enabled:
        typeof candidate?.before_sleep?.enabled === "boolean"
          ? candidate.before_sleep.enabled
          : beforeSleepFallback.enabled,
      time: isTime(candidate?.before_sleep?.time) ? candidate.before_sleep.time : beforeSleepFallback.time,
    },
    onlyWhenIncomplete:
      typeof candidate?.onlyWhenIncomplete === "boolean"
        ? candidate.onlyWhenIncomplete
        : typeof fallback?.onlyWhenIncomplete === "boolean"
          ? fallback.onlyWhenIncomplete
          : defaultReminders.onlyWhenIncomplete,
  };
}

function dedupeAndSort(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.filter((value): value is number => Number.isInteger(value) && value >= 0))].sort(
    (a, b) => a - b,
  );
}

function normalizeCompletedIndexes(values: unknown, category: CategoryId) {
  const total = getCategoryTotal(category);
  return dedupeAndSort(values).filter((value) => value < total);
}

function dedupeSavedZikrIds(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))].sort();
}

function loadLegacySavedZikrIds() {
  try {
    return dedupeSavedZikrIds(JSON.parse(window.localStorage.getItem(LEGACY_SAVED_ZIKR_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<StoredSession>;
  return (
    typeof session.id === "string" &&
    typeof session.category === "string" &&
    ["morning", "evening", "before_sleep"].includes(session.category) &&
    typeof session.completedAt === "string" &&
    !Number.isNaN(Date.parse(session.completedAt)) &&
    typeof session.completedCount === "number" &&
    Number.isFinite(session.completedCount) &&
    typeof session.totalCount === "number" &&
    Number.isFinite(session.totalCount) &&
    typeof session.durationSeconds === "number" &&
    Number.isFinite(session.durationSeconds) &&
    typeof session.isComplete === "boolean"
  );
}

/** Converts untrusted persisted or remote data into a complete, render-safe snapshot. */
export function normalizeAppState(value: unknown, fallbackSavedZikrIds: string[] = []): AppStateSnapshot {
  const parsed = value && typeof value === "object" ? (value as Partial<AppStateSnapshot>) : {};
  const settings = parsed.settings as Partial<AppStateSnapshot["settings"]> | undefined;
  const progressDayStartHour = isProgressDayStartHour(settings?.progressDayStartHour)
    ? settings.progressDayStartHour
    : DEFAULT_APP_STATE.settings.progressDayStartHour;
  const sessions = Array.isArray(parsed.sessions) ? parsed.sessions.filter(isStoredSession) : [];
  const dailyCompletions = Array.isArray(parsed.dailyCompletions)
    ? normalizeDailyCompletions(parsed.dailyCompletions)
    : deriveDailyCompletionsFromLegacySessions(sessions, progressDayStartHour);

  return {
    settings: {
      language:
        settings?.language && isLanguage(settings.language) ? settings.language : DEFAULT_APP_STATE.settings.language,
      darkMode: typeof settings?.darkMode === "boolean" ? settings.darkMode : DEFAULT_APP_STATE.settings.darkMode,
      themeMode:
        settings?.themeMode && isThemeMode(settings.themeMode)
          ? settings.themeMode
          : settings?.darkMode === false
            ? "light"
            : DEFAULT_APP_STATE.settings.themeMode,
      showTransliteration:
        typeof settings?.showTransliteration === "boolean"
          ? settings.showTransliteration
          : DEFAULT_APP_STATE.settings.showTransliteration,
      showTranslation:
        typeof settings?.showTranslation === "boolean"
          ? settings.showTranslation
          : DEFAULT_APP_STATE.settings.showTranslation,
      textSize:
        settings?.textSize && isTextSize(settings.textSize) ? settings.textSize : DEFAULT_APP_STATE.settings.textSize,
      arabicFont:
        settings?.arabicFont && isArabicFont(settings.arabicFont)
          ? settings.arabicFont
          : DEFAULT_APP_STATE.settings.arabicFont,
      highContrast:
        typeof settings?.highContrast === "boolean" ? settings.highContrast : DEFAULT_APP_STATE.settings.highContrast,
      boldText: typeof settings?.boldText === "boolean" ? settings.boldText : DEFAULT_APP_STATE.settings.boldText,
      reduceMotion:
        typeof settings?.reduceMotion === "boolean" ? settings.reduceMotion : DEFAULT_APP_STATE.settings.reduceMotion,
      hapticFeedback:
        typeof settings?.hapticFeedback === "boolean"
          ? settings.hapticFeedback
          : DEFAULT_APP_STATE.settings.hapticFeedback,
      forceRtl: typeof settings?.forceRtl === "boolean" ? settings.forceRtl : DEFAULT_APP_STATE.settings.forceRtl,
      colorBlindSupport:
        settings?.colorBlindSupport && isColorBlindSupport(settings.colorBlindSupport)
          ? settings.colorBlindSupport
          : DEFAULT_APP_STATE.settings.colorBlindSupport,
      reminders: normalizeReminders(settings?.reminders),
      weeklyGoalDays: isWeeklyGoalDays(settings?.weeklyGoalDays)
        ? settings.weeklyGoalDays
        : DEFAULT_APP_STATE.settings.weeklyGoalDays,
      quietProgressEnabled:
        typeof settings?.quietProgressEnabled === "boolean"
          ? settings.quietProgressEnabled
          : DEFAULT_APP_STATE.settings.quietProgressEnabled,
      progressDayStartHour,
    },
    profile: {
      displayName:
        typeof parsed.profile?.displayName === "string" && parsed.profile.displayName.trim()
          ? parsed.profile.displayName.trim()
          : DEFAULT_APP_STATE.profile.displayName,
      lastPhoneNumber:
        typeof parsed.profile?.lastPhoneNumber === "string"
          ? parsed.profile.lastPhoneNumber
          : DEFAULT_APP_STATE.profile.lastPhoneNumber,
      isGuest:
        typeof parsed.profile?.isGuest === "boolean" ? parsed.profile.isGuest : DEFAULT_APP_STATE.profile.isGuest,
      accountUserId:
        typeof parsed.profile?.accountUserId === "string"
          ? parsed.profile.accountUserId
          : DEFAULT_APP_STATE.profile.accountUserId,
    },
    completed: {
      morning: normalizeCompletedIndexes(parsed.completed?.morning, "morning"),
      evening: normalizeCompletedIndexes(parsed.completed?.evening, "evening"),
      before_sleep: normalizeCompletedIndexes(parsed.completed?.before_sleep, "before_sleep"),
    },
    sessions,
    dailyCompletions,
    savedZikrIds: Array.isArray(parsed.savedZikrIds)
      ? dedupeSavedZikrIds(parsed.savedZikrIds)
      : dedupeSavedZikrIds(fallbackSavedZikrIds),
  };
}

/**
 * Loads the application state from local storage.
 * If no state is found or an error occurs during parsing, the default application state is returned.
 * It also performs validation and fallback for every configuration property.
 *
 * @returns {AppStateSnapshot} The merged application state.
 */
export function loadAppState(): AppStateSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_APP_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_APP_STATE,
        savedZikrIds: loadLegacySavedZikrIds(),
      };
    }

    return normalizeAppState(JSON.parse(raw), loadLegacySavedZikrIds());
  } catch {
    return DEFAULT_APP_STATE;
  }
}

/**
 * Persists the application state to local storage.
 *
 * @param {AppStateSnapshot} state - The application state to be saved.
 */
export function saveAppState(state: AppStateSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAppState(state)));
  } catch {
    // Storage can be denied or full. Persistence failure must never blank the app.
  }
}

/** Resets preferences while preserving progress, sessions, saved items, and account metadata. */
export function resetStoredSettings() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const existing = normalizeAppState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}"));
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...existing,
        settings: DEFAULT_APP_STATE.settings,
      }),
    );
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The recovery screen can still reload with in-memory defaults.
    }
  }
}

/** Removes only Azkar-owned local data, leaving unrelated origin storage untouched. */
export function clearStoredAppData() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of [
    STORAGE_KEY,
    LEGACY_SAVED_ZIKR_STORAGE_KEY,
    "azkarapp.foreground-reminders.v1",
    "azkarapp.install-dismissed",
    "azkarapp.onboarding-complete.v1",
  ]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Continue clearing any remaining app-owned keys when storage is partially unavailable.
    }
  }
}

/**
 * Converts arrays of completed Azkar indices into sets for optimized lookup.
 *
 * @param {AppStateSnapshot["completed"]} completed - The plain object containing arrays of completed indices.
 * @returns {Record<CategoryId, Set<number>>} A dictionary mapping category IDs to sets of completed indices.
 */
export function toCompletedSets(completed: AppStateSnapshot["completed"]): Record<CategoryId, Set<number>> {
  return {
    morning: new Set(completed.morning),
    evening: new Set(completed.evening),
    before_sleep: new Set(completed.before_sleep),
  };
}

/**
 * Converts sets of completed Azkar indices back into sorted arrays for persistence.
 *
 * @param {Record<CategoryId, Set<number>>} completed - The dictionary mapping category IDs to sets of completed indices.
 * @returns {AppStateSnapshot["completed"]} A plain object containing sorted arrays of completed indices.
 */
export function fromCompletedSets(completed: Record<CategoryId, Set<number>>): AppStateSnapshot["completed"] {
  return {
    morning: [...completed.morning].sort((a, b) => a - b),
    evening: [...completed.evening].sort((a, b) => a - b),
    before_sleep: [...completed.before_sleep].sort((a, b) => a - b),
  };
}

/**
 * Merges an incoming partial state update into a base application state.
 * Deduplicates and sorts arrays (e.g., completed indices) and merges session history.
 *
 * @param {AppStateSnapshot} base - The existing application state.
 * @param {Partial<AppStateSnapshot>} incoming - The new state changes to merge.
 * @returns {AppStateSnapshot} A new, immutably updated application state object.
 */
export function mergeAppStates(base: AppStateSnapshot, incoming: Partial<AppStateSnapshot>): AppStateSnapshot {
  const safeBase = normalizeAppState(base);
  const completed = {
    morning: normalizeCompletedIndexes(
      [...(safeBase.completed.morning ?? []), ...(incoming.completed?.morning ?? [])],
      "morning",
    ),
    evening: normalizeCompletedIndexes(
      [...(safeBase.completed.evening ?? []), ...(incoming.completed?.evening ?? [])],
      "evening",
    ),
    before_sleep: normalizeCompletedIndexes(
      [...(safeBase.completed.before_sleep ?? []), ...(incoming.completed?.before_sleep ?? [])],
      "before_sleep",
    ),
  };

  const sessions = new Map<string, StoredSession>();
  for (const session of safeBase.sessions) {
    sessions.set(session.id, session);
  }
  for (const session of incoming.sessions ?? []) {
    if (isStoredSession(session)) {
      sessions.set(session.id, session);
    }
  }

  return {
    settings: {
      language:
        incoming.settings?.language && isLanguage(incoming.settings.language)
          ? incoming.settings.language
          : isLanguage(safeBase.settings.language)
            ? safeBase.settings.language
            : DEFAULT_APP_STATE.settings.language,
      darkMode:
        typeof incoming.settings?.darkMode === "boolean" ? incoming.settings.darkMode : safeBase.settings.darkMode,
      themeMode:
        incoming.settings?.themeMode && isThemeMode(incoming.settings.themeMode)
          ? incoming.settings.themeMode
          : safeBase.settings.themeMode,
      showTransliteration:
        typeof incoming.settings?.showTransliteration === "boolean"
          ? incoming.settings.showTransliteration
          : safeBase.settings.showTransliteration,
      showTranslation:
        typeof incoming.settings?.showTranslation === "boolean"
          ? incoming.settings.showTranslation
          : safeBase.settings.showTranslation,
      textSize:
        incoming.settings?.textSize && isTextSize(incoming.settings.textSize)
          ? incoming.settings.textSize
          : safeBase.settings.textSize,
      arabicFont:
        incoming.settings?.arabicFont && isArabicFont(incoming.settings.arabicFont)
          ? incoming.settings.arabicFont
          : safeBase.settings.arabicFont,
      highContrast:
        typeof incoming.settings?.highContrast === "boolean"
          ? incoming.settings.highContrast
          : safeBase.settings.highContrast,
      boldText:
        typeof incoming.settings?.boldText === "boolean" ? incoming.settings.boldText : safeBase.settings.boldText,
      reduceMotion:
        typeof incoming.settings?.reduceMotion === "boolean"
          ? incoming.settings.reduceMotion
          : safeBase.settings.reduceMotion,
      hapticFeedback:
        typeof incoming.settings?.hapticFeedback === "boolean"
          ? incoming.settings.hapticFeedback
          : safeBase.settings.hapticFeedback,
      forceRtl:
        typeof incoming.settings?.forceRtl === "boolean" ? incoming.settings.forceRtl : safeBase.settings.forceRtl,
      colorBlindSupport:
        incoming.settings?.colorBlindSupport && isColorBlindSupport(incoming.settings.colorBlindSupport)
          ? incoming.settings.colorBlindSupport
          : safeBase.settings.colorBlindSupport,
      reminders: normalizeReminders(incoming.settings?.reminders, safeBase.settings.reminders),
      weeklyGoalDays: isWeeklyGoalDays(incoming.settings?.weeklyGoalDays)
        ? incoming.settings.weeklyGoalDays
        : safeBase.settings.weeklyGoalDays,
      quietProgressEnabled:
        typeof incoming.settings?.quietProgressEnabled === "boolean"
          ? incoming.settings.quietProgressEnabled
          : safeBase.settings.quietProgressEnabled,
      progressDayStartHour: isProgressDayStartHour(incoming.settings?.progressDayStartHour)
        ? incoming.settings.progressDayStartHour
        : safeBase.settings.progressDayStartHour,
    },
    profile: {
      displayName: incoming.profile?.displayName?.trim() || safeBase.profile.displayName,
      lastPhoneNumber: incoming.profile?.lastPhoneNumber ?? safeBase.profile.lastPhoneNumber,
      isGuest: incoming.profile?.isGuest ?? safeBase.profile.isGuest,
      accountUserId: incoming.profile?.accountUserId ?? safeBase.profile.accountUserId,
    },
    completed,
    sessions: [...sessions.values()].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    ),
    dailyCompletions: mergeDailyCompletions(
      safeBase.dailyCompletions,
      Array.isArray(incoming.dailyCompletions)
        ? normalizeDailyCompletions(incoming.dailyCompletions)
        : deriveDailyCompletionsFromLegacySessions(
            incoming.sessions ?? [],
            isProgressDayStartHour(incoming.settings?.progressDayStartHour)
              ? incoming.settings.progressDayStartHour
              : safeBase.settings.progressDayStartHour,
          ),
    ),
    savedZikrIds: dedupeSavedZikrIds([...(safeBase.savedZikrIds ?? []), ...(incoming.savedZikrIds ?? [])]),
  };
}

/** Preserves device preferences while removing all private data owned by a guest or signed-in account. */
export function clearPrivateAppData(state: AppStateSnapshot): AppStateSnapshot {
  const safeState = normalizeAppState(state);
  return {
    ...safeState,
    profile: { ...DEFAULT_APP_STATE.profile },
    completed: { morning: [], evening: [], before_sleep: [] },
    sessions: [],
    dailyCompletions: [],
    savedZikrIds: [],
  };
}
