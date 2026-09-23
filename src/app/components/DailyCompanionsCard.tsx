import { BookOpen, MapPin, Check } from "./icons";
import { t } from "../i18n";
import { formatNumerals, formatRatio } from "../formatting";
import type { AppLanguage } from "../types";

export function DailyCompanionsCard({
  language,
  quranWird,
  quranProgress,
  mosquePrayers,
  onToggleQuranWird,
  onCycleMosquePrayers,
  showMosque = true,
  className = "",
}: {
  language: AppLanguage;
  quranWird: boolean;
  quranProgress?: { progress: number; goal: number };
  mosquePrayers: "mosque_3" | "mosque_5" | null;
  onToggleQuranWird: () => void;
  onCycleMosquePrayers: () => void;
  showMosque?: boolean;
  className?: string;
}) {
  const isArabic = language === "ar";
  const hasMosque = Boolean(mosquePrayers);

  // Mosque state label
  const mosqueState =
    mosquePrayers === "mosque_5"
      ? t(language, "progress.mosque5")
      : mosquePrayers === "mosque_3"
        ? t(language, "progress.mosque3")
        : t(language, "progress.mosqueNone");

  return (
    <section
      data-testid="daily-companions-card"
      dir={isArabic ? "rtl" : "ltr"}
      aria-labelledby="daily-companions-heading"
      className={`overflow-hidden rounded-3xl border border-border/60 bg-card/90 text-foreground shadow-raised backdrop-blur-md ${className}`}
    >
      <div className="border-b border-border/60 bg-muted/40 px-4 py-3.5 sm:px-6">
        <h2 id="daily-companions-heading" className="text-subtitle font-black leading-tight text-foreground" dir="auto">
          {t(language, showMosque ? "home.dailyCompanions" : "progress.quranAndRemembrance")}
        </h2>
        <p className="mt-0.5 text-caption font-semibold text-muted-foreground" dir="auto">
          {t(language, showMosque ? "home.dailyCompanionsDesc" : "progress.quranAndRemembranceDesc")}
        </p>
      </div>

      <div className="divide-y divide-border/50">
        {/* Quran Wird Item */}
        <button
          type="button"
          onClick={onToggleQuranWird}
          aria-pressed={quranWird}
          className="flex w-full min-h-[48px] items-center justify-between px-4 py-3.5 text-start transition-colors hover:bg-muted/40 active:bg-muted/70 sm:px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex size-10 items-center justify-center rounded-2xl transition-colors ${
                quranWird ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              <BookOpen size={20} strokeWidth={quranWird ? 2.5 : 2} aria-hidden="true" />
            </div>
            <div>
              <span className="block text-body font-bold text-foreground">{t(language, "progress.quranWird")}</span>
              <span
                className={`block text-caption font-semibold ${quranWird ? "text-success" : "text-muted-foreground"}`}
              >
                {quranWird
                  ? t(language, "progress.completed")
                  : quranProgress && quranProgress.goal > 0
                    ? isArabic
                      ? `${formatRatio(quranProgress.progress, quranProgress.goal, language)} صفحة`
                      : `${formatRatio(quranProgress.progress, quranProgress.goal, language)} pages`
                    : t(language, "progress.markComplete")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {quranProgress && quranProgress.goal > 0 && (
              <span className="text-caption font-bold rounded-lg border border-border/80 bg-muted/60 px-2.5 py-1 text-muted-foreground">
                {formatNumerals(quranProgress.progress, language)}/{formatNumerals(quranProgress.goal, language)}
              </span>
            )}
            <div
              className={`flex size-6 items-center justify-center rounded-full border transition-all ${
                quranWird
                  ? "border-success bg-success text-success-foreground"
                  : "border-border bg-transparent text-transparent"
              }`}
              aria-hidden="true"
            >
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        </button>

        {/* Mosque Prayers Item */}
        {showMosque && (
          <button
            type="button"
            onClick={onCycleMosquePrayers}
            className="flex w-full min-h-[48px] items-center justify-between px-4 py-3.5 text-start transition-colors hover:bg-muted/40 active:bg-muted/70 sm:px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`flex size-10 items-center justify-center rounded-2xl transition-colors ${
                  hasMosque ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
                }`}
              >
                <MapPin size={20} strokeWidth={hasMosque ? 2.5 : 2} aria-hidden="true" />
              </div>
              <div>
                <span className="block text-body font-bold text-foreground">
                  {t(language, "progress.mosquePrayers")}
                </span>
                <span
                  className={`block text-caption font-semibold ${hasMosque ? "text-warning" : "text-muted-foreground"}`}
                >
                  {mosqueState}
                </span>
              </div>
            </div>

            <span className="text-caption font-bold rounded-lg border border-border/80 bg-muted/60 px-2.5 py-1 text-muted-foreground">
              {mosquePrayers === "mosque_5" ? "5/5" : mosquePrayers === "mosque_3" ? "3/5" : "0/5"}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
