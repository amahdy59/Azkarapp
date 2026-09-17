import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasPlaceholderValue = (value: string | undefined) => !value || /your-|example\.com/i.test(value);
export const isEnabledFeatureFlag = (value: string | undefined) => value?.trim().toLowerCase() === "true";
export const hasValidSupabaseConfig = (url: string | undefined, key: string | undefined) =>
  !hasPlaceholderValue(url) && !hasPlaceholderValue(key);

export const isSupabaseConfigured = hasValidSupabaseConfig(supabaseUrl, supabasePublicKey);

export const authProviderFlags = {
  google: isSupabaseConfigured && isEnabledFeatureFlag(import.meta.env.VITE_GOOGLE_AUTH_ENABLED),
  email: isSupabaseConfigured && isEnabledFeatureFlag(import.meta.env.VITE_EMAIL_AUTH_ENABLED),
  apple: isSupabaseConfigured && isEnabledFeatureFlag(import.meta.env.VITE_APPLE_AUTH_ENABLED),
} as const;

export const isAnyAccountProviderEnabled = Object.values(authProviderFlags).some(Boolean);

export function getAuthCallbackUrl() {
  const configuredAppUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim();
  const baseUrl =
    configuredAppUrl ||
    (typeof window === "undefined"
      ? "http://localhost:5173/"
      : new URL(import.meta.env.BASE_URL, window.location.origin).toString());
  const callback = new URL(baseUrl);
  callback.search = "";
  callback.hash = "";
  callback.searchParams.set("view", "auth-callback");
  return callback.toString();
}

let clientPromise: Promise<SupabaseClient<Database> | null> | null = null;

/** Loads the account client only when a configured account feature is used. */
export function getSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured) {
    return Promise.resolve(null);
  }

  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient<Database>(supabaseUrl, supabasePublicKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    }),
  );

  return clientPromise;
}
