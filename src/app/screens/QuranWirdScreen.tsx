import { useMemo } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, Check, Clock, Undo } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import type { AppLanguage, QuranReadingPosition, QuranWirdPlan } from "../types";

const TOTAL_PAGES = 604;

function lastSevenDayKeys() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return getProgressDayKey(date);
  });
}

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "custom")
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  return t(language, "mushaf.planDaily");
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
  onRecordPage,
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
  onRecordPage: () => void;
  onUndoPage: () => void;
}) {
  const todayKey = getProgressDayKey();
  const completedPages = wirdHistory[todayKey] ?? [];
  const read = completedPages.length;
  const goal = plan.dailyPages;
  const progress = Math.min(100, Math.round((read / goal) * 100));
  const remaining = Math.max(goal - read, 0);
  const circumference = 2 * Math.PI * 42;
  const positionSurah = position.surahNumber ? getSurahDisplayName(position.surahNumber, language) : "";
  const positionJuz = position.juzNumber ?? getJuzNumberForPage(position.page);
  const week = useMemo(() => lastSevenDayKeys(), []);
  const activeDays = week.filter((dayKey) => (wirdHistory[dayKey] ?? []).length > 0).length;

  return (
    <ScreenContainer dir={direction} screenName={t(language, "mushaf.wirdTitle")} className="overflow-y-auto">
      <Header
        title={t(language, "mushaf.wirdTitle")}
        subtitle={t(language, "mushaf.wirdSubtitle")}
        onBack={onBack}
        language={language}
      />
      <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 px-4 pb-8 pt-3 sm:px-6">
        <section
          className="rounded-3xl border border-primary/50 bg-card p-5 shadow-raised sm:p-6"
          aria-labelledby="wird-today-title"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.8125rem] font-bold text-primary">{t(language, "mushaf.today")}</p>
              <h2 id="wird-today-title" className="mt-1 text-xl font-extrabold text-foreground">
                {t(language, "mushaf.todayTarget")}
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {t(language, "mushaf.wirdProgress", {
                  read: formatNumerals(read, language),
                  goal: formatNumerals(goal, language),
                })}
              </p>
            </div>
            <div
              className="relative grid size-28 shrink-0 place-items-center"
              role="progressbar"
              aria-label={t(language, "mushaf.todayProgress", {
                read: formatNumerals(read, language),
                goal: formatNumerals(goal, language),
              })}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-valuenow={Math.min(read, goal)}
            >
              <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-primary transition-[stroke-dashoffset] duration-standard"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress / 100)}
                />
              </svg>
              <div className="absolute text-center">
                <bdi className="block text-xl font-extrabold text-foreground">
                  {formatNumerals(progress, language)}%
                </bdi>
                <span className="text-[0.6875rem] font-bold text-muted-foreground">
                  {t(language, "mushaf.complete")}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {remaining > 0
              ? t(language, "mushaf.pagesRemaining", { count: formatNumerals(remaining, language) })
              : t(language, "mushaf.wirdGoalReached")}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <BookOpen size={18} aria-hidden="true" />
            {t(language, "mushaf.continueReading")}
            <ArrowNext size={18} aria-hidden="true" />
          </button>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onRecordPage}
              className="min-h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, "mushaf.recordPage")}
            </button>
            <button
              type="button"
              onClick={onUndoPage}
              disabled={read === 0}
              className="flex min-h-11 items-center gap-1 rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Undo size={16} aria-hidden="true" />
              {t(language, "common.undo")}
            </button>
          </div>
        </section>

        <section
          className="rounded-3xl border border-border bg-card p-5 shadow-xs"
          aria-labelledby="wird-position-title"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Clock size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="wird-position-title" className="text-base font-extrabold text-foreground">
                {t(language, "mushaf.lastReadingPosition")}
              </h2>
              <p className="mt-1 text-sm font-bold text-foreground" dir="auto">
                {positionSurah}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {t(language, "mushaf.positionDetail", {
                  page: formatNumerals(position.page, language),
                  juz: formatNumerals(positionJuz, language),
                  ayah: position.ayahNumber ? formatNumerals(position.ayahNumber, language) : "—",
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-plan-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="wird-plan-title" className="text-base font-extrabold text-foreground">
                {t(language, "mushaf.planTitle")}
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {planLabel(language, plan)} ·{" "}
                {t(language, "mushaf.pagesPerDay", { count: formatNumerals(goal, language) })}
              </p>
            </div>
            <Check size={20} className="shrink-0 text-primary" aria-hidden="true" />
          </div>
          <label className="mt-4 block text-sm font-bold text-foreground" htmlFor="quran-wird-plan">
            {t(language, "mushaf.changePlan")}
          </label>
          <select
            id="quran-wird-plan"
            value={plan.kind}
            onChange={(event) => {
              const kind = event.target.value as QuranWirdPlan["kind"];
              onPlanChange(
                kind === "khatmah30"
                  ? { kind, dailyPages: Math.ceil(TOTAL_PAGES / 30), durationDays: 30 }
                  : kind === "custom"
                    ? { kind, dailyPages: Math.ceil(TOTAL_PAGES / 60), durationDays: 60 }
                    : { kind, dailyPages: 4 },
              );
            }}
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <option value="khatmah30">{t(language, "mushaf.planKhatmah30")}</option>
            <option value="daily">{t(language, "mushaf.planDaily")}</option>
            <option value="custom">{t(language, "mushaf.planCustomChoice")}</option>
          </select>
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
                  onPlanChange({ kind: "custom", durationDays: days, dailyPages: Math.ceil(TOTAL_PAGES / days) });
                }}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              />
            </label>
          )}
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{t(language, "mushaf.redistributeNote")}</p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-week-title">
          <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
            {t(language, "mushaf.thisWeek")}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {t(language, "mushaf.weeklySummary", { count: formatNumerals(activeDays, language) })}
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2" role="list" aria-label={t(language, "mushaf.thisWeek")}>
            {week.map((dayKey, index) => {
              const count = (wirdHistory[dayKey] ?? []).length;
              return (
                <div key={dayKey} role="listitem" className="text-center">
                  <span
                    className={`mx-auto block h-2.5 w-full rounded-full ${count ? "bg-primary" : "bg-muted"}`}
                    aria-hidden="true"
                  />
                  <span className="mt-2 block text-[0.6875rem] font-bold text-muted-foreground">
                    {new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", { weekday: "narrow" }).format(
                      new Date(`${dayKey}T12:00:00`),
                    )}
                  </span>
                  <span className="sr-only">
                    {t(language, "mushaf.dayPages", { day: String(index + 1), count: formatNumerals(count, language) })}
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
