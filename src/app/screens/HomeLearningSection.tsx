import { useSyncExternalStore } from "react";
import { HomeLearningCard } from "../components/HomeLearningCard";
import { readLearningState, subscribeLearningState } from "../learning/learningState";
import { learningEditions } from "../learning/catalogue";
import { getLearningContinuation } from "../learning/learningContinuation";
import type { LearningLanguage, LearningResourceId } from "../learning/types";
import type { AppLanguage } from "../types";
import { learningT } from "../i18n/learning";
import { formatNumerals } from "../formatting";

/** Deferred metadata/record composition; Home never opens packs or scans downloads. */
export function HomeLearningSection({
  language,
  onGlass,
  onOpenBooks,
  onOpenResource,
}: {
  language: AppLanguage;
  onGlass: boolean;
  onOpenBooks: () => void;
  onOpenResource: (id: LearningResourceId, unitId?: string, contentLanguage?: LearningLanguage) => void;
}) {
  const state = useSyncExternalStore(subscribeLearningState, readLearningState);
  const available = learningEditions(language);
  if (!available.length) return null;
  const continuation = getLearningContinuation(available, state);
  return (
    <HomeLearningCard
      language={language}
      onGlass={onGlass}
      onOpenBooks={onOpenBooks}
      book={
        continuation
          ? {
              title: continuation.resource.title,
              language: continuation.resource.language,
              sectionLabel: learningT(language, "sourcePage", {
                page: formatNumerals(Number(continuation.unitId.slice(2)), language),
              }),
            }
          : undefined
      }
      onContinue={
        continuation
          ? () => onOpenResource(continuation.resource.id, continuation.unitId, continuation.resource.language)
          : undefined
      }
    />
  );
}
