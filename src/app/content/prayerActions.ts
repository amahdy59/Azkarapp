import { Mosque, PrayerBeads, PrayerRug } from "../components/icons";
import { t } from "../i18n";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import {
  getPrayerSunnah,
  TWELVE_RAKAHS,
  type PrayerSunnah,
  type SunnahEvidence,
  type SunnahRank,
} from "./prayerSunnah";
import type { PrayerTrackingWrite } from "../components/PrayerTrackerCards";

export type PrayerActionId = "congregation" | "sunnah_before" | "adhkar" | "sunnah_after";

export interface PrayerActionItem {
  id: PrayerActionId;
  label: string;
  Icon: typeof Mosque;
  field: PrayerTrackingWrite;
  checked: boolean;
  testId: string;
}

export interface PrayerSunnahDetail {
  position: "before" | "after";
  title: string;
  rakahs: number;
  rakahsLabel: string;
  rank: SunnahRank;
  rankLabel: string;
  description: string;
  sunnah: PrayerSunnah;
}

export interface PrayerRawatibVirtue {
  title: string;
  description: string;
  evidence: SunnahEvidence;
}

export interface PrayerInfoData {
  prayer: PrayerName;
  prayerName: string;
  modalTitle: string;
  rawatibVirtue: PrayerRawatibVirtue;
  sunnahItems: PrayerSunnahDetail[];
}

/**
 * Returns the relevant checklist action items for a given prayer in their natural order.
 * - Fajr: congregation -> sunnah before -> adhkar
 * - Dhuhr: congregation -> sunnah before -> adhkar -> sunnah after
 * - Asr: congregation -> sunnah before -> adhkar
 * - Maghrib: congregation -> adhkar -> sunnah after
 * - Isha: congregation -> adhkar -> sunnah after
 */
export function getPrayerActions({
  prayer,
  language,
  record,
}: {
  prayer: PrayerName;
  language: AppLanguage;
  record?: PrayerTrackingRecord;
}): PrayerActionItem[] {
  const name = t(language, `notifications.${prayer}`);
  const actions: PrayerActionItem[] = [];

  // 1. Obligatory prayer in congregation (All 5 prayers)
  actions.push({
    id: "congregation",
    label: t(language, "prayerActions.prayedCongregation", { prayer: name }),
    Icon: Mosque,
    field: "location",
    checked: record?.location === "mosque" || record?.mosque === true,
    testId: "prayer-action-location",
  });

  // 2. Sunnah before (Fajr, Dhuhr, Asr)
  const hasSunnahBeforeInChecklist = prayer === "fajr" || prayer === "dhuhr" || prayer === "asr";
  if (hasSunnahBeforeInChecklist) {
    const isChecked =
      prayer === "dhuhr" ? (record?.sunnahBefore ?? false) : (record?.sunnahBefore ?? record?.sunnah ?? false);

    const labelKey =
      prayer === "fajr"
        ? "prayerActions.fajrBeforeAction"
        : prayer === "dhuhr"
          ? "prayerActions.dhuhrBeforeAction"
          : "prayerActions.asrBeforeAction";

    actions.push({
      id: "sunnah_before",
      label: t(language, labelKey),
      Icon: PrayerRug,
      field: prayer === "dhuhr" ? "sunnahBefore" : "sunnah",
      checked: isChecked,
      testId: `prayer-action-${prayer}-sunnah-before`,
    });
  }

  // 3. Adhkar after prayer (All 5 prayers)
  actions.push({
    id: "adhkar",
    label: t(language, "prayerActions.adhkarAfterPrayer"),
    Icon: PrayerBeads,
    field: "adhkar",
    checked: record?.adhkar === true,
    testId: `prayer-action-${prayer}-adhkar`,
  });

  // 4. Sunnah after (Dhuhr, Maghrib, Isha)
  const hasSunnahAfterInChecklist = prayer === "dhuhr" || prayer === "maghrib" || prayer === "isha";
  if (hasSunnahAfterInChecklist) {
    const isChecked =
      prayer === "dhuhr" ? (record?.sunnahAfter ?? false) : (record?.sunnahAfter ?? record?.sunnah ?? false);

    const labelKey =
      prayer === "dhuhr"
        ? "prayerActions.dhuhrAfterAction"
        : prayer === "maghrib"
          ? "prayerActions.maghribAfterAction"
          : "prayerActions.ishaAfterAction";

    actions.push({
      id: "sunnah_after",
      label: t(language, labelKey),
      Icon: PrayerRug,
      field: prayer === "dhuhr" ? "sunnahAfter" : "sunnah",
      checked: isChecked,
      testId: `prayer-action-${prayer}-sunnah-after`,
    });
  }

  return actions;
}

/**
 * Returns structured educational information about the Sunnah prayers of the selected prayer.
 */
export function getPrayerInfoData(prayer: PrayerName, language: AppLanguage): PrayerInfoData {
  const prayerName = t(language, `notifications.${prayer}`);
  const modalTitle = t(language, "prayerActions.infoTitle", { prayer: prayerName });

  const sunnahBefore = getPrayerSunnah(prayer, "before");
  const sunnahAfter = getPrayerSunnah(prayer, "after");

  const sunnahItems: PrayerSunnahDetail[] = [];

  if (sunnahBefore) {
    const descKey =
      prayer === "fajr"
        ? "prayerActions.fajrBeforeDesc"
        : prayer === "dhuhr"
          ? "prayerActions.dhuhrBeforeDesc"
          : prayer === "asr"
            ? "prayerActions.asrBeforeDesc"
            : "prayerActions.maghribBeforeDesc";

    sunnahItems.push({
      position: "before",
      title: t(language, "prayerActions.beforePrayer"),
      rakahs: sunnahBefore.before,
      rakahsLabel: t(language, sunnahBefore.before === 4 ? "prayerActions.rakahsFour" : "prayerActions.rakahsTwo"),
      rank: sunnahBefore.rank,
      rankLabel: t(
        language,
        sunnahBefore.rank === "confirmed" ? "prayerActions.confirmedRank" : "prayerActions.optionalRank",
      ),
      description: t(language, descKey),
      sunnah: sunnahBefore,
    });
  }

  if (sunnahAfter) {
    const descKey =
      prayer === "dhuhr"
        ? "prayerActions.dhuhrAfterDesc"
        : prayer === "maghrib"
          ? "prayerActions.maghribAfterDesc"
          : "prayerActions.ishaAfterDesc";

    sunnahItems.push({
      position: "after",
      title: t(language, "prayerActions.afterPrayer"),
      rakahs: sunnahAfter.after,
      rakahsLabel: t(language, sunnahAfter.after === 4 ? "prayerActions.rakahsFour" : "prayerActions.rakahsTwo"),
      rank: sunnahAfter.rank,
      rankLabel: t(
        language,
        sunnahAfter.rank === "confirmed" ? "prayerActions.confirmedRank" : "prayerActions.optionalRank",
      ),
      description: t(language, descKey),
      sunnah: sunnahAfter,
    });
  }

  return {
    prayer,
    prayerName,
    modalTitle,
    rawatibVirtue: {
      title: t(language, "prayerActions.rawatibVirtueTitle"),
      description: t(language, "prayerActions.rawatibVirtueDesc"),
      evidence: TWELVE_RAKAHS,
    },
    sunnahItems,
  };
}
