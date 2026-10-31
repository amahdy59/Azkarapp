import type { AppLanguage } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { formatProgressRange, type progressRecordingPattern } from "../progressDashboard";
import { dashboardText as text } from "../i18n/progressDashboard";
import { Calendar, CheckCircle2, Minus } from "./icons";

export function ProgressRecordingPattern({
  days,
  language,
  calendar,
}: {
  days: ReturnType<typeof progressRecordingPattern>;
  language: AppLanguage;
  calendar: CalendarType;
}) {
  if (!days.length) return null;
  return (
    <section
      className="rounded-xl border border-border bg-card p-3 sm:p-4"
      data-testid="progress-recording-pattern"
      aria-label={text(language, "pattern")}
    >
      <h3 className="text-base font-bold">{text(language, "pattern")}</h3>
      <p className="mt-1 progress-help">{text(language, "patternHelp")}</p>
      <ol className="progress-pattern-grid mt-3">
        {days.map(({ dayKey, kind }) => {
          const Icon = kind === "activity" ? CheckCircle2 : kind === "target" ? Calendar : Minus;
          return (
            <li key={dayKey} className="min-w-0 rounded-lg border border-border p-2 text-center">
              <time dateTime={dayKey} className="block text-xs leading-relaxed">
                {formatProgressRange({ startKey: dayKey, endKey: dayKey }, language, calendar)}
              </time>
              <Icon
                className={`mx-auto my-2 size-5 ${kind === "none" ? "text-muted-foreground" : "text-primary"}`}
                aria-hidden="true"
              />
              <span className="block text-xs leading-relaxed">{text(language, kind)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
