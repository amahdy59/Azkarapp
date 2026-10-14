import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ProgressBar } from "./ProgressBar";

/** Transfer progress is distinct from verified offline readiness. */
export function DownloadProgress({
  completed,
  total,
  label,
  language,
  direction = language === "ar" ? "rtl" : "ltr",
  active = false,
}: {
  completed: number;
  total: number;
  label: string;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  active?: boolean;
}) {
  const percent = Math.min(100, Math.max(0, Math.floor((100 * completed) / Math.max(1, total))));
  const milestone = Math.floor(percent / 25) * 25;
  const progressText = t(language, "downloads.progressValue", { percent: formatNumerals(percent, language) });

  return (
    <div className="space-y-1.5" dir={direction} data-slot="download-progress-group">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span className="tabular-nums" aria-hidden="true">
          {progressText}
        </span>
      </div>
      <ProgressBar
        value={completed}
        max={Math.max(1, total)}
        height={6}
        trackColor="color-mix(in srgb, var(--muted) 75%, var(--foreground) 10%)"
        fillColor="var(--primary)"
        direction={direction}
        aria-label={label}
        aria-valuetext={progressText}
      />
      <span className="sr-only" role="status">
        {active
          ? `${label}: ${t(language, "downloads.progressValue", { percent: formatNumerals(milestone, language) })}`
          : ""}
      </span>
    </div>
  );
}
