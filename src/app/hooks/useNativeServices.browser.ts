import type { AppStateSnapshot } from "../types";

/** Browser/PWA builds have no widget or native reminder bridge. */
export function useNativeServices(_state: AppStateSnapshot) {
  // Intentionally empty: browser reminders use the existing web scheduler.
}
