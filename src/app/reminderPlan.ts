import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { locationCalendarDate } from "./content/locationTime";
import { getPrayerTimeline } from "./prayerTimeline";
import type { LocationSettings, ReminderContext } from "./types";

const TOPIC_SEQUENCE = ["character", "helping_others", "general_dua", "moment", "fasting_virtue", "moment"] as const;

/** A civil projection for reminder labels only; the actual clock remains an instant. */
export function reminderCivilTime(now: Date, location?: LocationSettings): Date {
  const zone = location?.timeZone || DEFAULT_LOCATION.timeZone || "UTC";
  try {
    const date = locationCalendarDate(now, zone);
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: zone,
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);
    date.setHours(
      Number(parts.find((part) => part.type === "hour")?.value),
      Number(parts.find((part) => part.type === "minute")?.value),
      0,
      0,
    );
    return date;
  } catch {
    return new Date(now);
  }
}

/** Conservative product exclusion, not a calendar/fatwa service. A one-day
 * uncertainty margin suppresses invitations near Eid and Tashriq. No data leaves the device.
 * Evidence: Bukhari 1990; Muslim 1141a. Ramadan has its own existing collection.
 */
export function canSuggestVoluntaryFast(civilDate: Date, hijriOffset = 0): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      calendar: "islamic-umalqura",
      timeZone: "UTC",
      month: "numeric",
      day: "numeric",
    });
    if (formatter.resolvedOptions().calendar !== "islamic-umalqura") return false;
    for (const margin of [-1, 0, 1]) {
      const date = new Date(
        Date.UTC(civilDate.getFullYear(), civilDate.getMonth(), civilDate.getDate() + hijriOffset + margin, 12),
      );
      const parts = formatter.formatToParts(date);
      const month = Number(parts.find((part) => part.type === "month")?.value);
      const day = Number(parts.find((part) => part.type === "day")?.value);
      if (!month || !day || month === 9 || (month === 10 && day === 1) || (month === 12 && day >= 10 && day <= 13))
        return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Blend the established moment plan with a topic plan. Priority is explicit:
 * narrow prayer / last third / Friday's last hour; brief advance fasting;
 * morning/evening openings, Duha and bedtime; then balanced general topics.
 */
export function getReminderPlan(input: {
  now: Date;
  location?: LocationSettings;
  contexts: readonly ReminderContext[];
  hijriOffset?: number;
}) {
  const { now, location, hijriOffset = 0 } = input;
  const civil = reminderCivilTime(now, location);
  const dateKey = `${civil.getFullYear()}-${String(civil.getMonth() + 1).padStart(2, "0")}-${String(civil.getDate()).padStart(2, "0")}`;
  const minutes = civil.getHours() * 60 + civil.getMinutes();
  const slot = Math.floor(minutes / 30);
  const dayOrdinal = Math.floor(Date.UTC(civil.getFullYear(), civil.getMonth(), civil.getDate()) / 86_400_000);
  const ordinal = dayOrdinal * 48 + slot;
  const key = `${dateKey}-s30-${slot}-plan-${Math.floor(ordinal / TOPIC_SEQUENCE.length)}`;
  const timeline = getPrayerTimeline(now, location);
  const sincePrayer = (now.getTime() - timeline.current.at) / 60_000;
  const untilPrayer = (timeline.next.at - now.getTime()) / 60_000;
  const nextDate = new Date(civil);
  nextDate.setDate(nextDate.getDate() + 1);
  const fastingToday = canSuggestVoluntaryFast(civil, hijriOffset);
  const contexts = input.contexts.filter(
    (context) => context !== "friday_after_asr" && (fastingToday || (context !== "monday" && context !== "thursday")),
  );
  const moment = (prefix: ReminderContext[] = []) => {
    const ordered = [...new Set([...prefix, ...contexts])];
    const interval = ordered.some((context) => ["dhuha", "before_fajr", "last_third"].includes(context)) ? 45 : 30;
    return { contexts: ordered, key: `${dateKey}-s${interval}-${Math.floor(minutes / interval)}`, fastingToday };
  };
  if (civil.getDay() === 5 && timeline.next.prayer === "maghrib" && untilPrayer <= 60)
    return moment(["friday_after_asr"]);
  if (untilPrayer <= 20) return moment([timeline.next.prayer === "fajr" ? "before_fajr" : timeline.next.prayer]);
  if (sincePrayer < 30)
    return moment(
      contexts[0] === "after_prayer" ? ["after_prayer", timeline.current.prayer] : [timeline.current.prayer],
    );
  if (contexts.includes("last_third")) return moment(["last_third"]);

  // One 45-minute opportunity, distinct from any claimed Sunnah timing. The
  // after-Asr offset leaves the immediate prayer/adhkar window undisturbed.
  const [asrHour, asrMinute] = timeline.prayerTimes.asr.split(":").map(Number);
  const preparationStart = asrHour! * 60 + asrMinute! + 45;
  const advanceFasting =
    (civil.getDay() === 0 || civil.getDay() === 3) &&
    minutes >= preparationStart &&
    minutes < preparationStart + 45 &&
    canSuggestVoluntaryFast(nextDate, hijriOffset);
  if (advanceFasting) return moment(["fasting_tomorrow"]);

  const inMorningOpening = timeline.current.prayer === "fajr" && sincePrayer < 90;
  const inEveningOpening = timeline.current.prayer === "asr" && sincePrayer < 90;
  if (inMorningOpening || inEveningOpening || contexts.includes("dhuha") || contexts.includes("before_sleep"))
    return moment();
  // Shift each day so recurring prayer/bedtime windows cannot permanently
  // crowd the same topic out of the reader's usual visiting hours.
  let topic = TOPIC_SEQUENCE[(ordinal + dayOrdinal) % TOPIC_SEQUENCE.length]!;
  if (topic === "fasting_virtue" && !fastingToday) topic = "moment";
  if (topic === "moment") return moment();
  return { contexts: [topic, ...contexts] as ReminderContext[], key, fastingToday };
}
