import { t } from "./i18n";
import evidence from "./content/notificationEvidence.json";
import { formatNumerals } from "./formatting";
import type { AppLanguage, PrayerName } from "./types";

import type { ContextReminderKind } from "./contextReminders";

type ReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer" | ContextReminderKind;

/** Shared by browser delivery and Android scheduling; contains no scheduling policy. */
export function notificationCopy(
  language: AppLanguage,
  reminder: { kind: "prayer"; prayer: PrayerName; leadMinutes: number } | { kind: ReminderKind },
  dateKey: string,
  prayerTime?: string,
) {
  const ordinal = Math.floor(Date.parse(dateKey + "T12:00:00Z") / 86_400_000);
  const select = (pool: readonly (keyof typeof evidence)[]) => pool[Math.abs(ordinal) % pool.length]!;
  let selected: keyof typeof evidence | undefined;
  if (reminder.kind === "prayer") {
    const prayer = t(language, `notifications.${reminder.prayer}`);
    const pools = {
      fajr: ["P1", "P3", "R01"],
      dhuhr: reminder.leadMinutes > 0 ? (["P2b"] as const) : (["P2", "P2b"] as const),
      asr: ["P3", "R01"],
      maghrib: ["P4"],
      isha: ["P5", "P5b"],
    } as const;
    selected = select(pools[reminder.prayer]);
    return {
      title: prayerTime
        ? t(language, "notifications.prayerAtTitle", { prayer, time: formatNumerals(prayerTime, language) })
        : t(language, "notifications.prayerNowTitle", { prayer }),
      ...evidenceBody(language, selected),
    };
  }
  const pools = {
    morning: ["Z1", "Z2", "R03"],
    evening: ["Z2", "R04"],
    before_sleep: ["Z3", "R05"],
    friday: ["T05"],
    fridayDua: ["T01"],
    beforeFajrDua: ["T02"],
    fridaySalawat: ["T04"],
    fastingPreparation: ["T06"],
  } as const;
  if (reminder.kind !== "after_prayer") selected = select(pools[reminder.kind]);
  return {
    title: t(language, `notifications.${reminder.kind}`),
    ...(selected
      ? evidenceBody(language, selected)
      : { body: t(language, "notifications.routineBody"), evidenceId: undefined, sourceUrl: undefined }),
  };
}

const SOURCE_NAMES = {
  bukhari: ["البخاري", "Bukhari"],
  muslim: ["مسلم", "Muslim"],
  tirmidhi: ["الترمذي", "Tirmidhi"],
  abudawud: ["أبو داود", "Abu Dawud"],
  mishkat: ["مشكاة المصابيح", "Mishkat"],
} as const;
const GRADES = {
  sahih: ["صحيح", "Sahih"],
  hasanGharibTirmidhi: ["حسن غريب عند الترمذي", "Hasan gharib — al-Tirmidhi"],
  sahihAlbani: ["صحيح — الألباني", "Sahih — al-Albani"],
  hasanSahihAlbani: ["حسن صحيح — الألباني", "Hasan Sahih — al-Albani"],
  hasanAlbani: ["حسن — الألباني", "Hasan — al-Albani"],
} as const;

export function notificationEvidenceDetails(language: AppLanguage, id: keyof typeof evidence) {
  const entry: {
    arabic: string;
    english: string;
    captionArabic?: string;
    captionEnglish?: string;
    source: string;
    grade: string;
  } = evidence[id];
  const arabic = language === "ar";
  const caption = arabic ? entry.captionArabic : entry.captionEnglish;
  const quotation = arabic ? entry.arabic : entry.english;
  const [collection, number] = entry.source.split(":");
  const names = SOURCE_NAMES[collection as keyof typeof SOURCE_NAMES];
  const reference = `${names[arabic ? 0 : 1]} ${number}`;
  const grade = GRADES[entry.grade as keyof typeof GRADES][arabic ? 0 : 1];
  return {
    quotation,
    reference,
    grade,
    context: caption,
    sourceUrl: `https://sunnah.com/${entry.source}`,
  };
}

function evidenceBody(language: AppLanguage, id: keyof typeof evidence) {
  const details = notificationEvidenceDetails(language, id);
  return {
    body: [details.context, `«${details.quotation}»`, `${details.reference} · ${details.grade}`]
      .filter(Boolean)
      .join("\n"),
    evidenceId: id,
    sourceUrl: details.sourceUrl,
  };
}
