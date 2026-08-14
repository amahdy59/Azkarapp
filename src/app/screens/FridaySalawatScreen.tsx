import { useState, useEffect, useCallback } from "react";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { ExternalLink, RotateCcw } from "../components/icons";
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

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target;
    if (
      targetElement instanceof Element &&
      targetElement.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [data-prevent-count='true']",
      )
    ) {
      return;
    }
    increment();
  };

  return (
    <ScreenContainer dir={direction} className="px-0 relative" screenName={copy.title}>
      <Header title={copy.title} subtitle={copy.subtitle} onBack={onBack} language={language} />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {complete ? copy.completed : ""}
      </p>

      {/* Pointer-only canvas shortcut; the explicit counter remains the named keyboard target. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative z-10 flex flex-1 overflow-y-auto px-5 pb-8 pt-3"
        data-counting-mode="canvas"
        onClick={handleCanvasClick}
      >
        <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4">
          <section aria-labelledby="salawat-reference-title">
            <h2 id="salawat-reference-title" className="mb-2 text-start text-[0.8125rem] font-black text-foreground">
              {copy.benefits}
            </h2>
            <BenefitCard text={copy.muslim} source={copy.muslimSource} href="https://sunnah.com/muslim:408" />
          </section>

          <section
            aria-labelledby="salawat-counter-title"
            className="flex shrink-0 flex-col rounded-[24px] border border-border bg-card p-5 shadow-raised sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="salawat-counter-title" className="text-[0.8125rem] font-black text-foreground">
                {copy.target}
              </h2>
              <CounterTargetPicker
                activeTarget={progress.target}
                onTargetChange={(target) => persist(progress.count, target)}
                language={language}
                direction={direction}
                allowOpen={false}
              />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center pb-1">
              <p
                className="zikr-text mb-7 max-w-[34rem] text-center text-[1.25rem] font-black leading-[2] text-foreground sm:text-[1.5rem]"
                dir="rtl"
                lang="ar"
              >
                {copy.phrase}
              </p>
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
                className="mt-5"
              >
                <RotateCcw size={18} aria-hidden="true" />
                {copy.reset}
              </Button>
              <p className="mt-3 text-center text-[0.8125rem] font-semibold text-muted-foreground">{copy.tap}</p>
            </div>
          </section>

          <BenefitCard text={copy.friday} source={copy.fridaySource} href="https://sunnah.com/abudawud:1047" />
        </div>
      </div>
    </ScreenContainer>
  );
}
