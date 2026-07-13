import type { Session } from "@supabase/supabase-js";
import type { AppStateSnapshot, AppLanguage, StoredSession } from "../app/state";
import { DEFAULT_APP_STATE, mergeAppStates } from "../app/state";
import { isSupabaseConfigured, supabase } from "./supabase";

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
  };
}

type RemoteProfileRow = {
  display_name: string | null;
  phone: string | null;
  preferred_language: AppLanguage | null;
};

type RemoteSettingsRow = {
  dark_mode: boolean;
  settings_json?: Partial<AppStateSnapshot["settings"]> | null;
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

export async function loadRemoteState(session: Session, localState: AppStateSnapshot) {
  const client = assertSupabase();
  const userId = session.user.id;

  const [{ data: profile }, { data: settings }, { data: progress }, { data: sessions }] = await Promise.all([
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
      .returns<RemoteSessionRow[]>(),
  ]);

  const remoteState: Partial<AppStateSnapshot> = {
    settings: {
      language: profile?.preferred_language ?? localState.settings.language,
      darkMode: settings?.dark_mode ?? localState.settings.darkMode,
      themeMode: settings?.settings_json?.themeMode ?? localState.settings.themeMode,
      showTransliteration: settings?.settings_json?.showTransliteration ?? localState.settings.showTransliteration,
      showTranslation: settings?.settings_json?.showTranslation ?? localState.settings.showTranslation,
      textSize: settings?.settings_json?.textSize ?? localState.settings.textSize,
      highContrast: settings?.settings_json?.highContrast ?? localState.settings.highContrast,
      boldText: settings?.settings_json?.boldText ?? localState.settings.boldText,
      reduceMotion: settings?.settings_json?.reduceMotion ?? localState.settings.reduceMotion,
      hapticFeedback: settings?.settings_json?.hapticFeedback ?? localState.settings.hapticFeedback,
      forceRtl: settings?.settings_json?.forceRtl ?? localState.settings.forceRtl,
      voiceOver: settings?.settings_json?.voiceOver ?? localState.settings.voiceOver,
      audioQuality: settings?.settings_json?.audioQuality ?? localState.settings.audioQuality,
      colorBlindSupport: settings?.settings_json?.colorBlindSupport ?? localState.settings.colorBlindSupport,
    },
    profile: {
      displayName:
        profile?.display_name?.trim() || profileFromSession(session, localState.profile.lastPhoneNumber).displayName,
      lastPhoneNumber: profile?.phone ?? session.user.phone ?? localState.profile.lastPhoneNumber,
      isGuest: false,
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

  const settingsPayload = {
    user_id: userId,
    dark_mode: state.settings.darkMode,
    settings_json: {
      language: state.settings.language,
      themeMode: state.settings.themeMode,
      showTransliteration: state.settings.showTransliteration,
      showTranslation: state.settings.showTranslation,
      textSize: state.settings.textSize,
      highContrast: state.settings.highContrast,
      boldText: state.settings.boldText,
      reduceMotion: state.settings.reduceMotion,
      hapticFeedback: state.settings.hapticFeedback,
      forceRtl: state.settings.forceRtl,
      voiceOver: state.settings.voiceOver,
      audioQuality: state.settings.audioQuality,
      colorBlindSupport: state.settings.colorBlindSupport,
    },
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
