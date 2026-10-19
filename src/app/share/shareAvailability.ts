import type { ShareContentOptions, ShareItem } from "./shareLayout";

export type ShareAddition = "meaning" | "wordMeanings" | "pronunciation" | "benefit" | "source";
export type SharePreset = "arabic" | "translated" | "full" | "custom";

/** Match the renderer's eligibility, including reminder and language policies. */
export function getShareAvailability(items: readonly ShareItem[]): Record<ShareAddition, number> {
  const nonempty = (value?: string) => Boolean(value?.trim());
  return {
    meaning: items.filter((item) => !item.reminder && nonempty(item.translation)).length,
    wordMeanings: items.filter((item) => !item.reminder && item.language === "ar" && nonempty(item.wordMeanings))
      .length,
    pronunciation: items.filter((item) => !item.reminder && nonempty(item.transliteration)).length,
    benefit: items.filter((item) => !item.reminder && nonempty(item.benefit)).length,
    source: items.filter((item) => nonempty(item.sourceReference)).length,
  };
}

export function sharePresetOptions(
  preset: Exclude<SharePreset, "custom">,
  items: readonly ShareItem[],
): ShareContentOptions {
  const available = getShareAvailability(items);
  return {
    meaning: preset !== "arabic" && available.meaning > 0,
    wordMeanings: preset === "full" && available.wordMeanings > 0,
    pronunciation: preset === "full" && available.pronunciation > 0,
    benefit: preset === "full" && available.benefit > 0,
  };
}
