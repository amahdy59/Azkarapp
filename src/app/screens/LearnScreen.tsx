import { useMemo, useState } from "react";
import { ArrowPrevious, BookOpen } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { LearningOfflineActions } from "../components/LearningOfflineActions";
import { LearningLanguageChoices } from "../components/LearningLanguageChoices";
import { learningCatalogue, learningEditions, learningDescription, learningEditionNotice } from "../learning/catalogue";
import { updateLearningState } from "../learning/learningState";
import { cancelLearningDownload, startLearningDownload } from "../learning/learningDownloads";
import { useLearningOffline, useLearningState } from "../hooks/useLearningLibrary";
import { learningT } from "../i18n/learning";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { LearningResourceId } from "../learning/types";
import { learningEditionId, type LearningLanguage } from "../learning/types";
import "./learn.css";

export function LearnScreen({
  language,
  direction,
  onBack,
  onOpenResource,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  onOpenResource: (id: LearningResourceId, unitId?: string, contentLanguage?: LearningLanguage) => void;
}) {
  const state = useLearningState();
  const editions = useMemo(() => learningEditions(language), [language]);
  const resources = useMemo(
    () =>
      learningCatalogue(language).map(
        (base) =>
          editions.find((edition) => edition.id === base.id && edition.language === state[base.id]?.contentLanguage) ||
          base,
      ),
    [language, editions, state],
  );
  const [storageNotice, setStorageNotice] = useState(false);
  const { statuses, job } = useLearningOffline(resources);
  return (
    <ScreenContainer dir={direction} screenName={learningT(language, "title")}>
      <div className="mx-auto w-full max-w-7xl px-page">
        <Button variant="ghost" onClick={onBack}>
          <ArrowPrevious aria-hidden="true" />
          {t(language, "more.title")}
        </Button>
        <Header
          title={learningT(language, "title")}
          subtitle={learningT(language, "subtitle")}
          language={language}
          elevateOnScroll={false}
          style={{ position: "static", paddingInline: 0 }}
        />
        <section aria-labelledby="learn-books-title" className="space-y-4 py-4">
          <div>
            <h2 id="learn-books-title" className="text-title font-bold">
              {learningT(language, "books")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{learningT(language, "booksDescription")}</p>
          </div>
          <div className="learn-catalogue">
            {!resources.length && (
              <p role="status" className="text-muted-foreground">
                {learningT(language, "noBooks")}
              </p>
            )}
            {resources.map((resource) => (
              <article key={resource.id} className="learn-book-card" aria-labelledby={`title-${resource.id}`}>
                <div className="learn-book-summary">
                  <div className="learn-book-cover" aria-hidden="true">
                    <BookOpen size={32} />
                    <span />
                    <span />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-micro font-semibold text-primary">
                      {learningT(language, resource.language === "ar" ? "arabicContent" : "englishContent")}
                    </p>
                    <h3
                      id={`title-${resource.id}`}
                      lang={resource.language}
                      dir={resource.language === "ar" ? "rtl" : "ltr"}
                      className="text-lg font-bold leading-relaxed text-foreground"
                    >
                      {resource.title}
                    </h3>
                    <p
                      lang={resource.language}
                      dir={resource.language === "ar" ? "rtl" : "ltr"}
                      className="text-sm text-muted-foreground"
                    >
                      {resource.author}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {learningDescription(language, resource.id)}
                </p>
                <LearningLanguageChoices
                  language={language}
                  value={resource.language}
                  choices={editions.filter((edition) => edition.id === resource.id).map((edition) => edition.language)}
                  onChange={(contentLanguage) => {
                    setStorageNotice(
                      !updateLearningState(resource.id, (previous) => ({ ...previous, contentLanguage })),
                    );
                  }}
                />
                {learningEditionNotice(language, resource) && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {learningEditionNotice(language, resource, true)}
                  </p>
                )}
                <Button
                  className="mt-auto w-full"
                  onClick={() =>
                    onOpenResource(resource.id, state[learningEditionId(resource)]?.position?.unitId, resource.language)
                  }
                  aria-describedby={`title-${resource.id}`}
                >
                  <BookOpen aria-hidden="true" />
                  {learningT(language, state[learningEditionId(resource)]?.position ? "continue" : "read")}
                </Button>
                <LearningOfflineActions
                  language={language}
                  resourceId={learningEditionId(resource)}
                  status={statuses[learningEditionId(resource)]}
                  job={job}
                  onSave={() => void startLearningDownload(resource)}
                  onCancel={cancelLearningDownload}
                />
              </article>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{learningT(language, "localProgress")}</p>
          <p role="status" className="text-sm">
            {storageNotice ? learningT(language, "sessionOnly") : ""}
          </p>
        </section>
      </div>
    </ScreenContainer>
  );
}
