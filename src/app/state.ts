import type {
  AppLanguage,
  AppStateSnapshot,
  ArabicFontOption,
  CategoryId,
  ColorBlindSupport,
  LocationSettings,
  ReminderSettings,
  StoredSession,
  ThemeMode,
} from "./types";
import {
  CATEGORY_IDS,
  DEFAULT_PROGRESS_DAY_START_HOUR,
  deriveDailyCompletionsFromLegacySessions,
  getProgressDayKey,
  mergeDailyCompletions,
  normalizeDailyCompletions,
} from "./progress";
import { ALL_AZKAR, getAzkarByCategory } from "./content/azkar";
import { CALCULATION_METHODS, DEFAULT_LOCATION } from "./content/prayerCalculation";

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
    calendarType: "hijri",
    routineModes: {
      morning: "core",
      evening: "core",
      before_sleep: "core",
    },
    location: DEFAULT_LOCATION,
  },
  profile: {
    displayName: "Guest",
    email: "",
    phone: "",
    avatarUrl: "",
    isGuest: true,
    accountUserId: "",
  },
  completed: Object.fromEntries(CATEGORY_IDS.map((id) => [id, []])) as unknown as Record<CategoryId, string[]>,
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

function normalizeRoutineModes(value: unknown): AppStateSnapshot["settings"]["routineModes"] {
  const candidate =
    value && typeof value === "object" ? (value as Partial<AppStateSnapshot["settings"]["routineModes"]>) : {};
  return {
    morning: candidate.morning === "complete" ? "complete" : "core",
    evening: candidate.evening === "complete" ? "complete" : "core",
    before_sleep: candidate.before_sleep === "complete" ? "complete" : "core",
  };
}

/** Pre-arrangement order used only to migrate legacy numeric completion indexes safely. */
const LEGACY_ROUTINE_ORDER: Partial<Record<CategoryId, string[]>> = {
  morning: [
    "m-hm-75a",
    "m-hm-75",
    "m-hm-76a",
    "m-hm-76b",
    "m-hm-76c",
    "m-hm-77m",
    "m-hm-89m",
    "m-hm-90m",
    "m-hm-78m",
    "m-hm-79",
    "m-hm-80m",
    "m-hm-81m",
    "m-hm-82",
    "m-hm-83",
    "m-hm-84",
    "m-hm-85",
    "m-hm-86",
    "m-hm-87",
    "m-hm-88",
    "m-hm-91",
    "m-hm-93",
    "m-hm-94",
    "m-hm-95",
    "m-hm-96",
    "m-hm-98",
  ],
  evening: [
    "e-hm-75a",
    "e-hm-75",
    "e-hm-76a",
    "e-hm-76b",
    "e-hm-76c",
    "e-hm-77e",
    "e-hm-89e",
    "e-hm-90e",
    "e-hm-78e",
    "e-hm-79",
    "e-hm-80e",
    "e-hm-81e",
    "e-hm-82",
    "e-hm-83",
    "e-hm-84",
    "e-hm-85",
    "e-hm-86",
    "e-hm-87",
    "e-hm-88",
    "e-hm-91",
    "e-hm-92",
    "e-hm-96",
    "e-hm-97",
    "e-hm-98",
  ],
  before_sleep: [
    "s-hm-99-ikhlas",
    "s-hm-99-falaq",
    "s-hm-99-nas",
    "s-hm-100",
    "s-hm-101",
    "s-hm-109a",
    "s-hm-110a",
    "s-hm-110b",
    "s-hm-106-subhanallah",
    "s-hm-106-alhamdulillah",
    "s-hm-106-allahu-akbar",
    "s-hm-102",
    "s-hm-105",
    "s-hm-104",
    "s-hm-108",
    "s-hm-107",
    "s-hm-109",
    "s-hm-111",
  ],
};

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

const isLazyZikrId = (value: string) => /^(friday|comprehensive)-dua-/.test(value);

function normalizeCompletedIds(values: unknown, category: CategoryId) {
  if (!Array.isArray(values)) {
    return [];
  }

  const zikrIds = getAzkarByCategory(category).map((zikr) => zikr.id);
  const acceptsLazyIds = zikrIds.length === 0;
  const legacyZikrIds = LEGACY_ROUTINE_ORDER[category] ?? zikrIds;
  const validIds = new Set(zikrIds);
  return [
    ...new Set(
      values
        .map((value) =>
          typeof value === "string"
            ? value
            : Number.isInteger(value) && Number(value) >= 0
              ? legacyZikrIds[Number(value)]
              : undefined,
        )
        .filter(
          (value): value is string =>
            typeof value === "string" && (acceptsLazyIds ? isLazyZikrId(value) : validIds.has(value)),
        ),
    ),
  ].sort();
}

function dedupeSavedZikrIds(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" && (ALL_AZKAR.some((zikr) => zikr.id === value) || isLazyZikrId(value)),
      ),
    ),
  ].sort();
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
    (CATEGORY_IDS as string[]).includes(session.category) &&
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

function normalizeLocation(value: unknown, fallback: LocationSettings = DEFAULT_LOCATION): LocationSettings {
  const location = value && typeof value === "object" ? (value as Partial<LocationSettings>) : {};
  const validLatitude =
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90;
  const validLongitude =
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180;
  const calculationMethod =
    typeof location.calculationMethod === "number" && CALCULATION_METHODS[location.calculationMethod]
      ? location.calculationMethod
      : fallback.calculationMethod;
  const adjustmentSource = location.adjustments && typeof location.adjustments === "object" ? location.adjustments : {};
  const adjustmentNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
  const adjustments = Object.fromEntries(
    adjustmentNames.map((name) => {
      const value = adjustmentSource[name];
      return [
        name,
        typeof value === "number" && Number.isFinite(value) ? Math.max(-120, Math.min(120, Math.round(value))) : 0,
      ];
    }),
  ) as NonNullable<LocationSettings["adjustments"]>;

  return {
    latitude: validLatitude ? location.latitude : fallback.latitude,
    longitude: validLongitude ? location.longitude : fallback.longitude,
    cityName:
      typeof location.cityName === "string" && location.cityName.trim()
        ? location.cityName.trim().slice(0, 100)
        : fallback.cityName,
    calculationMethod,
    autoDetect: typeof location.autoDetect === "boolean" ? location.autoDetect : fallback.autoDetect,
    timeZone:
      typeof location.timeZone === "string" && location.timeZone.trim() ? location.timeZone.trim() : fallback.timeZone,
    adjustments,
  };
}

/** Converts untrusted persisted or remote data into a complete, render-safe snapshot. */
export function normalizeAppState(value: unknown, fallbackSavedZikrIds: string[] = []): AppStateSnapshot {
  const parsed = value && typeof value === "object" ? (value as Partial<AppStateSnapshot>) : {};
  const settings = parsed.settings as Partial<AppStateSnapshot["settings"]> | undefined;
  const legacyProfile = parsed.profile as unknown as { lastPhoneNumber?: unknown } | undefined;
  const progressDayStartHour = isProgressDayStartHour(settings?.progressDayStartHour)
    ? settings.progressDayStartHour
    : DEFAULT_APP_STATE.settings.progressDayStartHour;
  const sessions = Array.isArray(parsed.sessions) ? parsed.sessions.filter(isStoredSession) : [];
  const dailyCompletions = Array.isArray(parsed.dailyCompletions)
    ? normalizeDailyCompletions(parsed.dailyCompletions)
    : deriveDailyCompletionsFromLegacySessions(sessions, progressDayStartHour);

  const currentDayKey = getProgressDayKey(new Date(), progressDayStartHour);
  const lastActiveDayKey = typeof parsed.lastActiveDayKey === "string" ? parsed.lastActiveDayKey : "";
  const isNewDay = lastActiveDayKey !== "" && lastActiveDayKey !== currentDayKey;

  const completed = Object.fromEntries(
    CATEGORY_IDS.map((id) => {
      const isDailyRoutine = ["morning", "evening", "before_sleep", "waking_up", "after_prayer"].includes(id);
      if (isNewDay && isDailyRoutine) {
        return [id, []];
      }
      return [id, normalizeCompletedIds(parsed.completed?.[id], id)];
    }),
  ) as Record<CategoryId, string[]>;

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
      calendarType:
        settings?.calendarType === "hijri" || settings?.calendarType === "gregorian"
          ? settings.calendarType
          : (DEFAULT_APP_STATE.settings.calendarType ?? "hijri"),
      routineModes: normalizeRoutineModes(settings?.routineModes),
      location: normalizeLocation(settings?.location),
    },
    profile: {
      displayName:
        typeof parsed.profile?.displayName === "string" && parsed.profile.displayName.trim()
          ? parsed.profile.displayName.trim()
          : DEFAULT_APP_STATE.profile.displayName,
      email: typeof parsed.profile?.email === "string" ? parsed.profile.email.trim() : DEFAULT_APP_STATE.profile.email,
      phone:
        typeof parsed.profile?.phone === "string"
          ? parsed.profile.phone
          : typeof legacyProfile?.lastPhoneNumber === "string"
            ? legacyProfile.lastPhoneNumber
            : DEFAULT_APP_STATE.profile.phone,
      avatarUrl:
        typeof parsed.profile?.avatarUrl === "string"
          ? parsed.profile.avatarUrl.trim()
          : DEFAULT_APP_STATE.profile.avatarUrl,
      isGuest:
        typeof parsed.profile?.isGuest === "boolean" ? parsed.profile.isGuest : DEFAULT_APP_STATE.profile.isGuest,
      accountUserId:
        typeof parsed.profile?.accountUserId === "string"
          ? parsed.profile.accountUserId
          : DEFAULT_APP_STATE.profile.accountUserId,
    },
    completed,
    sessions,
    dailyCompletions,
    savedZikrIds: Array.isArray(parsed.savedZikrIds)
      ? dedupeSavedZikrIds(parsed.savedZikrIds)
      : dedupeSavedZikrIds(fallbackSavedZikrIds),
    ...(typeof parsed.lastActiveDayKey === "string" ? { lastActiveDayKey: currentDayKey } : {}),
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
    const dayKey = getProgressDayKey(new Date(), state.settings.progressDayStartHour);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAppState({ ...state, lastActiveDayKey: dayKey })));
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
 * Converts arrays of completed zikr IDs into sets for optimized lookup.
 *
 * @param {AppStateSnapshot["completed"]} completed - The plain object containing arrays of completed indices.
 * @returns {Record<CategoryId, Set<string>>} A dictionary mapping category IDs to sets of completed zikr IDs.
 */
export function toCompletedSets(completed: AppStateSnapshot["completed"]): Record<CategoryId, Set<string>> {
  const result = {} as Record<CategoryId, Set<string>>;
  for (const id of CATEGORY_IDS) {
    result[id] = new Set(completed[id] ?? []);
  }
  return result;
}

/**
 * Converts sets of completed zikr IDs back into sorted arrays for persistence.
 *
 * @param {Record<CategoryId, Set<string>>} completed - The dictionary mapping category IDs to completed zikr IDs.
 * @returns {AppStateSnapshot["completed"]} A plain object containing sorted zikr ID arrays.
 */
export function fromCompletedSets(completed: Record<CategoryId, Set<string>>): AppStateSnapshot["completed"] {
  const result = {} as AppStateSnapshot["completed"];
  for (const id of CATEGORY_IDS) {
    result[id] = [...(completed[id] ?? [])].sort();
  }
  return result;
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
  const completed = {} as Record<CategoryId, string[]>;
  for (const id of CATEGORY_IDS) {
    completed[id] = normalizeCompletedIds([...(safeBase.completed[id] ?? []), ...(incoming.completed?.[id] ?? [])], id);
  }

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
      calendarType:
        incoming.settings?.calendarType === "hijri" || incoming.settings?.calendarType === "gregorian"
          ? incoming.settings.calendarType
          : (safeBase.settings.calendarType ?? "hijri"),
      routineModes: normalizeRoutineModes(incoming.settings?.routineModes ?? safeBase.settings.routineModes),
      location: normalizeLocation(incoming.settings?.location, safeBase.settings.location ?? DEFAULT_LOCATION),
    },
    profile: {
      displayName: incoming.profile?.displayName?.trim() || safeBase.profile.displayName,
      email: incoming.profile?.email?.trim() ?? safeBase.profile.email,
      phone: incoming.profile?.phone ?? safeBase.profile.phone,
      avatarUrl: incoming.profile?.avatarUrl?.trim() ?? safeBase.profile.avatarUrl,
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
    completed: Object.fromEntries(CATEGORY_IDS.map((id) => [id, []])) as unknown as Record<CategoryId, string[]>,
    sessions: [],
    dailyCompletions: [],
    savedZikrIds: [],
  };
}
