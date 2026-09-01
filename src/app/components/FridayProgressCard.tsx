import { BookOpen, CheckCircle2, Heart } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { FridaySummary } from "../fridaySummary";

/**
 * The Friday companion's progress, surfaced on Progress.
 *
 * Read-only on purpose: the companion screen owns every one of these actions,
 * and a second place to toggle them would be a second source of truth for the
 * same storage keys. Tapping the card opens the companion instead.
 */
export function FridayProgressCard({
  summary,
  language,
  direction,
  onOpen,
}: {
  summary: FridaySummary;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpen?: () => void;
}) {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const num = (value: number) => value.toLocaleString(locale);
  const salawatReached = summary.salawatCount >= summary.salawatTarget;

  const rows = [
    {
      id: "kahf",
      icon: <BookOpen className="size-5" aria-hidden="true" />,
      label: t(language, "friday.kahfHeading"),
      value: summary.kahfOpened ? t(language, "friday.kahfCompleted") : t(language, "friday.kahfNotStarted"),
      done: summary.kahfOpened,
    },
    {
      id: "salawat",
      icon: <Heart className="size-5" aria-hidden="true" />,
      label: t(language, "friday.salawatHeading"),
      value: `${num(summary.salawatCount)} / ${num(summary.salawatTarget)}`,
      done: salawatReached,
    },
    {
      id: "practices",
      icon: <CheckCircle2 className="size-5" aria-hidden="true" />,
      label: t(language, "friday.todayPractices"),
      value: `${num(summary.practicesDone)} / ${num(summary.practicesTotal)}`,
      done: summary.practicesDone >= summary.practicesTotal,
    },
  ];

  return (
    <section
      data-testid="progress-friday"
      dir={direction}
      className="mt-4 w-full overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-raised"
    >
      <div className="border-b border-primary/40 bg-gradient-to-b from-muted/45 to-transparent px-4 py-4 text-start sm:px-6">
        <h2 className="text-[1.125rem] font-black leading-tight text-foreground" dir="auto">
          {t(language, "friday.weeklyProgress")}
        </h2>
      </div>

      <div className="stagger-in grid gap-2.5 px-4 py-4 sm:grid-cols-3 sm:px-6">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={onOpen}
            disabled={!onOpen}
            data-testid={`progress-friday-${row.id}`}
            className={`stagger-content group flex min-h-[4.5rem] w-full items-center gap-3 rounded-2xl border px-3 py-3 text-start transition-[background-color,border-color,box-shadow] duration-standard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 enabled: disabled:cursor-default ${
              row.done
                ? "border-primary/55 bg-primary/10 enabled:hover:border-primary/70"
                : "border-border bg-background enabled:hover:border-primary/45 enabled:hover:bg-muted"
            }`}
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
                row.done ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted text-primary"
              }`}
            >
              {row.icon}
            </span>
            <span className="flex min-w-0 flex-col">
              <span dir="auto" className="truncate text-[0.9375rem] font-black leading-snug text-foreground">
                {row.label}
              </span>
              {/* Isolated so a Latin "3 / 7" cannot reorder against Arabic around it. */}
              <bdi className="mt-1 text-[0.8125rem] font-bold text-muted-foreground">{row.value}</bdi>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
