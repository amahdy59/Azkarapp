import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check, ChevronNext, ChevronPrevious, Copy, Download, Share2 } from "./icons";
import { t } from "../i18n";
import { FIELD_LABEL_CLASS } from "./FormField";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { QuranVerseText } from "./QuranVerseText";
import { ShareFormatSelect } from "./ShareFormatSelect";
import { SharingDisclosure } from "./SharingDisclosure";
import { SharingChoiceLabel, SHARING_SELECTED_CLASS } from "./SharingChoiceLabel";
import { useLayoutMode } from "../hooks/useLayoutMode";
import type { AppLanguage, ThemeMode, Zikr, RoutineMode, PrayerName } from "../types";
import {
  generateAllCollectionStoryPages,
  getCompatibleShareFormats,
  releaseSharePages,
  SHARE_PALETTES,
  type GeneratedCollectionStoryCard,
} from "../share/collectionShareCard";
import {
  canCopyImage,
  canShareMultipleFiles,
  copyImageToClipboard,
  downloadFile,
  shareMultipleFiles,
  shareSingleFile,
} from "../share/shareDispatcher";
import { createShareArchive } from "../share/shareArchive";
import {
  getCuratedRoutinePack,
  resolveCuratedImageUrl,
  fetchAllCuratedCardFiles,
  copyCuratedCardImage,
  type CuratedRoutineCard,
} from "../share/curatedRoutineCards";
import {
  defaultShareAppearance,
  getShareText,
  getShareItemRepetitionLabel,
  shareDisplayDigits,
  getShareUrl,
  toShareItem,
  ShareFitError,
  type ShareAppearance,
  type ShareFormat,
  type ShareItem,
} from "../share/shareLayout";
import { formatNumerals } from "../formatting";

export interface CollectionShareModalProps {
  open: boolean;
  onClose: () => void;
  collectionTitle: string;
  collectionTitleArabic?: string;
  collectionTitleEnglish?: string;
  collectionSubtitle?: string;
  categoryId?: string;
  readerIndex?: number;
  routineMode?: RoutineMode;
  prayer?: PrayerName;
  single?: boolean;
  items: Zikr[];
  language: AppLanguage;
  themeMode?: ThemeMode;
  shareItems?: ShareItem[];
  shareItemsByLanguage?: Record<AppLanguage, ShareItem[]>;
  shareUrl?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  initialFormat?: ShareFormat;
  initialScope?: "current" | "selected" | "all";
  contentAlignment?: "start" | "center";
}

function supportsTextShare(data: ShareData): boolean {
  if (typeof navigator.share !== "function") return false;
  try {
    return typeof navigator.canShare !== "function" || navigator.canShare(data);
  } catch {
    return false;
  }
}

export function CollectionShareModal({
  open,
  onClose,
  collectionTitle,
  collectionTitleArabic,
  collectionTitleEnglish,
  collectionSubtitle,
  categoryId,
  readerIndex,
  routineMode,
  prayer,
  single = false,
  items,
  language,
  themeMode = "light",
  shareItems,
  shareItemsByLanguage,
  shareUrl,
  dialogTitle,
  dialogDescription,
  initialFormat,
  initialScope = "current",
  contentAlignment = "start",
}: CollectionShareModalProps) {
  const direction = language === "ar" ? "rtl" : "ltr";
  const layoutMode = useLayoutMode();
  const wide = layoutMode === "expanded" || layoutMode === "large";
  const [appearance, setAppearance] = useState<ShareAppearance>(() => defaultShareAppearance(categoryId, themeMode));
  const [format, setFormat] = useState<ShareFormat>(
    () =>
      initialFormat ??
      (single &&
      (shareItemsByLanguage?.[language] ?? shareItems ?? items.map((item) => toShareItem(item, language))).every(
        (item) => item.reminder,
      )
        ? "portrait"
        : "story"),
  );
  const [meaning, setMeaning] = useState(false);
  const [wordMeanings, setWordMeanings] = useState(false);
  const [exportLanguage, setExportLanguage] = useState<AppLanguage>(language);
  const [pronunciation, setPronunciation] = useState(false);
  const [benefit, setBenefit] = useState(false);
  const [qr, setQr] = useState(false);
  const [subtitle, setSubtitle] = useState(false);
  const [source, setSource] = useState(true);
  const [mode, setMode] = useState<"image" | "text" | "link">("image");
  const curatedPack = useMemo(() => (!single ? getCuratedRoutinePack(categoryId) : null), [categoryId, single]);
  const [imageSource, setImageSource] = useState<"curated" | "generated">("generated");
  const [curatedIndex, setCuratedIndex] = useState(0);
  const [curatedFiles, setCuratedFiles] = useState<File[]>([]);
  const [curatedPreviewUrls, setCuratedPreviewUrls] = useState<string[]>([]);
  const [curatedLoading, setCuratedLoading] = useState(false);
  const [curatedUnavailable, setCuratedUnavailable] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [pages, setPages] = useState<GeneratedCollectionStoryCard[]>([]);
  const [active, setActive] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [compatibleFormats, setCompatibleFormats] = useState<ShareFormat[] | null>(null);
  const [fitFailed, setFitFailed] = useState(false);
  const [scope, setScope] = useState<"current" | "selected" | "all">(initialScope);
  const [selected, setSelected] = useState<number[]>([]);
  const activeItemRef = useRef<string | undefined>(undefined);
  const operationLock = useRef(false);
  const descriptionId = useId();
  const languageHintId = useId();
  const actionHintId = useId();
  const copyHintId = useId();
  const shareHintId = useId();
  const languageId = useId();
  const presetId = useId();
  const collectionUrl =
    shareUrl ??
    (categoryId
      ? getShareUrl(categoryId, single ? readerIndex : undefined, undefined, { routineMode, prayer })
      : undefined);
  // Screen composition can recreate arrays on its minute/audio clock. Only changed
  // content should restart an expensive export, never a parent render alone.
  const itemsJson = JSON.stringify({ items, shareItems, shareItemsByLanguage });
  const stableInput = useMemo(
    () =>
      JSON.parse(itemsJson) as {
        items: Zikr[];
        shareItems?: ShareItem[];
        shareItemsByLanguage?: Record<AppLanguage, ShareItem[]>;
      },
    [itemsJson],
  );
  const collectionName = (exportLanguage === "ar" ? collectionTitleArabic : collectionTitleEnglish) ?? collectionTitle;
  const title =
    single &&
    categoryId &&
    !stableInput.items.some((item) => (item.mushafPages?.length ?? 0) > 1) &&
    !stableInput.shareItems?.some((item) => item.reminder)
      ? t(exportLanguage, "shareStudio.singleCollectionTitle", { collection: collectionName })
      : collectionName;
  const content = useMemo(
    () => ({
      meaning,
      wordMeanings: wordMeanings && exportLanguage === "ar",
      pronunciation,
      benefit,
      qr,
      subtitle,
      source,
    }),
    [meaning, wordMeanings, exportLanguage, pronunciation, benefit, qr, subtitle, source],
  );
  const exportItems = useMemo<ShareItem[]>(
    () =>
      (
        stableInput.shareItemsByLanguage?.[exportLanguage] ??
        stableInput.shareItems ??
        stableInput.items.map((z) => toShareItem(z, exportLanguage))
      ).map((item) => (single && !item.reminder && (categoryId || !item.title) ? { ...item, title } : item)),
    [stableInput, exportLanguage, single, title, categoryId],
  );
  const url = single && exportItems[0]?.reminder ? exportItems[0].readingUrl : collectionUrl;
  const text = getShareText(exportItems, exportLanguage, content, title, url);
  const uniqueItems = (items: ShareItem[]) => [...new Map(items.map((item) => [item.id, item])).values()];
  const current = pages[active];
  const total = current?.totalPages ?? pages.length;
  const ready = Boolean(current);
  const allReady = ready && !generating;
  const scopedPages =
    scope === "all"
      ? pages
      : scope === "selected"
        ? pages.filter((_, index) => selected.includes(index))
        : current
          ? [current]
          : [];
  const isCuratedActive = mode === "image" && Boolean(curatedPack) && imageSource === "curated";
  const currentCuratedCard: CuratedRoutineCard | undefined = curatedPack?.cards[curatedIndex];
  const totalCurated = curatedPack?.cards.length ?? 0;
  const scopedNative = isCuratedActive
    ? curatedFiles.length > 0 && canShareMultipleFiles(curatedFiles)
    : scopedPages.length > 0 && canShareMultipleFiles(scopedPages.map((page) => page.file));
  const scopeReady = isCuratedActive
    ? curatedFiles.length > 0 && !curatedLoading
    : scopedPages.length > 0 && (scope === "current" ? ready : allReady);
  const scopedText =
    scope === "current"
      ? getShareText(
          uniqueItems(current?.layout?.fragments.map((fragment) => fragment.item) ?? exportItems),
          exportLanguage,
          content,
          title,
          url,
        )
      : scope === "selected"
        ? getShareText(
            uniqueItems(scopedPages.flatMap((page) => page.layout?.fragments.map((fragment) => fragment.item) ?? [])),
            exportLanguage,
            content,
            title,
            url,
          )
        : text;
  const nativeText = supportsTextShare(mode === "link" ? { title, url } : { title, text: scopedText });
  const payload = mode === "link" ? (url ?? "") : scopedText;
  const payloadReady = mode === "link" ? Boolean(url) : scope !== "selected" || selected.length > 0;
  const copyAsImage =
    mode === "image" && (isCuratedActive ? canCopyImage() : scopedPages.length === 1 && canCopyImage());

  useEffect(() => {
    const urls = curatedFiles.map((file) => URL.createObjectURL(file));
    setCuratedPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [curatedFiles]);

  useEffect(() => {
    setImageSource("generated");
    setCuratedIndex(0);
  }, [curatedPack]);

  useEffect(() => {
    if (!open || !curatedPack || imageSource !== "curated") return;
    let cancelled = false;
    setCuratedFiles([]);
    setCuratedUnavailable(false);
    setCuratedLoading(true);
    fetchAllCuratedCardFiles(curatedPack, exportLanguage)
      .then((files) => {
        if (!cancelled) {
          setCuratedFiles(files);
          setCuratedLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCuratedLoading(false);
          setCuratedFiles([]);
          setCuratedUnavailable(true);
          setImageSource("generated");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, curatedPack, exportLanguage, imageSource]);
  useEffect(() => {
    if (current?.layout?.fragments[0]) activeItemRef.current = current.layout.fragments[0].item.id;
  }, [current]);
  const subtitleKey =
    categoryId === "morning"
      ? "morningSubtitle"
      : categoryId === "evening"
        ? "eveningSubtitle"
        : categoryId === "before_sleep"
          ? "sleepSubtitle"
          : "generalSubtitle";

  useEffect(() => {
    if (!open || !exportItems.length) return;
    const controller = new AbortController();
    let ownedPages: GeneratedCollectionStoryCard[] = [];
    setGenerating(true);
    setFailed(false);
    setFitFailed(false);
    setCompatibleFormats(null);
    setSelected([]);
    setPages([]);
    setActive(0);
    setStatus("");
    const rememberedId = activeItemRef.current;
    getCompatibleShareFormats(exportItems, content, single)
      .then((formats) => {
        if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        setCompatibleFormats(formats);
        if (!formats.includes(format)) throw new ShareFitError("selection", format);
        return generateAllCollectionStoryPages({
          collectionTitle: title,
          contentAlignment,
          collectionSubtitle: single ? collectionSubtitle : t(exportLanguage, `shareStudio.${subtitleKey}`),
          allItems: exportItems,
          appearance,
          format,
          content,
          single,
          url,
          qr,
          language: exportLanguage,
          signal: controller.signal,
          onPage: (page) => {
            if (!controller.signal.aborted) setPages((previous) => [...previous, page]);
          },
        });
      })
      .then((result) => {
        ownedPages = result;
        if (controller.signal.aborted) {
          releaseSharePages(result);
          return;
        }
        setPages(result);
        const remembered = result.findIndex((page) =>
          page.layout?.fragments.some((fragment) => fragment.item.id === rememberedId),
        );
        setActive(Math.max(0, remembered));
        setGenerating(false);
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setPages([]);
        setGenerating(false);
        setFailed(true);
        setFitFailed(cause instanceof ShareFitError);
      });
    return () => {
      controller.abort();
      releaseSharePages(ownedPages);
    };
  }, [
    open,
    exportItems,
    title,
    contentAlignment,
    collectionSubtitle,
    exportLanguage,
    subtitleKey,
    appearance,
    format,
    content,
    single,
    url,
    qr,
    retry,
  ]);

  const run = async (action: () => Promise<void> | void) => {
    if (operationLock.current) return;
    operationLock.current = true;
    setBusy(true);
    setError(false);
    setStatus("");
    try {
      await action();
    } catch {
      setError(true);
      setStatus(t(language, "shareStudio.actionError"));
    } finally {
      operationLock.current = false;
      setBusy(false);
    }
  };
  const notify = (value: "sharing" | "downloading" | "shared" | "downloaded" | "cancelled") =>
    setStatus(value === "cancelled" ? "" : t(language, `shareStudio.${value}`));
  const copyText = async (value: string) => {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(value);
    setStatus(t(language, "shareStudio.copied"));
  };
  const shareText = async (value: string, link = false) => {
    if (!supportsTextShare(link ? { title, url: value } : { title, text: value })) {
      await copyText(value);
      return;
    }
    try {
      await navigator.share(link ? { title, url: value } : { title, text: value });
      setStatus(t(language, "shareStudio.shared"));
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        setStatus("");
        return;
      }
      throw cause;
    }
  };
  const onPreviewKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(pages.length - 1);
    else
      setActive((value) =>
        Math.min(
          pages.length - 1,
          Math.max(0, value + ((event.key === "ArrowLeft") === (direction === "rtl") ? 1 : -1)),
        ),
      );
  };

  const selectClass = "flex min-w-0 flex-col gap-2";
  const additions = [
    meaning && t(language, "shareStudio.translation"),
    wordMeanings && exportLanguage === "ar" && t(language, "shareStudio.wordMeanings"),
    pronunciation && t(language, "shareStudio.transliteration"),
    benefit && t(language, "shareStudio.benefit"),
    mode === "image" && qr && t(language, "shareStudio.qr"),
    mode === "image" && subtitle && t(language, "shareStudio.subtitle"),
  ]
    .filter(Boolean)
    .join(" · ");
  const actionHint =
    mode !== "image"
      ? ""
      : isCuratedActive
        ? curatedLoading
          ? t(language, "shareStoryPack.generating")
          : totalCurated > 1
            ? t(language, "shareStudio.archiveCount", { count: formatNumerals(totalCurated, language) })
            : ""
        : fitFailed
          ? t(language, "shareStudio.chooseSize")
          : generating
            ? t(language, "shareStoryPack.generating")
            : failed
              ? t(language, "shareStudio.retryHint")
              : scope === "selected" && !selected.length
                ? t(language, "shareStudio.chooseCards")
                : scopedPages.length > 1
                  ? t(language, "shareStudio.archiveCount", { count: formatNumerals(scopedPages.length, language) })
                  : "";
  const pageLabel = t(language, "shareStoryPack.pageCount", {
    current: formatNumerals(active + 1, language),
    total: formatNumerals(total || 1, language),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={dialogTitle ?? t(language, single ? "shareStudio.singleTitle" : "shareStoryPack.modalTitle")}
      direction={direction}
      language={language}
      describedById={descriptionId}
      testId="collection-share-modal"
      maxWidthClassName="max-w-5xl"
      className="!h-[calc(100dvh-16px)] !max-h-[calc(100dvh-16px)] !w-[calc(100%-16px)] gap-0"
    >
      <div data-testid="sharing-scroll" className="min-h-0 flex-1 overflow-y-auto scroll-py-4">
        <div className="shrink-0 border-b border-border px-[16px] py-[12px] pe-[96px]">
          <p className="text-lg font-bold" aria-hidden="true">
            {dialogTitle ?? t(language, single ? "shareStudio.singleTitle" : "shareStudio.collectionTitle")}
          </p>
          <p className="text-sm text-muted-foreground break-words">{collectionTitle}</p>
        </div>
        <div role="group" aria-label={t(language, "shareStudio.method")} className="mx-[16px] my-[12px] shrink-0">
          <p className="sr-only">{t(language, "shareStudio.method")}</p>
          <div className="flex flex-wrap gap-2 items-start">
            {(["image", "text", "link"] as const).map((value) => (
              <Button
                key={value}
                variant={mode === value ? (value === "image" ? "default" : "outline") : "ghost"}
                aria-pressed={mode === value}
                onClick={() => {
                  if (value === "text" && !ready) setScope("all");
                  setMode(value);
                }}
                disabled={busy || (value === "link" && !url)}
                className={`min-h-11 h-auto border whitespace-normal break-words ${mode === value ? (value === "image" ? "border-primary" : SHARING_SELECTED_CLASS) : "border-transparent"}`}
                style={{ paddingInline: 4, flex: value === "image" ? "2 1 8rem" : "1 1 4rem" }}
              >
                <SharingChoiceLabel selected={mode === value}>{t(language, `shareStudio.${value}`)}</SharingChoiceLabel>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-[16px] pb-[16px] space-y-4">
          <div
            className={mode === "image" && !inspect ? "grid gap-4" : "space-y-4"}
            dir={direction === "rtl" ? "ltr" : "rtl"}
            style={
              wide && mode === "image" && !inspect ? { gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)" } : undefined
            }
          >
            <section data-testid="sharing-preview" dir={direction} className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-title font-bold">{t(language, "shareStudio.previewHeading")}</h2>
                {mode === "image" && (isCuratedActive ? Boolean(currentCuratedCard) : ready) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 h-auto whitespace-normal text-label"
                    aria-pressed={inspect}
                    onKeyDown={onPreviewKeyDown}
                    onClick={() => setInspect((value) => !value)}
                  >
                    {t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                  </Button>
                )}
              </div>
              {mode === "image" ? (
                <>
                  <div role="group" aria-label={t(language, "shareStudio.preview")}>
                    {failed && !isCuratedActive ? (
                      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-start space-y-3">
                        <h3 className="font-bold">
                          {t(language, fitFailed ? "shareStudio.fitTitle" : "shareStudio.generationTitle")}
                        </h3>
                        <p role="alert">
                          {t(language, fitFailed ? "shareStudio.fitError" : "shareStudio.generationHint")}
                        </p>
                        {fitFailed ? (
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {compatibleFormats?.map((value, index) => (
                              <Button
                                key={value}
                                variant={index === 0 ? "default" : "outline"}
                                className="min-h-11 h-auto whitespace-normal"
                                onClick={() => setFormat(value)}
                              >
                                {t(language, "shareStudio.useSize", { size: t(language, `shareStudio.${value}`) })}
                              </Button>
                            ))}
                            <p className="w-full text-sm text-muted-foreground">
                              {t(language, "shareStudio.alternativeHint")}
                            </p>
                          </div>
                        ) : (
                          <Button className="mt-3" onClick={() => setRetry((value) => value + 1)}>
                            {t(language, "common.tryAgain")}
                          </Button>
                        )}
                      </div>
                    ) : isCuratedActive && currentCuratedCard ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onKeyDown={onPreviewKeyDown}
                          onClick={() => setInspect((value) => !value)}
                          aria-label={t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                          aria-pressed={inspect}
                          className="flex w-full items-center justify-center rounded-2xl p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                          style={{ height: inspect ? "min(75dvh,800px)" : "clamp(240px,calc(100dvh - 260px),720px)" }}
                        >
                          <img
                            src={
                              curatedPreviewUrls[curatedIndex] ?? resolveCuratedImageUrl(currentCuratedCard.imagePath)
                            }
                            alt={language === "ar" ? currentCuratedCard.altText.ar : currentCuratedCard.altText.en}
                            className="h-full max-w-full w-auto object-contain rounded-xl shadow-raised"
                          />
                        </button>
                        {totalCurated > 1 && (
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={curatedIndex <= 0 || busy}
                              aria-label={t(language, "shareStoryPack.previousPage")}
                              onKeyDown={onPreviewKeyDown}
                              onClick={() => setCuratedIndex((value) => Math.max(0, value - 1))}
                              className="size-11"
                            >
                              <ChevronPrevious data-rtl-flip aria-hidden="true" />
                            </Button>
                            <div className="flex flex-col items-center gap-1">
                              <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
                                {t(language, "shareStudio.curatedCardPage", {
                                  page: formatNumerals(curatedIndex + 1, language),
                                  total: formatNumerals(totalCurated, language),
                                })}
                              </span>
                              <div className="flex gap-1" aria-hidden="true">
                                {curatedPack?.cards.map((_, dotIndex) => (
                                  <span
                                    key={dotIndex}
                                    className={`size-1.5 rounded-full transition-colors ${
                                      dotIndex === curatedIndex ? "bg-primary" : "bg-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={curatedIndex >= totalCurated - 1 || busy}
                              aria-label={t(language, "shareStoryPack.nextPage")}
                              onKeyDown={onPreviewKeyDown}
                              onClick={() => setCuratedIndex((value) => Math.min(totalCurated - 1, value + 1))}
                              className="size-11"
                            >
                              <ChevronNext data-rtl-flip aria-hidden="true" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : current ? (
                      <button
                        type="button"
                        onKeyDown={onPreviewKeyDown}
                        onClick={() => setInspect((value) => !value)}
                        aria-label={t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                        aria-pressed={inspect}
                        className="flex w-full items-center justify-center rounded-2xl p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        style={{
                          height: inspect
                            ? "min(75dvh,800px)"
                            : wide
                              ? "clamp(240px,calc(100dvh - 260px),720px)"
                              : undefined,
                          aspectRatio: !inspect && !wide ? `${current.width} / ${current.height}` : undefined,
                          maxHeight: !inspect && !wide ? "65dvh" : undefined,
                        }}
                      >
                        <img
                          src={current.dataUrl}
                          alt={current.altText}
                          width={current.width}
                          height={current.height}
                          className="h-full max-w-full w-auto object-contain rounded-xl shadow-raised"
                        />
                      </button>
                    ) : (
                      <p role="status" className="py-12 text-center text-sm">
                        {t(language, "shareStoryPack.generating")}
                      </p>
                    )}
                    {!isCuratedActive && ready && total > 1 && (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={active <= 0 || busy}
                          aria-label={t(language, "shareStoryPack.previousPage")}
                          onKeyDown={onPreviewKeyDown}
                          onClick={() => setActive((value) => value - 1)}
                          className="size-11"
                        >
                          <ChevronPrevious data-rtl-flip aria-hidden="true" />
                        </Button>
                        <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
                          {pageLabel}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={active >= pages.length - 1 || busy}
                          aria-label={t(language, "shareStoryPack.nextPage")}
                          onKeyDown={onPreviewKeyDown}
                          onClick={() => setActive((value) => value + 1)}
                          className="size-11"
                        >
                          <ChevronNext data-rtl-flip aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {generating && ready && (
                    <p role="status" className="text-sm text-muted-foreground">
                      {t(language, "shareStudio.remaining")}
                    </p>
                  )}
                  {!isCuratedActive && current?.layout && (
                    <SharingDisclosure label={t(language, "shareStudio.readCard")}>
                      <div className="pb-3 space-y-4">
                        {current.layout.fragments.map((fragment, index) => (
                          <div key={`${fragment.item.id}-${index}`}>
                            {(fragment.heading?.text ?? fragment.item.title) && (
                              <h3 className="whitespace-pre-wrap font-semibold">
                                {shareDisplayDigits(fragment.heading?.text ?? fragment.item.title!, exportLanguage)}
                              </h3>
                            )}
                            {!fragment.item.hideRepetition && (
                              <p className="text-sm text-muted-foreground">
                                {getShareItemRepetitionLabel(fragment.item, exportLanguage)}
                              </p>
                            )}
                            {fragment.part > 1 && (
                              <p className="text-sm font-semibold text-primary">
                                {t(exportLanguage, "shareStudio.continuedBefore")}
                              </p>
                            )}
                            {[...fragment.sections, ...(fragment.citation ? [fragment.citation] : [])].map(
                              (section, sectionIndex) => (
                                <p
                                  key={`${section.key}-${sectionIndex}`}
                                  lang={section.direction === "rtl" ? "ar" : "en"}
                                  dir={section.direction}
                                  className={`whitespace-pre-wrap break-words text-base leading-relaxed ${section.direction === "rtl" ? "zikr-text" : ""}`}
                                  style={section.quranText ? QURAN_TEXT_STYLE : undefined}
                                >
                                  {section.key !== "arabic" && section.key !== "source" && (
                                    <strong className="block text-sm">
                                      {t(exportLanguage, `shareStudio.${section.key}`)}
                                    </strong>
                                  )}
                                  {section.quranText ? (
                                    <QuranVerseText
                                      text={section.text}
                                      language={exportLanguage}
                                      canonicalKey={fragment.item.canonicalKey}
                                    />
                                  ) : (
                                    shareDisplayDigits(
                                      section.displayText ?? section.text,
                                      section.direction === "rtl" ? "ar" : "en",
                                    )
                                  )}
                                </p>
                              ),
                            )}
                            {fragment.part < fragment.parts && (
                              <p className="text-sm font-semibold text-primary">
                                {t(exportLanguage, "shareStudio.continuedAfter")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </SharingDisclosure>
                  )}
                  {!isCuratedActive && total > 1 && (
                    <SharingDisclosure
                      open={scope === "selected" || undefined}
                      label={t(language, "shareStudio.overview")}
                    >
                      <div
                        className="grid gap-3 pt-2"
                        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,8rem),1fr))" }}
                      >
                        {pages.map((page, index) => (
                          <div key={page.file.name}>
                            <button
                              type="button"
                              aria-label={t(language, "shareStudio.goToCard", {
                                count: formatNumerals(index + 1, language),
                              })}
                              aria-pressed={active === index}
                              onClick={() => setActive(index)}
                              disabled={busy}
                              className={`relative min-h-11 min-w-11 w-full rounded-xl border p-2 focus-visible:ring-[3px] focus-visible:ring-ring ${active === index ? "border-primary bg-muted" : "border-border"}`}
                            >
                              <img src={page.dataUrl} alt="" className="mx-auto h-24 w-full object-contain" />
                              <span>{formatNumerals(index + 1, language)}</span>
                              {active === index && <Check aria-hidden="true" className="absolute end-1 top-1 size-4" />}
                            </button>
                            {scope === "selected" && (
                              <label className="min-h-11 flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(index)}
                                  disabled={busy}
                                  onChange={(event) =>
                                    setSelected((previous) =>
                                      event.target.checked
                                        ? [...previous, index]
                                        : previous.filter((value) => value !== index),
                                    )
                                  }
                                />
                                <span className="min-w-0 break-words">
                                  {t(language, "shareStudio.selectCard", {
                                    count: formatNumerals(index + 1, language),
                                  })}
                                </span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </SharingDisclosure>
                  )}
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    {t(language, mode === "text" ? "shareStudio.textPreview" : "shareStudio.linkPreview")}
                    <textarea
                      readOnly
                      value={mode === "text" ? scopedText : (url ?? "")}
                      dir="auto"
                      rows={mode === "text" ? 9 : 3}
                      className="w-full resize-y rounded-xl border border-border bg-background p-3 text-base leading-relaxed font-normal"
                    />
                  </label>
                </>
              )}
            </section>
            <section data-testid="sharing-settings" dir={direction} className="min-w-0 space-y-4">
              {curatedPack && !curatedUnavailable && mode === "image" && (
                <div
                  role="group"
                  aria-label={t(language, "shareStudio.image")}
                  className="mt-3 grid gap-2 items-start"
                  style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,8rem),1fr))" }}
                >
                  <Button
                    variant="outline"
                    aria-pressed={imageSource === "curated"}
                    onClick={() => setImageSource("curated")}
                    disabled={busy}
                    className={`min-h-11 h-auto whitespace-normal break-words ${imageSource === "curated" ? SHARING_SELECTED_CLASS : ""}`}
                    style={{ paddingInline: 4 }}
                  >
                    <SharingChoiceLabel selected={imageSource === "curated"}>
                      {t(language, "shareStudio.curatedTab")}
                    </SharingChoiceLabel>
                  </Button>
                  <Button
                    variant="outline"
                    aria-pressed={imageSource === "generated"}
                    onClick={() => setImageSource("generated")}
                    disabled={busy}
                    className={`min-h-11 h-auto whitespace-normal break-words ${imageSource === "generated" ? SHARING_SELECTED_CLASS : ""}`}
                    style={{ paddingInline: 4 }}
                  >
                    <SharingChoiceLabel selected={imageSource === "generated"}>
                      {t(language, "shareStudio.generatedTab")}
                    </SharingChoiceLabel>
                  </Button>
                </div>
              )}
              {isCuratedActive && curatedPack && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h3 className="font-bold text-sm text-foreground">{t(language, "shareStudio.overview")}</h3>
                  <p className="text-xs text-muted-foreground">{t(language, "shareStudio.curatedHint")}</p>
                  <div
                    className="grid gap-2 pt-1"
                    style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,6rem),1fr))" }}
                  >
                    {curatedPack.cards.map((card, idx) => (
                      <button
                        key={card.id}
                        type="button"
                        aria-label={t(language, "shareStudio.goToCard", {
                          count: formatNumerals(idx + 1, language),
                        })}
                        aria-pressed={curatedIndex === idx}
                        onClick={() => setCuratedIndex(idx)}
                        disabled={busy}
                        className={`relative min-h-11 w-full rounded-xl border p-1.5 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring ${
                          curatedIndex === idx ? "border-primary bg-muted/60" : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <img
                          src={curatedPreviewUrls[idx] ?? resolveCuratedImageUrl(card.imagePath)}
                          alt=""
                          className="mx-auto h-20 w-full object-contain rounded-lg"
                        />
                        <span className="block mt-1 text-xs font-semibold text-center">
                          {formatNumerals(idx + 1, language)}
                        </span>
                        {curatedIndex === idx && (
                          <Check aria-hidden="true" className="absolute end-1 top-1 size-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!isCuratedActive && !single && mode !== "link" && total > 1 && (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">{t(language, "shareStudio.scope")}</legend>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2">
                    {(["current", "selected", "all"] as const).map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        aria-pressed={scope === value}
                        disabled={busy}
                        onClick={() => setScope(value)}
                        className={`min-h-11 h-auto whitespace-normal py-2 ${scope === value ? SHARING_SELECTED_CLASS : ""}`}
                        style={{ paddingInline: 4 }}
                      >
                        <SharingChoiceLabel selected={scope === value}>
                          {t(language, `shareStudio.scope${value}`)}
                        </SharingChoiceLabel>
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm" role="status">
                    {t(
                      language,
                      scopedPages.length === 0
                        ? "shareStudio.noCards"
                        : scopedPages.length === 1
                          ? "shareStudio.oneCard"
                          : scopedPages.length === 2
                            ? "shareStudio.twoCards"
                            : scopedPages.length >= 11
                              ? "shareStudio.manyCards"
                              : "shareStudio.imageCount",
                      { count: formatNumerals(scopedPages.length, language) },
                    )}
                  </p>
                  {scope === "selected" && (
                    <p className="text-sm text-muted-foreground">{t(language, "shareStudio.selectionHint")}</p>
                  )}
                </fieldset>
              )}

              {mode === "image" && !isCuratedActive && (
                <SharingDisclosure
                  open={wide || undefined}
                  label={t(language, "shareStudio.imageSettings")}
                  summary={t(language, `shareStudio.${format}`)}
                >
                  {mode === "image" && (
                    <>
                      <fieldset>
                        <legend className="mb-2 text-sm font-semibold">
                          {t(language, "shareStoryPack.themeLabel")}
                        </legend>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2">
                          {(["olive", "gold", "lavender"] as const).map((value) => (
                            <Button
                              key={value}
                              variant="outline"
                              aria-label={t(language, `shareStudio.${value}`)}
                              aria-pressed={appearance === value}
                              disabled={busy}
                              onClick={() => setAppearance(value)}
                              className={`min-h-11 h-auto w-full flex-col whitespace-normal py-3 ${appearance === value ? SHARING_SELECTED_CLASS : ""}`}
                              style={{ paddingInline: 4 }}
                            >
                              <span
                                aria-hidden="true"
                                className="flex h-12 w-10 flex-col gap-1 rounded border p-1"
                                style={{
                                  backgroundColor: SHARE_PALETTES[value].background,
                                  borderColor: SHARE_PALETTES[value].accent,
                                  color: SHARE_PALETTES[value].accent,
                                }}
                              >
                                <span className="h-1 w-4 self-center rounded bg-current" />
                                <span
                                  className="flex-1 rounded flex flex-col gap-1 p-1"
                                  style={{ backgroundColor: SHARE_PALETTES[value].surface }}
                                >
                                  <span className="h-1 rounded bg-current" />
                                  <span className="h-1 rounded bg-current" />
                                </span>
                              </span>
                              <SharingChoiceLabel selected={appearance === value}>
                                <span className="font-bold">{t(language, `shareStudio.${value}Name`)}</span>
                              </SharingChoiceLabel>
                              <span className="text-xs font-normal text-muted-foreground">
                                {t(language, `shareStudio.${value}Time`)}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </fieldset>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className={selectClass}>
                          <label className={FIELD_LABEL_CLASS} id={languageId} htmlFor={`${languageId}-control`}>
                            {t(language, "shareStudio.cardLanguage")}
                          </label>
                          <Select
                            value={exportLanguage}
                            onValueChange={(value) => setExportLanguage(value as AppLanguage)}
                            disabled={busy}
                            dir={direction}
                          >
                            <SelectTrigger
                              id={`${languageId}-control`}
                              aria-labelledby={languageId}
                              aria-describedby={languageHintId}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[110]">
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                          <p id={languageHintId} className="text-xs text-muted-foreground">
                            {t(
                              language,
                              shareItemsByLanguage ? "shareStudio.evidenceLanguageHint" : "shareStudio.languageHint",
                            )}
                          </p>
                        </div>
                        <ShareFormatSelect
                          value={format}
                          onChange={setFormat}
                          language={language}
                          disabled={busy}
                          compatibleFormats={compatibleFormats}
                        />
                      </div>
                    </>
                  )}
                </SharingDisclosure>
              )}
              {mode !== "link" && !isCuratedActive && (
                <SharingDisclosure
                  label={t(language, "shareStudio.contentOptions")}
                  summary={additions || t(language, "shareStudio.noAdditions")}
                >
                  <div className="pb-2">
                    <div className={`${selectClass} mb-3`}>
                      <label htmlFor={presetId} className={FIELD_LABEL_CLASS}>
                        {t(language, "shareStudio.preset")}
                      </label>
                      <Select
                        dir={direction}
                        value={
                          !meaning && !wordMeanings && !pronunciation && !benefit
                            ? "arabic"
                            : meaning && !wordMeanings && !pronunciation && !benefit
                              ? "translated"
                              : meaning && pronunciation && benefit && (exportLanguage !== "ar" || wordMeanings)
                                ? "full"
                                : "custom"
                        }
                        disabled={busy}
                        onValueChange={(value) => {
                          if (value === "custom") return;
                          setMeaning(value !== "arabic");
                          setPronunciation(value === "full");
                          setBenefit(value === "full");
                          setWordMeanings(value === "full" && exportLanguage === "ar");
                        }}
                      >
                        <SelectTrigger id={presetId}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          {(["arabic", "translated", "full", "custom"] as const).map((value) => (
                            <SelectItem key={value} value={value}>
                              {t(language, `shareStudio.preset${value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {[
                      {
                        key: "includeSources",
                        value: source,
                        set: setSource,
                        available: exportItems.some((item) => item.sourceReference),
                      },
                      {
                        key: "meaning",
                        value: meaning,
                        set: setMeaning,
                        available: exportItems.some((item) => item.translation),
                      },
                      {
                        key: "wordMeanings",
                        value: wordMeanings,
                        set: setWordMeanings,
                        available: exportLanguage === "ar" && exportItems.some((item) => item.wordMeanings),
                      },
                      {
                        key: "pronunciation",
                        value: pronunciation,
                        set: setPronunciation,
                        available: exportItems.some((item) => item.transliteration),
                      },
                      {
                        key: "benefit",
                        value: benefit,
                        set: setBenefit,
                        available: exportItems.some((item) => item.benefit && !item.reminder),
                      },
                      {
                        key: "qr",
                        value: qr,
                        set: setQr,
                        available: mode === "image" && Boolean(url) && exportItems.some((item) => !item.reminder),
                      },
                      {
                        key: "subtitle",
                        value: subtitle,
                        set: setSubtitle,
                        available: mode === "image" && !single && Boolean(collectionSubtitle),
                      },
                    ]
                      .filter((option) => option.available)
                      .map((option) => (
                        <label key={option.key} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={option.value}
                            onChange={(event) => option.set(event.target.checked)}
                            disabled={busy}
                            className="size-5 accent-primary"
                          />
                          <span>{t(language, `shareStudio.${option.key}`)}</span>
                        </label>
                      ))}
                    {exportItems.some((item) => item.sourceReference) && (
                      <p className="text-xs text-muted-foreground">{t(language, "shareStudio.sourceHint")}</p>
                    )}
                    {exportItems.some((item) => item.reminder) && (
                      <p className="mt-2 text-xs text-muted-foreground">{t(language, "shareStudio.reminderHint")}</p>
                    )}
                  </div>
                </SharingDisclosure>
              )}
            </section>
          </div>
          <div
            role={error ? "alert" : "status"}
            aria-live={error ? "assertive" : "polite"}
            aria-atomic="true"
            className={error ? "text-sm text-foreground" : "sr-only"}
          >
            {status}
          </div>
          <DialogPrimitive.Description id={descriptionId} className="sr-only">
            {dialogDescription ?? t(language, "shareStudio.description")}
          </DialogPrimitive.Description>
        </div>
      </div>
      <div
        data-testid="sharing-actions"
        className="shrink-0 border-t border-border bg-card p-[12px] pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        {actionHint && (
          <p id={actionHintId} className="mb-2 text-sm text-muted-foreground">
            {actionHint}
          </p>
        )}
        <div className={`grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2 ${wide ? "ms-auto max-w-md" : ""}`}>
          <Button
            variant={(mode === "image" ? scopedNative : nativeText) ? "default" : "outline"}
            className="min-h-12 gap-1 px-2 whitespace-nowrap"
            aria-describedby={
              !(mode === "image" ? scopedNative : nativeText) ? shareHintId : actionHint ? actionHintId : undefined
            }
            title={
              !(mode === "image" ? scopedNative : nativeText) ? t(language, "shareStudio.shareUnavailable") : undefined
            }
            disabled={busy || (mode === "image" ? !scopeReady || !scopedNative : !nativeText || !payloadReady)}
            aria-busy={busy}
            onClick={() =>
              void run(async () => {
                if (mode !== "image") {
                  await shareText(payload, mode === "link");
                } else if (isCuratedActive) {
                  if (curatedFiles.length === 1) {
                    await shareSingleFile(curatedFiles[0]!, {
                      title,
                      downloadFallback: false,
                      onStatus: notify,
                    });
                  } else {
                    await shareMultipleFiles(curatedFiles, {
                      title,
                      downloadFallback: false,
                      onStatus: notify,
                    });
                  }
                } else if (scopedPages.length === 1) {
                  await shareSingleFile(scopedPages[0]!.file, { title, downloadFallback: false, onStatus: notify });
                } else {
                  await shareMultipleFiles(
                    scopedPages.map((page) => page.file),
                    {
                      title,
                      downloadFallback: false,
                      onStatus: notify,
                    },
                  );
                }
              })
            }
          >
            <Share2 aria-hidden="true" />
            {t(language, "shareStudio.share")}
          </Button>
          <Button
            variant={(mode === "image" ? scopedNative : nativeText) ? "outline" : "default"}
            className="min-h-12 gap-1 px-2 whitespace-nowrap"
            disabled={busy || (mode === "image" ? !scopeReady : !payloadReady)}
            aria-describedby={actionHint ? actionHintId : undefined}
            onClick={() =>
              void run(async () => {
                downloadFile(
                  mode !== "image"
                    ? new File([payload], "azkar.txt", { type: "text/plain;charset=utf-8" })
                    : isCuratedActive
                      ? curatedFiles.length === 1
                        ? curatedFiles[0]!
                        : await createShareArchive(curatedFiles, scopedText)
                      : scopedPages.length === 1
                        ? scopedPages[0]!.file
                        : await createShareArchive(
                            scopedPages.map((page) => page.file),
                            scopedText,
                          ),
                );
                notify("downloaded");
              })
            }
          >
            <Download aria-hidden="true" />
            {t(language, "shareStudio.save")}
          </Button>
          <Button
            variant="ghost"
            className="min-h-12 gap-1 px-2 whitespace-nowrap"
            aria-describedby={copyHintId}
            title={t(
              language,
              mode === "image"
                ? copyAsImage
                  ? "shareStoryPack.copySingle"
                  : "shareStudio.imageCopyUnavailable"
                : "shareStudio.copyText",
            )}
            disabled={busy || (mode === "image" ? !scopeReady || !copyAsImage : !payloadReady)}
            onClick={() =>
              void run(async () => {
                if (isCuratedActive && currentCuratedCard) {
                  if (!(await copyCuratedCardImage(currentCuratedCard))) {
                    setError(true);
                    setStatus(t(language, "shareStudio.copyCuratedError"));
                    return;
                  }
                  setStatus(t(language, "shareStudio.copyCuratedSuccess"));
                } else if (copyAsImage) {
                  if (!(await copyImageToClipboard(scopedPages[0]!.blob))) {
                    setError(true);
                    setStatus(t(language, "shareStudio.copyFailed"));
                    return;
                  }
                  setStatus(t(language, "shareStoryPack.copySuccess"));
                } else {
                  await copyText(payload);
                }
              })
            }
          >
            <Copy aria-hidden="true" />
            {t(language, "shareStudio.copy")}
          </Button>
        </div>
        <span id={copyHintId} className="sr-only">
          {t(
            language,
            mode === "image"
              ? copyAsImage
                ? "shareStoryPack.copySingle"
                : "shareStudio.imageCopyUnavailable"
              : "shareStudio.copyText",
          )}
        </span>
        <span id={shareHintId} className="sr-only">
          {t(language, "shareStudio.shareUnavailable")}
        </span>
      </div>
    </Modal>
  );
}
