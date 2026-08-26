import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronUp } from "./icons";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/**
 * The meaning of the word you just tapped, anchored under that word.
 *
 * A bottom sheet answered the question but covered the ayah to do it, so the
 * reader lost the line they were on. Anchoring keeps the word, its context and
 * its gloss in one glance.
 *
 * Exactly one popover exists for the whole passage — Al-Kahf highlights 258
 * words, and rendering a positioned element per word would cost 258 layout
 * boxes to show one. The tapped word takes `data-word-active`, CSS gives that
 * element the anchor name, and this element positions against it.
 */
const ANCHOR_SUPPORTED =
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("anchor-name", "--a");

export function QuranWordPopover({
  meanings,
  anchorEl,
  language,
  direction,
  onShowAll,
  showSource = false,
  onClose,
}: {
  meanings: QuranWordMeaning[] | null;
  anchorEl: HTMLElement | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onShowAll?: () => void;
  showSource?: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState<{ top: number; left: number; caret: number; above: boolean } | null>(null);
  const open = Boolean(meanings?.length && anchorEl);

  /* One measurement per open, never on scroll. A tooltip that chases the text
     while it moves is both a jank source and the wrong behaviour; this closes
     instead.
     
     Both paths measure, for different reasons. Without anchor positioning this
     computes the placement. With it, the browser has already placed the box —
     including flipping it above the word near the viewport edge — but CSS
     gives no selector for "the fallback position won", so the caret would keep
     pointing up while sitting below the word. Reading the resolved box back is
     the only way to know which side it landed on. */
  useLayoutEffect(() => {
    if (!open || !anchorEl || !ref.current) return;
    const word = anchorEl.getBoundingClientRect();
    const box = ref.current.getBoundingClientRect();
    const margin = 8;

    if (ANCHOR_SUPPORTED) {
      /* The caret is measured even here. The browser centres the box on the
         word, but on a narrow screen it also clamps it to the viewport, and a
         caret pinned to the box's middle then points at empty space beside the
         word — worst on phones, where the clamp always happens. */
      setFallback({
        top: 0,
        left: 0,
        caret: word.left + word.width / 2 - box.left,
        above: box.bottom <= word.top + 2,
      });
      return;
    }

    const above = word.bottom + margin + box.height > window.innerHeight;
    const wordCenter = word.left + word.width / 2;
    const left = Math.min(Math.max(wordCenter - box.width / 2, margin), window.innerWidth - box.width - margin);
    setFallback({
      top: above ? word.top - box.height - margin : word.bottom + margin,
      left,
      caret: wordCenter - left,
      above,
    });
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) {
      setFallback(null);
      return;
    }
    /* Containment rather than stopPropagation: this listener runs in the
       capture phase, so it fires before any handler inside the popover could
       stop it — a tap on "All meanings" would clear the selection before the
       button ever acted on it. */
    const dismiss = (event?: Event) => {
      const target = event?.target;
      if (target instanceof Node && ref.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    // `capture` so a tap inside the reading canvas closes this before the
    // canvas counts it as a tap on the zikr.
    document.addEventListener("pointerdown", dismiss, { capture: true });
    document.addEventListener("keydown", onKey);

    /* Scroll dismissal waits out the opening frames. Bringing a word into view
       is itself a scroll — the browser does it when a tap lands near an edge,
       and so does any test runner — so listening immediately closed the gloss
       on the very gesture that asked for it. Only a scroll the reader starts
       after it has settled should dismiss. */
    let scrollArmed = false;
    const armScroll = window.setTimeout(() => {
      scrollArmed = true;
    }, 300);
    const onScroll = () => {
      if (scrollArmed) onClose();
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.clearTimeout(armScroll);
      document.removeEventListener("pointerdown", dismiss, { capture: true });
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [open, onClose]);

  if (!open || !meanings) return null;

  const primary = meanings[0]!;
  const extra = meanings.length - 1;

  return (
    <div
      ref={ref}
      role="tooltip"
      dir={direction}
      data-testid="quran-word-popover"
      data-above={fallback?.above ? "true" : undefined}
      className="quran-word-popover"
      style={
        fallback
          ? ({
              ...(ANCHOR_SUPPORTED ? null : { top: `${fallback.top}px`, left: `${fallback.left}px` }),
              "--caret-x": `${fallback.caret}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex items-stretch gap-3 sm:gap-4 min-w-0">
        {/* Right Section: Word & Meaning */}
        <div className="flex flex-1 min-w-0 flex-col justify-center gap-1.5" lang="ar" dir="rtl">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-mushaf text-xl font-bold text-primary">{primary.word}</span>
            <span className="font-ui-arabic text-[0.625rem] font-bold text-primary/80">
              {t(language, "reader.wordMeaningLabel")}
            </span>
          </div>
          <span className="font-ui-arabic text-sm font-bold text-foreground">{primary.explanationArabic}</span>
        </div>

        {/* Divider */}
        <div className="w-px shrink-0 bg-border/40" aria-hidden="true" />

        {/* Left Section: Meta (Ayah & Source) & Actions */}
        <div className="flex shrink-0 flex-col justify-center gap-1.5 w-[110px] sm:w-[140px]">
          <div className="flex items-center justify-between gap-3">
            <bdi className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[0.625rem] font-bold text-muted-foreground">
              {t(language, "reader.ayahLabel", { ayah: formatNumerals(primary.ayahNumber, language) })}
            </bdi>
            {onShowAll && (
              <button
                type="button"
                onClick={onShowAll}
                data-testid="quran-word-popover-all"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 -mx-1 text-[0.6875rem] font-bold text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 shrink-0"
              >
                {extra > 0
                  ? t(language, "reader.wordMeaningMore", { count: formatNumerals(extra, language) })
                  : t(language, "reader.wordMeaningAll")}
                <ChevronUp size={12} aria-hidden="true" className="shrink-0" />
              </button>
            )}
          </div>
          {showSource && (
            <span className="text-[0.5625rem] font-semibold leading-tight text-muted-foreground/80 break-words line-clamp-2 max-w-[140px] sm:max-w-[180px]">
              {language === "ar" ? QURAN_WORD_MEANING_SOURCE.nameArabic : QURAN_WORD_MEANING_SOURCE.nameEnglish}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
