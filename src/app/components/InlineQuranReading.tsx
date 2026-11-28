import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties } from "react";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import type { AppLanguage } from "../types";
import type { QuranReadingWord } from "./quranReadingPortions";
import { useOverlayBack } from "../hooks/useOverlayBack";
import { AyahMarker } from "./AyahMarker";
import { BookOpen, Minus, Plus } from "./icons";
import { Button } from "./ui/button";

/** Shares the normal reader's header slot; 100% always means the printed page. */
export function InlineQuranZoomHeader({
  language,
  scale,
  onScale,
  onClose,
}: {
  language: AppLanguage;
  scale: number;
  onScale: (value: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="quran-zoom-header" data-testid="quran-zoom-header" dir={language === "ar" ? "rtl" : "ltr"}>
      <Button
        variant="outline"
        onClick={onClose}
        className="quran-page-view"
        title={t(language, "quranZoom.returnMushaf")}
      >
        <BookOpen aria-hidden="true" />
        <span>{t(language, "quranZoom.pageView")}</span>
      </Button>
      <div className="quran-header-size" role="group" aria-label={t(language, "quranZoom.size")} dir="ltr">
        <Button
          variant="outline"
          size="icon"
          aria-label={t(language, "quranZoom.smaller")}
          onClick={() => onScale(scale - 25)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <output aria-live="polite" aria-atomic="true">
          {formatNumerals(scale, language)}%
        </output>
        <Button
          variant="outline"
          size="icon"
          aria-label={t(language, "quranZoom.larger")}
          disabled={scale >= 250}
          onClick={() => onScale(scale + 25)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/** All source words once, in one native scroll region. No portion navigation. */
export function InlineQuranReading({
  words,
  language,
  scale,
  baseFont,
  initialAnchor,
  onClose,
}: {
  words: readonly QuranReadingWord[];
  language: AppLanguage;
  scale: number;
  baseFont: number;
  initialAnchor: number;
  onClose: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const anchor = useRef(initialAnchor);
  const hint = useId();
  const backDismiss = useOverlayBack(true, onClose);
  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return;
    const restore = () => {
      const requested =
        (((baseFont * scale) / 100) * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 16;
      node.style.setProperty("--quran-inline-size", `${requested}px`);
      // Keep even the longest unbroken source glyph inside a narrow viewport.
      const text = node.querySelector<HTMLElement>('[data-testid="quran-enlarged-text"]')!;
      const available = text.clientWidth - 32;
      const widest = Math.max(
        1,
        ...Array.from(
          text.querySelectorAll<HTMLElement>("[data-zoom-word]"),
          (word) => word.getBoundingClientRect().width,
        ),
      );
      if (available > 0 && widest > available)
        node.style.setProperty("--quran-inline-size", `${((requested * available) / widest) * 0.98}px`);
      const target = text.querySelectorAll<HTMLElement>("[data-zoom-word]")[anchor.current];
      if (target) node.scrollTop += target.getBoundingClientRect().top - node.getBoundingClientRect().top - 8;
    };
    restore();
    const observer = new ResizeObserver(restore);
    observer.observe(node);
    document.fonts?.addEventListener("loadingdone", restore);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", restore);
    };
  }, [baseFont, scale, words]);
  useLayoutEffect(() => {
    frame.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const stop = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Escape") event.stopPropagation();
    };
    const names = ["keydown", "pointerdown", "pointerup", "touchstart", "touchend"];
    for (const name of names) node.addEventListener(name, stop);
    return () => {
      for (const name of names) node.removeEventListener(name, stop);
    };
  }, []);
  return (
    <div
      ref={frame}
      className="quran-enlarged-inline"
      role="region"
      aria-label={t(language, "quranZoom.title")}
      aria-describedby={hint}
      tabIndex={scale > 100 ? 0 : undefined}
      data-testid="quran-enlarged-reading"
      data-quran-inline-zoom=""
      data-back-dismiss={backDismiss}
      dir="rtl"
      lang="ar"
      data-interactive="true"
      onScroll={(event) => {
        const node = event.currentTarget;
        const top = node.getBoundingClientRect().top;
        const visible = Array.from(node.querySelectorAll<HTMLElement>("[data-zoom-word]")).findIndex(
          (word) => word.getBoundingClientRect().bottom > top + 8,
        );
        if (visible >= 0) anchor.current = visible;
      }}
    >
      <p id={hint} className="sr-only" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
        {t(language, "quranZoom.scrollHint")}
      </p>
      <div
        className="quran-inline-text"
        data-testid="quran-enlarged-text"
        data-layout-ready="true"
        translate="no"
        style={{ ...QURAN_TEXT_STYLE, fontSize: "var(--quran-inline-size)", lineHeight: 1.85 } as CSSProperties}
      >
        {words.map((word) => (
          <span key={word.id}>
            <span data-zoom-word={word.id} style={{ fontFamily: word.glyph ? word.fontFamily : undefined }}>
              {word.glyph ? (
                <>
                  <span aria-hidden="true">{word.glyph}</span>
                  <span className="sr-only">{word.text}</span>
                </>
              ) : word.endAyah ? (
                <AyahMarker number={word.endAyah} language={language} />
              ) : (
                word.text
              )}
            </span>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
