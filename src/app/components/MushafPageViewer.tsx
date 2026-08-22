import { useState, useMemo } from "react";
import type { AppLanguage, MushafTheme } from "../types";
import { getQuranWordMeaning } from "../content/quranWordMeanings";
import * as Popover from "@radix-ui/react-popover";
import { t } from "../i18n";
import { X, Bookmark } from "./icons";
import { formatNumerals } from "../formatting";
import { getSurahDisplayName } from "../content/surahInfo";

export interface MushafWordToken {
  verseKey: string;
  position: number;
  isEnd: number;
  text: string;
}

export function AyahMarker({
  number,
  language,
  theme = "parchment",
}: {
  number: string | number;
  language: AppLanguage;
  theme?: MushafTheme;
}) {
  const displayNum = formatNumerals(number, language);
  const isOled = theme === "oled";

  return (
    <span
      className="inline-flex items-center justify-center relative mx-1 align-middle select-none shrink-0"
      role="img"
      aria-label={`آية ${displayNum}`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        className={`${isOled ? "text-white drop-shadow-xs" : "text-primary/90 transition-transform drop-shadow-xs"}`}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.5" className="opacity-90" />
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="2 1.5"
          className="opacity-60"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[0.625rem] sm:text-[0.6875rem] font-bold font-sans leading-none pt-0.5 ${
          isOled ? "text-white" : "text-primary"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden="true"
      >
        {displayNum}
      </span>
    </span>
  );
}

function SurahHeaderBox({
  surahNumber,
  language,
  theme = "parchment",
}: {
  surahNumber: number | string;
  language: AppLanguage;
  theme?: MushafTheme;
}) {
  const title = getSurahDisplayName(surahNumber, language);
  const isOled = theme === "oled";

  return (
    <div className="flex items-center justify-center w-full my-2 select-none" dir="rtl">
      <div
        className={`relative flex items-center justify-between w-full max-w-[96%] sm:max-w-[92%] px-4 py-1.5 border-2 rounded-xl shadow-xs ${
          isOled
            ? "border-white bg-white/10 text-white"
            : "border-primary/60 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 text-primary"
        }`}
      >
        <span className="text-[0.875rem] opacity-80" aria-hidden="true">
          ۞
        </span>
        <span className="font-arabic font-extrabold text-[1rem] sm:text-[1.125rem] tracking-wide">{title}</span>
        <span className="text-[0.875rem] opacity-80" aria-hidden="true">
          ۞
        </span>
      </div>
    </div>
  );
}

function BismillahLine() {
  return (
    <div className="flex items-center justify-center w-full my-1.5 select-none text-center" dir="rtl">
      <p
        className="font-arabic font-bold text-[1.125rem] sm:text-[1.25rem] tracking-wide opacity-95"
        style={{ fontFamily: "var(--font-mushaf)" }}
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </p>
    </div>
  );
}

export function MushafPageViewer({
  lines,
  language,
  pageNumber,
  surahName,
  juzNumber,
  direction,
  theme = "parchment",
  isBookmarked = false,
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  direction: "ltr" | "rtl";
  theme?: MushafTheme;
  isBookmarked?: boolean;
}) {
  const isArabic = language === "ar";

  const [activeWord, setActiveWord] = useState<{
    verseKey: string;
    wordPosition: number;
    text: string;
    meaning: string;
  } | null>(null);

  // Analyze page lines to identify Surah headers and Bismillah
  const lineDetails = useMemo(() => {
    // Collect all first-verse instances on this page
    const surahStarts: { surah: number; startLine: number }[] = [];
    for (let l = 0; l < lines.length; l++) {
      const lineWords = lines[l];
      if (!lineWords || lineWords.length === 0) continue;
      for (const w of lineWords) {
        const [s, a] = w.verseKey.split(":");
        if (a === "1" && !surahStarts.some((item) => item.surah === Number(s))) {
          surahStarts.push({ surah: Number(s), startLine: l + 1 });
        }
      }
    }

    return lines.map((words, idx) => {
      const lineNum = idx + 1;
      const isEmpty = !words || words.length === 0;

      // Check if this empty line corresponds to a Surah Header or Bismillah
      if (isEmpty) {
        for (const start of surahStarts) {
          if (start.surah === 1 && lineNum === 1) {
            return { type: "surah-header" as const, surah: 1 };
          }
          if (lineNum === start.startLine - 2) {
            return { type: "surah-header" as const, surah: start.surah };
          }
          if (lineNum === start.startLine - 1 && start.surah !== 9) {
            return { type: "bismillah" as const };
          }
        }
        return { type: "empty" as const };
      }

      return { type: "text" as const, words };
    });
  }, [lines]);

  const formattedJuz = `${t(language, "common.juz")} ${formatNumerals(juzNumber, language)}`;

  // Theme styling classes
  const themeClasses = {
    parchment: "bg-[#fbf7ee] dark:bg-[#141820] text-[#1c1917] dark:text-[#f3f4f6] border-primary/40 ring-primary/20",
    dark: "bg-[#0b0e14] text-[#f3f4f6] border-primary/30 ring-primary/15",
    oled: "bg-[#000000] text-[#ffffff] border-white/50 ring-white/30",
    white: "bg-[#ffffff] text-[#111827] border-gray-300 ring-gray-200",
  }[theme];

  const headerBgClass = {
    parchment: "bg-primary/5 border-primary/20 text-foreground/80",
    dark: "bg-primary/10 border-primary/20 text-foreground/80",
    oled: "bg-white/10 border-white/30 text-white",
    white: "bg-gray-100 border-gray-200 text-gray-800",
  }[theme];

  return (
    <article
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden border-0 shadow-none ring-0 transition-colors duration-200 sm:rounded-2xl sm:border sm:shadow-raised sm:ring-1 ${themeClasses}`}
      dir="rtl"
      aria-label={t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
    >
      {/* Bookmark Ribbon on top-end corner */}
      {isBookmarked && (
        <div
          className="absolute top-0 end-4 z-20 flex items-center justify-center text-primary drop-shadow-md pointer-events-none"
          role="img"
          aria-label={t(language, "mushaf.bookmarkSaved")}
        >
          <Bookmark size={26} className="fill-primary text-primary" />
        </div>
      )}

      {/* Decorative Mushaf Header Banner */}
      <div
        className={`flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2 text-[0.75rem] font-bold font-sans sm:px-5 sm:text-[0.8125rem] ${headerBgClass}`}
      >
        <span className="font-arabic font-extrabold">{surahName}</span>
        <span className="font-arabic font-bold opacity-80">{formattedJuz}</span>
      </div>

      {/* 15-Line Mushaf Page Canvas */}
      <div
        className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden px-2 py-2 min-[360px]:px-3 sm:px-5 sm:py-3"
        style={{
          fontFamily: "var(--font-mushaf)",
          fontSize: "clamp(0.75rem, 3.45vw, 1.35rem)",
          lineHeight: 1.75,
        }}
      >
        {lineDetails.map((line, lineIdx) => {
          if (line.type === "surah-header") {
            return <SurahHeaderBox key={lineIdx} surahNumber={line.surah} language={language} theme={theme} />;
          }

          if (line.type === "bismillah") {
            return <BismillahLine key={lineIdx} />;
          }

          if (line.type === "empty") {
            return <div key={lineIdx} className="h-6" aria-hidden="true" />;
          }

          const lineWords = line.words;

          return (
            <div
              key={lineIdx}
              className="flex w-full select-text flex-nowrap items-baseline justify-center gap-x-0.5 whitespace-nowrap py-px min-[360px]:gap-x-1 sm:gap-x-1.5 md:gap-x-2"
            >
              {lineWords.map((w, wIdx) => {
                const meaning = getQuranWordMeaning(w.verseKey, w.text);
                const isGhareeb = !!meaning;

                if (w.isEnd) {
                  return (
                    <AyahMarker
                      key={`${w.verseKey}-${w.position}-${wIdx}`}
                      number={w.text || w.verseKey.split(":")[1] || ""}
                      language={language}
                      theme={theme}
                    />
                  );
                }

                const wordContent = (
                  <span className="select-text" title={!isArabic && isGhareeb ? meaning : undefined}>
                    {w.text}
                  </span>
                );

                if (isGhareeb) {
                  return (
                    <Popover.Root
                      key={`${w.verseKey}-${w.position}`}
                      open={activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position}
                      onOpenChange={(open) => {
                        if (open)
                          setActiveWord({ verseKey: w.verseKey, wordPosition: w.position, text: w.text, meaning });
                        else if (activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position)
                          setActiveWord(null);
                      }}
                    >
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          className="relative rounded bg-primary/10 px-0.5 text-primary underline decoration-2 decoration-dotted underline-offset-4 transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={t(language, "mushaf.wordMeaning", { word: w.text })}
                        >
                          <span className="font-bold">{w.text}</span>
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="top"
                          sideOffset={6}
                          className="z-50 max-w-[290px] p-3.5 rounded-xl bg-popover text-popover-foreground shadow-overlay border border-border/60 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                          dir={direction}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center w-full border-b border-border/40 pb-1.5">
                              <span
                                className="font-bold text-primary text-[1.125rem]"
                                style={{ fontFamily: "var(--font-mushaf)" }}
                              >
                                {w.text}
                              </span>
                              <Popover.Close className="text-muted-foreground hover:text-foreground rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring">
                                <X size={14} />
                              </Popover.Close>
                            </div>
                            <p className="text-[0.875rem] font-sans font-medium leading-relaxed">{meaning}</p>
                          </div>
                          <Popover.Arrow className="fill-popover" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  );
                }

                return <span key={`${w.verseKey}-${w.position}-${wIdx}`}>{wordContent}</span>;
              })}
            </div>
          );
        })}
      </div>
    </article>
  );
}
