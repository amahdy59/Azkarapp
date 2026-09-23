import type { AppStateSnapshot, UserSettingsState } from "../app/types";

export type RemoteSyncSnapshot = Omit<AppStateSnapshot, "settings" | "profile"> & {
  settings: Omit<UserSettingsState, "location">;
  profile?: {
    displayName: string;
  };
};

export const FORBIDDEN_SYNC_KEYS = new Set([
  "latitude",
  "longitude",
  "cityName",
  "email",
  "phone",
  "accountUserId",
  "avatarUrl",
]);

/**
 * Recursively scans an object for any forbidden privacy or device-local keys.
 * Throws immediately if a forbidden key is encountered.
 */
export function assertNoForbiddenSyncFields(data: unknown, path = ""): void {
  if (!data || typeof data !== "object") return;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      assertNoForbiddenSyncFields(data[i], `${path}[${i}]`);
    }
    return;
  }

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_SYNC_KEYS.has(key) || currentPath === "settings.location") {
      throw new Error(`Forbidden sync field detected: ${currentPath}`);
    }
    assertNoForbiddenSyncFields(value, currentPath);
  }
}

/**
 * Builds an authoritative, privacy-safe remote synchronization snapshot.
 *
 * Excludes precise coordinates (latitude, longitude, cityName) which must
 * remain device-local according to docs/ARCHITECTURE.md.
 * Excludes private profile identity and contact fields (email, phone, accountUserId, avatarUrl).
 * Bounds session history to the newest 100 entries.
 */
export function buildRemoteSyncSnapshot(state: AppStateSnapshot): RemoteSyncSnapshot {
  const safeSettings: Omit<UserSettingsState, "location"> = {
    language: state.settings.language,
    darkMode: state.settings.darkMode,
    themeMode: state.settings.themeMode,
    showTransliteration: state.settings.showTransliteration,
    showTranslation: state.settings.showTranslation,
    textSize: state.settings.textSize,
    zikrFont: state.settings.zikrFont,
    highContrast: state.settings.highContrast,
    boldText: state.settings.boldText,
    reduceMotion: state.settings.reduceMotion,
    reduceTransparency: state.settings.reduceTransparency,
    hapticFeedback: state.settings.hapticFeedback,
    forceRtl: state.settings.forceRtl,
    colorBlindSupport: state.settings.colorBlindSupport,
    reminders: state.settings.reminders,
    weeklyGoalDays: state.settings.weeklyGoalDays,
    mosquePrayerGoal: state.settings.mosquePrayerGoal,
    dailyPathStartDayKey: state.settings.dailyPathStartDayKey,
    quietProgressEnabled: state.settings.quietProgressEnabled,
    progressDayStartHour: state.settings.progressDayStartHour,
    calendarType: state.settings.calendarType,
    routineModes: state.settings.routineModes,
  };

  const safeProfile = {
    displayName: state.profile?.displayName?.trim() || "",
  };

  // Sessions capped to newest 100
  const sortedSessions = Array.isArray(state.sessions)
    ? [...state.sessions]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 100)
    : [];

  const snapshot: RemoteSyncSnapshot = {
    settings: safeSettings,
    profile: safeProfile,
    completed: state.completed,
    sessions: sortedSessions,
    dailyCompletions: state.dailyCompletions,
    prayerTracking: state.prayerTracking,
    dailyHabits: state.dailyHabits,
    savedZikrIds: state.savedZikrIds,
    khatmahPage: state.khatmahPage,
    mushafTheme: state.mushafTheme,
    mushafLayout: state.mushafLayout,
    mushafToolbarSide: state.mushafToolbarSide,
    mushafTextScale: state.mushafTextScale,
    mushafBookmarks: state.mushafBookmarks,
    surahReadingPages: state.surahReadingPages,
    mushafVerseBookmarks: state.mushafVerseBookmarks,
    dailyWirdGoal: state.dailyWirdGoal,
    wirdHistory: state.wirdHistory,
    quranWirdDailyGoals: state.quranWirdDailyGoals,
    quranWirdCompletionAnnounced: state.quranWirdCompletionAnnounced,
    quranLastReadingEvent: state.quranLastReadingEvent,
    quranReadingPosition: state.quranReadingPosition,
    quranWirdPlan: state.quranWirdPlan,
    fridayProgress: state.fridayProgress,
    lastActiveDayKey: state.lastActiveDayKey,
  };

  assertNoForbiddenSyncFields(snapshot);
  return snapshot;
}
