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
  { id: "home", name: "Home", nameArabic: "الدخول والخروج من المنزل", icon: "home" },
  { id: "mosque", name: "Mosque", nameArabic: "أذكار المسجد", icon: "building" },
  { id: "after_prayer", name: "After Prayer", nameArabic: "أذكار بعد الصلاة", icon: "book-open" },
  { id: "restroom", name: "Restroom", nameArabic: "أذكار الخلاء", icon: "droplets" },
  { id: "food_drink", name: "Eating & Drinking", nameArabic: "الطعام والشراب", icon: "coffee" },
  { id: "travel", name: "Travel", nameArabic: "أذكار السفر", icon: "plane" },
];
