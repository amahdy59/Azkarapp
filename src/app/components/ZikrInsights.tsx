import type { AppLanguage, ZikrDayRecord } from "../types";
import { getZikrItemInsights } from "../progressInsights";
import { getAzkarForMode } from "../content/azkar";
import { routeToHash } from "../routing";
import { formatNumerals, formatPercentage } from "../formatting";
import { progressText } from "../i18n/progressInsights";
import { RecordedComparisonBar } from "./RecordedComparisonBar";

export function ZikrInsights({
  records,
  startKey,
  endKey,
  language,
}: {
  records: readonly ZikrDayRecord[];
  startKey: string;
  endKey: string;
  language: AppLanguage;
}) {
  const rows = getZikrItemInsights(records, startKey, endKey);
  const rate = (row: (typeof rows)[number]) => row.recorded / row.possible;
  const lowest = rows[0];
  const highest = rows.at(-1);
  const equal = lowest && highest && rate(lowest) === rate(highest);
  const groups =
    lowest && highest && !equal
      ? [
          { key: "itemsFocus" as const, rows: rows.filter((row) => rate(row) === rate(lowest)) },
          { key: "itemsBest" as const, rows: rows.filter((row) => rate(row) === rate(highest)) },
        ]
      : [];
  return (
    <section data-testid="zikr-insights" className="mt-5 space-y-3 border-t border-border pt-4">
      <h3 className="text-base font-bold">{progressText(language, "insights.itemsTitle")}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{progressText(language, "insights.itemsScope")}</p>
      {!groups.length && (
        <p className="text-sm">{progressText(language, equal ? "insights.itemsEqual" : "insights.itemsEarly")}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key}>
            <h4 className="mb-3 text-sm font-semibold">{progressText(language, `insights.${group.key}`)}</h4>
            {group.rows.length > 1 && (
              <p className="mb-3 text-xs text-muted-foreground">
                {progressText(language, "insights.itemsTied", { count: formatNumerals(group.rows.length, language) })}
              </p>
            )}
            <ul className="space-y-4">
              {group.rows.slice(0, 3).map((row) => {
                const collection = getAzkarForMode(row.category, "complete");
                const index = collection.findIndex((item) => item.id === row.id);
                const item = collection[index];
                if (!item) return null;
                const text = language === "ar" ? item.arabicText : item.translation;
                const title = text.split(/\s+/).slice(0, 9).join(" ") + (text.split(/\s+/).length > 9 ? "…" : "");
                const measure = progressText(language, "insights.itemsMeasure", {
                  done: formatNumerals(row.recorded, language),
                  days: formatNumerals(row.possible, language),
                });
                return (
                  <li key={row.id}>
                    <a
                      href={routeToHash({ view: "reader", categoryId: row.category, index, routineMode: "complete" })!}
                      aria-label={`${progressText(language, "insights.itemsRead")}: ${title}`}
                      className="inline-flex min-h-11 items-center rounded-lg py-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      {title}
                    </a>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {formatPercentage(Math.round(rate(row) * 100), language)} · {measure}
                    </p>
                    <RecordedComparisonBar
                      label={`${title}: ${measure}`}
                      segments={[{ label: title, value: row.recorded, color: "var(--primary)" }]}
                      max={row.possible}
                      language={language}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
