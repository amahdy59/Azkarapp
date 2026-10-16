import { AudioOptionToggle } from "./AudioOptionToggle";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import QuranSurahListeningReader from "./QuranSurahListeningReader";

const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50";

function revealListeningTarget(root: HTMLElement | null, target: HTMLElement | null, alignOpening = false) {
  const enlarged = target?.closest<HTMLElement>(
    '.audio-listening-body[data-listening-magnified="true"] > .audio-listening-arabic',
  );
  const viewport = enlarged ?? root?.closest<HTMLElement>(".audio-expanded-text");
  if (!viewport || !target) return;
  const view = viewport.getBoundingClientRect();
  const bounds = target.getBoundingClientRect();
  const controls = root?.closest(".floating-audio-player--expanded")?.querySelector("[data-listening-controls]");
  const visibleTop = enlarged ? view.top : Math.max(view.top, controls?.getBoundingClientRect().bottom ?? view.top);
  if (alignOpening || bounds.top < visibleTop || bounds.bottom > view.bottom) {
    viewport.scrollTo?.({
      top: Math.max(0, viewport.scrollTop + bounds.top - visibleTop - 8),
      behavior: "instant",
    });
  }
}

export function PagedQuranListeningReader({
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
  controlsHost,
  preferencesHost,
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
  controlsHost?: HTMLElement | null;
  preferencesHost?: HTMLElement | null;
}) {
  const pages = useMemo(() => entry.mushafPages ?? [], [entry.mushafPages]);
  const [manualIndex, setManualIndex] = useState(0);
  const [follow, setFollow] = useState(true);
  const [words, setWords] = useState(true);
  const [retry, setRetry] = useState(0);
  const timing = useReviewedQuranTiming(segment);
  const cue = useQuranPlaybackCue(timing, currentTime, playing, readTime);
  const root = useRef<HTMLElement>(null);
  const positionedZoom = useRef("");
  useEffect(() => {
    setFollow(true);
    setManualIndex(0);
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
    if (!follow || !result) return;
    const cueTarget =
      root.current?.querySelector<HTMLElement>('[data-playback-word="true"]') ??
      root.current?.querySelector<HTMLElement>("[data-playback-verse]");
    const heading = root.current?.querySelector<HTMLElement>(`[data-mushaf-surah-number="${entry.quranRange?.surah}"]`);
    const firstWord =
      root.current?.querySelector<HTMLElement>(
        `[data-listening-verse="${entry.quranRange?.surah}:${entry.quranRange?.ayahStart}"]`,
      ) ?? root.current?.querySelector<HTMLElement>("[data-listening-verse]");
    if (!root.current || !(cueTarget ?? heading ?? firstWord)) return;
    const viewport = root.current.closest<HTMLElement>(".audio-expanded-text");
    const reveal = () => {
      const openingFits =
        heading && firstWord && viewport
          ? firstWord.getBoundingClientRect().bottom - heading.getBoundingClientRect().top <= viewport.clientHeight - 16
          : true;
      revealListeningTarget(
        root.current,
        cueTarget ?? (openingFits ? (heading ?? firstWord) : firstWord) ?? null,
        !cueTarget,
      );
    };
    reveal();
    // Text resizing and page fitting can move a stationary playback cue.
    // Observe geometry only while following, leaving manual browsing alone.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reveal);
    });
    observer.observe(root.current);
    const target = cueTarget ?? firstWord ?? heading;
    if (target) observer.observe(target);
    const pageFrame = target?.closest(".mushaf-page-frame");
    if (pageFrame) observer.observe(pageFrame);
    if (viewport) observer.observe(viewport);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [
    follow,
    result,
    cue.verseKey,
    cue.word?.position,
    magnification,
    entry.quranRange?.surah,
    entry.quranRange?.ayahStart,
  ]);
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
  const controls = (
    <div
      data-listening-controls=""
      className="audio-listening-navigation mx-auto flex w-fit max-w-full items-center justify-center bg-background"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <select
        aria-label={t(language, "mushaf.pageRegion", { page: formatNumerals(page.page, language) })}
        className={buttonClass + " bg-background font-bold tabular-nums"}
        value={index}
        onChange={(event) => browse(Number(event.target.value))}
      >
        {pages.map((item, pageIndex) => (
          <option key={item.page} value={pageIndex}>
            {formatNumerals(item.page, language)}
          </option>
        ))}
      </select>
    </div>
  );
  const preferences = (
    <div
      data-testid="quran-listening-preferences"
      className="flex flex-col gap-2"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <p className="text-sm">{t(language, timing ? "quranListening.browseHint" : "quranListening.unavailable")}</p>
      {timing && (
        <AudioOptionToggle
          label={t(language, "quranListening.follow")}
          checked={follow && !error}
          disabled={error}
          onChange={() => {
            setManualIndex(index);
            setFollow((value) => !value);
          }}
        />
      )}
      {hasWords && (
        <AudioOptionToggle
          label={t(
            language,
            timing?.reviewStatus === "owner-preview" ? "quranListening.estimatedWords" : "quranListening.words",
          )}
          checked={words}
          onChange={() => setWords((value) => !value)}
        />
      )}
    </div>
  );
  const resume =
    language === "ar" && timing && !follow && !error ? (
      <button
        type="button"
        className={`${buttonClass} audio-listening-resume mx-auto flex`}
        onClick={() => {
          setFollow(true);
          root.current?.closest<HTMLElement>(".audio-expanded-text")?.focus({ preventScroll: true });
        }}
      >
        {t(language, "quranListening.returnToVerse")}
      </button>
    ) : null;
  const overlayHost = root.current?.closest(".audio-expanded-reading");
  return (
    <section ref={root} className="w-full" aria-label={t(language, "quranListening.reader")}>
      {controlsHost ? createPortal(controls, controlsHost) : controls}
      {preferencesHost
        ? createPortal(preferences, preferencesHost)
        : preferencesHost === undefined
          ? preferences
          : null}
      {overlayHost ? createPortal(resume, overlayHost) : resume}
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
                  ...QURAN_TEXT_STYLE,
                  fontSize: `calc(${textScale === "small" ? "1.25rem" : textScale === "large" ? "1.75rem" : "1.5rem"} * ${magnification / 100})`,
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
            onManualBrowse={() => {
              setManualIndex(index);
              setFollow(false);
            }}
            onResumeFollowing={timing ? () => setFollow(true) : undefined}
          />
        )}
      </div>
    </section>
  );
}

export type QuranListeningReaderProps = Parameters<typeof PagedQuranListeningReader>[0];
export default function QuranListeningReader(props: QuranListeningReaderProps) {
  return [18, 32, 67].includes(props.entry.quranRange?.surah ?? 0) ? (
    <QuranSurahListeningReader {...props} />
  ) : (
    <PagedQuranListeningReader {...props} />
  );
}
