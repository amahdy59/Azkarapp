import type { CategoryId } from "../types";

export const CATEGORIES: Array<{
  id: CategoryId;
  name: string;
  nameArabic: string;
  icon: "sun" | "crescent" | "stars";
}> = [
  { id: "morning", name: "Morning Azkar", nameArabic: "أذكار الصباح", icon: "sun" },
  { id: "evening", name: "Evening Azkar", nameArabic: "أذكار المساء", icon: "crescent" },
  { id: "before_sleep", name: "Before Sleep Azkar", nameArabic: "أذكار النوم", icon: "stars" },
];
