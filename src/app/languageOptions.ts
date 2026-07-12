import type { AppLanguage } from "./types";

export const LANGUAGES_LIST: Array<{
  code: AppLanguage;
  flag: string;
  native: string;
  name: string;
}> = [
  { code: "en", flag: "🇬🇧", native: "English", name: "English" },
  { code: "ar", flag: "🇸🇦", native: "العربية", name: "Arabic" },
  { code: "fr", flag: "🇫🇷", native: "Français", name: "French" },
  { code: "ur", flag: "🇵🇰", native: "اردو", name: "Urdu" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe", name: "Turkish" },
  { code: "id", flag: "🇮🇩", native: "Bahasa Indonesia", name: "Indonesian" },
  { code: "ml", flag: "🇮🇳", native: "മലയാളം", name: "Malayalam" },
  { code: "ha", flag: "🇳🇬", native: "Hausa", name: "Hausa" },
];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: "English",
  ar: "Arabic",
  fr: "French",
  ur: "Urdu",
  tr: "Turkish",
  id: "Indonesian",
  ml: "Malayalam",
  ha: "Hausa",
};
