import { useState } from "react";
import { AppLanguage } from "../types";
import { getQuranWordMeaning } from "../content/quranWordMeanings";
import * as Popover from "@radix-ui/react-popover";
import { t } from "../i18n";
import { X } from "./icons";

export function MushafPageViewer({
  lines,
  language,
  pageNumber,
  surahName,
  juzNumber,
  highlightGhareeb,
  direction,
}: {
  lines: { verseKey: string; position: number; isEnd: number; text: string }[][];
  language: AppLanguage;
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  highlightGhareeb: boolean;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";

  const [activeWord, setActiveWord] = useState<{
    verseKey: string;
    wordPosition: number;
    text: string;
    meaning: string;
  } | null>(null);

  return (
    <div
      className="flex flex-col h-full w-full bg-[#fdfaf6] dark:bg-[#0c0c0c] text-foreground rounded-xl shadow-sm border border-border/40 overflow-hidden"
      dir="rtl"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-border/50 text-[0.875rem] font-bold text-muted-foreground font-sans bg-black/5 dark:bg-white/5">
        <span>{surahName}</span>
        <span>{t(language, "common.juz", { number: juzNumber }) || `Juz ${juzNumber}`}</span>
      </div>

      <div
        className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto flex flex-col justify-around min-h-[500px]"
        style={{
          fontFamily: "var(--font-mushaf)",
          fontSize: "1.25rem",
          lineHeight: "2.5",
        }}
      >
        {lines.map((lineWords, lineIdx) => {
          if (!lineWords || lineWords.length === 0) {
            return <div key={lineIdx} className="h-8" aria-hidden="true" />;
          }

          return (
            <div key={lineIdx} className="flex justify-between items-baseline w-full">
              {lineWords.map((w, wIdx) => {
                const meaning = highlightGhareeb ? getQuranWordMeaning(w.verseKey, w.text) : undefined;
                const isGhareeb = !!meaning;

                const wordContent = w.isEnd ? (
                  <span className="inline-flex items-center justify-center relative mx-1 text-primary">
                    <span className="text-[1.5rem]">۝</span>
                    <span className="absolute text-[0.5rem] font-sans font-bold leading-none select-none">
                      {w.verseKey.split(":")[1]}
                    </span>
                  </span>
                ) : (
                  <span className="select-text" title={!isArabic && isGhareeb ? meaning : undefined}>
                    {w.text}
                  </span>
                );

                if (isGhareeb) {
                  return (
                    <Popover.Root
                      key={w.verseKey + "-" + w.position}
                      open={activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position}
                      onOpenChange={(open) => {
                        if (open)
                          setActiveWord({ verseKey: w.verseKey, wordPosition: w.position, text: w.text, meaning });
                        else if (activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position)
                          setActiveWord(null);
                      }}
                    >
                      <Popover.Trigger asChild>
                        <button className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                          <span className="text-primary/90 underline decoration-primary/40 decoration-dotted underline-offset-4">
                            {w.text}
                          </span>
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="top"
                          sideOffset={5}
                          className="z-50 max-w-[280px] p-3 rounded-xl bg-popover text-popover-foreground shadow-overlay border border-border/50 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                          dir={direction}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-primary" style={{ fontFamily: "var(--font-mushaf)" }}>
                                {w.text}
                              </span>
                              <Popover.Close className="text-muted-foreground hover:text-foreground rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring">
                                <X size={14} />
                              </Popover.Close>
                            </div>
                            <p className="text-[0.875rem] leading-relaxed">{meaning}</p>
                          </div>
                          <Popover.Arrow className="fill-popover" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  );
                }

                return <span key={w.verseKey + "-" + w.position + "-" + wIdx}>{wordContent}</span>;
              })}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center px-4 py-2 border-t border-border/50 text-[0.75rem] font-medium text-muted-foreground bg-black/5 dark:bg-white/5 font-sans">
        {pageNumber}
      </div>
    </div>
  );
}
