import { AudioOptionToggle } from "./AudioOptionToggle";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { QuranListeningReaderProps } from "./QuranListeningReader";
import { useReviewedQuranTiming } from "../hooks/useReviewedListeningTiming";
import { useQuranPlaybackCue } from "../hooks/useQuranPlaybackCue";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { splitMushafPages } from "../content/mushafPages";
import { splitQuranTranslation } from "../content/quranTranslation";
import { MushafListeningPage } from "./MushafPageViewer";
import { QuranListeningTranslation } from "./QuranListeningTranslation";
import { MushafBismillahArt } from "./MushafBismillahArt";
import { BASMALAH_ARABIC } from "./QuranChrome";
import { QURAN_TEXT_STYLE, getQuranReadingSize } from "../quranTypography";
import { t } from "../i18n";

const actionClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

/** Keep the reference page's slots, filtering only adjacent surah content. */
function Passage({
  page,
  fallback,
  props,
  verseKey,
  word,
  follow,
  followIntent,
}: {
  page: number;
  fallback: string;
  props: QuranListeningReaderProps;
  verseKey: string | null;
  word: { verseKey: string; position: number } | null;
  follow: boolean;
  followIntent: RefObject<boolean>;
}) {
  const [retry, setRetry] = useState(0);
  const { result, error } = useListeningMushafPage(page, retry);
  const root = useRef<HTMLDivElement>(null);
  const range = props.entry.quranRange!;
  const lines = useMemo(
    () =>
      result?.lines.map((line) =>
        line.filter((token) => {
          const [surah, ayah] = token.verseKey.split(":").map(Number);
          return surah === range.surah && ayah! >= range.ayahStart && ayah! <= range.ayahEnd;
        }),
      ),
    [result, range],
  );
  useEffect(() => {
    if (!follow || !result) return;
    const outerViewport = root.current?.closest<HTMLElement>(".audio-expanded-text");
    if (!outerViewport) return;
    let frame = 0;
    const reveal = () => {
      if (!followIntent.current) return;
      const pageRange = props.entry.mushafPages?.find((item) => item.page === page);
      const ayah = Number(verseKey?.split(":")[1]);
      const atOpening = !verseKey && page === props.entry.mushafPages?.[0]?.page;
      // A verse can straddle printed pages; without a word cue use its declared page.
      if (!atOpening && !word && pageRange && (ayah < pageRange.startAyah || ayah > pageRange.endAyah)) return;
      let target = atOpening
        ? root.current?.querySelector<HTMLElement>(`[data-mushaf-surah-number="${range.surah}"]`)
        : word
          ? root.current?.querySelector<HTMLElement>('[data-playback-word="true"]')
          : root.current?.querySelector<HTMLElement>("[data-playback-verse]");
      if (!target) return;
      const region = root.current?.closest<HTMLElement>(".audio-listening-arabic");
      const viewport = region && region.scrollHeight > region.clientHeight + 1 ? region : outerViewport;
      // Enlarged text can place all opening verses below a tall surah heading.
      // Reveal actual reading ink while retaining the heading above for scrolling.
      if (atOpening) {
        const firstVerse = root.current?.querySelector<HTMLElement>("[data-listening-verse]");
        if (firstVerse && firstVerse.getBoundingClientRect().top >= viewport.getBoundingClientRect().bottom - 8)
          target = firstVerse;
      }
      if (!atOpening && region && region.scrollWidth > region.clientWidth) {
        const view = region.getBoundingClientRect();
        const wordBounds = target.getBoundingClientRect();
        if (wordBounds.left < view.left || wordBounds.right > view.right)
          region.scrollBy({ left: wordBounds.left - view.left, behavior: "instant" });
      }
      const bounds = viewport.getBoundingClientRect();
      const ink = target.getBoundingClientRect();
      if (
        (atOpening && Math.abs(ink.top - bounds.top - 8) > 1) ||
        ink.top < bounds.top ||
        ink.bottom > bounds.bottom - 56
      )
        viewport.scrollTo({ top: Math.max(0, viewport.scrollTop + ink.top - bounds.top - 8), behavior: "instant" });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reveal);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(root.current!);
    const stream = root.current?.closest(".audio-listening-stream");
    if (stream) observer.observe(stream);
    observer.observe(outerViewport);
    const region = root.current?.closest<HTMLElement>(".audio-listening-arabic");
    if (region) observer.observe(region);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [follow, followIntent, result, verseKey, word, page, props.entry.mushafPages, range.surah]);
  const typeScale = props.textScale === "small" ? 0.9 : props.textScale === "large" ? 1.08 : 1;
  const scale = (typeScale * (props.magnification ?? 100)) / 100;
  return (
    <div ref={root} data-listening-passage={page} className="w-full">
      {lines?.some((line) => line.length) ? (
        <MushafListeningPage
          lines={lines}
          pageNumber={page}
          language={props.language}
          useQcfGlyphs={result!.qcf}
          theme={props.theme}
          textScale={props.textScale}
          magnification={props.magnification}
          onlySurah={range.surah}
          highlightedVerseKey={verseKey}
          highlightedWord={word}
        />
      ) : (
        <>
          {page === props.entry.mushafPages?.[0]?.page && (
            <>
              <h2 className="mb-2 text-center text-lg font-bold">
                {props.language === "ar" ? props.entry.titleArabic : props.entry.titleEnglish}
              </h2>
              <div className="mb-2 text-center" dir="rtl" lang="ar">
                <span aria-hidden="true">
                  <MushafBismillahArt className="mx-auto h-auto w-44 max-w-full" />
                </span>
                <span className="sr-only">{BASMALAH_ARABIC}</span>
              </div>
            </>
          )}
          {error && (
            <div role="status" className="text-center text-sm">
              <p>{t(props.language, "quranListening.pageError")}</p>
              <button type="button" className={actionClass} onClick={() => setRetry((value) => value + 1)}>
                {t(props.language, "audioPlayer.retry")}
              </button>
            </div>
          )}
          <p
            data-testid="audio-quran-fallback-text"
            dir="rtl"
            lang="ar"
            className="w-full text-center"
            style={{
              ...QURAN_TEXT_STYLE,
              fontSize: `calc(${getQuranReadingSize(props.textSize ?? "medium")} * ${scale})`,
            }}
          >
            {fallback}
          </p>
        </>
      )}
    </div>
  );
}

export default function QuranSurahListeningReader(props: QuranListeningReaderProps) {
  const {
    entry,
    language,
    segment,
    currentTime,
    playing = false,
    readTime,
    preferencesHost,
    theme = "light",
    textSize = "medium",
  } = props;
  const timing = useReviewedQuranTiming(segment);
  const cue = useQuranPlaybackCue(timing, currentTime, playing, readTime);
  const [follow, setFollowState] = useState(true);
  const followIntent = useRef(true);
  const setFollow = (value: boolean) => {
    // Stop already-scheduled geometry recovery before React commits the new state.
    followIntent.current = value;
    setFollowState(value);
  };
  const [words, setWords] = useState(true);
  const root = useRef<HTMLElement>(null);
  const pages = useMemo(
    () => splitMushafPages(entry.arabicText ?? "", entry.mushafPages ?? []),
    [entry.arabicText, entry.mushafPages],
  );
  const translation = useMemo(
    () => splitQuranTranslation(entry.translation ?? "", entry.quranRange),
    [entry.translation, entry.quranRange],
  );
  useEffect(() => {
    setFollow(true);
  }, [entry.entryId, segment?.variantId]);
  useLayoutEffect(() => {
    const viewport = root.current?.closest<HTMLElement>(".audio-expanded-text");
    let endTarget: HTMLElement | null = null;
    const pause = () => {
      endTarget = null;
      followIntent.current = false;
      setFollowState(false);
    };
    const key = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target === viewport || target.classList.contains("audio-listening-arabic")) &&
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)
      ) {
        pause();
        if (event.key === "End" || event.key === "Home") {
          event.preventDefault();
          target.scrollTo({ top: event.key === "End" ? target.scrollHeight : 0, behavior: "instant" });
          if (event.key === "End") endTarget = target;
        }
      }
    };
    // Late page/font fitting can increase the range after End. Honor the user's
    // explicit endpoint while that region is focused, until another browse action.
    const resize = new ResizeObserver(() => {
      if (endTarget && document.activeElement === endTarget)
        endTarget.scrollTo({ top: endTarget.scrollHeight, behavior: "instant" });
    });
    if (root.current) resize.observe(root.current);
    if (viewport) resize.observe(viewport);
    const blur = () => {
      endTarget = null;
    };
    viewport?.addEventListener("wheel", pause, { passive: true });
    viewport?.addEventListener("touchmove", pause, { passive: true });
    viewport?.addEventListener("pointerdown", pause, { passive: true });
    viewport?.addEventListener("focusout", blur);
    viewport?.addEventListener("keydown", key);
    return () => {
      viewport?.removeEventListener("wheel", pause);
      viewport?.removeEventListener("touchmove", pause);
      viewport?.removeEventListener("pointerdown", pause);
      viewport?.removeEventListener("focusout", blur);
      viewport?.removeEventListener("keydown", key);
      resize.disconnect();
    };
  }, []);
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
          checked={follow}
          onChange={() => {
            setFollow(!follow);
          }}
        />
      )}
      {timing?.verses.some((verse) => verse.words?.length) && (
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
    timing && !follow ? (
      <button
        type="button"
        className={`${actionClass} audio-listening-resume`}
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
    <section
      ref={root}
      className={`audio-listening-stream theme-${theme} w-full max-w-3xl rounded-lg bg-background text-foreground`}
      aria-label={t(language, "quranListening.reader")}
    >
      {preferencesHost
        ? createPortal(preferences, preferencesHost)
        : preferencesHost === undefined
          ? preferences
          : null}
      {overlayHost ? createPortal(resume, overlayHost) : resume}
      <div className="audio-listening-body" data-listening-magnified={(props.magnification ?? 100) > 100}>
        <div
          className="audio-listening-arabic"
          tabIndex={(props.magnification ?? 100) > 100 ? 0 : undefined}
          role={(props.magnification ?? 100) > 100 ? "region" : undefined}
          aria-label={(props.magnification ?? 100) > 100 ? t(language, "mushaf.magnification") : undefined}
        >
          {pages.map((page) => (
            <Passage
              key={page.page}
              page={page.page}
              fallback={page.text}
              props={props}
              verseKey={cue.verseKey}
              word={words ? cue.word : null}
              follow={follow}
              followIntent={followIntent}
            />
          ))}
        </div>
        {entry.translation && language === "en" && (
          <QuranListeningTranslation
            verses={translation}
            activeVerseKey={cue.verseKey}
            follow={follow}
            textSize={textSize}
            pageNumber={pages[0]!.page}
            onManualBrowse={() => setFollow(false)}
          />
        )}
      </div>
    </section>
  );
}
