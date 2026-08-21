/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, X } from "./icons";
import { splitMushafPages } from "../content/mushafPages";
import type { QuranWordMeaning, WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { QuranWordText } from "./QuranWordText";
import { QuranPrelude } from "./QuranChrome";

type ReaderMode = "fit" | "comfort";

function useReaderMode(): [ReaderMode, (m: ReaderMode) => void] {
  const [mode, setMode] = useState<ReaderMode>(() => {
    try {
      return (window.localStorage.getItem("azkarapp.mushaf-mode") as ReaderMode) || "fit";
    } catch {
      return "fit";
    }
  });

  const updateMode = (newMode: ReaderMode) => {
    setMode(newMode);
    try {
      window.localStorage.setItem("azkarapp.mushaf-mode", newMode);
    } catch {
      /* ignore */
    }
  };

  return [mode, updateMode];
}

function MushafPage({
  page,
  pageIndex,
  zikr,
  meanings,
  language,
  textStyle,
  onSelectMeanings,
  activeWordId,
  mode,
  resetSignal,
  onInteract,
}: {
  page: { page: number; text: string };
  pageIndex: number;
  zikr: Zikr;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  textStyle: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  mode: ReaderMode;
  resetSignal: number;
  onInteract: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (mode === "comfort") {
      setBaseScale(1);
      return;
    }
    const observer = new ResizeObserver(() => {
      const el = contentRef.current;
      const container = containerRef.current;
      if (!el || !container) return;
      const sh = el.scrollHeight;
      const ch = container.clientHeight;
      if (sh > ch && ch > 0) {
        setBaseScale(ch / sh);
      } else {
        setBaseScale(1);
      }
    });
    if (contentRef.current) observer.observe(contentRef.current);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mode, page.text]);

  useEffect(() => {
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  }, [resetSignal, mode]);

  const touchState = useRef({
    startDistance: 0,
    startZoom: 1,
    startPan: { x: 0, y: 0 },
    lastTap: 0,
    startCenter: { x: 0, y: 0 },
  });

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      touchState.current.startDistance = Math.hypot(dx, dy);
      touchState.current.startZoom = zoomScale;
      touchState.current.startPan = pan;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - touchState.current.lastTap < 300) {
        if (zoomScale > 1) {
          setZoomScale(1);
          setPan({ x: 0, y: 0 });
        } else {
          setZoomScale(1.5);
          setPan({ x: 0, y: 0 });
        }
      }
      touchState.current.lastTap = now;
      touchState.current.startCenter = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
      touchState.current.startPan = pan;
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
      const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
      const dist = Math.hypot(dx, dy);
      const newZoom = Math.max(
        1,
        Math.min(4, touchState.current.startZoom * (dist / touchState.current.startDistance)),
      );
      setZoomScale(newZoom);
      e.preventDefault();
      e.stopPropagation();
    } else if (e.touches.length === 1 && zoomScale > 1) {
      const dx = e.touches[0]!.clientX - touchState.current.startCenter.x;
      const dy = e.touches[0]!.clientY - touchState.current.startCenter.y;
      setPan({
        x: touchState.current.startPan.x + dx,
        y: touchState.current.startPan.y + dy,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      data-testid="mushaf-immersive-page"
      data-mushaf-page={page.page}
      aria-label={t(language, "reader.mushafPage", { page: formatNumerals(page.page, language) })}
      className={`flex h-full w-full shrink-0 snap-center flex-col px-5 py-6 sm:px-10 ${
        mode === "comfort" ? "overflow-y-auto" : "overflow-hidden"
      }`}
      onClick={onInteract}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      style={{ touchAction: zoomScale > 1 ? "none" : mode === "fit" ? "pan-x pinch-zoom" : "pan-x pan-y pinch-zoom" }}
    >
      <div ref={containerRef} className="mx-auto flex h-full w-full max-w-[var(--content-reading)] flex-col relative">
        <div
          ref={contentRef}
          style={{
            transform: mode === "fit" ? `translate(${pan.x}px, ${pan.y}px) scale(${baseScale * zoomScale})` : "none",
            transformOrigin: "top center",
            transition: "transform 0.1s ease-out",
          }}
          className="flex flex-col"
        >
          {pageIndex === 0 && <QuranPrelude zikr={zikr} className="pointer-events-none mb-6" />}
          <QuranWordText
            text={page.text}
            meanings={meanings}
            language={language}
            style={{ ...textStyle, textAlign: "justify", textAlignLast: "center" }}
            onSelectMeanings={(selection) => {
              onInteract();
              onSelectMeanings(selection);
            }}
            activeWordId={activeWordId}
          />
        </div>
      </div>
    </section>
  );
}

export function MushafImmersiveReader({
  zikr,
  arabicText,
  meanings,
  language,
  direction,
  title,
  reducedMotion = false,
  textStyle,
  onSelectMeanings,
  activeWordId,
  onClose,
  onComplete,
}: {
  zikr: Zikr;
  arabicText: string;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  title: string;
  reducedMotion?: boolean;
  textStyle: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pages = splitMushafPages(arabicText, zikr.mushafPages ?? []);
  const pageCount = pages.length;

  const [mode, setMode] = useReaderMode();
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<number>(undefined);

  const resetControlsTimer = useCallback(() => {
    window.clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 3500) as unknown as number;
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => window.clearTimeout(controlsTimer.current);
  }, [resetControlsTimer, index, mode]);

  const onInteract = useCallback(() => {
    setControlsVisible((v) => {
      if (!v) {
        resetControlsTimer();
        return true;
      }
      return v;
    });
  }, [resetControlsTimer]);

  const flip = useCallback(
    (delta: number) => {
      const track = trackRef.current;
      if (!track) return;
      const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
      track.scrollBy({
        left: sign * delta * track.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        flip(direction === "rtl" ? -1 : 1);
        onInteract();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        flip(direction === "rtl" ? 1 : -1);
        onInteract();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [direction, flip, onClose, onInteract]);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    setIndex((current) => (next === current ? current : Math.min(Math.max(next, 0), pageCount - 1)));
  }, [pageCount]);

  const current = pages[Math.min(index, Math.max(pageCount - 1, 0))]!;
  const atStart = index <= 0;
  const atEnd = pageCount > 0 && index >= pageCount - 1;

  useEffect(() => {
    if (atEnd) onComplete?.();
  }, [atEnd, onComplete]);

  if (pageCount === 0) return null;

  return (
    <div
      data-testid="mushaf-immersive"
      dir={direction}
      role="dialog"
      aria-modal="true"
      aria-label={t(language, "reader.immersiveTitle")}
      className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
      onClick={() => {
        if (!controlsVisible) onInteract();
      }}
    >
      <div
        className={`absolute inset-x-0 top-0 z-10 flex flex-col transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur shadow-sm">
          <span className="min-w-0 truncate text-[0.9375rem] font-black" dir="auto">
            {title}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <bdi
              data-testid="mushaf-immersive-indicator"
              className="hidden sm:inline text-[0.8125rem] font-bold text-muted-foreground"
            >
              {t(language, "reader.mushafPage", { page: formatNumerals(current.page, language) })} ·{" "}
              {formatNumerals(index + 1, language)} / {formatNumerals(pageCount, language)}
            </bdi>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "fit" ? "comfort" : "fit");
                resetControlsTimer();
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-[0.75rem] font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {mode === "fit"
                ? t(language, "reader.immersiveModeComfort") || "Comfort Reading"
                : t(language, "reader.immersiveModeFit") || "Fit Page"}
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="mushaf-immersive-close"
              aria-label={t(language, "reader.immersiveClose")}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div
          className="h-1 shrink-0 bg-muted"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={pageCount}
          aria-valuenow={index + 1}
          aria-label={t(language, "reader.immersiveProgress")}
          data-testid="mushaf-immersive-progress"
        >
          <div
            className="h-full bg-primary transition-[width] duration-standard ease-standard"
            style={{ width: `${((index + 1) / pageCount) * 100}%` }}
          />
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        data-testid="mushaf-immersive-track"
        className="flex min-h-0 h-full w-full flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIndex) => (
          <MushafPage
            key={page.page}
            page={page}
            pageIndex={pageIndex}
            zikr={zikr}
            meanings={meanings}
            language={language}
            textStyle={textStyle}
            onSelectMeanings={onSelectMeanings}
            activeWordId={activeWordId}
            mode={mode}
            resetSignal={index}
            onInteract={onInteract}
          />
        ))}
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-10 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <nav className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur shadow-sm">
          <FlipButton
            onClick={() => {
              flip(-1);
              onInteract();
            }}
            disabled={atStart}
            label={t(language, "reader.immersivePrevious")}
            testId="mushaf-immersive-previous"
            direction={direction}
            back
          />
          <bdi
            data-testid="mushaf-immersive-indicator-mobile"
            className="sm:hidden text-[0.8125rem] font-bold text-muted-foreground"
          >
            {formatNumerals(index + 1, language)} / {formatNumerals(pageCount, language)}
          </bdi>
          {atEnd ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="mushaf-immersive-return"
              className="flex min-h-11 items-center gap-2 rounded-full border border-primary bg-primary px-4 text-[0.875rem] font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, "reader.immersiveComplete")}
            </button>
          ) : (
            <FlipButton
              onClick={() => {
                flip(1);
                onInteract();
              }}
              disabled={atEnd}
              label={t(language, "reader.immersiveNext")}
              testId="mushaf-immersive-next"
              direction={direction}
            />
          )}
        </nav>
      </div>
    </div>
  );
}

function FlipButton({
  onClick,
  disabled,
  label,
  testId,
  direction,
  back = false,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  testId: string;
  direction: "ltr" | "rtl";
  back?: boolean;
}) {
  const pointsLeft = back === (direction === "ltr");
  const Icon = pointsLeft ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[0.875rem] font-bold transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
