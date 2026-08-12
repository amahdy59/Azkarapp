import { useState, useEffect, useCallback } from "react";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { CheckCircle2, ExternalLink, Heart, RotateCcw } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { Button } from "../components/ui/button";
import { readFridaySalawatProgress, writeFridaySalawatProgress, type FridaySalawatTarget } from "../fridayProgress";
import type { AppLanguage } from "../types";

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
    <article className="rounded-3xl border border-border/40 bg-card p-4.5 text-start shadow-raised">
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
  reduceMotion = false,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  reduceMotion?: boolean;
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
      const focusedControl =
        activeEl instanceof Element &&
        activeEl.closest(
          'button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="combobox"], [role="menuitem"], [role="option"], [role="radio"], [role="search"], [role="switch"], [role="tab"], [role="textbox"]',
        );
      if (focusedControl) return;
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
    <ScreenContainer dir={direction} className="px-0 relative" screenName={copy.title}>
      <Header title={copy.title} subtitle={copy.subtitle} onBack={onBack} language={language} />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {complete ? copy.completed : ""}
      </p>

      <div className="relative z-10 flex flex-1 overflow-y-auto px-5 pb-8 pt-3">
        <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-5">
          <div className="grid items-stretch gap-5 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
            <section className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-card to-card p-6 text-center shadow-raised md:min-h-[22rem]">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <Heart className="fill-rose-500/15" size={28} aria-hidden="true" />
              </span>
              <p
                className="mt-4 max-w-[32rem] zikr-text text-[1.25rem] font-black leading-9 text-foreground sm:text-[1.375rem]"
                dir="rtl"
                lang="ar"
              >
                {copy.phrase}
              </p>
            </section>

            <section
              aria-labelledby="salawat-counter-title"
              className="flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-4 shadow-raised sm:p-5"
            >
              <h2 id="salawat-counter-title" className="sr-only">
                {copy.target}
              </h2>
              <CounterTargetPicker
                activeTarget={progress.target}
                onTargetChange={(target) => persist(progress.count, target)}
                language={language}
                direction={direction}
                allowOpen={false}
              />

              <div className="my-6 flex flex-col items-center justify-center">
                <ZikrCounterSurface
                  count={progress.count}
                  total={progress.target}
                  complete={complete}
                  onTap={increment}
                  language={language}
                  instructionText={copy.tap}
                  testId="salawat-counter"
                  className="salawat-counter-surface"
                  reduceMotion={reduceMotion}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => persist(0, progress.target)}
                  disabled={progress.count === 0}
                  className="mt-4"
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  {copy.reset}
                </Button>
              </div>
            </section>
          </div>

          <section aria-labelledby="salawat-benefits" className="space-y-3">
            <div className="flex items-center gap-2 text-start">
              <CheckCircle2 size={20} className="text-emerald-500" aria-hidden="true" />
              <h2 id="salawat-benefits" className="text-[0.9375rem] font-black text-foreground">
                {copy.benefits}
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <BenefitCard text={copy.muslim} source={copy.muslimSource} href="https://sunnah.com/muslim:408" />
              <BenefitCard text={copy.friday} source={copy.fridaySource} href="https://sunnah.com/abudawud:1047" />
            </div>
          </section>
        </div>
      </div>
    </ScreenContainer>
  );
}
