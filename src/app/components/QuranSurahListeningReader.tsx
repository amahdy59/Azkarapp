import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { QuranListeningReaderProps } from "./QuranListeningReader";
import { useReviewedQuranTiming } from "../hooks/useReviewedListeningTiming";
import { useQuranPlaybackCue } from "../hooks/useQuranPlaybackCue";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { splitMushafPages } from "../content/mushafPages";
import { splitQuranTranslation } from "../content/quranTranslation";
import { MushafExcerptCanvas } from "./MushafPageViewer";
import { QuranListeningTranslation } from "./QuranListeningTranslation";
import { MushafBismillahArt } from "./MushafBismillahArt";
import { BASMALAH_ARABIC } from "./QuranChrome";
import { QURAN_TEXT_STYLE, getQuranReadingSize } from "../quranTypography";
import { Check } from "./icons";
import { t } from "../i18n";

const actionClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

/** One page's verified words, without printed-page fitting or adjacent surahs. */
function Passage({
  page,
  fallback,
  props,
  verseKey,
  word,
  follow,
}: {
  page: number;
  fallback: string;
  props: QuranListeningReaderProps;
  verseKey: string | null;
  word: { verseKey: string; position: number } | null;
  follow: boolean;
}) {
  const [retry, setRetry] = useState(0);
  const { result, error } = useListeningMushafPage(page, retry);
  const root = useRef<HTMLDivElement>(null);
  const range = props.entry.quranRange!;
  const lines = useMemo(
    () =>
      result?.lines
        .map((line) =>
          line.filter((token) => {
            const [surah, ayah] = token.verseKey.split(":").map(Number);
            return surah === range.surah && ayah! >= range.ayahStart && ayah! <= range.ayahEnd;
          }),
        )
        .filter((line) => line.length),
    [result, range],
  );
  useEffect(() => {
    if (!follow || !result) return;
    const viewport = root.current?.closest<HTMLElement>(".audio-expanded-text");
    if (!viewport) return;
    let frame = 0;
    const reveal = () => {
      const pageRange = props.entry.mushafPages?.find((item) => item.page === page);
      const ayah = Number(verseKey?.split(":")[1]);
      // A verse can straddle printed pages; without a word cue use its declared page.
      if (!word && pageRange && (ayah < pageRange.startAyah || ayah > pageRange.endAyah)) return;
      const target = word
        ? root.current?.querySelector<HTMLElement>('[data-playback-word="true"]')
        : root.current?.querySelector<HTMLElement>("[data-playback-verse]");
      if (!target) return;
      const bounds = viewport.getBoundingClientRect();
      const ink = target.getBoundingClientRect();
      if (ink.top < bounds.top || ink.bottom > bounds.bottom - 56)
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
    observer.observe(viewport);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [follow, result, verseKey, word, page, props.entry.mushafPages]);
  const typeScale = props.textScale === "small" ? 0.9 : props.textScale === "large" ? 1.08 : 1;
  const scale = (typeScale * (props.magnification ?? 100)) / 100;
  return (
    <div ref={root} data-listening-passage={page} className="w-full">
      {lines?.length ? (
        <MushafExcerptCanvas
          lines={lines}
          pageNumber={page}
          language={props.language}
          useQcfGlyphs={result!.qcf}
          theme={props.theme}
          textSize={props.textSize}
          readingScale={scale}
          highlightedVerseKey={verseKey}
          highlightedWord={word}
        />
      ) : (
        <>
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
  const [follow, setFollow] = useState(true);
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
  useEffect(() => {
    const viewport = root.current?.closest<HTMLElement>(".audio-expanded-text");
    const pause = () => setFollow(false);
    const key = (event: KeyboardEvent) => {
      if (
        event.target === viewport &&
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)
      )
        pause();
    };
    viewport?.addEventListener("wheel", pause, { passive: true });
    viewport?.addEventListener("touchmove", pause, { passive: true });
    viewport?.addEventListener("keydown", key);
    return () => {
      viewport?.removeEventListener("wheel", pause);
      viewport?.removeEventListener("touchmove", pause);
      viewport?.removeEventListener("keydown", key);
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
        <button
          type="button"
          className={actionClass}
          aria-pressed={follow}
          onClick={() => setFollow((value) => !value)}
        >
          <span>{t(language, "quranListening.follow")}</span>
          {follow && <Check size={16} className="shrink-0" aria-hidden="true" />}
        </button>
      )}
      {timing?.verses.some((verse) => verse.words?.length) && (
        <button type="button" className={actionClass} aria-pressed={words} onClick={() => setWords((value) => !value)}>
          <span>
            {t(
              language,
              timing.reviewStatus === "owner-preview" ? "quranListening.estimatedWords" : "quranListening.words",
            )}
          </span>
          {words && <Check size={16} className="shrink-0" aria-hidden="true" />}
        </button>
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
      <h2 className="mb-2 text-center text-lg font-bold">
        {language === "ar" ? entry.titleArabic : entry.titleEnglish}
      </h2>
      <div className="mb-2 text-center" dir="rtl" lang="ar" data-testid="quran-basmalah">
        <span aria-hidden="true">
          <MushafBismillahArt className="mx-auto h-auto w-44 max-w-full" />
        </span>
        <span className="sr-only">{BASMALAH_ARABIC}</span>
      </div>
      <div className="audio-listening-body">
        <div className="audio-listening-arabic">
          {pages.map((page) => (
            <Passage
              key={page.page}
              page={page.page}
              fallback={page.text}
              props={props}
              verseKey={cue.verseKey}
              word={words ? cue.word : null}
              follow={follow}
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
