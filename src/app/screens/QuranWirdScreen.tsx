import { useMemo } from "react";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, ChevronDown, Undo } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import type { AppLanguage, QuranReadingPosition, QuranWirdPlan } from "../types";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const TOTAL_PAGES = 604;

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "custom")
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  return t(language, "mushaf.planDaily");
}

function effectiveDailyGoal(plan: QuranWirdPlan, history: Record<string, number[]>) {
  if (plan.kind === "daily" || !plan.durationDays || !plan.startedDayKey) return plan.dailyPages;
  const [year, month, day] = plan.startedDayKey.split("-").map(Number);
  const today = new Date();
  const elapsed = Math.max(
    0,
    Math.floor(
      (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(year!, month! - 1, day!)) /
        86_400_000,
    ),
  );
  const completed = new Set(
    Object.entries(history)
      .filter(([dayKey]) => dayKey >= plan.startedDayKey!)
      .flatMap(([, pages]) => pages),
  ).size;
  return Math.max(1, Math.ceil(Math.max(0, TOTAL_PAGES - completed) / Math.max(1, plan.durationDays - elapsed)));
}

export function QuranWirdScreen({
  language,
  direction,
  position,
  plan,
  wirdHistory,
  onBack,
  onContinue,
  onPlanChange,
  onUndoPage,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  position: QuranReadingPosition;
  plan: QuranWirdPlan;
  wirdHistory: Record<string, number[]>;
  onBack: () => void;
  onContinue: () => void;
  onPlanChange: (plan: QuranWirdPlan) => void;
  onUndoPage: () => void;
}) {
  const todayKey = getProgressDayKey();
  const completedPages = wirdHistory[todayKey] ?? [];
  const read = completedPages.length;
  const goal = effectiveDailyGoal(plan, wirdHistory);
  const redistributed = plan.kind !== "daily" && goal !== plan.dailyPages;
  const remaining = Math.max(goal - read, 0);
  const positionSurah = position.surahNumber ? getSurahDisplayName(position.surahNumber, language) : "";
  const positionJuz = position.juzNumber ?? getJuzNumberForPage(position.page);
  const week = useMemo(() => currentSaturdayWeekKeys(), []);
  const activeDays = week.filter((dayKey) => (wirdHistory[dayKey] ?? []).length > 0).length;

  return (
    <ScreenContainer dir={direction} screenName={t(language, "mushaf.wirdTitle")} className="overflow-y-auto">
      <Header title={t(language, "mushaf.wirdTitle")} onBack={onBack} language={language} />
      <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 px-4 pb-8 pt-3 sm:px-6">
        <section
          className="rounded-3xl border border-primary/50 bg-card p-5 shadow-raised sm:p-6"
          aria-labelledby="wird-today-title"
        >
          <div className="flex items-end justify-between gap-3">
            <h2 id="wird-today-title" className="text-xl font-extrabold text-foreground">
              {t(language, "mushaf.todayTarget")}
            </h2>
            <bdi dir="ltr" className="shrink-0 text-sm font-extrabold text-primary">
              {formatNumerals(read, language)} / {formatNumerals(goal, language)}
            </bdi>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={Math.min(read, goal)}
              max={goal}
              height={8}
              direction={direction}
              aria-label={t(language, "mushaf.todayProgress", {
                read: formatNumerals(read, language),
                goal: formatNumerals(goal, language),
              })}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {remaining > 0
              ? t(language, "mushaf.pagesRemaining", { count: formatNumerals(remaining, language) })
              : t(language, "mushaf.wirdGoalReached")}
          </p>
          <div className="mt-4 border-y border-border/60 py-3">
            <p className="font-arabic text-sm font-bold text-foreground" dir="auto">
              {positionSurah}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t(language, "mushaf.positionDetail", {
                page: formatNumerals(position.page, language),
                juz: formatNumerals(positionJuz, language),
                ayah: position.ayahNumber ? formatNumerals(position.ayahNumber, language) : "—",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <BookOpen size={18} aria-hidden="true" />
            {t(language, "mushaf.continueReading")}
            <ArrowNext size={18} aria-hidden="true" />
          </button>
          {read > 0 && (
            <button
              type="button"
              onClick={onUndoPage}
              className="mt-2 flex min-h-11 items-center gap-1 rounded-xl px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Undo size={16} aria-hidden="true" />
              {t(language, "mushaf.undoLastPage")}
            </button>
          )}
        </section>

        <details className="group rounded-3xl border border-border bg-card p-5 shadow-xs">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            <div>
              <h2 className="text-base font-extrabold text-foreground">{t(language, "mushaf.planTitle")}</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {planLabel(language, plan)} ·{" "}
                {t(language, "mushaf.pagesPerDay", { count: formatNumerals(goal, language) })}
              </p>
            </div>
            <ChevronDown
              size={20}
              className="shrink-0 text-primary transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="border-t border-border/60 pt-4">
            <label className="mt-4 block text-sm font-bold text-foreground" htmlFor="quran-wird-plan">
              {t(language, "mushaf.changePlan")}
            </label>
            <Select
              value={plan.kind}
              onValueChange={(value) => {
                const kind = value as QuranWirdPlan["kind"];
                onPlanChange(
                  kind === "khatmah30"
                    ? { kind, dailyPages: Math.ceil(TOTAL_PAGES / 30), durationDays: 30, startedDayKey: todayKey }
                    : kind === "custom"
                      ? { kind, dailyPages: Math.ceil(TOTAL_PAGES / 60), durationDays: 60, startedDayKey: todayKey }
                      : { kind, dailyPages: 4 },
                );
              }}
            >
              <SelectTrigger
                id="quran-wird-plan"
                className="mt-2 font-bold"
                aria-label={t(language, "mushaf.changePlan")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir={direction} position="popper">
                <SelectItem value="khatmah30">{t(language, "mushaf.planKhatmah30")}</SelectItem>
                <SelectItem value="daily">{t(language, "mushaf.planDaily")}</SelectItem>
                <SelectItem value="custom">{t(language, "mushaf.planCustomChoice")}</SelectItem>
              </SelectContent>
            </Select>
            {plan.kind === "custom" && (
              <label className="mt-3 block text-sm font-bold text-foreground">
                {t(language, "mushaf.durationDays")}
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={plan.durationDays ?? 60}
                  onChange={(event) => {
                    const days = Math.min(604, Math.max(1, Number(event.target.value) || 1));
                    onPlanChange({
                      kind: "custom",
                      durationDays: days,
                      dailyPages: Math.ceil(TOTAL_PAGES / days),
                      startedDayKey: plan.startedDayKey ?? todayKey,
                    });
                  }}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                />
              </label>
            )}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{t(language, "mushaf.redistributeNote")}</p>
            {redistributed && (
              <p className="mt-2 text-xs font-bold text-primary">
                {t(language, "mushaf.redistributedGoal", { count: formatNumerals(goal, language) })}
              </p>
            )}
          </div>
        </details>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-week-title">
          <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
            {t(language, "mushaf.thisWeek")}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {t(language, "mushaf.weeklySummary", { count: formatNumerals(activeDays, language) })}
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2" role="list" aria-label={t(language, "mushaf.thisWeek")}>
            {week.map((dayKey) => {
              const count = (wirdHistory[dayKey] ?? []).length;
              const dayLabel = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
                weekday: "short",
              }).format(new Date(`${dayKey}T12:00:00`));
              return (
                <div key={dayKey} role="listitem" className="text-center">
                  <span
                    className={`mx-auto block h-2.5 w-full rounded-full ${count ? "bg-primary" : "bg-muted"}`}
                    aria-hidden="true"
                  />
                  <span className="mt-2 block text-[0.6875rem] font-bold text-muted-foreground">{dayLabel}</span>
                  <span className="sr-only">
                    {t(language, "mushaf.dayPages", {
                      day: dayLabel,
                      count: formatNumerals(count, language),
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
