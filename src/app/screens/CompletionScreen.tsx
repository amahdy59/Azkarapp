import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Check, Home, Share2 } from "../components/icons";
import { GrowthEventStatus } from "../components/RoutineGarden";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode, isRoutineCategory } from "../content/azkar";
import { formatHijriDate, formatNumerals, numeralFontFamily } from "../formatting";
import { t } from "../i18n";
import { getCategoryStreak, MAIN_CATEGORY_IDS, type GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, RoutineMode } from "../types";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function CompletionScreen({
  catId,
  sessionStart,
  dailyCompletions,
  growthEvent,
  quietProgressEnabled,
  progressDayStartHour,
  onHome,
  language,
  direction,
  completionLevel = "complete",
  onContinueComplete,
}: {
  catId: CategoryId;
  sessionStart: number;
  dailyCompletions: DailyCollectionCompletion[];
  growthEvent: GrowthEvent | null;
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  onHome: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  completionLevel?: RoutineMode;
  onContinueComplete?: () => void;
}) {
  const cat = CATEGORIES.find((item) => item.id === catId)!;
  const azkarCount = getAzkarForMode(catId, completionLevel).length;
  const elapsedMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60_000));
  const isArabic = language === "ar";
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    vibrate([30, 50, 30, 50, 50]);

    const isCore = MAIN_CATEGORY_IDS.includes(catId);
    let animationFrame = 0;

    if (isCore) {
      // Keep routine celebrations brief so they feel rewarding without interrupting the next action.
      const duration = 900;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#16a34a", "#22c55e", "#4ade80"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#16a34a", "#22c55e", "#4ade80"],
        });
        if (Date.now() < end) {
          animationFrame = requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Quieter single burst for extra groups — softer colours, smaller scale
      confetti({
        particleCount: 28,
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 0.35 },
        colors: ["#d7a528", "#fbbf24", "#fde68a", "#a3e635"],
        scalar: 0.7,
        gravity: 0.9,
      });
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [catId]);

  const categoryName = isArabic ? cat.nameArabic : cat.name;
  const categoryStreak = Math.max(1, getCategoryStreak(dailyCompletions, catId, new Date(), progressDayStartHour));
  const streakMessage = t(
    language,
    categoryStreak === 1
      ? "completion.categoryStreakOne"
      : categoryStreak === 2
        ? "completion.categoryStreakTwo"
        : "completion.categoryStreakMany",
    { category: categoryName, count: formatNumerals(categoryStreak, language) },
  );
  const stats = [
    { value: azkarCount, label: t(language, "completion.completedAzkar") },
    { value: elapsedMin, label: t(language, "completion.minutes") },
  ];

  const share = async () => {
    const text = t(language, "completion.shareText", { category: categoryName });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Azkar", text });
        setShareStatus(t(language, "completion.shareSuccess"));
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus(t(language, "completion.copySuccess"));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setShareStatus(t(language, "completion.shareError"));
    }
  };

  return (
    <div
      className="completion-screen-enter relative h-full overflow-y-auto bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center"
      dir={direction}
    >
      <TimeOfDayBackground categoryId={catId} />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col">
        <p className="sr-only" role="status" aria-live="polite">
          {t(language, "completion.sessionComplete", { category: categoryName })}
        </p>

        <div
          className="celebration-glow celebration-pop relative mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary"
          aria-hidden="true"
        >
          <Check size={38} className="text-primary-foreground" strokeWidth={2.25} />
        </div>

        <h1 className="mt-5 text-[1.75rem] font-extrabold leading-9 text-primary">
          {t(language, "completion.mashaAllah")}
        </h1>
        <p className="mt-1 text-[1.125rem] font-bold text-card-foreground">
          {t(language, "completion.completed", { category: categoryName })}
        </p>
        <p className="mt-3 text-[0.875rem] leading-6 text-foreground/80">
          {quietProgressEnabled ? streakMessage : t(language, "completion.reflection")}
        </p>

        {quietProgressEnabled && growthEvent?.kind === "palm" && (
          <GrowthEventStatus event={growthEvent} language={language} />
        )}

        <section
          className="mt-7 grid grid-cols-2 overflow-hidden rounded-3xl border border-border/40 bg-card backdrop-blur-xl shadow-lg shadow-black/5"
          aria-label={t(language, "completion.sessionSummary")}
        >
          {stats.map(({ value, label }, index) => (
            <article
              key={label}
              className={`summary-item-enter flex min-h-[92px] flex-col items-center justify-center p-4 ${index === 0 ? "border-e border-white/30 dark:border-white/10" : ""}`}
              style={{ animationDelay: `${180 + index * 55}ms` }}
            >
              <p
                className="text-[1.625rem] font-extrabold text-primary"
                style={{ fontFamily: numeralFontFamily(language) }}
              >
                {formatNumerals(value, language)}
              </p>
              <p className="mt-1 text-[0.8125rem] text-foreground/75">{label}</p>
            </article>
          ))}
        </section>

        <div className="mt-auto pt-7">
          <p className="text-[0.75rem] text-foreground/70" dir="auto">
            {formatHijriDate(new Date(), language)}
          </p>
          <div className="mt-3 grid gap-3">
            {isRoutineCategory(catId) && completionLevel === "core" && onContinueComplete && (
              <button
                type="button"
                onClick={onContinueComplete}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 font-bold text-amber-900 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:text-amber-200"
              >
                {t(language, "category.continueAdditional", {
                  count: formatNumerals(
                    getAzkarForMode(catId, "complete").filter((zikr) => !zikr.includedInCore).length,
                    language,
                  ),
                })}
              </button>
            )}
            <button
              type="button"
              onClick={onHome}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Home size={18} /> {t(language, "completion.returnHome")}
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-4 font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Share2 size={18} /> {t(language, "completion.share")}
            </button>
            {shareStatus && (
              <p className="text-[0.75rem] font-semibold text-muted-foreground" role="status" aria-live="polite">
                {shareStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
