import type { DailyCollectionCompletion } from "../types";
import { MAIN_CATEGORY_IDS } from "../progress";

export type GardenLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface OasisHabits {
  quranWird: boolean;
  mosquePrayers: "mosque_3" | "mosque_5" | null;
  active?: boolean;
}

export interface OasisRoutines {
  morning: boolean;
  evening: boolean;
  beforeSleep: boolean;
  afterPrayerCount: number;
  extraCategoriesCount: number;
}

export interface OasisLevelDetail {
  level: GardenLevel;
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  nextMilestone?: string;
  nextMilestoneArabic?: string;
  progressPercent: number;
}

export interface OasisDayState {
  dayKey: string;
  date: Date;
  level: GardenLevel;
  routines: OasisRoutines;
  habits: OasisHabits;
  isToday: boolean;
}

/**
 * Calculates the oasis progression level (0–5) from completed routines and daily habits.
 *
 * Tier thresholds:
 * - Level 0: Inactive / No activity recorded today.
 * - Level 1: Droplet — Any activity (situational zikr, any non-core dhikr, or habit).
 * - Level 2: Seedling — At least 1 core routine (Morning, Evening, or Sleep).
 * - Level 3: Branch — Morning AND Evening azkar completed (the two ends of the day).
 * - Level 4: Palm — Morning, Evening, AND Before Sleep azkar completed.
 * - Level 5: Oasis — Full devotion: Morning + Evening + Sleep + 5 After-Prayer adhkar + Quran Wird + Mosque prayers.
 */
export function calculateOasisLevel(routines: OasisRoutines, habits: OasisHabits): GardenLevel {
  const hasMorning = routines.morning;
  const hasEvening = routines.evening;
  const hasSleep = routines.beforeSleep;
  const hasCoreAll = hasMorning && hasEvening && hasSleep;
  const hasAfterPrayerAll = routines.afterPrayerCount >= 5;
  const hasQuranWird = habits.quranWird;
  const hasMosquePrayers = Boolean(habits.mosquePrayers);

  if (hasCoreAll && hasAfterPrayerAll && hasQuranWird && hasMosquePrayers) {
    return 5;
  }

  if (hasCoreAll) {
    return 4;
  }

  if (hasMorning && hasEvening) {
    return 3;
  }

  if (hasMorning || hasEvening || hasSleep) {
    return 2;
  }

  const anyActivity =
    Boolean(habits.active) ||
    routines.afterPrayerCount > 0 ||
    routines.extraCategoriesCount > 0 ||
    hasQuranWird ||
    hasMosquePrayers;

  if (anyActivity) {
    return 1;
  }

  return 0;
}

export const OASIS_LEVEL_DETAILS: Record<GardenLevel, OasisLevelDetail> = {
  0: {
    level: 0,
    name: "Awaiting Dhikr",
    nameArabic: "بانتظار الذكر",
    description: "Start with any remembrance or prayer to nurture your heart.",
    descriptionArabic: "ابدأ بأي ذكر أو دعاء لترطيب لسانك وقلبك.",
    nextMilestone: "Complete any zikr or habit to earn your first Droplet.",
    nextMilestoneArabic: "أتمم أي ذكر أو عادة لتنال قطرة الندى الأولى.",
    progressPercent: 0,
  },
  1: {
    level: 1,
    name: "Droplet of Remembrance",
    nameArabic: "قطرة الندى",
    description: "The first drop of remembrance that revives the spiritual soil.",
    descriptionArabic: "أول قطرة تروي بها أرضك الروحية بنفحات الذكر.",
    nextMilestone: "Complete Morning, Evening, or Sleep azkar to sprout a Seedling.",
    nextMilestoneArabic: "أتمم أذكار الصباح أو المساء أو النوم لتنبت فسيلتك.",
    progressPercent: 20,
  },
  2: {
    level: 2,
    name: "Sprouted Seedling",
    nameArabic: "فسيلة نامية",
    description: "A foundational routine has taken root and started to sprout.",
    descriptionArabic: "بداية ثابتة أينعت فيها أولى أورادك اليومية المباركة.",
    nextMilestone: "Complete both Morning and Evening azkar to grow into a Branch.",
    nextMilestoneArabic: "اجمع بين أذكار الصباح والمساء لتورق أغصانك.",
    progressPercent: 40,
  },
  3: {
    level: 3,
    name: "Extended Branch",
    nameArabic: "غصن مورق",
    description: "Both ends of the day are safeguarded with morning and evening protection.",
    descriptionArabic: "حفظت طرفي النهار بأذكار الصباح والمساء وامتدت أغصانك.",
    nextMilestone: "Complete Before Sleep azkar to crown your day with a Palm.",
    nextMilestoneArabic: "أتمم أذكار النوم لتكتمل نخلتك الذهبية لليوم.",
    progressPercent: 65,
  },
  4: {
    level: 4,
    name: "Full Palm",
    nameArabic: "نخلة مكتملة",
    description: "Full daily protection achieved with Morning, Evening, and Sleep azkar.",
    descriptionArabic: "اكتملت نخلتك الذهبية بتحصين الصباح والمساء وأذكار النوم.",
    nextMilestone: "Add 5 after-prayer adhkar, Quran wird, and mosque prayers to reach the Oasis.",
    nextMilestoneArabic: "أضف أذكار الصلوات الخمس والورد القرآني وصلاة المسجد لتبلغ الواحة.",
    progressPercent: 85,
  },
  5: {
    level: 5,
    name: "Flourishing Oasis",
    nameArabic: "واحة مزدهرة",
    description: "The highest sanctuary of devotion: palms, prayers, Qur'an, and spring waters.",
    descriptionArabic: "قمة العطاء الروحي: نخل وظلال وورد وقرآن وجماعة في المسجد.",
    nextMilestone: "Oasis complete! Keep this serene rhythm alive tomorrow.",
    nextMilestoneArabic: "اكتملت الواحة! حافظ على هذا النقاء والسكينة غداً.",
    progressPercent: 100,
  },
};

/**
 * Derives daily Oasis status from app data completions.
 */
export function deriveOasisRoutinesFromCompletions(
  records: readonly DailyCollectionCompletion[],
  dayKey: string,
): OasisRoutines {
  const dayRecords = records.filter((r) => r.dayKey === dayKey);
  const categories = new Set(dayRecords.map((r) => r.category));

  const morning = categories.has("morning");
  const evening = categories.has("evening");
  const beforeSleep = categories.has("before_sleep");

  const afterPrayerRecords = dayRecords.filter((r) => r.category === "after_prayer");
  const subCats = new Set(afterPrayerRecords.map((r) => r.subCategory).filter(Boolean));
  const afterPrayerCount = subCats.size > 0 ? subCats.size : categories.has("after_prayer") ? 1 : 0;

  const extraCategories = [...categories].filter((c) => !MAIN_CATEGORY_IDS.includes(c) && c !== "after_prayer");

  return {
    morning,
    evening,
    beforeSleep,
    afterPrayerCount,
    extraCategoriesCount: extraCategories.length,
  };
}

/**
 * Creates preset mock routines and habits for sandbox simulation.
 */
export function getPresetOasisState(level: GardenLevel): { routines: OasisRoutines; habits: OasisHabits } {
  switch (level) {
    case 5:
      return {
        routines: {
          morning: true,
          evening: true,
          beforeSleep: true,
          afterPrayerCount: 5,
          extraCategoriesCount: 2,
        },
        habits: {
          quranWird: true,
          mosquePrayers: "mosque_5",
          active: true,
        },
      };
    case 4:
      return {
        routines: {
          morning: true,
          evening: true,
          beforeSleep: true,
          afterPrayerCount: 2,
          extraCategoriesCount: 0,
        },
        habits: {
          quranWird: false,
          mosquePrayers: null,
          active: true,
        },
      };
    case 3:
      return {
        routines: {
          morning: true,
          evening: true,
          beforeSleep: false,
          afterPrayerCount: 0,
          extraCategoriesCount: 0,
        },
        habits: {
          quranWird: false,
          mosquePrayers: null,
          active: true,
        },
      };
    case 2:
      return {
        routines: {
          morning: true,
          evening: false,
          beforeSleep: false,
          afterPrayerCount: 0,
          extraCategoriesCount: 0,
        },
        habits: {
          quranWird: false,
          mosquePrayers: null,
          active: true,
        },
      };
    case 1:
      return {
        routines: {
          morning: false,
          evening: false,
          beforeSleep: false,
          afterPrayerCount: 1,
          extraCategoriesCount: 0,
        },
        habits: {
          quranWird: false,
          mosquePrayers: null,
          active: true,
        },
      };
    case 0:
    default:
      return {
        routines: {
          morning: false,
          evening: false,
          beforeSleep: false,
          afterPrayerCount: 0,
          extraCategoriesCount: 0,
        },
        habits: {
          quranWird: false,
          mosquePrayers: null,
          active: false,
        },
      };
  }
}
