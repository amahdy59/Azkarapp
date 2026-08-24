import { useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, Check, Undo } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { effectiveDailyGoal, getQuranWirdGoal, TOTAL_MUSHAF_PAGES } from "./quranWirdGoal";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import type { AppLanguage, QuranReadingEvent, QuranReadingPosition, QuranWirdPlan } from "../types";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "custom") {
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  }
  return t(language, "mushaf.planDaily");
}

function completionDate(now: Date, days: number, language: AppLanguage) {
  const date = new Date(now);
  date.setDate(date.getDate() + Math.max(0, days - 1));
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function QuranWirdScreen({
  language,
  direction,
  position,
  plan,
  wirdHistory,
  quranWirdDailyGoals = {},
  lastReadingEvent,
  onBack,
  onContinue,
  onPlanChange,
  onUndoReadingEvent,
  progressDayStartHour,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  position: QuranReadingPosition;
  plan: QuranWirdPlan;
  wirdHistory: Record<string, number[]>;
  quranWirdDailyGoals: Record<string, number>;
  lastReadingEvent?: QuranReadingEvent;
  onBack: () => void;
  onContinue: () => void;
  onPlanChange: (plan: QuranWirdPlan) => void;
  onUndoReadingEvent: () => void;
  progressDayStartHour: number;
}) {
  const now = useNow();
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const completedPages = Array.from(new Set(wirdHistory[todayKey] ?? []));
  const read = completedPages.length;
  const goalResult = getQuranWirdGoal(plan, wirdHistory, todayKey);
  const goal = goalResult.dailyGoal;
  const remaining = Math.max(goal - read, 0);
  const targetEndPage = Math.min(position.page + Math.max(remaining, 1) - 1, TOTAL_MUSHAF_PAGES);
  const positionSurah = getSurahDisplayName(position.surahNumber ?? 1, language);
  const positionJuz = position.juzNumber ?? getJuzNumberForPage(position.page);
  // Khatmah-level progress is orientation: the current page within 604, not a
  // second completion ledger. Daily completion remains in `wirdHistory`.
  const khatmahPagesRead = position.page;
  const khatmahPercent = Math.floor((khatmahPagesRead / TOTAL_MUSHAF_PAGES) * 100);
  const week = useMemo(() => currentSaturdayWeekKeys(now), [now]);
  const firstPlan =
    !plan.startedDayKey && position.page === 1 && Object.values(wirdHistory).every((pages) => !pages.length);
  const [isDrafting, setIsDrafting] = useState(firstPlan);
  const [draftPlan, setDraftPlan] = useState<QuranWirdPlan>(plan);
  const normalizedDraft: QuranWirdPlan = {
    ...draftPlan,
    startedDayKey: todayKey,
    ...(draftPlan.kind === "daily"
      ? {}
      : { startPage: draftPlan.startPage ?? position.page, targetPage: draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES }),
  };
  const draftGoal = effectiveDailyGoal(normalizedDraft, wirdHistory, todayKey);
  const draftDays =
    normalizedDraft.kind === "daily"
      ? Math.max(1, Math.ceil((TOTAL_MUSHAF_PAGES - position.page + 1) / normalizedDraft.dailyPages))
      : (normalizedDraft.durationDays ?? 30);
  const draftCompletionDate = completionDate(now, draftDays, language);
  const canUndo = lastReadingEvent?.dayKey === todayKey && lastReadingEvent.pages.length > 0;

  return (
    <ScreenContainer dir={direction} screenName={t(language, "mushaf.wirdTitle")} className="overflow-y-auto">
      <Header title={t(language, "mushaf.wirdTitle")} onBack={onBack} language={language} />
      <div className="mx-auto flex w-full flex-col gap-4 px-4 pb-8 pt-3 sm:px-6" style={{ maxWidth: "44rem" }}>
        <section
          className="rounded-3xl border border-primary/50 bg-card p-5 shadow-raised sm:p-6"
          aria-labelledby="wird-today-title"
        >
          <h2 id="wird-today-title" className="mb-3 text-xl font-extrabold text-foreground">
            {t(language, "mushaf.todayReadingTitle")}
          </h2>

          {goalResult.expired ? (
            <div className="rounded-2xl border border-border bg-muted p-4" role="status">
              <p className="text-sm font-bold text-foreground">{t(language, "mushaf.planExpired")}</p>
              <button
                type="button"
                onClick={() => setIsDrafting(true)}
                className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "mushaf.adjustPlan")}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-1">
                <p className="text-lg font-bold text-primary" dir="auto">
                  {t(language, "mushaf.pagesRange", {
                    start: formatNumerals(position.page, language),
                    end: formatNumerals(targetEndPage, language),
                  })}
                </p>
                <p className="text-sm font-medium text-muted-foreground" dir="auto">
                  {t(language, "mushaf.readingContext", {
                    surah: positionSurah,
                    juz: formatNumerals(positionJuz, language),
                  })}
                </p>
              </div>

              <p className="mb-2 text-sm font-bold text-foreground">
                {t(language, "mushaf.completedCount", {
                  read: formatNumerals(read, language),
                  goal: formatNumerals(goal, language),
                })}
              </p>
              <ProgressBar
                aria-label={t(language, "mushaf.todayProgress", {
                  read: formatNumerals(read, language),
                  goal: formatNumerals(goal, language),
                })}
                value={Math.min(read, goal)}
                max={Math.max(goal, 1)}
                height={8}
                direction={direction}
              />

              {remaining > 0 ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {t(language, "mushaf.continueFromPage", { page: formatNumerals(position.page, language) })}
                </p>
              ) : (
                <div className="mt-3 flex items-center gap-2 font-bold text-success">
                  <Check size={16} aria-hidden="true" />
                  <span>{t(language, "mushaf.wirdCompleteShort")}</span>
                </div>
              )}

              <button
                type="button"
                onClick={onContinue}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <BookOpen size={18} aria-hidden="true" />
                {t(language, "mushaf.continueReading")}
                <ArrowNext size={18} data-rtl-flip aria-hidden="true" />
              </button>
            </>
          )}

          {canUndo && (
            <button
              type="button"
              onClick={onUndoReadingEvent}
              className="mt-2 flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Undo size={16} aria-hidden="true" />
              {t(language, "mushaf.undoPages", {
                pages: lastReadingEvent.pages.map((page) => formatNumerals(page, language)).join("–"),
              })}
            </button>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground">{t(language, "mushaf.currentKhatmah")}</h2>
            <span className="text-sm font-bold text-primary">{formatNumerals(khatmahPercent, language)}%</span>
          </div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {formatNumerals(khatmahPagesRead, language)} / {formatNumerals(TOTAL_MUSHAF_PAGES, language)}{" "}
            {t(language, "mushaf.pagesUnit")}
          </p>
          <ProgressBar
            aria-label={t(language, "mushaf.khatmahProgress")}
            value={khatmahPagesRead}
            max={TOTAL_MUSHAF_PAGES}
            height={6}
            direction={direction}
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">{t(language, "mushaf.planTitle")}</h2>
              {!isDrafting && (
                <p className="mt-1 text-sm font-medium text-muted-foreground">{planLabel(language, plan)}</p>
              )}
            </div>
            {!isDrafting && (
              <button
                type="button"
                onClick={() => {
                  setDraftPlan(plan);
                  setIsDrafting(true);
                }}
                className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "mushaf.editPlan")}
              </button>
            )}
          </div>

          {isDrafting && (
            <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-foreground">{t(language, "mushaf.planType")}</label>
                <Select
                  value={draftPlan.kind === "daily" ? "daily" : "custom"}
                  onValueChange={(value) =>
                    setDraftPlan(
                      value === "daily"
                        ? { kind: "daily", dailyPages: 4, startedDayKey: todayKey }
                        : {
                            kind: "custom",
                            durationDays: 30,
                            dailyPages: Math.ceil(Math.max(1, TOTAL_MUSHAF_PAGES - position.page + 1) / 30),
                            startedDayKey: todayKey,
                            startPage: position.page,
                            targetPage: TOTAL_MUSHAF_PAGES,
                          },
                    )
                  }
                >
                  <SelectTrigger aria-label={t(language, "mushaf.changePlan")} className="font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={direction} position="popper">
                    <SelectItem value="daily">
                      <span className="flex flex-col text-start">
                        <span>{t(language, "mushaf.planPagesPerDay")}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {t(language, "mushaf.planPagesPerDayHint")}
                        </span>
                      </span>
                    </SelectItem>
                    <SelectItem value="custom">
                      <span className="flex flex-col text-start">
                        <span>{t(language, "mushaf.planFinishByDate")}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {t(language, "mushaf.planAdaptiveHint")}
                        </span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {draftPlan.kind === "daily" ? (
                <label className="block text-sm font-bold text-foreground">
                  <span className="mb-2 block">{t(language, "mushaf.planPagesPerDay")}</span>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={draftPlan.dailyPages}
                    onChange={(event) =>
                      setDraftPlan({
                        ...draftPlan,
                        dailyPages: Math.min(604, Math.max(1, Number(event.target.value) || 1)),
                        startedDayKey: todayKey,
                      })
                    }
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </label>
              ) : (
                <label className="block text-sm font-bold text-foreground">
                  <span className="mb-2 block">{t(language, "mushaf.finishInDays")}</span>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={draftPlan.durationDays ?? 30}
                    onChange={(event) => {
                      const days = Math.min(604, Math.max(1, Number(event.target.value) || 1));
                      setDraftPlan({
                        kind: "custom",
                        durationDays: days,
                        dailyPages: Math.ceil(Math.max(1, TOTAL_MUSHAF_PAGES - position.page + 1) / days),
                        startedDayKey: todayKey,
                        startPage: position.page,
                        targetPage: TOTAL_MUSHAF_PAGES,
                      });
                    }}
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </label>
              )}

              <div className="flex flex-col gap-1 rounded-xl bg-muted p-4 text-sm font-medium text-foreground">
                <p>{t(language, "mushaf.aroundPagesPerDay", { count: formatNumerals(draftGoal, language) })}</p>
                <p>{t(language, "mushaf.estimatedCompletion", { date: draftCompletionDate })}</p>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraftPlan(plan);
                    setIsDrafting(false);
                  }}
                  className="min-h-11 flex-1 rounded-xl border border-border px-3 font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {t(language, "mushaf.cancelPlan")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPlanChange(normalizedDraft);
                    setIsDrafting(false);
                  }}
                  className="min-h-11 flex-1 rounded-xl bg-primary px-3 font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {t(language, "mushaf.savePlan")}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-week-title">
          <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
            {t(language, "mushaf.thisWeek")}
          </h2>
          <div className="mt-4 flex flex-col gap-2" role="list" aria-label={t(language, "mushaf.thisWeek")}>
            {week.map((dayKey) => {
              const count = new Set(wirdHistory[dayKey] ?? []).size;
              const dayEligible = !plan.startedDayKey || dayKey >= plan.startedDayKey;
              const dayGoal = dayEligible
                ? (quranWirdDailyGoals[dayKey] ?? effectiveDailyGoal(plan, wirdHistory, dayKey))
                : 0;
              const dayLabel = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
                weekday: "short",
              }).format(new Date(`${dayKey}T12:00:00`));
              const complete = dayGoal > 0 && count >= dayGoal;

              return (
                <div
                  key={dayKey}
                  role="listitem"
                  className={`flex items-center justify-between rounded-xl p-3 ${dayKey === todayKey ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[0.875rem] font-bold text-foreground">{dayLabel}</span>
                    {complete ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-success text-success-foreground">
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <bdi dir="ltr" className="text-[0.875rem] font-bold text-muted-foreground">
                    {dayGoal > 0 && count > 0
                      ? `${formatNumerals(count, language)} / ${formatNumerals(dayGoal, language)}`
                      : t(language, "mushaf.noReading")}
                  </bdi>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
