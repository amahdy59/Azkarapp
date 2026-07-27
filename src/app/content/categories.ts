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
