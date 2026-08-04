import { useState } from "react";
import { AdaptiveCounterTrack } from "../components/ZikrComponents";
import { Check, CheckCircle2, ExternalLink, Heart, RotateCcw } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { readFridaySalawatProgress, writeFridaySalawatProgress, type FridaySalawatTarget } from "../fridayProgress";
import type { AppLanguage } from "../types";

const TARGETS: FridaySalawatTarget[] = [10, 100, 1000];

const COPY = {
  en: {
    title: "Salawat Counter ﷺ",
    subtitle: "Choose a target and count with intention",
    phrase: "Allahumma salli wa sallim ‘ala Nabiyyina Muhammad",
    target: "Target",
    tap: "Tap to count",
    completed: "Target completed",
    reset: "Reset counter",
    benefits: "Authentic benefits",
    muslim: "Whoever sends one blessing upon the Prophet ﷺ, Allah sends ten blessings upon that person.",
    muslimSource: "Sahih Muslim 408",
    friday: "Friday is among the best of your days, so increase your prayers upon the Prophet ﷺ on it.",
    fridaySource: "Sunan Abi Dawud 1047 — Sahih",
  },
  ar: {
    title: "عداد الصلاة على النبي ﷺ",
    subtitle: "اختر هدفًا واحتسب الأجر",
    phrase: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    target: "الهدف",
    tap: "اضغط للعد",
    completed: "اكتمل الهدف",
    reset: "تصفير العداد",
    benefits: "فضائل ثابتة بأحاديث صحيحة",
    muslim: "«مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا».",
    muslimSource: "صحيح مسلم ٤٠٨",
    friday: "«إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ، فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ».",
    fridaySource: "سنن أبي داود ١٠٤٧ — صحيح",
  },
} as const;

function BenefitCard({ text, source, href }: { text: string; source: string; href: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 text-start shadow-sm">
      <p className="text-[0.9375rem] font-semibold leading-7 text-foreground">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl text-[0.8125rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {source}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  );
}

export function FridaySalawatScreen({
  language,
  direction,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const copy = COPY[language];
  const [progress, setProgress] = useState(readFridaySalawatProgress);
  const complete = progress.count >= progress.target;

  const persist = (count: number, target: FridaySalawatTarget) => {
    const next = { count, target };
    setProgress(next);
    writeFridaySalawatProgress(next);
  };

  const increment = () => {
    if (complete) return;
    persist(progress.count + 1, progress.target);
  };

  return (
    <ScreenContainer dir={direction} className="px-0">
      <Header title={copy.title} subtitle={copy.subtitle} onBack={onBack} language={language} />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-8 pt-3">
        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-card p-5 text-center shadow-sm">
          <Heart className="mx-auto fill-rose-500/15 text-rose-500" size={28} aria-hidden="true" />
          <p className="mt-3 text-[1.125rem] font-black leading-8 text-foreground" dir="rtl" lang="ar">
            {copy.phrase}
          </p>
        </section>

        <section aria-labelledby="salawat-target-title">
          <h2 id="salawat-target-title" className="mb-2 text-start text-[0.875rem] font-black text-foreground">
            {copy.target}
          </h2>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1.5">
            {TARGETS.map((target) => (
              <button
                key={target}
                type="button"
                aria-pressed={progress.target === target}
                onClick={() => persist(progress.count, target)}
                className={`min-h-11 rounded-xl text-[0.9375rem] font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  progress.target === target ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
                style={{ fontFamily: counterNumeralFontFamily(language) }}
              >
                {formatNumerals(target, language)}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center" aria-live="polite">
          <button
            type="button"
            data-testid="salawat-counter"
            disabled={complete}
            onClick={increment}
            aria-label={`${copy.tap}: ${formatRatio(progress.count, progress.target, language)}`}
            className={`adaptive-counter-surface counter-ring-stage ${progress.count === 0 ? "counter-ring-ready" : ""}`}
            style={{ width: 180, height: 180, borderRadius: 90 }}
          >
            <AdaptiveCounterTrack count={progress.count} total={progress.target} compact={false} />
            <div className="adaptive-counter-content">
              {complete ? (
                <div className="counter-complete-cue flex flex-col items-center justify-center">
                  <span className="counter-check-mark">
                    <Check size={36} strokeWidth={2.5} />
                  </span>
                  <span className="mt-2 text-[0.75rem] font-black text-foreground">{copy.completed}</span>
                </div>
              ) : (
                <>
                  <div className="adaptive-counter-numerals flex flex-col items-center" dir="ltr">
                    <p
                      className="counter-number text-[2rem] font-black leading-none text-foreground"
                      style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatNumerals(progress.count, language)}
                    </p>
                    <p
                      className="text-[0.75rem] font-bold text-muted-foreground mt-1"
                      style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatRatio(progress.count, progress.target, language)}
                    </p>
                  </div>

                  <div className="my-1.5 h-[1.5px] w-7 bg-border/60 rounded-full" aria-hidden="true" />

                  <p className="tap-anywhere-hint font-bold text-foreground text-xs">{copy.tap}</p>

                  {progress.target > progress.count && (
                    <p
                      className="mt-0.5 text-[0.6875rem] font-extrabold text-primary"
                      style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums" }}
                    >
                      {language === "ar"
                        ? `${formatNumerals(progress.target - progress.count, language)} متبقٍ`
                        : `${progress.target - progress.count} remaining`}
                    </p>
                  )}
                </>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => persist(0, progress.target)}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-[0.875rem] font-black text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <RotateCcw size={18} aria-hidden="true" />
            {copy.reset}
          </button>
        </section>

        <section aria-labelledby="salawat-benefits" className="space-y-3">
          <div className="flex items-center gap-2 text-start">
            <CheckCircle2 size={20} className="text-emerald-500" aria-hidden="true" />
            <h2 id="salawat-benefits" className="text-[0.9375rem] font-black text-foreground">
              {copy.benefits}
            </h2>
          </div>
          <BenefitCard text={copy.muslim} source={copy.muslimSource} href="https://sunnah.com/muslim:408" />
          <BenefitCard text={copy.friday} source={copy.fridaySource} href="https://sunnah.com/abudawud:1047" />
        </section>
      </div>
    </ScreenContainer>
  );
}
