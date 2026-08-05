import { useState, useEffect, useCallback } from "react";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { CheckCircle2, ExternalLink, Heart, RotateCcw } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { counterNumeralFontFamily, formatNumerals } from "../formatting";
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
    <article className="rounded-[1.5rem] border border-white/40 dark:border-white/10 bg-card p-4.5 text-start backdrop-blur-xl shadow-lg shadow-black/5">
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

  const persist = useCallback((count: number, target: FridaySalawatTarget) => {
    const next = { count, target };
    setProgress(next);
    writeFridaySalawatProgress(next);
  }, []);

  const increment = useCallback(() => {
    if (complete) return;
    persist(progress.count + 1, progress.target);
  }, [complete, persist, progress.count, progress.target]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        increment();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [increment, onBack]);

  return (
    <ScreenContainer dir={direction} className="px-0 relative">
      <TimeOfDayBackground categoryId="friday" />
      <Header title={copy.title} subtitle={copy.subtitle} onBack={onBack} language={language} />

      <div className="relative z-10 flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-8 pt-3">
        <section className="rounded-[2rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-card p-5 text-center backdrop-blur-xl shadow-lg shadow-black/5">
          <Heart className="mx-auto fill-rose-500/15 text-rose-500" size={28} aria-hidden="true" />
          <p className="mt-3 text-[1.125rem] font-black leading-8 text-foreground" dir="rtl" lang="ar">
            {copy.phrase}
          </p>
        </section>

        <section aria-labelledby="salawat-target-title">
          <h2 id="salawat-target-title" className="mb-2 text-start text-[0.875rem] font-black text-foreground">
            {copy.target}
          </h2>
          <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/40 dark:border-white/10 bg-card p-1.5 backdrop-blur-xl shadow-lg shadow-black/5">
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
          <ZikrCounterSurface
            count={progress.count}
            total={progress.target}
            compact={false}
            complete={complete}
            onTap={increment}
            language={language}
            instructionText={copy.tap}
            testId="salawat-counter"
          />

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
