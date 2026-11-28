import "../../styles/theme/wordPopover.css";
import "./overlay-surfaces.css";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, X } from "./icons";
import { type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useSafeAreaCollisionPadding } from "../hooks/useSafeAreaCollisionPadding";

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
  const description = useId();
  const closeAndRestore = () => {
    onClose();
    anchorEl?.focus({ preventScroll: true });
  };
  const [fallback, setFallback] = useState<{ top: number; left: number; caret: number; above: boolean } | null>(null);
  const open = Boolean(meanings?.length && anchorEl);
  const { top: safeTop, right: safeRight, bottom: safeBottom, left: safeLeft } = useSafeAreaCollisionPadding();

  /* One measurement per open, never on scroll. A tooltip that chases the text
     while it moves is both a jank source and the wrong behaviour; this closes
     instead.
     
     A body portal and viewport coordinates avoid differing CSS-anchor
     containment across engines and keep blur outside the reading canvas. */
  useLayoutEffect(() => {
    if (!open || !anchorEl || !ref.current) return;
    const measure = () => {
      if (!ref.current) return;
      const word = anchorEl.getBoundingClientRect();
      // Entrance transforms must not shorten the collision box.
      const box = { width: ref.current.offsetWidth, height: ref.current.offsetHeight };
      const margin = 8;

      const above = word.bottom + margin + box.height > window.innerHeight - safeBottom;
      const wordCenter = word.left + word.width / 2;
      const left = Math.max(safeLeft, Math.min(wordCenter - box.width / 2, window.innerWidth - box.width - safeRight));
      setFallback({
        top: Math.max(
          safeTop,
          Math.min(
            above ? word.top - box.height - margin : word.bottom + margin,
            window.innerHeight - safeBottom - box.height,
          ),
        ),
        left,
        caret: wordCenter - left,
        above,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [open, anchorEl, meanings, safeTop, safeRight, safeBottom, safeLeft]);

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
        anchorEl?.focus({ preventScroll: true });
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
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && ref.current?.contains(event.target)) return;
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
      data-overlay-surface="contextual"
      data-state="open"
      data-dropdown-surface=""
      aria-describedby={description}
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
      <div className="quran-word-popover-content">
        <div className="quran-word-popover-heading">
          <div className="quran-word-popover-reference">
            <span className="quran-word-popover-word" lang="ar" dir="rtl">
              {primary.word}
            </span>
            <bdi className="quran-word-popover-ayah">
              {t(language, "reader.ayahLabel", { ayah: formatNumerals(primary.ayahNumber, language) })}
            </bdi>
          </div>
          <button
            type="button"
            onClick={closeAndRestore}
            aria-label={t(language, "reader.closeWordMeaning")}
            data-testid="quran-word-popover-dismiss"
            className="quran-word-popover-close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p id={description} className="quran-word-popover-explanation" lang="ar" dir="rtl">
          {primary.explanationArabic}
        </p>
        {onShowAll && (
          <button
            type="button"
            onClick={onShowAll}
            data-testid="quran-word-popover-all"
            className="quran-word-popover-all"
          >
            {extra > 0
              ? t(language, "reader.wordMeaningMore", { count: formatNumerals(extra, language) })
              : t(language, "reader.wordMeaningAll")}
            <ChevronUp size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
