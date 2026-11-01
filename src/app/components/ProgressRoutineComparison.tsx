import { memo, useId, useState } from "react";
import type { ProgressMetricValue } from "../progressDashboard";
import type { AppLanguage } from "../types";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals, formatPercentage } from "../formatting";
import { ProgressBar } from "./ProgressBar";
import { ChevronDown } from "./icons";

const routines = ["morning", "evening", "sleep"] as const;
const colours = ["var(--primary)", "var(--success)", "var(--info)"];

export const ProgressRoutineComparison = memo(function ProgressRoutineComparison({
  values,
  language,
}: {
  values: Record<(typeof routines)[number], ProgressMetricValue>;
  language: AppLanguage;
}) {
  const id = useId();
  const [showComposition, setShowComposition] = useState(false);
  const total = routines.reduce((sum, key) => sum + values[key].count, 0);
  let offset = 0;
  const parts = routines.map((key, index) => {
    const count = values[key].count;
    const share = total ? (count / total) * 100 : 0;
    const part = { key, count, share, offset, colour: colours[index]! };
    offset += share;
    return part;
  });
  return (
    <section
      className="progress-summary-card progress-routine-comparison"
      data-material-card
      data-testid="progress-routine-bars"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="text-base font-bold">
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
      <details
        className="mt-3 border-t border-border"
        onToggle={(event) => setShowComposition(event.currentTarget.open)}
      >
        <summary className="progress-disclosure progress-focus">
          {text(language, "composition")}
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        {showComposition && (
          <div className="pb-2" data-testid="progress-routine-composition">
            <p className="progress-help">{text(language, "compositionHelp")}</p>
            {total ? (
              <div className="progress-composition-layout mt-3">
                <svg
                  viewBox="0 0 120 120"
                  className="progress-composition-chart"
                  role="img"
                  aria-labelledby={`${id}-composition-title ${id}-composition-description`}
                >
                  <title id={`${id}-composition-title`}>{text(language, "composition")}</title>
                  <desc id={`${id}-composition-description`}>
                    {parts
                      .map(
                        (part) =>
                          `${text(language, part.key)}: ${formatNumerals(part.count, language)} (${formatPercentage(Math.round(part.share * 10) / 10, language)})`,
                      )
                      .join("; ")}
                  </desc>
                  {parts
                    .filter((part) => part.count > 0)
                    .map((part) => (
                      <circle
                        key={part.key}
                        cx="60"
                        cy="60"
                        r="44"
                        pathLength="100"
                        fill="none"
                        stroke={part.colour}
                        strokeWidth="16"
                        strokeDasharray={`${part.share} ${100 - part.share}`}
                        strokeDashoffset={-part.offset}
                        transform="rotate(-90 60 60)"
                      />
                    ))}
                  <text
                    x="60"
                    y="65"
                    textAnchor="middle"
                    fill="var(--foreground)"
                    fontSize="18"
                    fontWeight="700"
                    aria-hidden="true"
                  >
                    {formatNumerals(total, language)}
                  </text>
                </svg>
                <dl className="min-w-0 space-y-2">
                  {parts.map((part) => (
                    <div key={part.key} className="progress-composition-label">
                      <dt>
                        <span
                          aria-hidden="true"
                          className="progress-composition-swatch"
                          style={{ background: part.colour }}
                        />
                        {text(language, `short_${part.key}`)}
                      </dt>
                      <dd className="font-semibold">
                        <bdi>
                          {formatNumerals(part.count, language)} ·{" "}
                          {formatPercentage(Math.round(part.share * 10) / 10, language)}
                        </bdi>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="mt-3 text-sm">{text(language, "compositionEmpty")}</p>
            )}
          </div>
        )}
      </details>
    </section>
  );
});
