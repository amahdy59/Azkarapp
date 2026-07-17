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
      onlyWhenIncomplete: true,
    },
    weeklyGoalDays: 4,
  },
  profile: {
    displayName: "Guest",
    lastPhoneNumber: "",
    isGuest: true,
  },
  completed: {
    morning: [],
    evening: [],
    before_sleep: [],
  },
  sessions: [],
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
  fallback: ReminderSettings = DEFAULT_APP_STATE.settings.reminders,
): ReminderSettings {
  const candidate = value as Partial<ReminderSettings> | undefined;
  return {
    morning: {
      enabled: typeof candidate?.morning?.enabled === "boolean" ? candidate.morning.enabled : fallback.morning.enabled,
      time: isTime(candidate?.morning?.time) ? candidate.morning.time : fallback.morning.time,
    },
    evening: {
      enabled: typeof candidate?.evening?.enabled === "boolean" ? candidate.evening.enabled : fallback.evening.enabled,
      time: isTime(candidate?.evening?.time) ? candidate.evening.time : fallback.evening.time,
    },
    onlyWhenIncomplete:
      typeof candidate?.onlyWhenIncomplete === "boolean" ? candidate.onlyWhenIncomplete : fallback.onlyWhenIncomplete,
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

    const parsed = JSON.parse(raw) as Partial<AppStateSnapshot>;

    return {
      settings: {
        language:
          parsed.settings?.language && isLanguage(parsed.settings.language)
            ? parsed.settings.language
            : DEFAULT_APP_STATE.settings.language,
        darkMode:
          typeof parsed.settings?.darkMode === "boolean"
            ? parsed.settings.darkMode
            : DEFAULT_APP_STATE.settings.darkMode,
        themeMode:
          parsed.settings?.themeMode && isThemeMode(parsed.settings.themeMode)
            ? parsed.settings.themeMode
            : parsed.settings?.darkMode === false
              ? "light"
              : DEFAULT_APP_STATE.settings.themeMode,
        showTransliteration:
          typeof parsed.settings?.showTransliteration === "boolean"
            ? parsed.settings.showTransliteration
            : DEFAULT_APP_STATE.settings.showTransliteration,
        showTranslation:
          typeof parsed.settings?.showTranslation === "boolean"
            ? parsed.settings.showTranslation
            : DEFAULT_APP_STATE.settings.showTranslation,
        textSize:
          parsed.settings?.textSize && isTextSize(parsed.settings.textSize)
            ? parsed.settings.textSize
            : DEFAULT_APP_STATE.settings.textSize,
        arabicFont:
          parsed.settings?.arabicFont && isArabicFont(parsed.settings.arabicFont)
            ? parsed.settings.arabicFont
            : DEFAULT_APP_STATE.settings.arabicFont,
        highContrast:
          typeof parsed.settings?.highContrast === "boolean"
            ? parsed.settings.highContrast
            : DEFAULT_APP_STATE.settings.highContrast,
        boldText:
          typeof parsed.settings?.boldText === "boolean"
            ? parsed.settings.boldText
            : DEFAULT_APP_STATE.settings.boldText,
        reduceMotion:
          typeof parsed.settings?.reduceMotion === "boolean"
            ? parsed.settings.reduceMotion
            : DEFAULT_APP_STATE.settings.reduceMotion,
        hapticFeedback:
          typeof parsed.settings?.hapticFeedback === "boolean"
            ? parsed.settings.hapticFeedback
            : DEFAULT_APP_STATE.settings.hapticFeedback,
        forceRtl:
          typeof parsed.settings?.forceRtl === "boolean"
            ? parsed.settings.forceRtl
            : DEFAULT_APP_STATE.settings.forceRtl,
        colorBlindSupport:
          parsed.settings?.colorBlindSupport && isColorBlindSupport(parsed.settings.colorBlindSupport)
            ? parsed.settings.colorBlindSupport
            : DEFAULT_APP_STATE.settings.colorBlindSupport,
        reminders: normalizeReminders(parsed.settings?.reminders),
        weeklyGoalDays: isWeeklyGoalDays(parsed.settings?.weeklyGoalDays)
          ? parsed.settings.weeklyGoalDays
          : DEFAULT_APP_STATE.settings.weeklyGoalDays,
      },
      profile: {
        displayName: parsed.profile?.displayName?.trim() || DEFAULT_APP_STATE.profile.displayName,
        lastPhoneNumber: parsed.profile?.lastPhoneNumber || DEFAULT_APP_STATE.profile.lastPhoneNumber,
        isGuest:
          typeof parsed.profile?.isGuest === "boolean" ? parsed.profile.isGuest : DEFAULT_APP_STATE.profile.isGuest,
      },
      completed: {
        morning: dedupeAndSort(parsed.completed?.morning),
        evening: dedupeAndSort(parsed.completed?.evening),
        before_sleep: dedupeAndSort(parsed.completed?.before_sleep),
      },
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions.filter(
            (session): session is StoredSession =>
              !!session &&
              typeof session.id === "string" &&
              typeof session.category === "string" &&
              typeof session.completedAt === "string" &&
              typeof session.completedCount === "number" &&
              typeof session.totalCount === "number" &&
              typeof session.durationSeconds === "number" &&
              typeof session.isComplete === "boolean",
          )
        : [],
      // Reader-only saved items pre-date app-state persistence. Retain them the
      // first time a user upgrades so favorites become visible and syncable.
      savedZikrIds: Array.isArray(parsed.savedZikrIds)
        ? dedupeSavedZikrIds(parsed.savedZikrIds)
        : loadLegacySavedZikrIds(),
    };
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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const completed = {
    morning: dedupeAndSort([...(base.completed.morning ?? []), ...(incoming.completed?.morning ?? [])]),
    evening: dedupeAndSort([...(base.completed.evening ?? []), ...(incoming.completed?.evening ?? [])]),
    before_sleep: dedupeAndSort([...(base.completed.before_sleep ?? []), ...(incoming.completed?.before_sleep ?? [])]),
  };

  const sessions = new Map<string, StoredSession>();
  for (const session of base.sessions) {
    sessions.set(session.id, session);
  }
  for (const session of incoming.sessions ?? []) {
    sessions.set(session.id, session);
  }

  return {
    settings: {
      language:
        incoming.settings?.language && isLanguage(incoming.settings.language)
          ? incoming.settings.language
          : isLanguage(base.settings.language)
            ? base.settings.language
            : DEFAULT_APP_STATE.settings.language,
      darkMode: incoming.settings?.darkMode ?? base.settings.darkMode,
      themeMode: incoming.settings?.themeMode ?? base.settings.themeMode,
      showTransliteration: incoming.settings?.showTransliteration ?? base.settings.showTransliteration,
      showTranslation: incoming.settings?.showTranslation ?? base.settings.showTranslation,
      textSize: incoming.settings?.textSize ?? base.settings.textSize,
      arabicFont: incoming.settings?.arabicFont ?? base.settings.arabicFont,
      highContrast: incoming.settings?.highContrast ?? base.settings.highContrast,
      boldText: incoming.settings?.boldText ?? base.settings.boldText,
      reduceMotion: incoming.settings?.reduceMotion ?? base.settings.reduceMotion,
      hapticFeedback: incoming.settings?.hapticFeedback ?? base.settings.hapticFeedback,
      forceRtl: incoming.settings?.forceRtl ?? base.settings.forceRtl,
      colorBlindSupport: incoming.settings?.colorBlindSupport ?? base.settings.colorBlindSupport,
      reminders: normalizeReminders(incoming.settings?.reminders, base.settings.reminders),
      weeklyGoalDays: isWeeklyGoalDays(incoming.settings?.weeklyGoalDays)
        ? incoming.settings.weeklyGoalDays
        : base.settings.weeklyGoalDays,
    },
    profile: {
      displayName: incoming.profile?.displayName?.trim() || base.profile.displayName,
      lastPhoneNumber: incoming.profile?.lastPhoneNumber ?? base.profile.lastPhoneNumber,
      isGuest: incoming.profile?.isGuest ?? base.profile.isGuest,
    },
    completed,
    sessions: [...sessions.values()].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    ),
    savedZikrIds: dedupeSavedZikrIds([...(base.savedZikrIds ?? []), ...(incoming.savedZikrIds ?? [])]),
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Calculates current and longest session streaks based on user activity history.
 * A streak increments for consecutive days with at least one completed session.
 *
 * @param {StoredSession[]} sessions - The array of historical sessions.
 * @returns {{ currentStreak: number, longestStreak: number }} The streak summary statistics.
 */
export function getStreakSummary(sessions: StoredSession[]) {
  const completedDays = [
    ...new Set(
      sessions
        .filter((session) => session.isComplete)
        .map((session) => startOfDay(new Date(session.completedAt)).toISOString()),
    ),
  ]
    .map((value) => new Date(value))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let runLength = 0;

  for (let index = 0; index < completedDays.length; index += 1) {
    const completedDay = completedDays[index];
    if (!completedDay) {
      continue;
    }

    if (index === 0) {
      runLength = 1;
      const today = startOfDay(new Date());
      const diffDays = Math.round((today.getTime() - completedDay.getTime()) / 86400000);
      currentStreak = diffDays <= 1 ? 1 : 0;
      longestStreak = 1;
      continue;
    }

    const previousCompletedDay = completedDays[index - 1];
    if (!previousCompletedDay) {
      continue;
    }

    const diffDays = Math.round((previousCompletedDay.getTime() - completedDay.getTime()) / 86400000);
    runLength = diffDays === 1 ? runLength + 1 : 1;
    longestStreak = Math.max(longestStreak, runLength);

    if (currentStreak === index && diffDays === 1) {
      currentStreak += 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
