import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { ExpandCorners, Plus } from "./icons";
import { InlineQuranReading, InlineQuranZoomHeader } from "./InlineQuranReading";
import { EnlargedReadingToolbar } from "./EnlargedReadingToolbar";
import { AyahMarker } from "./AyahMarker";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { portionForWord, type QuranReadingWord } from "./quranReadingPortions";
import "./quran-reading-zoom.css";

/** A separately named view: canonical pages stay mounted and keep their geometry. */
export function QuranReadingZoom({
  words,
  language,
  title,
  children,
  gestureSelector,
  returnLabel,
  onOpen,
  inline = false,
  disabled = false,
}: {
  words: readonly QuranReadingWord[];
  language: AppLanguage;
  title?: string;
  children: (trigger: ReactNode, enlarged?: ReactNode, zoomHeader?: ReactNode) => ReactNode;
  gestureSelector?: string;
  returnLabel?: string;
  onOpen?: () => void;
  inline?: boolean;
  disabled?: boolean;
}) {
  const boundary = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState<readonly QuranReadingWord[] | null>(null);
  const [scale, setScale] = useState(150);
  const [anchor, setAnchor] = useState(0);
  const [context, setContext] = useState(title);
  const [baseFont, setBaseFont] = useState(23);
  useEffect(() => {
    if (disabled) setSnapshot(null);
  }, [disabled]);
  const close = useCallback(() => {
    setSnapshot(null);
  }, []);
  const previouslyOpen = useRef(false);
  useLayoutEffect(() => {
    if (!snapshot && previouslyOpen.current) opener.current?.focus({ preventScroll: true });
    previouslyOpen.current = Boolean(snapshot);
  }, [snapshot]);
  const changeInlineScale = useCallback(
    (value: number) => {
      if (value <= 100) close();
      else setScale(Math.max(125, Math.min(250, Math.round(value / 25) * 25)));
    },
    [close],
  );
  useEffect(() => {
    if (!inline || !snapshot) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[role="dialog"], [data-dropdown-surface], [data-toolbar-panel]')) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [close, inline, snapshot]);
  const open = useCallback(
    (zoom = 150, target?: Element | null) => {
      if (!words.length || disabled) return;
      const node = target?.closest<HTMLElement>("[data-zoom-word], [data-verse-key], [data-listening-verse]");
      const id = node?.dataset.zoomWord;
      const verse = node?.dataset.verseKey ?? node?.dataset.listeningVerse;
      const index = words.findIndex((word) => (id ? word.id === id : verse ? word.verseKey === verse : false));
      if (inline) {
        const line = boundary.current?.querySelector<HTMLElement>(".mushaf-paper [data-mushaf-line-content]");
        const rootScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
        const pageScale =
          parseFloat(
            getComputedStyle(line?.closest(".mushaf-paper") ?? document.documentElement).getPropertyValue(
              "--mushaf-magnification",
            ),
          ) || 1;
        const normalSize = line ? parseFloat(getComputedStyle(line).fontSize) / rootScale / pageScale : 23;
        setBaseFont(Number.isFinite(normalSize) && normalSize > 0 ? normalSize : 23);
      }
      setAnchor(Math.max(0, index));
      setScale(Math.max(125, Math.min(250, Math.round(zoom / 25) * 25)));
      setContext(title);
      setSnapshot([...words]);
      onOpen?.();
    },
    [words, title, onOpen, inline, disabled],
  );

  // Native non-passive capture owns only multi-touch inside the reading surface.
  // Prevent the synthetic click from also counting, opening a gloss or turning a page.
  useEffect(() => {
    const root = boundary.current;
    if (!root || disabled) return;
    let pinch: { distance: number; ratio: number; target: Element | null } | null = null;
    let suppressUntil = 0;
    let firstPointer: { target: Element; id: number } | null = null;
    const distance = (event: TouchEvent) =>
      Math.hypot(
        event.touches[0]!.clientX - event.touches[1]!.clientX,
        event.touches[0]!.clientY - event.touches[1]!.clientY,
      );
    const capture = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[role="dialog"]') || (gestureSelector && !target?.closest(gestureSelector))) return;
      if (event.touches.length >= 2) {
        if (!pinch) pinch = { distance: Math.max(1, distance(event)), ratio: 1, target };
        else pinch.ratio = distance(event) / pinch.distance;
        suppressUntil = performance.now() + 700;
        event.preventDefault();
        event.stopPropagation();
      } else if (pinch) {
        event.preventDefault();
        event.stopPropagation();
        if (event.touches.length === 0) {
          const finished = pinch;
          pinch = null;
          if (event.type !== "touchcancel" && finished.ratio > 1.12) {
            if (inline && snapshot) changeInlineScale(scale * finished.ratio);
            else open(100 * finished.ratio, finished.target);
          } else if (event.type !== "touchcancel" && inline && snapshot && finished.ratio < 0.88)
            changeInlineScale(scale * finished.ratio);
        }
      }
    };
    const suppress = (event: Event) => {
      if (
        performance.now() < suppressUntil &&
        !(event.target instanceof Element && event.target.closest('[role="dialog"]'))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const pointer = (event: PointerEvent) => {
      if (
        event.pointerType !== "touch" ||
        !(event.target instanceof Element) ||
        event.target.closest('[role="dialog"]')
      )
        return;
      if (event.type === "pointerdown" && event.isPrimary) firstPointer = { target: event.target, id: event.pointerId };
      if (event.type === "pointerdown" && !event.isPrimary) {
        suppressUntil = performance.now() + 700;
        if (firstPointer)
          firstPointer.target.dispatchEvent(
            new PointerEvent("pointercancel", { bubbles: true, pointerId: firstPointer.id, pointerType: "touch" }),
          );
      }
      if (pinch || performance.now() < suppressUntil) {
        event.stopPropagation();
      }
    };
    const options = { capture: true, passive: false };
    for (const name of ["touchstart", "touchmove", "touchend", "touchcancel"])
      root.addEventListener(name, capture as EventListener, options);
    root.addEventListener("click", suppress, true);
    for (const name of ["pointerdown", "pointermove", "pointerup"])
      root.addEventListener(name, pointer as EventListener, true);
    return () => {
      for (const name of ["touchstart", "touchmove", "touchend", "touchcancel"])
        root.removeEventListener(name, capture as EventListener, true);
      root.removeEventListener("click", suppress, true);
      for (const name of ["pointerdown", "pointermove", "pointerup"])
        root.removeEventListener(name, pointer as EventListener, true);
    };
  }, [gestureSelector, open, disabled, inline, snapshot, scale, changeInlineScale]);

  const trigger = (
    <Button
      ref={opener}
      variant="outline"
      className={`quran-zoom-trigger ${inline ? "mushaf-chrome-action" : ""}`}
      aria-label={t(language, "quranZoom.open")}
      title={t(language, "quranZoom.open")}
      aria-haspopup={inline ? undefined : "dialog"}
      aria-pressed={inline ? Boolean(snapshot) : undefined}
      onClick={(event) => {
        event.stopPropagation();
        if (inline && snapshot) close();
        else open();
      }}
      disabled={!words.length || disabled}
    >
      {inline ? (
        <span className="mushaf-furniture-pill">
          <ExpandCorners size={18} aria-hidden="true" />
          <span className="quran-zoom-label">{t(language, "quranZoom.shortOpen")}</span>
        </span>
      ) : (
        <>
          <Plus size={16} aria-hidden="true" />
          <span>{t(language, "quranZoom.open")}</span>
        </>
      )}
    </Button>
  );
  return (
    <div ref={boundary} className="contents" data-quran-zoom-boundary="">
      {children(
        trigger,
        inline && !disabled && snapshot ? (
          <InlineQuranReading
            key={title}
            words={words}
            language={language}
            initialAnchor={context === title ? anchor : 0}
            scale={scale}
            baseFont={baseFont}
            onClose={close}
          />
        ) : undefined,
        inline && !disabled && snapshot ? (
          <InlineQuranZoomHeader language={language} scale={scale} onScale={changeInlineScale} onClose={close} />
        ) : undefined,
      )}
      {!inline && !disabled && snapshot && (
        <EnlargedQuran
          words={snapshot}
          language={language}
          title={context}
          initialAnchor={anchor}
          scale={scale}
          onScale={setScale}
          onClose={() => setSnapshot(null)}
          returnLabel={returnLabel}
          returnFocusRef={opener}
        />
      )}
    </div>
  );
}

function EnlargedQuran({
  words,
  language,
  title,
  initialAnchor,
  scale,
  onScale,
  onClose,
  returnLabel,
  returnFocusRef,
}: {
  words: readonly QuranReadingWord[];
  language: AppLanguage;
  title?: string;
  initialAnchor: number;
  scale: number;
  onScale: (scale: number) => void;
  onClose: () => void;
  returnLabel?: string;
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}) {
  const hint = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [portions, setPortions] = useState<[number, number][]>([]);
  const [anchor, setAnchor] = useState(initialAnchor);
  const [font, setFont] = useState(32);
  const [layout, setLayout] = useState(0);
  const [ready, setReady] = useState(false);
  const current = portionForWord(portions, anchor);
  const range = portions[current];
  const renderWord = (word: QuranReadingWord, index: number, measuring = false) => (
    <span
      key={word.id}
      data-zoom-word={word.id}
      data-measure-word={measuring ? index : undefined}
      style={{ fontFamily: word.glyph ? word.fontFamily : undefined }}
    >
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
    </span>
  );
  const requestedFont = (scale / 100) * 23;
  useLayoutEffect(() => {
    setReady(false);
    setFont(requestedFont * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16));
  }, [requestedFont, layout]);
  useLayoutEffect(() => {
    const frame = viewport.current,
      text = measure.current;
    if (!frame || !text || !frame.clientHeight) return;
    // A QCF glyph's baseline and the surrounding line box vary by font and
    // platform. Measure each proposed portion from its own first line, including
    // padding, rather than projecting line bottoms from a nominal font size.
    // The temporary probe is outside React's owned children and never painted.
    const source = [...text.children];
    const probe = text.cloneNode(false) as HTMLDivElement;
    probe.style.position = "absolute";
    probe.inert = true;
    frame.append(probe);
    const bounds = frame.getBoundingClientRect();
    const place = (start: number, end: number) => {
      probe.replaceChildren(...source.slice(start, end).map((node) => node.cloneNode(true)));
    };
    const fits = () => {
      const block = probe.getBoundingClientRect();
      return (
        block.bottom <= bounds.bottom + 0.5 &&
        probe.scrollWidth <= probe.clientWidth + 0.5 &&
        [...probe.querySelectorAll<HTMLElement>("[data-measure-word]")].every((node) => {
          const word = node.getBoundingClientRect();
          return (
            word.left >= bounds.left - 0.5 &&
            word.right <= bounds.right + 0.5 &&
            word.top >= bounds.top - 0.5 &&
            word.bottom <= bounds.bottom + 0.5
          );
        })
      );
    };
    try {
      const next: [number, number][] = [];
      for (let start = 0; start < source.length;) {
        let end = start;
        let candidateSize = 1;
        let upper = start;
        // Grow only around this portion's capacity. Searching the entire
        // remaining surah for every page would repeatedly clone a long suffix.
        while (end < source.length) {
          const candidate = Math.min(source.length, start + candidateSize);
          place(start, candidate);
          if (!fits()) {
            upper = candidate - 1;
            break;
          }
          end = candidate;
          candidateSize *= 2;
        }
        let lower = end + 1;
        // Each word has its own unbroken box, so extending a prefix can only
        // retain its lines or add another. Keep every reviewed word exactly once.
        while (lower <= upper) {
          const candidate = Math.floor((lower + upper) / 2);
          place(start, candidate);
          if (fits()) {
            end = candidate;
            lower = candidate + 1;
          } else upper = candidate - 1;
        }
        if (end === start) {
          // Only a single word that cannot fit may reduce the effective size;
          // ordinary overflow always continues in another portion.
          place(start, start + 1);
          const word = probe.querySelector<HTMLElement>("[data-measure-word]")!.getBoundingClientRect();
          const factor = Math.min(
            1,
            (frame.clientWidth - 2) / Math.max(1, probe.scrollWidth, word.width),
            (frame.clientHeight - 2) / Math.max(1, probe.getBoundingClientRect().height, word.bottom - bounds.top),
          );
          setReady(false);
          setFont((value) => Math.max(1, value * factor * 0.98));
          return;
        }
        next.push([start, end]);
        start = end;
      }
      setPortions(next);
      setReady(true);
    } finally {
      probe.remove();
    }
  }, [font, words, layout]);
  useEffect(() => {
    const frame = viewport.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => setLayout((value) => value + 1));
    observer.observe(frame);
    const fonts = () => setLayout((value) => value + 1);
    document.fonts?.addEventListener("loadingdone", fonts);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", fonts);
    };
  }, []);
  const continuation =
    range && range[0] > 0 && words[range[0]]?.verseKey && words[range[0]]?.verseKey === words[range[0] - 1]?.verseKey;
  const body = (
    <>
      <header className="quran-enlarged-heading">
        <h2 className="text-lg font-bold">{t(language, "quranZoom.title")}</h2>
        {title && <p className="text-sm text-muted-foreground">{title}</p>}
      </header>
      <p id={hint} className="sr-only">
        {t(language, "quranZoom.hint")}
      </p>
      <div className="quran-portion-context sr-only">
        <span className="quran-portion-context-measure" aria-hidden="true">
          {t(language, "quranZoom.continuation")}
        </span>
        <span role="status">{continuation ? t(language, "quranZoom.continuation") : "\u00a0"}</span>
      </div>
      <div
        ref={viewport}
        className="quran-enlarged-viewport"
        style={{ ...QURAN_TEXT_STYLE, fontSize: font, lineHeight: 1.85 }}
      >
        <div ref={measure} className="quran-enlarged-measure" aria-hidden="true" dir="rtl" lang="ar">
          {words.map((word, index) => (
            <span key={word.id}>{renderWord(word, index, true)} </span>
          ))}
        </div>
        <div
          className="quran-enlarged-text"
          data-testid="quran-enlarged-text"
          data-layout-ready={ready}
          dir="rtl"
          lang="ar"
          translate="no"
          style={{ visibility: ready ? "visible" : "hidden" }}
        >
          {range &&
            words.slice(range[0], range[1]).map((word, index) => <span key={word.id}>{renderWord(word, index)} </span>)}
        </div>
      </div>
      <EnlargedReadingToolbar
        language={language}
        scale={scale}
        onScale={onScale}
        current={current}
        total={portions.length}
        ready={ready}
        onPrevious={() => setAnchor(portions[current - 1]![0])}
        onNext={() => setAnchor(portions[current + 1]![0])}
        closeLabel={returnLabel ?? t(language, "quranZoom.returnMushaf")}
      />
    </>
  );
  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "quranZoom.title")}
      language={language}
      direction={language === "ar" ? "rtl" : "ltr"}
      protectedSurface
      returnFocusRef={returnFocusRef}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        returnFocusRef.current?.focus({ preventScroll: true });
      }}
      testId="quran-enlarged-reading"
      describedById={hint}
      maxWidthClassName="max-w-3xl"
      className="quran-enlarged-dialog"
    >
      {/* Modal presentation is retained for flowing excerpts and listening. */}
      {body}
    </Modal>
  );
}
