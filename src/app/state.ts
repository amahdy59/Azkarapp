export type AppLanguage = "en" | "ar" | "fr" | "ur" | "tr" | "id" | "ml" | "ha";
export type CategoryId = "morning" | "evening" | "before_sleep";

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

const STORAGE_KEY = "azkarapp.state.v1";

export const DEFAULT_APP_STATE: AppStateSnapshot = {
  settings: {
    language: "en",
    darkMode: true,
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
};

function isLanguage(value: string): value is AppLanguage {
  return ["en", "ar", "fr", "ur", "tr", "id", "ml", "ha"].includes(value);
}

function dedupeAndSort(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.filter((value): value is number => Number.isInteger(value) && value >= 0))].sort((a, b) => a - b);
}

export function loadAppState(): AppStateSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_APP_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<AppStateSnapshot>;

    return {
      settings: {
        language: parsed.settings?.language && isLanguage(parsed.settings.language) ? parsed.settings.language : DEFAULT_APP_STATE.settings.language,
        darkMode: typeof parsed.settings?.darkMode === "boolean" ? parsed.settings.darkMode : DEFAULT_APP_STATE.settings.darkMode,
      },
      profile: {
        displayName: parsed.profile?.displayName?.trim() || DEFAULT_APP_STATE.profile.displayName,
        lastPhoneNumber: parsed.profile?.lastPhoneNumber || DEFAULT_APP_STATE.profile.lastPhoneNumber,
        isGuest: typeof parsed.profile?.isGuest === "boolean" ? parsed.profile.isGuest : DEFAULT_APP_STATE.profile.isGuest,
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
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function saveAppState(state: AppStateSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toCompletedSets(completed: AppStateSnapshot["completed"]): Record<CategoryId, Set<number>> {
  return {
    morning: new Set(completed.morning),
    evening: new Set(completed.evening),
    before_sleep: new Set(completed.before_sleep),
  };
}

export function fromCompletedSets(completed: Record<CategoryId, Set<number>>): AppStateSnapshot["completed"] {
  return {
    morning: [...completed.morning].sort((a, b) => a - b),
    evening: [...completed.evening].sort((a, b) => a - b),
    before_sleep: [...completed.before_sleep].sort((a, b) => a - b),
  };
}

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
      language: incoming.settings?.language ?? base.settings.language,
      darkMode: incoming.settings?.darkMode ?? base.settings.darkMode,
    },
    profile: {
      displayName: incoming.profile?.displayName?.trim() || base.profile.displayName,
      lastPhoneNumber: incoming.profile?.lastPhoneNumber ?? base.profile.lastPhoneNumber,
      isGuest: incoming.profile?.isGuest ?? base.profile.isGuest,
    },
    completed,
    sessions: [...sessions.values()].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getStreakSummary(sessions: StoredSession[]) {
  const completedDays = [...new Set(
    sessions
      .filter((session) => session.isComplete)
      .map((session) => startOfDay(new Date(session.completedAt)).toISOString()),
  )]
    .map((value) => new Date(value))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let runLength = 0;

  for (let index = 0; index < completedDays.length; index += 1) {
    if (index === 0) {
      runLength = 1;
      const today = startOfDay(new Date());
      const diffDays = Math.round((today.getTime() - completedDays[index].getTime()) / 86400000);
      currentStreak = diffDays <= 1 ? 1 : 0;
      longestStreak = 1;
      continue;
    }

    const diffDays = Math.round((completedDays[index - 1].getTime() - completedDays[index].getTime()) / 86400000);
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
