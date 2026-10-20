import { useId, useMemo, useState } from "react";
import type { AppLanguage } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals } from "../formatting";
import { formatProgressRange, type ProgressScopedDailyRecord, type ProgressMetric } from "../progressDashboard";
import { ChevronDown, ChevronUp } from "./icons";

const PAGE_SIZE = 10;
export function ProgressRecordsTable({
  records,
  metrics,
  language,
  calendar,
}: {
  records: readonly ProgressScopedDailyRecord[];
  metrics: readonly ProgressMetric[];
  language: AppLanguage;
  calendar: CalendarType;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: "dayKey" | ProgressMetric; descending: boolean }>({
    key: "dayKey",
    descending: true,
  });
  const [page, setPage] = useState(0);
  const date = (key: string) => formatProgressRange({ startKey: key, endKey: key }, language, calendar);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return records
      .filter(
        (row) =>
          !term ||
          row.dayKey.includes(term) ||
          formatProgressRange({ startKey: row.dayKey, endKey: row.dayKey }, language, calendar)
            .toLocaleLowerCase()
            .includes(term),
      )
      .sort((a, b) => {
        const av = a[sort.key],
          bv = b[sort.key];
        if (av === null || bv === null) return av === bv ? b.dayKey.localeCompare(a.dayKey) : av === null ? 1 : -1;
        const order = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return (sort.descending ? -order : order) || b.dayKey.localeCompare(a.dayKey);
      });
  }, [records, query, language, calendar, sort]);
  const activePage = Math.min(page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  const start = activePage * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const changeSort = (key: typeof sort.key) => {
    setPage(0);
    setSort({ key, descending: key === sort.key ? !sort.descending : true });
  };
  const button =
    "inline-flex min-h-11 items-center whitespace-nowrap gap-1 rounded-lg px-2 py-2 text-start text-xs font-bold progress-focus";
  return (
    <div className="space-y-3" data-testid="progress-records-table">
      <p className="progress-help">{text(language, "recordsHelp")}</p>
      <label className="block max-w-sm space-y-1 text-xs font-semibold" htmlFor={`${id}-search`}>
        <span>{text(language, "search")}</span>
        <input
          id={`${id}-search`}
          type="search"
          value={query}
          aria-describedby={`${id}-help`}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          className="min-h-11 w-full rounded-lg border border-border-control bg-card px-3 py-2 text-sm progress-focus"
        />
      </label>
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        {text(language, "searchHelp")}
      </p>
      <div
        className="overflow-x-auto rounded-lg border border-border progress-focus"
        role="region"
        aria-label={text(language, "records")}
        // Named overflow region needs keyboard scrolling for enlarged columns.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <table className="w-full border-collapse text-start text-sm">
          <caption className="px-3 py-2 text-start text-xs font-semibold text-muted-foreground">
            {text(language, "records")}
          </caption>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {(["dayKey", ...metrics] as const).map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="min-w-32 px-1 text-start"
                  aria-sort={sort.key === key ? (sort.descending ? "descending" : "ascending") : "none"}
                >
                  <button
                    type="button"
                    className={button}
                    onClick={() => changeSort(key)}
                    aria-label={`${key === "dayKey" ? text(language, "date") : text(language, key)}: ${text(language, sort.key === key && sort.descending ? "sortAscending" : "sortDescending")}`}
                  >
                    {key === "dayKey" ? text(language, "date") : text(language, key)}
                    {sort.key === key &&
                      (sort.descending ? (
                        <ChevronDown size={14} aria-hidden="true" />
                      ) : (
                        <ChevronUp size={14} aria-hidden="true" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.dayKey}>
                <th scope="row" className="whitespace-nowrap px-3 py-3 text-start font-semibold">
                  <time dateTime={row.dayKey}>{date(row.dayKey)}</time>
                </th>
                {metrics.map((metric) => (
                  <td key={metric} className="px-3 py-3 tabular-nums">
                    <bdi>{row[metric] === null ? "—" : formatNumerals(row[metric]!, language)}</bdi>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p role="status" className="text-sm text-muted-foreground">
          {text(language, "noMatches")}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" aria-atomic="true" className="text-xs text-muted-foreground">
          {text(language, "rows", {
            from: formatNumerals(rows.length ? start + 1 : 0, language),
            to: formatNumerals(start + rows.length, language),
            total: formatNumerals(filtered.length, language),
          })}
        </p>
        <div className="progress-records-pagination flex gap-2">
          <button
            type="button"
            className={`${button} border border-border-control disabled:opacity-50`}
            disabled={activePage === 0}
            onClick={() => setPage(activePage - 1)}
          >
            {text(language, "previousPage")}
          </button>
          <button
            type="button"
            className={`${button} border border-border-control disabled:opacity-50`}
            disabled={start + PAGE_SIZE >= filtered.length}
            onClick={() => setPage(activePage + 1)}
          >
            {text(language, "nextPage")}
          </button>
        </div>
      </div>
    </div>
  );
}
