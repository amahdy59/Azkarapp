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
  readOnly = false,
}: {
  summary: FridaySummary;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpen?: () => void;
  readOnly?: boolean;
}) {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const num = (value: number) => value.toLocaleString(locale);
  const salawatReached = summary.salawatCount >= summary.salawatTarget;
  const Row = readOnly ? "div" : "button";

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
      className="mt-5 w-full overflow-hidden rounded-2xl border border-border bg-card text-foreground"
    >
      <div className="border-b border-border px-4 py-3.5 text-start sm:px-5">
        <h2 className="text-base font-black leading-tight text-foreground sm:text-lg" dir="auto">
          {t(language, "friday.weeklyProgress")}
        </h2>
      </div>

      <div className="stagger-in grid gap-2.5 p-3 sm:p-4 sm:grid-cols-3">
        {rows.map((row) => (
          <Row
            key={row.id}
            type={readOnly ? undefined : "button"}
            onClick={readOnly ? undefined : onOpen}
            disabled={readOnly ? undefined : !onOpen}
            data-testid={`progress-friday-${row.id}`}
            className={`stagger-content group flex min-h-[4.25rem] w-full items-center gap-3 rounded-xl p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default ${
              row.done ? "bg-primary/10 enabled:hover:bg-primary/15" : "bg-muted/40 enabled:hover:bg-muted/70"
            }`}
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                row.done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {row.icon}
            </span>
            <span className="flex min-w-0 flex-col">
              <span dir="auto" className="text-sm font-black leading-snug text-foreground">
                {row.label}
              </span>
              {/* Isolated so a Latin "3 / 7" cannot reorder against Arabic around it. */}
              <bdi className="mt-0.5 text-xs font-semibold text-muted-foreground">{row.value}</bdi>
            </span>
          </Row>
        ))}
      </div>
    </section>
  );
}
