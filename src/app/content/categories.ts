import type { CategoryId } from "../types";

export const CATEGORIES: Array<{
  id: CategoryId;
  name: string;
  nameArabic: string;
  icon: string;
}> = [
  { id: "morning", name: "Morning Azkar", nameArabic: "أذكار الصباح", icon: "sun" },
  { id: "evening", name: "Evening Azkar", nameArabic: "أذكار المساء", icon: "crescent" },
  { id: "before_sleep", name: "Before Sleep Azkar", nameArabic: "أذكار النوم", icon: "stars" },
  { id: "waking_up", name: "Waking Up", nameArabic: "أذكار الاستيقاظ", icon: "sun" },
  { id: "after_prayer", name: "After Prayer", nameArabic: "أذكار بعد الصلاة", icon: "book-open" },
  { id: "comprehensive_duas", name: "Comprehensive Duas", nameArabic: "الأدعية الجامعة", icon: "book-open" },
  { id: "friday_kahf", name: "Surah Al-Kahf", nameArabic: "سورة الكهف", icon: "book-open" },
  { id: "home", name: "Home", nameArabic: "أذكار المنزل", icon: "home" },
  { id: "mosque", name: "Mosque", nameArabic: "أذكار المسجد", icon: "building" },
  { id: "food_drink", name: "Eating & Drinking", nameArabic: "الطعام والشراب", icon: "coffee" },
  { id: "restroom", name: "Purification", nameArabic: "أذكار الطهارة والخلاء", icon: "droplets" },
  { id: "clothing", name: "Clothing", nameArabic: "أذكار اللباس", icon: "sparkles" },
  { id: "travel", name: "Travel", nameArabic: "أذكار السفر", icon: "plane" },
  { id: "distress_anxiety", name: "Distress & Anxiety", nameArabic: "أذكار الكرب والهم", icon: "alert" },
  { id: "illness_ruqyah", name: "Illness & Ruqyah", nameArabic: "أذكار المرض والرقية", icon: "heart" },
  { id: "social_community", name: "Social & Community", nameArabic: "أذكار الإخاء والمجتمع", icon: "user" },
  { id: "natural_events", name: "Natural Events", nameArabic: "أذكار الظواهر الطبيعية", icon: "globe" },
  { id: "miscellaneous", name: "Miscellaneous", nameArabic: "أذكار متنوعة", icon: "sparkles" },
];

export const ROUTINE_CATEGORY_IDS: ReadonlySet<CategoryId> = new Set([
  "morning",
  "evening",
  "before_sleep",
  "waking_up",
  "after_prayer",
  "comprehensive_duas",
]);

export function isOccasionalCategory(catId: CategoryId): boolean {
  return !ROUTINE_CATEGORY_IDS.has(catId);
}

/**
 * Presentation-only grouping for the Library index.
 *
 * Category IDs, their order within a group, and all content are untouched —
 * Phase 06 prohibits ID migration, and this exists purely so 17 collections
 * scan as a short list of themes instead of one flat run.
 *
 * `friday_kahf` is deliberately absent: the Library already filters it out
 * because it is reached through the Friday screen.
 */
export const CATEGORY_GROUPS: ReadonlyArray<{
  id: string;
  /** i18n key under `library.groups`. */
  labelKey: string;
  categories: readonly CategoryId[];
}> = [
  {
    id: "daily",
    labelKey: "daily",
    categories: ["morning", "evening", "before_sleep", "waking_up", "after_prayer"],
  },
  { id: "place", labelKey: "place", categories: ["home", "mosque", "travel"] },
  { id: "everyday", labelKey: "everyday", categories: ["food_drink", "restroom", "clothing"] },
  { id: "hardship", labelKey: "hardship", categories: ["distress_anxiety", "illness_ruqyah"] },
  {
    id: "more",
    labelKey: "more",
    categories: ["comprehensive_duas", "social_community", "natural_events", "miscellaneous"],
  },
];
