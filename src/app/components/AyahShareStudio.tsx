import { SharingCaption } from "./SharingCaption";
import { getImageCaption } from "../share/shareCaption";
import { ShareFormatSelect } from "./ShareFormatSelect";
import { SharingArrow, SharingSteps, SharingStepNavigation, type SharingStep } from "./SharingSteps";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { loadAyahEnglishTranslation } from "../content/quranTranslations";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { generateAyahCards, type AyahCardInput } from "../share/ayahShareCard";
import { canShareMultipleFiles, downloadFile, shareMultipleFiles } from "../share/shareDispatcher";
import { createShareArchive } from "../share/shareArchive";
import { reportError } from "../../lib/observability";
import { Button } from "./ui/button";
import { Download, Share2, X, Maximize, Minimize } from "./icons";
import "./ayah-share-studio.css";
import { AyahMushafText } from "./AyahMushafText";

export interface AyahShareOptions {
  format: AyahCardInput["format"];
  includeTranslation: boolean;
  includeMeanings: boolean;
  textScale?: number;
  fitAyah?: boolean;
}
export default function AyahShareStudio({
  verseKey,
  text,
  pageNumber,
  title,
  meanings,
  language,
  onBack,
  onClose,
  options = { format: "portrait", includeTranslation: false, includeMeanings: false },
  onOptionsChange,
}: {
  verseKey: string;
  text: string;
  pageNumber?: number;
  title: string;
  meanings: QuranWordMeaning[];
  language: AppLanguage;
  onBack: () => void;
  onClose: () => void;
  options?: AyahShareOptions;
  onOptionsChange?: (options: AyahShareOptions) => void;
}) {
  const [step, setStep] = useState<SharingStep>("content");
  const [inspect, setInspect] = useState(false);
  const [includeCaption, setIncludeCaption] = useState(false);
  const steps = ["content", "design", "share"] as const;
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const changeStep = (next: SharingStep) => {
    setStep(next);
    requestAnimationFrame(() => stepHeading.current?.focus());
  };
  const [selection, setSelection] = useState(options);
  const { format, includeTranslation, includeMeanings, textScale = 1, fitAyah = true } = selection;
  const update = (patch: Partial<AyahShareOptions>) => {
    const next = { ...selection, ...patch };
    setSelection(next);
    onOptionsChange?.(next);
  };
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoaded, setTranslationLoaded] = useState(false);
  const [translationRetry, setTranslationRetry] = useState(0);
  const [generationRetry, setGenerationRetry] = useState(0);
  const [pages, setPages] = useState<Awaited<ReturnType<typeof generateAyahCards>>>([]);
  const [renderedInput, setRenderedInput] = useState<AyahCardInput | null>(null);
  const [active, setActive] = useState(0);
  const [generating, setGenerating] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [generationFailed, setGenerationFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [scrollWholeDialog, setScrollWholeDialog] = useState(false);
  const previousPages = useRef(pages);
  useEffect(() => heading.current?.focus(), []);
  useLayoutEffect(() => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused !== heading.current && surface.current?.contains(focused)) {
      focused.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
  }, [scrollWholeDialog]);
  useEffect(() => {
    const root = surface.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const header = root.querySelector<HTMLElement>(".ayah-share-header");
    const footer = root.querySelector<HTMLElement>(".ayah-share-footer");
    const body = root.querySelector<HTMLElement>(".ayah-share-body");
    if (!header || !footer || !body) return;
    let frame: number | undefined;
    const observer = new ResizeObserver(() => {
      // Enlarged text can consume a tall viewport too; preserve one reachable scroll surface.
      setScrollWholeDialog(header.offsetHeight + footer.offsetHeight + 120 > root.clientHeight);
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Font/content reflow can move a focused control after the initial focus scroll, particularly in WebKit.
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && focused !== heading.current && root.contains(focused)) {
          focused.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        }
      });
    });
    [root, header, body, footer].forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setTranslationLoaded(false);
    setTranslation(null);
    void loadAyahEnglishTranslation(verseKey)
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
  }, [verseKey, translationRetry]);
  const input = useMemo<AyahCardInput>(
    () => ({
      verseKey,
      language,
      pageNumber,
      text,
      title,
      format,
      textScale,
      fitAyah,
      continuation: t(language, "reader.ayahCardPart"),
      translation:
        includeTranslation && translation
          ? { text: translation, label: `${t(language, "quranListening.translation")} · Saheeh International` }
          : undefined,
      meanings:
        includeMeanings && meanings.length
          ? {
              text: meanings.map((meaning) => `${meaning.word}: ${meaning.explanationArabic}`).join("\n"),
              label: `${t("ar", "reader.wordMeaningsTitle")} · ${QURAN_WORD_MEANING_SOURCE.nameArabic}`,
            }
          : undefined,
    }),
    [
      verseKey,
      pageNumber,
      text,
      title,
      format,
      textScale,
      fitAyah,
      language,
      includeTranslation,
      translation,
      includeMeanings,
      meanings,
    ],
  );
  const completeText = [
    title,
    text,
    input.translation?.label,
    input.translation?.text,
    input.meanings?.label,
    input.meanings?.text,
  ]
    .filter(Boolean)
    .join("\n\n");
  useEffect(() => {
    const controller = new AbortController();
    setGenerating(true);
    setStatus("");
    setError(false);
    setGenerationFailed(false);
    // Coalesce quick choices; retain the last preview, but never export it as current.
    const timer = window.setTimeout(() => {
      void generateAyahCards(input, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) {
            result.forEach((page) => URL.revokeObjectURL(page.url));
            return;
          }
          previousPages.current.forEach((page) => URL.revokeObjectURL(page.url));
          previousPages.current = result;
          setPages(result);
          setRenderedInput(input);
          setActive((value) => Math.max(0, Math.min(value, result.length - 1)));
          setGenerating(false);
        })
        .catch((cause) => {
          if (!controller.signal.aborted) {
            reportError(cause, "ayah-card-generation");
            setGenerating(false);
            setError(true);
            setGenerationFailed(true);
            setStatus(t(language, "reader.shareCardError"));
          }
        });
    }, 100);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [input, language, generationRetry]);
  useEffect(() => () => previousPages.current.forEach((page) => URL.revokeObjectURL(page.url)), []);
  const ready =
    pages.length > 0 &&
    renderedInput === input &&
    !generating &&
    !busy &&
    !generationFailed &&
    (!includeTranslation || Boolean(translation));
  const files = pages.map((page) => page.file);
  const readingLink = /^\d+:\d+$/u.test(verseKey) ? `https://quran.com/${verseKey.replace(":", "/")}` : undefined;
  const captionText = getImageCaption([completeText, readingLink].filter(Boolean).join("\n\n"));
  const nativeShare = pages.length > 0 && canShareMultipleFiles(files);
  const share = async () => {
    if (!ready || !nativeShare) return;
    setBusy(true);
    setError(false);
    try {
      const result = await shareMultipleFiles(files, {
        title,
        text: includeCaption ? captionText : undefined,
        downloadFallback: false,
      });
      setStatus(
        t(
          language,
          result.method === "cancelled"
            ? "reader.shareCancelled"
            : result.method === "shared"
              ? "reader.ayahCardHandedOff"
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
  const saveAll = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      downloadFile(await createShareArchive(files, completeText));
      setStatus(t(language, "reader.ayahCardDownloadStarted"));
    } catch (cause) {
      reportError(cause, "ayah-card-archive");
      setError(true);
      setStatus(t(language, "reader.shareError"));
    } finally {
      setBusy(false);
    }
  };
  const current = pages[active];
  return (
    <div
      ref={surface}
      className="ayah-share-studio"
      data-testid="ayah-share-studio"
      data-scroll-whole={scrollWholeDialog || undefined}
      onFocusCapture={(event) => {
        if (event.target !== heading.current) event.target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      }}
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="ayah-share-header">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t(language, "common.back")}>
          <SharingArrow language={language} action="previous" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold text-foreground">
            {t(language, "reader.ayahCardTitle")}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t(language, "common.close")}>
          <X aria-hidden="true" />
        </Button>
        <div className="ayah-share-step-header">
          <SharingSteps steps={steps} step={step} onChange={changeStep} language={language} disabled={busy} />
        </div>
      </header>
      <div className="ayah-share-body" data-vaul-no-drag>
        <div className="ayah-share-preview" data-inspect={inspect || undefined} aria-busy={generating}>
          {current && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold">{t(language, "shareStudio.previewHeading")}</span>
              <Button
                variant="outline"
                className="min-h-11 h-auto whitespace-normal"
                aria-expanded={inspect}
                onClick={() => setInspect((value) => !value)}
              >
                {inspect ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
                {t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
              </Button>
            </div>
          )}
          <p className="mb-2 text-sm text-muted-foreground" dir="auto">
            {title}
          </p>
          {current ? (
            <figure>
              <img
                src={current.url}
                alt={t(language, "reader.ayahCardPreview", {
                  title,
                  page: formatNumerals(active + 1, language),
                  total: formatNumerals(pages.length, language),
                })}
                width={current.width}
                height={current.height}
              />
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {t(language, "reader.ayahCardCount", {
                  page: formatNumerals(active + 1, language),
                  total: formatNumerals(pages.length, language),
                })}
              </figcaption>
            </figure>
          ) : (
            <div className="ayah-share-placeholder" aria-hidden="true" />
          )}
          {pages.length > 1 && (
            <div className="sharing-card-navigation">
              <Button
                variant="outline"
                disabled={active === 0 || generating || busy}
                onClick={() => setActive((value) => value - 1)}
              >
                <SharingArrow language={language} action="previous" />
                {t(language, "common.previous")}
              </Button>
              <Button
                variant="outline"
                disabled={active === pages.length - 1 || generating || busy}
                onClick={() => setActive((value) => value + 1)}
              >
                {t(language, "common.next")}
                <SharingArrow language={language} action="next" />
              </Button>
            </div>
          )}
        </div>
        <div className="ayah-share-settings space-y-4 min-w-0">
          <div>
            <h3
              ref={stepHeading}
              tabIndex={-1}
              className="text-lg font-bold rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, `shareStudio.step${step}`)}
            </h3>
            <p className="sr-only">{t(language, `shareStudio.step${step}Hint`)}</p>
            {step === "design" && (
              <p className="mt-1 text-xs text-muted-foreground">{t(language, "shareStudio.designOptional")}</p>
            )}
          </div>
          {step === "design" && (
            <ShareFormatSelect
              value={format}
              onChange={(format) => update({ format })}
              language={language}
              disabled={busy}
            />
          )}
          {step === "content" && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">{t(language, "reader.ayahCardContent")}</legend>
              <label className="ayah-share-option">
                <input
                  type="checkbox"
                  checked={includeTranslation}
                  disabled={(!translation && !includeTranslation) || busy}
                  onChange={(event) => update({ includeTranslation: event.target.checked })}
                />
                {t(language, "reader.ayahCardTranslation")}
              </label>
              {!translationLoaded ? (
                <p className="text-sm text-muted-foreground">{t(language, "reader.ayahCardTranslationLoading")}</p>
              ) : (
                !translation && (
                  <div className="text-sm text-muted-foreground">
                    <p>{t(language, "reader.ayahCardTranslationUnavailable")}</p>
                    <Button variant="outline" disabled={busy} onClick={() => setTranslationRetry((value) => value + 1)}>
                      {t(language, "common.tryAgain")}
                    </Button>
                  </div>
                )
              )}
              <label className="ayah-share-option">
                <input
                  type="checkbox"
                  checked={includeMeanings}
                  disabled={!meanings.length || busy}
                  onChange={(event) => update({ includeMeanings: event.target.checked })}
                />
                {t(language, "reader.ayahCardMeanings")}
              </label>
              {!meanings.length && (
                <p className="text-sm text-muted-foreground">{t(language, "reader.ayahCardMeaningsUnavailable")}</p>
              )}
            </fieldset>
          )}
          {step === "share" && pages.length > 1 && (
            <p className="text-sm text-muted-foreground">{t(language, "reader.ayahCardComplete")}</p>
          )}
          {step === "design" && (
            <details className="sharing-typography">
              <summary className="min-h-11 cursor-pointer text-sm font-semibold">
                {t(language, "reader.ayahCardTypography")}
              </summary>
              <fieldset className="space-y-2">
                <legend className="sr-only">{t(language, "reader.ayahCardTypography")}</legend>
                <label className="block text-sm" htmlFor="ayah-card-text-size">
                  {t(language, "reader.ayahCardTextSize")} · {formatNumerals(Math.round(textScale * 100), language)}%
                </label>
                <input
                  id="ayah-card-text-size"
                  type="range"
                  min={0.75}
                  max={1.125}
                  step={0.125}
                  value={textScale}
                  aria-valuetext={`${formatNumerals(Math.round(textScale * 100), language)}%`}
                  onChange={(event) => update({ textScale: Number(event.target.value) })}
                  disabled={busy}
                  className="min-h-11 w-full accent-primary rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t(language, "reader.ayahCardSmaller")}</span>
                  <span>{t(language, "reader.ayahCardLarger")}</span>
                </div>
                <label className="ayah-share-option">
                  <input
                    type="checkbox"
                    checked={fitAyah}
                    aria-describedby="ayah-card-fit-hint"
                    disabled={busy}
                    onChange={(event) => update({ fitAyah: event.target.checked })}
                  />
                  {t(language, "reader.ayahCardFitAyah")}
                </label>
                <p id="ayah-card-fit-hint" className="text-sm text-muted-foreground">
                  {t(language, "reader.ayahCardFitHint")}
                </p>
              </fieldset>
            </details>
          )}
          {step === "share" && (
            <SharingCaption
              language={language}
              included={includeCaption}
              onIncludedChange={setIncludeCaption}
              text={captionText}
              readingLink={readingLink}
              busy={busy}
              disabled={includeTranslation && !translationLoaded}
              canCopy={typeof navigator.clipboard?.writeText === "function"}
              onSaveText={(value) => {
                try {
                  downloadFile(
                    new File([value], `ayah-${verseKey.replace(":", "-")}.txt`, { type: "text/plain;charset=utf-8" }),
                  );
                  setError(false);
                  setStatus(t(language, "reader.ayahCardDownloadStarted"));
                } catch (cause) {
                  reportError(cause, "ayah-card-save-text");
                  setError(true);
                  setStatus(t(language, "reader.shareError"));
                }
              }}
              onCopy={async (value) => {
                try {
                  await navigator.clipboard.writeText(value);
                  setError(false);
                  setStatus(
                    t(language, value === readingLink ? "shareStudio.readingLinkCopied" : "shareStudio.textCopied"),
                  );
                  return true;
                } catch (cause) {
                  reportError(cause, "ayah-card-copy");
                  setError(true);
                  setStatus(t(language, "reader.copyError"));
                  return false;
                }
              }}
            />
          )}
          {step === "share" && (
            <details className="rounded-xl border border-border p-3 text-center">
              <summary className="min-h-11 cursor-pointer text-sm font-semibold">
                {t(language, "reader.ayahCardText")}
              </summary>
              <p className="text-sm font-semibold" dir="auto">
                {title}
              </p>
              <p lang="ar" dir="rtl" className="zikr-text text-xl leading-[1.7]" style={QURAN_TEXT_STYLE}>
                <AyahMushafText text={text} verseKey={verseKey} pageNumber={pageNumber} language={language} />
              </p>
              {input.translation && (
                <div lang="en" dir="ltr" className="mt-3 text-sm leading-relaxed">
                  <p className="font-semibold">Saheeh International</p>
                  <p>{input.translation.text}</p>
                </div>
              )}
              {input.meanings && (
                <div lang="ar" dir="rtl" className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                  <p className="font-semibold">{input.meanings.label}</p>
                  <p>{input.meanings.text}</p>
                </div>
              )}

              {typeof navigator.clipboard?.writeText !== "function" && (
                <p className="mt-2 text-sm text-muted-foreground">{t(language, "shareStudio.copyTextUnavailable")}</p>
              )}
            </details>
          )}
        </div>
      </div>
      <footer className="ayah-share-footer">
        {step !== "share" && (
          <SharingStepNavigation
            steps={steps}
            step={step}
            onChange={changeStep}
            language={language}
            disabled={busy}
            onSkipDesign={() => changeStep("share")}
          />
        )}
        <p
          role={error ? "alert" : "status"}
          className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {generating
            ? t(language, "reader.shareCardGenerating")
            : status || (!nativeShare && ready ? t(language, "reader.ayahCardShareUnavailable") : "")}
        </p>
        {error && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              setError(false);
              if (generationFailed) setGenerationRetry((value) => value + 1);
            }}
          >
            {t(language, "common.tryAgain")}
          </Button>
        )}
        {step === "share" && (
          <div className="sharing-final-actions">
            <Button
              disabled={!ready}
              onClick={() => {
                if (nativeShare) void share();
                else if (pages.length > 1) void saveAll();
                else if (current) {
                  downloadFile(current.file);
                  setStatus(t(language, "reader.ayahCardDownloadStarted"));
                }
              }}
            >
              {nativeShare ? <Share2 aria-hidden="true" /> : <Download aria-hidden="true" />}
              {t(
                language,
                nativeShare
                  ? pages.length > 1
                    ? "reader.ayahCardShareAll"
                    : "reader.ayahCardShare"
                  : pages.length > 1
                    ? "reader.ayahCardSaveAll"
                    : "reader.ayahCardDownload",
                { total: formatNumerals(pages.length, language) },
              )}
            </Button>
            {nativeShare || pages.length > 1 ? (
              <Button
                variant="outline"
                disabled={!ready || !current}
                onClick={() => {
                  if (current) {
                    downloadFile(current.file);
                    setStatus(t(language, "reader.ayahCardDownloadStarted"));
                  }
                }}
              >
                <Download aria-hidden="true" />
                {t(language, "reader.ayahCardDownload")}
              </Button>
            ) : null}
          </div>
        )}
      </footer>
    </div>
  );
}
