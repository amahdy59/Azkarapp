import { useCallback } from "react";
import { t, type TranslationKey } from "../i18n";
import type { AppLanguage } from "../types";

export function useTranslation(language: AppLanguage) {
  return {
    t: useCallback(
      (key: TranslationKey | (string & {}), replacements?: Record<string, string | number>) => {
        return t(language, key, replacements);
      },
      [language],
    ),
  };
}
