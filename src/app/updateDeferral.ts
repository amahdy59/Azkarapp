/** Device-local update preference; never part of progress or account sync. */
export const UPDATE_DEFERRAL_KEY = "azkarapp.update-deferred.v1";
export const UPDATE_DEFERRAL_MS = 24 * 60 * 60 * 1000;

export interface UpdateDeferral {
  release: string;
  until: number;
}

export function readUpdateDeferral(): UpdateDeferral | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(UPDATE_DEFERRAL_KEY) ?? "null");
    return value && typeof value.release === "string" && typeof value.until === "number" && Number.isFinite(value.until)
      ? value
      : null;
  } catch {
    return null;
  }
}

export function deferUpdate(release: string, now = Date.now()): UpdateDeferral {
  const value = { release, until: now + UPDATE_DEFERRAL_MS };
  try {
    window.localStorage.setItem(UPDATE_DEFERRAL_KEY, JSON.stringify(value));
  } catch {
    // The mounted lifecycle also retains the choice when storage is unavailable.
  }
  return value;
}

export function remainingUpdateDeferral(value: UpdateDeferral | null, release: string, now = Date.now()): number {
  if (value?.release !== release) return 0;
  return Math.max(0, Math.min(UPDATE_DEFERRAL_MS, value.until - now));
}
