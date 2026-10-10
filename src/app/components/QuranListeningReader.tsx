import { useEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage, MushafPageTheme, MushafTextScale, TextSizeOption } from "../types";
import type { PlaybackEntry, ResolvedAudioSegment } from "../audio/audioTypes";
import { useReviewedQuranTiming } from "../hooks/useReviewedListeningTiming";
import { useQuranPlaybackCue } from "../hooks/useQuranPlaybackCue";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { MushafListeningPage } from "./MushafPageViewer";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { splitMushafPages } from "../content/mushafPages";
import { splitQuranTranslation } from "../content/quranTranslation";
import { QuranListeningTranslation } from "./QuranListeningTranslation";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronLeft, ChevronRight, Info, X } from "./icons";

const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50";

const navButtonClass =
  "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40 transition-colors";

function revealListeningTarget(root: HTMLElement | null, target: HTMLElement | null) {
  const enlarged = target?.closest<HTMLElement>(
    '.audio-listening-body[data-listening-magnified="true"] > .audio-listening-arabic',
  );
  const viewport = enlarged ?? root?.closest<HTMLElement>(".audio-expanded-text");
  if (!viewport || !target) return;
  const view = viewport.getBoundingClientRect();
  const bounds = target.getBoundingClientRect();
  const toolbarHeight = enlarged
    ? 0
    : (root?.querySelector("[data-listening-controls]")?.getBoundingClientRect().height ?? 0);
  if (bounds.top < view.top + toolbarHeight || bounds.bottom > view.bottom) {
    viewport.scrollTo?.({
      top: Math.max(0, viewport.scrollTop + bounds.top - view.top - toolbarHeight - 8),
      behavior: "instant",
    });
  }
}

export default function QuranListeningReader({
  entry,
  segment,
  currentTime,
  language,
  playing = false,
  readTime,
  theme = "light",
  textScale = "medium",
  magnification = 100,
  textSize = "medium",
}: {
  entry: PlaybackEntry;
  segment: ResolvedAudioSegment | null;
  currentTime: number;
  language: AppLanguage;
  playing?: boolean;
  readTime?: () => number;
  theme?: MushafPageTheme;
  textScale?: MushafTextScale;
  magnification?: number;
  textSize?: TextSizeOption;
}) {
  const pages = useMemo(() => entry.mushafPages ?? [], [entry.mushafPages]);
  const [manualIndex, setManualIndex] = useState(0);
  const [follow, setFollow] = useState(true);
  const [words, setWords] = useState(true);
  const [retry, setRetry] = useState(0);
  const timing = useReviewedQuranTiming(segment);
  const cue = useQuranPlaybackCue(timing, currentTime, playing, readTime);
  const root = useRef<HTMLElement>(null);
  const positionedAtStart = useRef(false);
  const positionedZoom = useRef("");
  useEffect(() => {
    setFollow(true);
    setManualIndex(0);
    positionedAtStart.current = false;
  }, [entry.entryId, segment?.variantId]);
  const ayah = Number(cue.verseKey?.split(":")[1]);
  const playingIndex =
    cue.verseKey && Number(cue.verseKey.split(":")[0]) === entry.quranRange?.surah
      ? pages.findIndex((page) => ayah >= page.startAyah && ayah <= page.endAyah)
      : -1;
  const index = follow && timing && playingIndex >= 0 ? playingIndex : Math.min(manualIndex, pages.length - 1);
  const page = pages[index]!;
  const { result, error } = useListeningMushafPage(page.page, retry);
  const fallbackPages = useMemo(() => splitMushafPages(entry.arabicText ?? "", pages), [entry.arabicText, pages]);
  const translation = useMemo(
    () => splitQuranTranslation(entry.translation ?? "", entry.quranRange),
    [entry.translation, entry.quranRange],
  );
  const visibleTranslation = useMemo(() => {
    const visibleKeys = result ? new Set(result.lines.flat().map((word) => word.verseKey)) : null;
    return translation.filter((verse) => {
      if (visibleKeys) return visibleKeys.has(verse.verseKey);
      const number = Number(verse.verseKey.split(":")[1]);
      return number >= page.startAyah && number <= page.endAyah;
    });
  }, [translation, result, page.startAyah, page.endAyah]);
  const hasWords = !error && Boolean(timing?.verses.some((verse) => verse.words?.length));
  const browse = (next: number) => {
    setFollow(false);
    setManualIndex(next);
  };
  useEffect(() => {
    if (follow && result && cue.verseKey) {
      revealListeningTarget(
        root.current,
        root.current?.querySelector<HTMLElement>('[data-playback-word="true"]') ??
          root.current?.querySelector<HTMLElement>("[data-playback-verse]") ??
          null,
      );
    }
  }, [follow, result, cue.verseKey, cue.word?.position, magnification]);
  useEffect(() => {
    if (magnification <= 100 || !result) {
      positionedZoom.current = "";
      return;
    }
    const region = root.current?.querySelector<HTMLElement>(".audio-listening-arabic");
    const canvas = region?.querySelector<HTMLElement>(".mushaf-page-canvas");
    if (!region || !canvas) return;
    const key = `${magnification}:${page.page}`;
    const changed = positionedZoom.current !== key;
    positionedZoom.current = key;
    if (!changed && !follow) return;
    let frame = 0;
    const position = () => {
      const current = follow
        ? (canvas.querySelector<HTMLElement>('[data-playback-word="true"]') ??
          canvas.querySelector<HTMLElement>("[data-playback-verse]"))
        : null;
      const heading = canvas.querySelector<HTMLElement>(`[data-mushaf-surah-number="${entry.quranRange?.surah}"]`);
      const target = current ?? heading ?? canvas.querySelector<HTMLElement>("[data-listening-verse]");
      if (target) {
        region.scrollTop = Math.max(
          0,
          region.scrollTop + target.getBoundingClientRect().top - region.getBoundingClientRect().top - 8,
        );
      }
      revealListeningTarget(root.current, target);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    const line = canvas.querySelector<HTMLElement>("[data-mushaf-line-content]");
    if (line) observer.observe(line);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [magnification, result, follow, page.page, entry.quranRange?.surah]);
  useEffect(() => {
    if (!result || positionedAtStart.current) return;
    positionedAtStart.current = true;
    if (index !== 0 || !entry.quranRange) return;
    const heading =
      root.current?.querySelector<HTMLElement>(`[data-mushaf-surah-number="${entry.quranRange.surah}"]`) ??
      root.current?.querySelector<HTMLElement>(
        `[data-listening-verse="${entry.quranRange.surah}:${entry.quranRange.ayahStart}"]`,
      );
    // This uses the printed surah boundary, never an inferred playback timestamp.
    revealListeningTarget(root.current, heading ?? null);
  }, [result, index, entry.quranRange]);
  useEffect(() => {
    const viewport = root.current?.closest<HTMLElement>(".audio-expanded-text") ?? root.current;
    const pauseFollowing = () => {
      if (follow) {
        setFollow(false);
        setManualIndex(index);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (
        !follow ||
        event.defaultPrevented ||
        (event.target instanceof Element && event.target.closest("input, textarea, [role=slider]"))
      )
        return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) {
        setFollow(false);
        setManualIndex(index);
      }
    };
    viewport?.addEventListener("keydown", handleKey);
    viewport?.addEventListener("wheel", pauseFollowing, { passive: true });
    viewport?.addEventListener("touchmove", pauseFollowing, { passive: true });
    return () => {
      viewport?.removeEventListener("keydown", handleKey);
      viewport?.removeEventListener("wheel", pauseFollowing);
      viewport?.removeEventListener("touchmove", pauseFollowing);
    };
  }, [follow, index]);
  return (
    <section ref={root} className="w-full" aria-label={t(language, "quranListening.reader")}>
      <div
        data-listening-controls=""
        className="sticky top-0 z-10 mx-auto flex items-center justify-center gap-1 rounded-full border border-border/50 bg-background/95 px-2.5 py-0.5 shadow-xs backdrop-blur-sm w-fit"
      >
        <button
          type="button"
          className={navButtonClass}
          aria-label={t(language, "common.previous")}
          disabled={index <= 0}
          onClick={() => browse(index - 1)}
        >
          {language === "ar" ? (
            <ChevronRight size={16} aria-hidden="true" />
          ) : (
            <ChevronLeft size={16} aria-hidden="true" />
          )}
        </button>
        <span
          className="text-xs font-bold px-1 tabular-nums text-foreground"
          role="status"
          aria-label={t(language, "mushaf.pageRegion", { page: formatNumerals(page.page, language) })}
        >
          {t(language, "quranListening.page", { page: formatNumerals(page.page, language) })}
        </span>
        <button
          type="button"
          className={navButtonClass}
          aria-label={t(language, "common.next")}
          disabled={index >= pages.length - 1}
          onClick={() => browse(index + 1)}
        >
          {language === "ar" ? (
            <ChevronLeft size={16} aria-hidden="true" />
          ) : (
            <ChevronRight size={16} aria-hidden="true" />
          )}
        </button>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={navButtonClass} aria-label={t(language, "quranListening.information")}>
              <Info size={15} aria-hidden="true" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              sideOffset={8}
              collisionPadding={8}
              aria-label={t(language, "quranListening.information")}
              data-testid="quran-follow-info"
              dir={language === "ar" ? "rtl" : "ltr"}
              onEscapeKeyDown={(event) => event.stopPropagation()}
              className="z-50 rounded-2xl border border-border bg-card p-3 text-foreground shadow-overlay"
              style={{ width: "min(18rem, calc(100vw - 2rem))" }}
            >
              <p className="text-sm">
                {t(language, timing ? "quranListening.browseHint" : "quranListening.unavailable")}
              </p>
              {timing && (
                <button
                  type="button"
                  className={buttonClass}
                  aria-pressed={follow && !error}
                  disabled={error}
                  onClick={() => {
                    setManualIndex(index);
                    setFollow((value) => !value);
                  }}
                >
                  {t(language, "quranListening.follow")}
                  {follow ? <Check size={16} aria-hidden="true" /> : null}
                </button>
              )}
              {hasWords && (
                <button
                  type="button"
                  className={buttonClass}
                  aria-pressed={words}
                  onClick={() => setWords((value) => !value)}
                >
                  {t(
                    language,
                    timing?.reviewStatus === "owner-preview" ? "quranListening.estimatedWords" : "quranListening.words",
                  )}
                  {words ? <Check size={16} aria-hidden="true" /> : null}
                </button>
              )}
              <Popover.Close asChild>
                <button type="button" className={buttonClass} aria-label={t(language, "common.close")}>
                  <X size={18} aria-hidden="true" />
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="audio-listening-body min-w-0" data-listening-magnified={magnification > 100}>
        <div
          className="audio-listening-arabic min-w-0"
          dir="ltr"
          tabIndex={magnification > 100 ? 0 : undefined}
          role={magnification > 100 ? "region" : undefined}
          aria-label={magnification > 100 ? t(language, "mushaf.magnification") : undefined}
        >
          {error ? (
            <>
              <div role="status" className="text-center">
                <p>{t(language, "quranListening.pageError")}</p>
                <button type="button" className={buttonClass} onClick={() => setRetry((value) => value + 1)}>
                  {t(language, "audioPlayer.retry")}
                </button>
              </div>
              <p
                data-testid="audio-quran-fallback-text"
                className={`theme-${theme} rounded-lg bg-background p-3 text-center text-foreground`}
                dir="rtl"
                lang="ar"
                style={{
                  fontFamily: "var(--font-mushaf)",
                  fontSize: `calc(${textScale === "small" ? "1.25rem" : textScale === "large" ? "1.75rem" : "1.5rem"} * ${magnification / 100})`,
                  lineHeight: 1.7,
                }}
              >
                {fallbackPages[index]?.text ?? entry.arabicText}
              </p>
            </>
          ) : !result ? (
            <p role="status" className="text-center">
              {t(language, "quranListening.loading")}
            </p>
          ) : (
            <MushafListeningPage
              theme={theme}
              textScale={textScale}
              magnification={magnification}
              lines={result.lines}
              pageNumber={page.page}
              language={language}
              useQcfGlyphs={result.qcf}
              highlightedVerseKey={cue.verseKey}
              highlightedWord={words ? cue.word : null}
            />
          )}
        </div>
        {entry.translation && language === "en" && (
          <QuranListeningTranslation
            verses={visibleTranslation}
            activeVerseKey={cue.verseKey}
            follow={follow}
            textSize={textSize}
            pageNumber={page.page}
          />
        )}
      </div>
    </section>
  );
}
