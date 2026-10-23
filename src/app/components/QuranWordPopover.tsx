import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp } from "./icons";
import { type QuranWordMeaning } from "../content/quranWordMeanings";
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
 * boxes to show one. The tapped word stays highlighted, and one viewport
 * measurement places the explanation against it.
 */
export function QuranWordPopover({
  meanings,
  anchorEl,
  language,
  direction,
  onShowAll,
  onClose,
}: {
  meanings: QuranWordMeaning[] | null;
  anchorEl: HTMLElement | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onShowAll?: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState<{ top: number; left: number; caret: number; above: boolean } | null>(null);
  const open = Boolean(meanings?.length && anchorEl);

  /* One measurement per open, never on scroll. A tooltip that chases the text
     while it moves is both a jank source and the wrong behaviour; this closes
     instead.
     
     A body portal and viewport coordinates avoid differing CSS-anchor
     containment across engines and keep blur outside the reading canvas. */
  useLayoutEffect(() => {
    if (!open || !anchorEl || !ref.current) return;
    const word = anchorEl.getBoundingClientRect();
    const box = ref.current.getBoundingClientRect();
    const margin = 8;

    const above = word.bottom + margin + box.height > window.innerHeight;
    const wordCenter = word.left + word.width / 2;
    const left = Math.min(Math.max(wordCenter - box.width / 2, margin), window.innerWidth - box.width - margin);
    setFallback({
      top: Math.max(margin, above ? word.top - box.height - margin : word.bottom + margin),
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
      if (target instanceof Node && (ref.current?.contains(target) || anchorEl?.contains(target))) return;
      // The first ordinary paper tap dismisses the gloss, without also
      // turning the page or hiding its tools underneath the explanation.
      if (target instanceof Element && target.closest(".mushaf-paper") && !target.closest("button, [role=button], a")) {
        event?.stopPropagation();
        event?.preventDefault();
      }
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
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
  }, [open, anchorEl, onClose]);

  if (!open || !meanings) return null;

  const primary = meanings[0]!;
  const extra = meanings.length - 1;

  // Keep the fixed overlay outside transformed/size-contained reading canvases.
  // Otherwise some engines position it relative to the page rather than the
  // viewport and nested backdrop roots cannot frost the underlying verses.
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`${t(language, "reader.wordMeaningLabel")}: ${primary.word}`}
      dir={direction}
      data-testid="quran-word-popover"
      data-prevent-count="true"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => {
        event.stopPropagation();
        // Padding is part of the chip too. Native child buttons keep their
        // own click/keyboard actions, especially the separate All meanings.
        if (event.target instanceof Element && !event.target.closest("button")) onClose();
      }}
      data-above={fallback?.above ? "true" : undefined}
      className={`quran-word-popover ${
        anchorEl
          ?.closest(".theme-light, .theme-midnight, .theme-dark, .theme-oled")
          ?.className.split(/\s+/)
          .filter((name) => /^theme-(light|midnight|dark|oled)$/.test(name))
          .join(" ") ?? ""
      }`}
      style={
        fallback
          ? ({
              top: `${fallback.top}px`,
              left: `${fallback.left}px`,
              "--caret-x": `${fallback.caret}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="grid min-w-0 gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch sm:gap-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "reader.closeWordMeaning")}
          data-testid="quran-word-popover-dismiss"
          className="flex min-h-11 min-w-0 flex-col justify-center gap-1 rounded-lg text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          lang="ar"
          dir="rtl"
        >
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <span className="font-ui-arabic text-lg font-bold text-primary">{primary.word}</span>
            <span className="font-ui-arabic text-micro font-bold text-primary/80">
              {t(language, "reader.wordMeaningLabel")}
            </span>
          </div>
          <span className="font-ui-arabic text-sm font-bold leading-relaxed text-foreground">
            {primary.explanationArabic}
          </span>
        </button>

        <div className="flex min-w-0 items-center justify-between gap-2 border-t border-border/40 pt-2 sm:flex-col sm:items-end sm:justify-center sm:border-s sm:border-t-0 sm:ps-4 sm:pt-0">
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "common.close")}
            className="flex min-h-11 min-w-11 flex-col items-start justify-center gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <bdi className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-micro font-bold text-muted-foreground">
              {t(language, "reader.ayahLabel", { ayah: formatNumerals(primary.ayahNumber, language) })}
            </bdi>
          </button>
          {onShowAll && (
            <button
              type="button"
              onClick={onShowAll}
              data-testid="quran-word-popover-all"
              className="-my-2 inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-micro font-bold text-primary transition-[background-color,transform] hover:bg-primary/10 active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:my-0 sm:self-start"
            >
              {extra > 0
                ? t(language, "reader.wordMeaningMore", { count: formatNumerals(extra, language) })
                : t(language, "reader.wordMeaningAll")}
              <ChevronUp size={12} aria-hidden="true" className="shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
