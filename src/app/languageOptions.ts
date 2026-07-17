import type { AppLanguage } from "./types";

export const LANGUAGES_LIST: Array<{
  code: AppLanguage;
  native: string;
  name: string;
}> = [
  { code: "en", native: "English", name: "English" },
  { code: "ar", native: "العربية", name: "Arabic" },
];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: "English",
  ar: "العربية",
};
