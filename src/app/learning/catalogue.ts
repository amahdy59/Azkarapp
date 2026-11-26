import data from "./catalogue.json";
import { learningT } from "../i18n/learning";
import type { AppLanguage } from "../types";
import type { LearningResource, LearningResourceId, LearningLanguage } from "./types";

declare const __LEARNING_REVIEW__: boolean;

export const LEARNING_IDS: readonly LearningResourceId[] = ["al-mukhtar", "dalil-al-mutamir", "al-wird-an-nabawi"];
const labels = { "al-mukhtar": "mukhtar", "dalil-al-mutamir": "mutamir", "al-wird-an-nabawi": "wird" } as const;

/** Metadata for removal-only management of previously cached editions. Never a reading catalogue. */
export function allLearningEditions(language: AppLanguage): LearningResource[] {
  return data.map((item) => ({
    ...item,
    id: item.id as LearningResourceId,
    kind: "book" as const,
    language: item.language as LearningLanguage,
    status: "status" in item ? ("draft-for-review" as const) : undefined,
    title: "title" in item ? String(item.title) : learningT(language, `${labels[item.id as LearningResourceId]}Title`),
    author:
      "author" in item
        ? String(item.author)
        : learningT(language, item.id === "al-wird-an-nabawi" ? "uwaishizAuthor" : "utairAuthor"),
  }));
}

export function learningEditions(language: AppLanguage): LearningResource[] {
  const review = import.meta.env.DEV || (typeof __LEARNING_REVIEW__ !== "undefined" && __LEARNING_REVIEW__);
  // Owner enabled the three Arabic adaptations for subsequent review. Keep
  // their honest source notices; unfinished English publication stays gated.
  return allLearningEditions(language).filter((item) => item.language === "ar" || !item.status || review);
}

export function isLearningResourceAvailable(resource: Pick<LearningResource, "id" | "language">) {
  return learningEditions("ar").some((item) => item.id === resource.id && item.language === resource.language);
}

export function learningCatalogue(language: AppLanguage, contentLanguage: LearningLanguage = "ar"): LearningResource[] {
  return learningEditions(language).filter((item) => item.language === contentLanguage);
}

export function learningDescription(language: AppLanguage, id: LearningResourceId) {
  return learningT(language, `${labels[id]}Description`);
}

/** Never substitute another book or consult a hidden edition for recovery. */
export function resolveLearningResource(
  language: AppLanguage,
  id: LearningResourceId,
  requested: LearningLanguage,
  available = learningEditions(language),
): LearningResource | undefined {
  return (
    available.find((item) => item.id === id && item.language === requested) ||
    available.find((item) => item.id === id && item.language === "ar")
  );
}

export function learningEditionNotice(language: AppLanguage, resource: LearningResource, detail = false) {
  if (resource.status === "draft-for-review") {
    return learningT(
      language,
      resource.language === "en" && resource.id === "dalil-al-mutamir"
        ? detail
          ? "englishDraft"
          : "englishDraftShort"
        : detail
          ? "reviewCopy"
          : "reviewCopyShort",
    );
  }
  if (resource.id === "dalil-al-mutamir" && resource.language === "ar")
    return learningT(language, detail ? "umrahScope" : "umrahScopeShort");
  return undefined;
}
