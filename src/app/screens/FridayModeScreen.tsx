import { useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import { Sparkles, BookOpen, Heart, CheckCircle2, RotateCcw } from "../components/icons";
import { t } from "../i18n";

// ─── Weekly-reset key ─────────────────────────────────────────────────────────
// Returns an ISO-week string like "2025-W03" so the Surah Al-Kahf checkbox
// automatically un-ticks on the first use of a new Friday week.
function getIsoWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7; // Sunday → 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // Nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const SALAWAT_KEY = "azkarapp_salawat_friday_count";
const KAHF_KEY_PREFIX = "azkarapp_surah_kahf_complete_";

export function FridayModeScreen({
  isArabic,
  direction,
  onBack,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";

  // Salawat counter — lifetime running total, intentionally never auto-resets
  const [salawatCount, setSalawatCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(SALAWAT_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Surah Al-Kahf — keyed by ISO week so it resets automatically each Friday week
  const [surahKahfRead, setSurahKahfRead] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${KAHF_KEY_PREFIX}${getIsoWeekKey()}`) === "true";
    } catch {
      return false;
    }
  });

  const handleIncrementSalawat = () => {
    const next = salawatCount + 1;
    setSalawatCount(next);
    try {
      localStorage.setItem(SALAWAT_KEY, next.toString());
    } catch {
      // ignore storage errors
    }
  };

  const handleResetSalawat = () => {
    setSalawatCount(0);
    try {
      localStorage.setItem(SALAWAT_KEY, "0");
    } catch {
      // ignore
    }
  };

  const handleToggleKahf = () => {
    const next = !surahKahfRead;
    setSurahKahfRead(next);
    try {
      localStorage.setItem(`${KAHF_KEY_PREFIX}${getIsoWeekKey()}`, next ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const milestones = [100, 500, 1000];

  return (
    <ScreenContainer dir={direction} className="px-0">
      <Header onBack={onBack} title={t(language, "friday.title")} subtitle={t(language, "friday.subtitle")} />

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4 space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-start shadow-md dark:bg-amber-500/15">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[1.125rem] font-black text-foreground">{t(language, "friday.bannerHeading")}</h2>
              <p className="mt-0.5 text-[0.8125rem] font-semibold text-muted-foreground">
                {t(language, "friday.bannerHadith")}
              </p>
            </div>
          </div>
        </div>

        {/* Salawat Counter Card */}
        <section aria-labelledby="salawat-heading" className="rounded-3xl border border-border bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-rose-500 fill-rose-500/20" />
              <h3 id="salawat-heading" className="text-[1rem] font-black text-foreground">
                {t(language, "friday.salawatHeading")}
              </h3>
            </div>
            {salawatCount > 0 && (
              <button
                type="button"
                onClick={handleResetSalawat}
                className="flex items-center gap-1 text-[0.75rem] font-extrabold text-muted-foreground hover:text-destructive transition-colors"
                aria-label={t(language, "friday.salawatResetAriaLabel")}
              >
                <RotateCcw size={14} />
                <span>{t(language, "friday.salawatResetLabel")}</span>
              </button>
            )}
          </div>

          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground text-start">
            {t(language, "friday.salawatText")}
          </p>

          {/* Interactive Counter Circle Button */}
          <div className="my-6 flex justify-center">
            <button
              type="button"
              onClick={handleIncrementSalawat}
              aria-label={t(language, "friday.salawatCounterAriaLabel", {
                count: formatNumerals(salawatCount, language),
              })}
              className="group relative flex size-36 flex-col items-center justify-center rounded-full border-4 border-amber-500/80 bg-amber-500/10 shadow-xl active:scale-95 transition-all hover:bg-amber-500/20 dark:bg-amber-500/15"
            >
              <span className="text-[2.25rem] font-black text-amber-600 dark:text-amber-400">
                {formatNumerals(salawatCount, language)}
              </span>
              <span className="text-[0.75rem] font-black text-muted-foreground group-hover:text-foreground">
                {t(language, "friday.salawatTapHint")}
              </span>
            </button>
          </div>

          {/* Milestones Progress */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {milestones.map((target) => {
              const reached = salawatCount >= target;
              return (
                <div
                  key={target}
                  className={`rounded-2xl border p-2.5 transition-all ${
                    reached
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border/70 bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="block text-[0.875rem] font-black">{formatNumerals(target, language)}</span>
                  <span className="block text-[0.6875rem] font-bold">
                    {reached ? t(language, "friday.milestoneDone") : t(language, "friday.milestoneTarget")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Surah Al-Kahf Card */}
        <section aria-labelledby="kahf-heading" className="rounded-3xl border border-border bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-amber-500" />
              <h3 id="kahf-heading" className="text-[1rem] font-black text-foreground">
                {t(language, "friday.kahfHeading")}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleToggleKahf}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-black transition-all ${
                surahKahfRead
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <CheckCircle2 size={15} />
              <span>{surahKahfRead ? t(language, "friday.kahfCompleted") : t(language, "friday.kahfMarkDone")}</span>
            </button>
          </div>

          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground text-start">
            {t(language, "friday.kahfHadith")}
          </p>
        </section>
      </div>
    </ScreenContainer>
  );
}
