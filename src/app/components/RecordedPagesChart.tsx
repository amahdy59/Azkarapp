import "./recorded-pages-chart.css";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import type { CSSProperties } from "react";
import { t } from "../i18n";

/** Read-only saved-page distribution. The screen supplies already scoped data. */
export function RecordedPagesChart({
  points,
  language,
  title,
}: {
  points: readonly { dayKey: string; count: number }[];
  language: AppLanguage;
  title: string;
}) {
  const maximum = Math.max(1, ...points.map((point) => point.count));
  const total = points.reduce((sum, point) => sum + point.count, 0);
  return (
    <section className="recorded-pages-chart" aria-label={title}>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {t(language, "home.recordedPagesTotal", { count: formatNumerals(total, language) })}
      </p>
      <ol className="recorded-pages-bars">
        {points.map((point) => {
          const date = new Date(`${point.dayKey}T12:00:00`);
          return (
            <li
              key={point.dayKey}
              aria-label={`${date.toLocaleDateString(language === "ar" ? "ar-EG" : "en")}: ${formatNumerals(point.count, language)}`}
            >
              <span className="recorded-pages-value">{formatNumerals(point.count, language)}</span>
              <span className="recorded-pages-track" aria-hidden="true">
                <span style={{ "--recorded-fill": point.count / maximum } as CSSProperties} />
              </span>
              <time dateTime={point.dayKey}>
                <span>{date.toLocaleDateString(language === "ar" ? "ar-EG" : "en", { weekday: "short" })}</span>
                <span>
                  {date.toLocaleDateString(language === "ar" ? "ar-EG" : "en", { day: "numeric", month: "short" })}
                </span>
              </time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
