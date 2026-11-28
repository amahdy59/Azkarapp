import { BookOpen, CheckCircle2, Download } from "./icons";
import { Button } from "./ui/button";
import { learningT } from "../i18n/learning";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import type { LearningOfflineStatus } from "../learning/learningAssets";
import type { LearningDownload } from "../learning/learningDownloads";
import type { LearningEditionId } from "../learning/types";

export function LearningOfflineActions({
  language,
  resourceId,
  status,
  job,
  onSave,
  onCancel,
  onRemove,
}: {
  language: AppLanguage;
  resourceId: LearningEditionId;
  status?: LearningOfflineStatus;
  job: LearningDownload | null;
  onSave: () => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const ownJob = job?.resourceId === resourceId ? job : null;
  const busy = job?.phase === "saving";
  const saving = ownJob?.phase === "saving";
  // A concurrent cache check may see all files before the active job finishes
  // its verification. Announce readiness only after that job has completed.
  const label = saving
    ? "downloading"
    : !status
      ? "checking"
      : !status.available
        ? "storageUnavailable"
        : status.complete
          ? "savedOffline"
          : status.previousEdition
            ? "previousSaved"
            : status.savedFiles
              ? "partial"
              : "notSaved";
  return (
    <div className="space-y-2">
      <p
        role={ownJob?.phase === "ready" ? "status" : undefined}
        className="flex items-start gap-2 text-sm text-muted-foreground"
      >
        {status?.complete && !saving ? (
          <CheckCircle2 size={18} className="shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <BookOpen size={18} className="shrink-0" aria-hidden="true" />
        )}
        {learningT(language, label)}
      </p>
      {saving && (
        <div role="status" className="space-y-1 text-sm">
          <p>
            {learningT(language, "downloadProgress", {
              current: formatNumerals(ownJob.completed, language),
              total: formatNumerals(ownJob.total, language),
            })}
          </p>
          <progress
            className="w-full accent-primary"
            value={ownJob.completed}
            max={ownJob.total}
            aria-label={learningT(language, "downloading")}
          />
        </div>
      )}
      {ownJob?.phase === "failed" && (
        <p role="alert" className="text-sm text-foreground">
          {learningT(language, "downloadFailed")}
        </p>
      )}
      {ownJob?.phase === "cancelled" && (
        <p role="status" className="text-sm text-muted-foreground">
          {learningT(language, "downloadCancelled")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {saving ? (
          <Button variant="outline" onClick={onCancel}>
            {learningT(language, "cancel")}
          </Button>
        ) : (
          !status?.complete && (
            <Button variant="outline" disabled={!status?.available || busy} onClick={onSave}>
              <Download aria-hidden="true" />
              {learningT(language, "saveOffline")}
            </Button>
          )
        )}
        {onRemove && Boolean(status?.savedFiles || status?.previousEdition) && (
          <Button variant="ghost" onClick={onRemove} disabled={busy}>
            {learningT(language, "removeDownload")}
          </Button>
        )}
      </div>
    </div>
  );
}
