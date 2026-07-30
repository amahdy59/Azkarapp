import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { AppStateSnapshot, AppLanguage, StoredSession } from "../app/state";
import type { UserProfileState } from "../app/types";
import { DEFAULT_APP_STATE, mergeAppStates } from "../app/state";
import { mergeDailyCompletions, normalizeDailyCompletions } from "../app/progress";
import { getAuthCallbackUrl, getSupabaseClient, isSupabaseConfigured } from "./supabase";

export const REMOTE_SESSION_PAGE_SIZE = 100;
const REMOTE_DAILY_COMPLETION_PAGE_SIZE = 500;
const syncedDailyCompletionKeysByUser = new Map<string, Set<string>>();
const dailyCompletionTableAvailability = new Map<string, boolean>();

async function assertSupabase(): Promise<SupabaseClient> {
  const client = await getSupabaseClient();
  if (!client || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return client;
}

export async function requestEmailOtp(email: string) {
  const client = await assertSupabase();
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await client.auth.signInWithOtp({
    email: normalizedEmail,
    options: { shouldCreateUser: true },
  });
  if (error) {
    throw error;
  }
  return normalizedEmail;
}

export async function resendEmailOtp(email: string) {
  return requestEmailOtp(email);
}

export async function verifyEmailOtp(email: string, token: string) {
  const client = await assertSupabase();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await client.auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: "email",
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithOAuthProvider(provider: "google" | "apple") {
  const client = await assertSupabase();
  try {
    window.sessionStorage.setItem("azkarapp.auth-return-view", "home");
  } catch {
    // The callback can safely fall back to Home when session storage is unavailable.
  }
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getAuthCallbackUrl() },
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function getCurrentSession() {
  const client = await assertSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function signOutSupabase() {
  const client = await assertSupabase();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function subscribeToAuthChanges(callback: (session: Session | null) => void) {
  const client = await assertSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

function metadataString(metadata: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function profileFromSession(
  session: Session | null,
  fallback: Partial<UserProfileState> = DEFAULT_APP_STATE.profile,
): UserProfileState {
  const user = session?.user;
  const email = user?.email?.trim() || fallback.email?.trim() || "";
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    metadataString(metadata, "full_name", "name", "display_name") ||
    (email.includes("@") ? email.split("@")[0]?.trim() : "") ||
    fallback.displayName?.trim() ||
    DEFAULT_APP_STATE.profile.displayName;

  return {
    displayName,
    email,
    phone: user?.phone ?? fallback.phone ?? "",
    avatarUrl: metadataString(metadata, "avatar_url", "picture") || fallback.avatarUrl?.trim() || "",
    isGuest: !user,
    accountUserId: user?.id ?? "",
  };
}

type RemoteProfileRow = {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: AppLanguage | null;
};

type RemoteSettingsJson = Partial<AppStateSnapshot["settings"]> & {
  savedZikrIds?: AppStateSnapshot["savedZikrIds"];
  dailyCompletions?: AppStateSnapshot["dailyCompletions"];
};

export function buildRemoteSettingsJson(state: AppStateSnapshot): RemoteSettingsJson {
  return {
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
    routineModes: state.settings.routineModes,
    savedZikrIds: state.savedZikrIds,
    dailyCompletions: state.dailyCompletions,
  };
}

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

type RemoteSavedZikrRow = {
  zikr_id: string;
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

async function loadAllRemoteDailyCompletions(client: SupabaseClient, userId: string) {
  const rows: RemoteDailyCompletionRow[] = [];
  let cursor: Pick<RemoteDailyCompletionRow, "day_key" | "category"> | null = null;

  while (true) {
    let query = client
      .from("daily_collection_completions")
      .select("day_key, category, time_zone")
      .eq("user_id", userId)
      .order("day_key", { ascending: true })
      .order("category", { ascending: true })
      .limit(REMOTE_DAILY_COMPLETION_PAGE_SIZE);
    if (cursor) {
      query = query.or(`day_key.gt.${cursor.day_key},and(day_key.eq.${cursor.day_key},category.gt.${cursor.category})`);
    }
    const { data, error } = await query.returns<RemoteDailyCompletionRow[]>();

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
    const last = page.at(-1);
    if (!last) return { rows, tableAvailable: true };
    cursor = { day_key: last.day_key, category: last.category };
  }
}

export function getSessionsForRemoteSync(sessions: StoredSession[]) {
  return [...sessions]
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))
    .slice(0, REMOTE_SESSION_PAGE_SIZE);
}

export async function loadRemoteState(
  session: Session,
  localState: AppStateSnapshot,
  options: { preserveLocalPreferences?: boolean } = {},
) {
  const client = await assertSupabase();
  const userId = session.user.id;

  const [profileResult, settingsResult, progressResult, sessionsResult, dailyCompletionResult, savedZikrResult] =
    await Promise.all([
      client
        .from("profiles")
        .select("display_name, email, phone, avatar_url, preferred_language")
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
      client.from("saved_zikr").select("zikr_id").eq("user_id", userId).returns<RemoteSavedZikrRow[]>(),
    ]);

  for (const result of [profileResult, settingsResult, progressResult, sessionsResult]) {
    if (result.error) {
      throw result.error;
    }
  }
  const savedZikrTableMissing =
    savedZikrResult.error?.code === "42P01" ||
    savedZikrResult.error?.code === "PGRST205" ||
    savedZikrResult.error?.message?.includes("saved_zikr") === true;
  if (savedZikrResult.error && !savedZikrTableMissing) {
    throw savedZikrResult.error;
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

  const settingsDailyCompletions = normalizeDailyCompletions(settings?.settings_json?.dailyCompletions);
  const settingsCompletionLevels = new Map(
    settingsDailyCompletions.map((record) => [dailyCompletionKey(record), record.completionLevel ?? "complete"]),
  );
  const remoteDailyCompletions = mergeDailyCompletions(
    settingsDailyCompletions,
    normalizeDailyCompletions(
      dailyCompletionResult.rows.map((record) => ({
        dayKey: record.day_key,
        category: record.category,
        timeZone: record.time_zone,
        completionLevel: settingsCompletionLevels.get(
          dailyCompletionKey({ dayKey: record.day_key, category: record.category }),
        ),
      })),
    ),
  );

  const remoteState: Partial<AppStateSnapshot> = {
    settings: options.preserveLocalPreferences
      ? localState.settings
      : {
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
          quietProgressEnabled:
            settings?.settings_json?.quietProgressEnabled ?? localState.settings.quietProgressEnabled,
          progressDayStartHour:
            settings?.settings_json?.progressDayStartHour ?? localState.settings.progressDayStartHour,
          routineModes: settings?.settings_json?.routineModes ?? localState.settings.routineModes,
          // Precise coordinates and prayer calculation settings are device-local.
          location: localState.settings.location,
        },
    profile: {
      displayName: profile?.display_name?.trim() || profileFromSession(session, localState.profile).displayName,
      email: profile?.email?.trim() || session.user.email?.trim() || localState.profile.email,
      phone: profile?.phone ?? session.user.phone ?? localState.profile.phone,
      avatarUrl: profile?.avatar_url?.trim() || profileFromSession(session, localState.profile).avatarUrl,
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
    savedZikrIds: savedZikrTableMissing
      ? (settings?.settings_json?.savedZikrIds ?? localState.savedZikrIds)
      : (savedZikrResult.data ?? []).map((row) => row.zikr_id),
  };

  return mergeAppStates(localState, remoteState);
}

export async function syncRemoteState(
  session: Session,
  state: AppStateSnapshot,
  streaks: { currentStreak: number; longestStreak: number },
) {
  const client = await assertSupabase();
  const userId = session.user.id;

  const profilePayload = {
    id: userId,
    display_name: state.profile.displayName,
    email: state.profile.email || session.user.email || null,
    phone: state.profile.phone || session.user.phone || null,
    avatar_url: state.profile.avatarUrl || null,
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

  const settingsJson = buildRemoteSettingsJson(state);
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
      getSessionsForRemoteSync(state.sessions).map((item) => ({
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

  const { data: existingSavedRows, error: existingSavedError } = await client
    .from("saved_zikr")
    .select("zikr_id")
    .eq("user_id", userId)
    .returns<RemoteSavedZikrRow[]>();
  const savedTableMissing =
    existingSavedError?.code === "42P01" ||
    existingSavedError?.code === "PGRST205" ||
    existingSavedError?.message?.includes("saved_zikr") === true;
  if (existingSavedError && !savedTableMissing) {
    throw existingSavedError;
  }
  if (!savedTableMissing) {
    const desired = new Set(state.savedZikrIds);
    const existing = new Set((existingSavedRows ?? []).map((row) => row.zikr_id));
    const additions = [...desired].filter((zikrId) => !existing.has(zikrId));
    const removals = [...existing].filter((zikrId) => !desired.has(zikrId));
    if (additions.length > 0) {
      const { error } = await client
        .from("saved_zikr")
        .upsert(additions.map((zikrId) => ({ user_id: userId, zikr_id: zikrId })));
      if (error) throw error;
    }
    if (removals.length > 0) {
      const { error } = await client.from("saved_zikr").delete().eq("user_id", userId).in("zikr_id", removals);
      if (error) throw error;
    }
  }
}

export async function updateAccountDisplayName(displayName: string) {
  const client = await assertSupabase();
  const normalized = displayName.trim();
  if (!normalized) {
    throw new Error("Enter a display name.");
  }
  const { error } = await client.auth.updateUser({ data: { display_name: normalized } });
  if (error) throw error;
}

export async function deleteCurrentAccount() {
  const client = await assertSupabase();
  const { error } = await client.functions.invoke("delete-account", { body: { confirm: true } });
  if (error) throw error;
}
