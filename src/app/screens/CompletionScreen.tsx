import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { Check, Home, Share2 } from "../components/icons";
import { GrowthEventStatus } from "../components/RoutineGarden";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { t } from "../i18n";
import { getGardenSummary, type GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

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
}) {
  const cat = CATEGORIES.find((item) => item.id === catId)!;
  const azkarCount = getAzkarByCategory(catId).length;
  const elapsedMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60_000));
  const isArabic = language === "ar";
  const [shareStatus, setShareStatus] = useState("");

  const encouragement = useMemo(() => {
    const messages = t(language, "completion.encouragements") as unknown as string[];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [language]);

  useEffect(() => {
    // Haptic feedback
    vibrate([30, 50, 30, 50, 50]);

    // Confetti animation
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#16a34a", "#22c55e", "#4ade80"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#16a34a", "#22c55e", "#4ade80"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const gardenSummary = getGardenSummary(dailyCompletions, new Date(), progressDayStartHour);
  const stats = [
    { value: elapsedMin, suffix: t(language, "completion.minutes"), label: t(language, "completion.duration") },
    { value: azkarCount, suffix: "", label: t(language, "completion.azkar") },
    { value: 100, suffix: "%", label: t(language, "completion.completion") },
    ...(quietProgressEnabled
      ? [
          {
            value: gardenSummary.activeDaysLast7,
            suffix: t(language, "completion.daysOfSeven"),
            label: t(language, "completion.activeDays"),
          },
        ]
      : []),
  ];

  const share = async () => {
    const text = t(language, "completion.shareText", { category: isArabic ? cat.nameArabic : cat.name });
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
      className="completion-screen-enter flex h-full flex-col overflow-y-auto bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center"
      dir={direction}
    >
      <p className="text-[0.8125rem] text-muted-foreground">
        {t(language, "completion.sessionComplete", { category: isArabic ? cat.nameArabic : cat.name })}
      </p>

      <div
        className="celebration-glow celebration-pop relative mx-auto mt-7 flex h-28 w-28 items-center justify-center rounded-full bg-primary"
        aria-hidden="true"
      >
        <Check size={48} className="text-primary-foreground" strokeWidth={2} />
      </div>

      <h1 className="mt-8 text-[1.75rem] font-extrabold leading-9 text-primary">
        {t(language, "completion.mashaAllah")}
      </h1>
      <p className="mt-2 text-[1.0625rem] font-semibold text-card-foreground">
        {t(language, "completion.completed", { category: isArabic ? cat.nameArabic : cat.name })}
      </p>
      <p className="mt-2 text-[0.8125rem] text-muted-foreground">{encouragement}</p>

      {quietProgressEnabled && growthEvent && <GrowthEventStatus event={growthEvent} language={language} />}

      <section className="mt-8 grid grid-cols-2 gap-3" aria-label={t(language, "completion.sessionSummary")}>
        {stats.map(({ value, suffix, label }, index) => (
          <article
            key={label}
            className={`summary-item-enter flex min-h-[94px] flex-col items-center justify-center rounded-2xl bg-card p-4 ${!quietProgressEnabled && index === stats.length - 1 ? "col-span-2" : ""}`}
            style={{ animationDelay: `${180 + index * 55}ms` }}
          >
            <p
              className="text-[1.5625rem] font-extrabold text-primary"
              style={{ fontFamily: numeralFontFamily(language) }}
            >
              {formatNumerals(value, language)}
              {suffix}
            </p>
            <p className="mt-1 text-[0.75rem] text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <p className="mt-auto pt-7 text-[0.6875rem] text-muted-foreground">
        {new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { dateStyle: "long" }).format(new Date())}
      </p>
      <div className="mt-3 grid gap-3">
        <button
          type="button"
          onClick={onHome}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground transition-transform duration-150 active:scale-[0.98]"
        >
          <Home size={18} /> {t(language, "completion.returnHome")}
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border-control bg-card font-bold text-foreground transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
  );
}
