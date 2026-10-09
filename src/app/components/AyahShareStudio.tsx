import { useEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { loadAyahTranslation, type AyahTranslation } from "../content/ayahTranslations";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { generateAyahCards, type AyahCardInput } from "../share/ayahShareCard";
import { downloadFile, shareMultipleFiles } from "../share/shareDispatcher";
import { reportError } from "../../lib/observability";
import { Button } from "./ui/button";

export default function AyahShareStudio({
  verseKey,
  text,
  title,
  meanings,
  language,
  onBack,
}: {
  verseKey: string;
  text: string;
  title: string;
  meanings: QuranWordMeaning[];
  language: AppLanguage;
  onBack: () => void;
}) {
  const [format, setFormat] = useState<AyahCardInput["format"]>("portrait");
  const [includeTranslation, setIncludeTranslation] = useState(false);
  const [includeMeanings, setIncludeMeanings] = useState(false);
  const [translation, setTranslation] = useState<AyahTranslation | null>(null);
  const [translationLoaded, setTranslationLoaded] = useState(false);
  const [pages, setPages] = useState<Awaited<ReturnType<typeof generateAyahCards>>>([]);
  const [active, setActive] = useState(0);
  const [generating, setGenerating] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    let cancelled = false;
    setTranslationLoaded(false);
    setTranslation(null);
    void loadAyahTranslation(verseKey)
      .catch((cause) => {
        reportError(cause, "ayah-card-translation");
        return null;
      })
      .then((value) => {
        if (!cancelled) {
          setTranslation(value);
          setTranslationLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [verseKey]);
  const input = useMemo<AyahCardInput>(
    () => ({
      verseKey,
      text,
      title,
      format,
      continuation: t(language, "reader.ayahCardPart"),
      translation:
        includeTranslation && translation
          ? { text: translation.text, label: `${t(language, "reader.ayahCardTranslation")} · ${translation.source}` }
          : undefined,
      meanings:
        includeMeanings && meanings.length
          ? {
              text: meanings.map((meaning) => `${meaning.word}: ${meaning.explanationArabic}`).join("\n"),
              label: `${t("ar", "reader.wordMeaningsTitle")} · ${QURAN_WORD_MEANING_SOURCE.nameArabic}`,
            }
          : undefined,
    }),
    [verseKey, text, title, format, language, includeTranslation, translation, includeMeanings, meanings],
  );
  useEffect(() => {
    let cancelled = false;
    let owned: Awaited<ReturnType<typeof generateAyahCards>> = [];
    setGenerating(true);
    setPages([]);
    setActive(0);
    setStatus("");
    setError(false);
    void generateAyahCards(input)
      .then((result) => {
        owned = result;
        if (cancelled) result.forEach((page) => URL.revokeObjectURL(page.url));
        else {
          setPages(result);
          setGenerating(false);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          reportError(cause, "ayah-card-generation");
          setGenerating(false);
          setError(true);
          setStatus(t(language, "reader.shareCardError"));
        }
      });
    return () => {
      cancelled = true;
      owned.forEach((page) => URL.revokeObjectURL(page.url));
    };
  }, [input, language]);
  const ready = pages.length > 0 && !generating && !busy;
  const share = async () => {
    if (!ready) return;
    setBusy(true);
    setError(false);
    try {
      const result = await shareMultipleFiles(
        pages.map((page) => page.file),
        { title, text: `${text}\n${title}` },
      );
      setStatus(
        t(
          language,
          result.method === "cancelled"
            ? "reader.shareCancelled"
            : result.method === "downloaded"
              ? "reader.shareCardDownloaded"
              : result.method === "shared"
                ? "reader.ayahShared"
                : "reader.shareError",
        ),
      );
      setError(result.method === "error");
    } catch (cause) {
      reportError(cause, "ayah-card-share");
      setError(true);
      setStatus(t(language, "reader.shareError"));
    } finally {
      setBusy(false);
    }
  };
  const current = pages[active];
  return (
    <div className="space-y-4 px-5 py-4" data-testid="ayah-share-studio">
      <Button variant="outline" onClick={onBack}>
        {t(language, "common.back")}
      </Button>
      <h3 ref={heading} tabIndex={-1} className="text-base font-bold text-foreground">
        {t(language, "reader.ayahCardTitle")}
      </h3>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t(language, "reader.ayahCardFormat")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["portrait", "square"] as const).map((value) => (
            <label
              key={value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3"
            >
              <input
                type="radio"
                name="ayah-card-format"
                value={value}
                checked={format === value}
                onChange={() => setFormat(value)}
                disabled={busy}
              />
              {t(language, value === "portrait" ? "reader.ayahCardPortrait" : "reader.ayahCardSquare")}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={includeTranslation}
            disabled={!translation || busy}
            onChange={(event) => setIncludeTranslation(event.target.checked)}
          />
          {t(language, "reader.ayahCardTranslation")}
        </label>
        {translationLoaded && !translation && (
          <p className="text-sm text-muted-foreground">{t(language, "reader.ayahCardTranslationUnavailable")}</p>
        )}
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={includeMeanings}
            disabled={!meanings.length || busy}
            onChange={(event) => setIncludeMeanings(event.target.checked)}
          />
          {t(language, "reader.ayahCardMeanings")}
        </label>
        {!meanings.length && (
          <p className="text-sm text-muted-foreground">{t(language, "reader.ayahCardMeaningsUnavailable")}</p>
        )}
      </div>
      {current && (
        <figure className="mx-auto w-full max-w-sm">
          <img
            src={current.url}
            alt={t(language, "reader.ayahCardPreview", {
              title,
              page: formatNumerals(active + 1, language),
              total: formatNumerals(pages.length, language),
            })}
            width={current.width}
            height={current.height}
            className="h-auto w-full rounded-xl border border-border"
          />
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {formatNumerals(`${active + 1} / ${pages.length}`, language)} · {t(language, "reader.ayahCardComplete")}
          </figcaption>
        </figure>
      )}
      {pages.length > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={active === 0} onClick={() => setActive((value) => value - 1)}>
            {t(language, "common.previous")}
          </Button>
          <Button
            variant="outline"
            disabled={active === pages.length - 1}
            onClick={() => setActive((value) => value + 1)}
          >
            {t(language, "common.next")}
          </Button>
        </div>
      )}
      <details className="rounded-xl border border-border p-3">
        <summary className="min-h-11 cursor-pointer text-sm font-semibold">
          {t(language, "reader.ayahCardText")}
        </summary>
        <p lang="ar" dir="rtl" className="zikr-text text-xl leading-loose" style={{ fontFamily: "var(--font-mushaf)" }}>
          {text}
        </p>
        {input.translation && (
          <p lang="en" dir="ltr" className="mt-3 text-sm leading-relaxed">
            {input.translation.text}
          </p>
        )}
        {input.meanings && (
          <p lang="ar" dir="rtl" className="mt-3 whitespace-pre-line text-sm leading-relaxed">
            {input.meanings.text}
          </p>
        )}
      </details>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!ready} onClick={() => void share()}>
          {t(language, "reader.ayahCardShare")}
        </Button>
        <Button
          variant="outline"
          disabled={!ready || !current}
          onClick={() => {
            if (current) {
              downloadFile(current.file);
              setStatus(t(language, "reader.shareCardDownloaded"));
            }
          }}
        >
          {t(language, "reader.ayahCardDownload")}
        </Button>
      </div>
      <p
        role={error ? "alert" : "status"}
        className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
      >
        {generating ? t(language, "reader.shareCardGenerating") : status}
      </p>
    </div>
  );
}
