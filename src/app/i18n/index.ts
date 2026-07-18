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

type TranslationSchema = typeof dictionaries.en;
export type TranslationKey = {
  [K in keyof TranslationSchema]: TranslationSchema[K] extends Record<string, string>
    ? {
        [K2 in keyof TranslationSchema[K]]: `${K & string}.${K2 & string}`;
      }[keyof TranslationSchema[K]]
    : K & string;
}[keyof TranslationSchema];

export function t(language: AppLanguage, key: TranslationKey | (string & {}), replacements?: Record<string, string | number>) {
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
