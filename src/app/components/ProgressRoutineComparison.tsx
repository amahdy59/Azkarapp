import "./surface-panel.css";
import { memo, useId } from "react";
import type { ProgressMetricValue } from "../progressDashboard";
import type { AppLanguage } from "../types";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals } from "../formatting";
import { ProgressBar } from "./ProgressBar";
import { Repeat } from "./icons";

const routines = ["morning", "evening", "sleep"] as const;

export const ProgressRoutineComparison = memo(function ProgressRoutineComparison({
  values,
  language,
}: {
  values: Record<(typeof routines)[number], ProgressMetricValue>;
  language: AppLanguage;
}) {
  const id = useId();
  return (
    <section
      className="progress-summary-card progress-routine-comparison"
      data-material-card="dense"
      data-testid="progress-routine-bars"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="surface-panel-heading">
        <span className="surface-panel-icon surface-control-finish" aria-hidden="true">
          <Repeat size={20} />
        </span>
        {text(language, "routineBars")}
      </h2>
      <p className="mt-1 progress-help">{text(language, "routineBarsHelp")}</p>
      <dl className="mt-3 space-y-3">
        {routines.map((key) => {
          const { count, possible } = values[key];
          const quantity = possible
            ? text(language, "countOf", {
                count: formatNumerals(count, language),
                total: formatNumerals(possible, language),
              })
            : text(language, "unavailable");
          return (
            <div key={key} className="progress-routine-row">
              <dt>{text(language, `short_${key}`)}</dt>
              <dd className="font-semibold">
                <bdi>{quantity}</bdi>
              </dd>
              <dd className="progress-routine-bar">
                {possible ? (
                  <ProgressBar
                    value={count}
                    max={possible}
                    height={7}
                    aria-label={text(language, key)}
                    aria-valuetext={quantity}
                  />
                ) : (
                  <p className="progress-help">{text(language, "unavailable")}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
});
