import type { CategoryId } from "../types";

export const CATEGORIES: Array<{
  id: CategoryId;
  name: string;
  nameArabic: string;
  icon: "sun" | "crescent" | "stars";
  totalCount: number;
}> = [
  { id: "morning", name: "Morning Azkar", nameArabic: "أذكار الصباح", icon: "sun", totalCount: 15 },
  { id: "evening", name: "Evening Azkar", nameArabic: "أذكار المساء", icon: "crescent", totalCount: 15 },
  { id: "before_sleep", name: "Before Sleep", nameArabic: "أذكار النوم", icon: "stars", totalCount: 10 },
];
