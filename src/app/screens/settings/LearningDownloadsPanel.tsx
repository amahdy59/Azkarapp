import { useMemo, useState } from "react";
import { BookOpen, RotateCcw } from "../../components/icons";
import { Button } from "../../components/ui/button";
import { LearningOfflineActions } from "../../components/LearningOfflineActions";
import { useLearningOffline } from "../../hooks/useLearningLibrary";
import { allLearningEditions, isLearningResourceAvailable, learningEditionNotice } from "../../learning/catalogue";
import { learningEditionId } from "../../learning/types";
import { removeLearningDownload } from "../../learning/learningAssets";
import { cancelLearningDownload, startLearningDownload } from "../../learning/learningDownloads";
import { learningT } from "../../i18n/learning";
import type { AppLanguage } from "../../types";
import type { LearningResource } from "../../learning/types";

export function LearningDownloadsPanel({ language }: { language: AppLanguage }) {
  const resources = useMemo(() => allLearningEditions(language), [language]);
  const { statuses, job, refresh } = useLearningOffline(resources);
  const [notice, setNotice] = useState("");
  const [removing, setRemoving] = useState(false);
  const managed = resources.filter(
    (resource) => isLearningResourceAvailable(resource) || statuses[learningEditionId(resource)]?.textSaved,
  );
  const checked = resources.every((resource) => statuses[learningEditionId(resource)] !== undefined);
  const remove = async (resource: LearningResource) => {
    setRemoving(true);
    try {
      await removeLearningDownload(resource);
      await refresh();
      setNotice(learningT(language, "removed"));
    } catch {
      setNotice(learningT(language, "storageUnavailable"));
    } finally {
      setRemoving(false);
    }
  };
  return (
    <div className="space-y-4 pt-4" data-testid="learning-downloads">
      <div className="flex items-center gap-3">
        <BookOpen className="shrink-0 text-primary" aria-hidden="true" />
        <h2 className="min-w-0 font-bold">{learningT(language, "books")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{learningT(language, "offlineHelp")}</p>
      {!managed.length && (
        <p role="status" className="text-sm text-muted-foreground">
          {learningT(language, checked ? "noBooks" : "checking")}
        </p>
      )}
      {managed.map((resource) => (
        <section
          key={learningEditionId(resource)}
          className="space-y-3 border-t border-border py-3"
          aria-labelledby={`download-${learningEditionId(resource)}`}
        >
          <h3
            id={`download-${learningEditionId(resource)}`}
            lang={resource.language}
            dir={resource.language === "ar" ? "rtl" : "ltr"}
            className="font-semibold leading-relaxed"
          >
            {resource.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {learningT(language, resource.language === "ar" ? "arabicContent" : "englishContent")}
          </p>
          {learningEditionNotice(language, resource) && (
            <p className="text-sm text-muted-foreground">{learningEditionNotice(language, resource)}</p>
          )}
          <div aria-busy={removing}>
            {isLearningResourceAvailable(resource) ? (
              <LearningOfflineActions
                language={language}
                resourceId={learningEditionId(resource)}
                status={statuses[learningEditionId(resource)]}
                job={job}
                onSave={() => {
                  if (!removing) void startLearningDownload(resource);
                }}
                onCancel={cancelLearningDownload}
                onRemove={() => {
                  if (!removing) void remove(resource);
                }}
              />
            ) : (
              <div className="space-y-2">
                <p className="text-sm">{learningT(language, "savedUnavailable")}</p>
                <Button
                  variant="outline"
                  disabled={removing || job?.phase === "saving"}
                  onClick={() => void remove(resource)}
                >
                  {learningT(language, "removeDownload")}
                </Button>
              </div>
            )}
          </div>
        </section>
      ))}
      <Button
        variant="outline"
        onClick={() => void refresh()}
        disabled={!managed.length || job?.phase === "saving" || removing}
      >
        <RotateCcw aria-hidden="true" />
        {learningT(language, "refresh")}
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {notice}
      </p>
    </div>
  );
}
