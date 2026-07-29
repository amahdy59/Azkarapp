import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasPlaceholderValue = (value: string | undefined) => !value || /your-|example\.com/i.test(value);

export const isSupabaseConfigured = !hasPlaceholderValue(supabaseUrl) && !hasPlaceholderValue(supabaseAnonKey);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Loads the account client only when a configured account feature is used. */
export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) {
    return Promise.resolve(null);
  }

  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
  );

  return clientPromise;
}
