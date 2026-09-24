import { normalizeAppState } from "./state";
import type { AppStateSnapshot } from "./types";

export const APP_BACKUP_FORMAT = "azkarapp-backup";
export const APP_BACKUP_VERSION = 1;

export interface AppBackupFile {
  format: typeof APP_BACKUP_FORMAT;
  version: typeof APP_BACKUP_VERSION;
  exportedAt: string;
  state: AppStateSnapshot;
}

export function createAppBackup(state: AppStateSnapshot, exportedAt = new Date()): AppBackupFile {
  return {
    format: APP_BACKUP_FORMAT,
    version: APP_BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    state: normalizeAppState(state),
  };
}

export function parseAppBackup(raw: string): AppStateSnapshot {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("invalid-backup");
  }

  const record = parsed as Record<string, unknown>;
  if (record.format === APP_BACKUP_FORMAT) {
    if (record.version !== APP_BACKUP_VERSION || !record.state || typeof record.state !== "object") {
      throw new Error("unsupported-backup");
    }
    return normalizeAppState(record.state);
  }

  // Exports produced before the versioned envelope were the normalized state
  // object itself. Keep those files restorable rather than stranding readers.
  if ("settings" in record || "sessions" in record || "savedZikrIds" in record) {
    return normalizeAppState(record);
  }

  throw new Error("invalid-backup");
}
