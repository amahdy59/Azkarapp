import type { ComponentType } from "react";
import type { AppLanguage } from "../types";
import type { ProgressMetric, ProgressMetricValue } from "../progressDashboard";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { dashboardText as text } from "../i18n/progressDashboard";
import { ChevronRight } from "./icons";
import { ProgressBar } from "./ProgressBar";

/** Presentation only: the dashboard owns normalized values and navigation. */
export function ProgressMetricCard({
  metric,
  value,
  valueText,
  caption,
  rangeLabel,
  language,
  icon: Icon,
  onExplore,
}: {
  metric: ProgressMetric;
  value: ProgressMetricValue;
  valueText: string;
  caption: string;
  rangeLabel?: string;
  language: AppLanguage;
  icon: ComponentType<{ size?: number; className?: string }>;
  onExplore: () => void;
}) {
  const hasDenominator = value.possible !== null && value.possible > 0;
  const unknown = metric === "quranGoals" && !value.possible;
  return (
    <div
      className="progress-metric-card"
      data-metric={metric}
      data-empty={value.count === 0}
      data-testid={`progress-metric-${metric}`}
    >
      <dt>
        <button
          type="button"
          className="progress-metric-link"
          aria-label={text(language, "explore", { metric: text(language, metric) })}
          onClick={onExplore}
        >
          <span className="progress-practice-icon">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span className="progress-metric-label">{text(language, `short_${metric}`)}</span>
          <ChevronRight size={16} aria-hidden="true" className="progress-metric-arrow rtl:rotate-180" />
        </button>
      </dt>
      <dd className="progress-metric-quantity" style={{ fontFamily: numeralFontFamily(language) }}>
        <bdi dir={language === "ar" ? "rtl" : "ltr"}>
          <span className="progress-metric-count">{unknown ? "—" : formatNumerals(value.count, language)}</span>
          {hasDenominator && (
            <span className="progress-metric-denominator">
              {text(language, "countOf", { count: "", total: formatNumerals(value.possible!, language) })}
            </span>
          )}
        </bdi>
      </dd>
      <dd className="progress-metric-footer">
        {hasDenominator && (
          <ProgressBar
            value={Math.min(value.count, value.possible!)}
            max={value.possible!}
            height={4}
            trackColor="var(--border-subtle)"
            fillColor="var(--primary)"
            aria-label={text(language, metric)}
            aria-valuetext={valueText}
          />
        )}
        <span className="progress-metric-caption">{caption}</span>
      </dd>
      {rangeLabel && <dd className="progress-metric-scope">{rangeLabel}</dd>}
    </div>
  );
}
