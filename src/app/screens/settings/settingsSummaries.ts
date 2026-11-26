import type { AudioPreferences } from "../../audio/audioTypes";
import { getAudioVoiceName } from "../../audio/audioVoices";
import type { DownloadReadiness } from "../../downloads/downloadSession";
import { formatNumerals } from "../../formatting";
import { t } from "../../i18n";
import type { AppLanguage, ReminderSettings } from "../../types";

export type SettingsMenuSummaries = { audio: string; downloads: string; reminders: string; progress: string };

/** Presentation only: saved choices and the last completed check, never new storage or verification work. */
export function getSettingsSummaries(
  language: AppLanguage,
  audio: AudioPreferences,
  readiness: DownloadReadiness,
  reminders: ReminderSettings,
  quietProgressEnabled: boolean,
  weeklyGoalDays: number,
): SettingsMenuSummaries {
  const checked =
    readiness.status === "checked" &&
    readiness.duaVoiceId === audio.duaVoiceId &&
    readiness.quranReciterId === audio.quranReciterId;
  const hasReminders =
    (reminders.prayer.enabled && reminders.prayer.prayers?.length !== 0) ||
    Object.entries(reminders).some(([kind, value]) => kind !== "prayer" && typeof value === "object" && value.enabled);
  let downloads = t(language, readiness.status === "busy" ? "settings.downloadsBusy" : "settings.downloadsUnchecked");
  if (checked) {
    downloads = t(language, "settings.downloadsChecked", {
      ready: formatNumerals(readiness.readyGroups, language),
      total: formatNumerals(readiness.totalGroups, language),
    });
    if (typeof readiness.usageBytes === "number" && Number.isFinite(readiness.usageBytes) && readiness.usageBytes >= 0)
      downloads +=
        " · " +
        t(language, "settings.appStorageSummary", {
          size: formatNumerals((readiness.usageBytes / 1_000_000).toFixed(1), language),
        });
  }
  return {
    audio: t(language, "settings.audioSummary", {
      voice: getAudioVoiceName(audio.duaVoiceId, language) ?? t(language, "settings.preferredReciter"),
      speed: formatNumerals(audio.playbackRate, language),
    }),
    downloads,
    reminders: t(language, hasReminders ? "settings.remindersSelected" : "settings.remindersOff"),
    progress: t(language, quietProgressEnabled ? "settings.weeklyGoalSummary" : "settings.progressSavedLocally", {
      days: formatNumerals(weeklyGoalDays, language),
    }),
  };
}
