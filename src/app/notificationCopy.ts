import { t } from "./i18n";
import { formatNumerals } from "./formatting";
import type { AppLanguage, PrayerName } from "./types";

type ReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer" | "friday" | "fridayDua" | "beforeFajrDua";

/** Shared by browser delivery and Android scheduling; contains no scheduling policy. */
export function notificationCopy(
  language: AppLanguage,
  reminder: { kind: "prayer"; prayer: PrayerName; leadMinutes: number } | { kind: ReminderKind },
) {
  if (reminder.kind === "prayer") {
    const prayer = t(language, `notifications.${reminder.prayer}`);
    const now = reminder.leadMinutes === 0;
    return {
      title: t(language, now ? "notifications.prayerNowTitle" : "notifications.prayerReminderTitle", { prayer }),
      body: t(
        language,
        now
          ? "notifications.prayerNowBody"
          : reminder.leadMinutes <= 10
            ? "notifications.prayerReminderFewBody"
            : "notifications.prayerReminderBody",
        { minutes: formatNumerals(reminder.leadMinutes, language) },
      ),
    };
  }
  const contextual = ["friday", "fridayDua", "beforeFajrDua"].includes(reminder.kind);
  return {
    title: t(language, `notifications.${reminder.kind}`),
    body: t(language, contextual ? `notifications.${reminder.kind}Body` : "notifications.routineBody"),
  };
}
