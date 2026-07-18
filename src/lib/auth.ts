import type { Session } from "@supabase/supabase-js";
import type { AppStateSnapshot, AppLanguage, StoredSession } from "../app/state";
import { DEFAULT_APP_STATE, mergeAppStates } from "../app/state";
import { mergeDailyCompletions, normalizeDailyCompletions } from "../app/progress";
import { isSupabaseConfigured, supabase } from "./supabase";

export const REMOTE_SESSION_PAGE_SIZE = 100;
const REMOTE_DAILY_COMPLETION_PAGE_SIZE = 500;
const syncedDailyCompletionKeysByUser = new Map<string, Set<string>>();
const dailyCompletionTableAvailability = new Map<string, boolean>();

export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith("966")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+966${digits.slice(1)}`;
  }

  if (digits.length <= 10) {
    return `+966${digits}`;
  }

  return `+${digits}`;
}

function assertSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function requestPhoneOtp(phone: string) {
  const client = assertSupabase();
  const normalizedPhone = normalizePhoneNumber(phone);
  const { error } = await client.auth.signInWithOtp({ phone: normalizedPhone });
  if (error) {
    throw error;
  }
  return normalizedPhone;
}

export async function resendPhoneOtp(phone: string) {
  const client = assertSupabase();
  const normalizedPhone = normalizePhoneNumber(phone);
  const { error } = await client.auth.resend({ type: "sms", phone: normalizedPhone });
  if (error) {
    throw error;
  }
  return normalizedPhone;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const client = assertSupabase();
  const normalizedPhone = normalizePhoneNumber(phone);
  const { data, error } = await client.auth.verifyOtp({
    phone: normalizedPhone,
    token,
    type: "sms",
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentSession() {
  const client = assertSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function signOutSupabase() {
  const client = assertSupabase();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export function subscribeToAuthChanges(callback: (session: Session | null) => void) {
  const client = assertSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

export function profileFromSession(session: Session | null, fallbackPhone: string) {
  const user = session?.user;
  const displayName =
    typeof user?.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : user?.phone
        ? `User ${user.phone.slice(-4)}`
        : DEFAULT_APP_STATE.profile.displayName;

  return {
    displayName,
    lastPhoneNumber: user?.phone ?? fallbackPhone,
    isGuest: !user,
    accountUserId: user?.id ?? "",
  };
}

type RemoteProfileRow = {
  display_name: string | null;
  phone: string | null;
  preferred_language: AppLanguage | null;
};

type RemoteSettingsJson = Partial<AppStateSnapshot["settings"]> & {
  savedZikrIds?: AppStateSnapshot["savedZikrIds"];
  dailyCompletions?: AppStateSnapshot["dailyCompletions"];
};

type RemoteSettingsRow = {
  dark_mode: boolean;
  settings_json?: RemoteSettingsJson | null;
};

type RemoteProgressRow = {
  completed: AppStateSnapshot["completed"];
};

type RemoteSessionRow = {
  id: string;
  category: StoredSession["category"];
  completed_at: string;
  completed_count: number;
  total_count: number;
  duration_seconds: number;
  is_complete: boolean;
};

type RemoteDailyCompletionRow = {
  day_key: string;
  category: StoredSession["category"];
  time_zone: string;
};

function isMissingDailyCompletionTable(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null;
  return (
    candidate?.code === "42P01" ||
    candidate?.code === "PGRST205" ||
    candidate?.message?.includes("daily_collection_completions") === true
  );
}

function dailyCompletionKey(record: { dayKey: string; category: StoredSession["category"] }) {
  return `${record.dayKey}:${record.category}`;
}

async function loadAllRemoteDailyCompletions(client: ReturnType<typeof assertSupabase>, userId: string) {
  const rows: RemoteDailyCompletionRow[] = [];
  let start = 0;

  while (true) {
    const { data, error } = await client
      .from("daily_collection_completions")
      .select("day_key, category, time_zone")
      .eq("user_id", userId)
      .order("day_key", { ascending: true })
      .order("category", { ascending: true })
      .range(start, start + REMOTE_DAILY_COMPLETION_PAGE_SIZE - 1)
      .returns<RemoteDailyCompletionRow[]>();

    if (error) {
      if (isMissingDailyCompletionTable(error)) {
        return { rows: [], tableAvailable: false };
      }
      throw error;
    }

    const page = data ?? [];
    rows.push(...page);
    if (page.length < REMOTE_DAILY_COMPLETION_PAGE_SIZE) {
      return { rows, tableAvailable: true };
    }
    start += REMOTE_DAILY_COMPLETION_PAGE_SIZE;
  }
}

export async function loadRemoteState(session: Session, localState: AppStateSnapshot) {
  const client = assertSupabase();
  const userId = session.user.id;

  const [profileResult, settingsResult, progressResult, sessionsResult, dailyCompletionResult] = await Promise.all([
    client
      .from("profiles")
      .select("display_name, phone, preferred_language")
      .eq("id", userId)
      .maybeSingle<RemoteProfileRow>(),
    client
      .from("user_settings")
      .select("dark_mode, settings_json")
      .eq("user_id", userId)
      .maybeSingle<RemoteSettingsRow>(),
    client.from("user_progress").select("completed").eq("user_id", userId).maybeSingle<RemoteProgressRow>(),
    client
      .from("session_history")
      .select("id, category, completed_at, completed_count, total_count, duration_seconds, is_complete")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(REMOTE_SESSION_PAGE_SIZE)
      .returns<RemoteSessionRow[]>(),
    loadAllRemoteDailyCompletions(client, userId),
  ]);

  for (const result of [profileResult, settingsResult, progressResult, sessionsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  const profile = profileResult.data;
  const settings = settingsResult.data;
  const progress = progressResult.data;
  const sessions = sessionsResult.data;

  dailyCompletionTableAvailability.set(userId, dailyCompletionResult.tableAvailable);
  if (dailyCompletionResult.tableAvailable) {
    syncedDailyCompletionKeysByUser.set(
      userId,
      new Set(
        dailyCompletionResult.rows.map((record) =>
          dailyCompletionKey({ dayKey: record.day_key, category: record.category }),
        ),
      ),
    );
  }

  const remoteDailyCompletions = mergeDailyCompletions(
    normalizeDailyCompletions(settings?.settings_json?.dailyCompletions),
    normalizeDailyCompletions(
      dailyCompletionResult.rows.map((record) => ({
        dayKey: record.day_key,
        category: record.category,
        timeZone: record.time_zone,
      })),
    ),
  );

  const remoteState: Partial<AppStateSnapshot> = {
    settings: {
      language: profile?.preferred_language ?? localState.settings.language,
      darkMode: settings?.dark_mode ?? localState.settings.darkMode,
      themeMode: settings?.settings_json?.themeMode ?? localState.settings.themeMode,
      showTransliteration: settings?.settings_json?.showTransliteration ?? localState.settings.showTransliteration,
      showTranslation: settings?.settings_json?.showTranslation ?? localState.settings.showTranslation,
      textSize: settings?.settings_json?.textSize ?? localState.settings.textSize,
      arabicFont: settings?.settings_json?.arabicFont ?? localState.settings.arabicFont,
      highContrast: settings?.settings_json?.highContrast ?? localState.settings.highContrast,
      boldText: settings?.settings_json?.boldText ?? localState.settings.boldText,
      reduceMotion: settings?.settings_json?.reduceMotion ?? localState.settings.reduceMotion,
      hapticFeedback: settings?.settings_json?.hapticFeedback ?? localState.settings.hapticFeedback,
      forceRtl: settings?.settings_json?.forceRtl ?? localState.settings.forceRtl,
      colorBlindSupport: settings?.settings_json?.colorBlindSupport ?? localState.settings.colorBlindSupport,
      reminders: settings?.settings_json?.reminders ?? localState.settings.reminders,
      weeklyGoalDays: settings?.settings_json?.weeklyGoalDays ?? localState.settings.weeklyGoalDays,
      quietProgressEnabled: settings?.settings_json?.quietProgressEnabled ?? localState.settings.quietProgressEnabled,
      progressDayStartHour: settings?.settings_json?.progressDayStartHour ?? localState.settings.progressDayStartHour,
    },
    profile: {
      displayName:
        profile?.display_name?.trim() || profileFromSession(session, localState.profile.lastPhoneNumber).displayName,
      lastPhoneNumber: profile?.phone ?? session.user.phone ?? localState.profile.lastPhoneNumber,
      isGuest: false,
      accountUserId: userId,
    },
    completed: progress?.completed ?? localState.completed,
    sessions: (sessions ?? []).map((item) => ({
      id: item.id,
      category: item.category,
      completedAt: item.completed_at,
      completedCount: item.completed_count,
      totalCount: item.total_count,
      durationSeconds: item.duration_seconds,
      isComplete: item.is_complete,
    })),
    ...(remoteDailyCompletions.length > 0 ? { dailyCompletions: remoteDailyCompletions } : {}),
    savedZikrIds: settings?.settings_json?.savedZikrIds ?? localState.savedZikrIds,
  };

  return mergeAppStates(localState, remoteState);
}

export async function syncRemoteState(
  session: Session,
  state: AppStateSnapshot,
  streaks: { currentStreak: number; longestStreak: number },
) {
  const client = assertSupabase();
  const userId = session.user.id;

  const profilePayload = {
    id: userId,
    display_name: state.profile.displayName,
    phone: normalizePhoneNumber(state.profile.lastPhoneNumber) || session.user.phone || null,
    preferred_language: state.settings.language,
    updated_at: new Date().toISOString(),
  };

  const progressPayload = {
    user_id: userId,
    completed: state.completed,
    current_streak: streaks.currentStreak,
    longest_streak: streaks.longestStreak,
    last_completed_at: state.sessions[0]?.completedAt ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await client.from("profiles").upsert(profilePayload);
  if (profileError) {
    throw profileError;
  }

  let tableAvailable = dailyCompletionTableAvailability.get(userId) !== false;
  const knownDailyCompletionKeys = syncedDailyCompletionKeysByUser.get(userId) ?? new Set<string>();
  const pendingDailyCompletions = normalizeDailyCompletions(state.dailyCompletions).filter(
    (record) => !knownDailyCompletionKeys.has(dailyCompletionKey(record)),
  );
  if (tableAvailable && pendingDailyCompletions.length > 0) {
    const { error: dailyCompletionError } = await client.from("daily_collection_completions").upsert(
      pendingDailyCompletions.map((record) => ({
        user_id: userId,
        day_key: record.dayKey,
        category: record.category,
        time_zone: record.timeZone,
      })),
      { onConflict: "user_id,day_key,category" },
    );
    if (dailyCompletionError) {
      if (!isMissingDailyCompletionTable(dailyCompletionError)) {
        throw dailyCompletionError;
      }
      tableAvailable = false;
      dailyCompletionTableAvailability.set(userId, false);
    } else {
      for (const record of pendingDailyCompletions) {
        knownDailyCompletionKeys.add(dailyCompletionKey(record));
      }
      syncedDailyCompletionKeysByUser.set(userId, knownDailyCompletionKeys);
      dailyCompletionTableAvailability.set(userId, true);
    }
  }

  const settingsJson: RemoteSettingsJson = {
    language: state.settings.language,
    themeMode: state.settings.themeMode,
    showTransliteration: state.settings.showTransliteration,
    showTranslation: state.settings.showTranslation,
    textSize: state.settings.textSize,
    arabicFont: state.settings.arabicFont,
    highContrast: state.settings.highContrast,
    boldText: state.settings.boldText,
    reduceMotion: state.settings.reduceMotion,
    hapticFeedback: state.settings.hapticFeedback,
    forceRtl: state.settings.forceRtl,
    colorBlindSupport: state.settings.colorBlindSupport,
    reminders: state.settings.reminders,
    weeklyGoalDays: state.settings.weeklyGoalDays,
    quietProgressEnabled: state.settings.quietProgressEnabled,
    progressDayStartHour: state.settings.progressDayStartHour,
    savedZikrIds: state.savedZikrIds,
  };
  if (!tableAvailable) {
    const { data: currentSettings, error: currentSettingsError } = await client
      .from("user_settings")
      .select("settings_json")
      .eq("user_id", userId)
      .maybeSingle<{ settings_json?: RemoteSettingsJson | null }>();
    if (currentSettingsError) {
      throw currentSettingsError;
    }
    settingsJson.dailyCompletions = mergeDailyCompletions(
      normalizeDailyCompletions(currentSettings?.settings_json?.dailyCompletions),
      state.dailyCompletions,
    );
  }

  const settingsPayload = {
    user_id: userId,
    dark_mode: state.settings.darkMode,
    settings_json: settingsJson,
    updated_at: new Date().toISOString(),
  };

  const { error: settingsError } = await client.from("user_settings").upsert(settingsPayload);
  if (settingsError) {
    throw settingsError;
  }

  const { error: progressError } = await client.from("user_progress").upsert(progressPayload);
  if (progressError) {
    throw progressError;
  }

  if (state.sessions.length > 0) {
    const { error: sessionError } = await client.from("session_history").upsert(
      state.sessions.map((item) => ({
        id: item.id,
        user_id: userId,
        category: item.category,
        completed_at: item.completedAt,
        completed_count: item.completedCount,
        total_count: item.totalCount,
        duration_seconds: item.durationSeconds,
        is_complete: item.isComplete,
      })),
    );

    if (sessionError) {
      throw sessionError;
    }
  }
}
