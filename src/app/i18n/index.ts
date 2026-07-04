import ar from "./ar";
import en from "./en";
import type { AppLanguage } from "../types";

const dictionaries = {
  ar,
  en,
} as const;

function getDictionary(language: AppLanguage) {
  return language === "ar" ? dictionaries.ar : dictionaries.en;
}

function resolveKey(source: Record<string, unknown>, key: string): string {
  const result = key.split(".").reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }
    return (value as Record<string, unknown>)[part];
  }, source);

  return typeof result === "string" ? result : key;
}

export function t(language: AppLanguage, key: string, replacements?: Record<string, string | number>) {
  const dictionary = getDictionary(language) as unknown as Record<string, unknown>;
  let template = resolveKey(dictionary, key);

  if (!replacements) {
    return template;
  }

  for (const [name, value] of Object.entries(replacements)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }

  return template;
}
