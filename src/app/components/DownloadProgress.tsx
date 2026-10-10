import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import "./download-progress.css";

/** File verification can advance in steps; never imply streamed byte progress. */
export function DownloadProgress({
  completed,
  total,
  label,
  language,
  active = false,
}: {
  completed: number;
  total: number;
  label: string;
  language: AppLanguage;
  active?: boolean;
}) {
  const percent = Math.min(100, Math.max(0, Math.floor((100 * completed) / Math.max(1, total))));
  const milestone = Math.floor(percent / 25) * 25;
  return (
    <div>
      <progress
        className="download-progress"
        max={Math.max(1, total)}
        value={completed}
        aria-label={label}
        aria-valuetext={t(language, "downloads.progressValue", { percent: formatNumerals(percent, language) })}
      />
      <span className="sr-only" role="status">
        {active
          ? `${label}: ${t(language, "downloads.progressValue", { percent: formatNumerals(milestone, language) })}`
          : ""}
      </span>
    </div>
  );
}
