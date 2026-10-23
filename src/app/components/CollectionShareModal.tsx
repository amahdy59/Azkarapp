import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Check,
  Copy,
  Download,
  Share2,
  Maximize,
  Minimize,
  FileText,
  Brush,
  Globe,
  Translate,
  SlidersHorizontal,
} from "./icons";
import { SharingArtworkChoice } from "./SharingArtworkChoice";
import { t } from "../i18n";
import { FIELD_LABEL_CLASS } from "./FormField";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { QuranVerseText } from "./QuranVerseText";
import { SharingCaption } from "./SharingCaption";
import { getImageCaption, getReadingLink } from "../share/shareCaption";
import { ShareFormatSelect } from "./ShareFormatSelect";
import { SharingArrow, SharingSteps, SharingStepNavigation, type SharingStep } from "./SharingSteps";
import { getShareAvailability, sharePresetOptions } from "../share/shareAvailability";
import { SharingDisclosure } from "./SharingDisclosure";
import { SharingChoiceLabel, SHARING_SELECTED_CLASS } from "./SharingChoiceLabel";
import { useLayoutMode } from "../hooks/useLayoutMode";
import type { AppLanguage, ThemeMode, Zikr, RoutineMode, PrayerName } from "../types";
import {
  generateAllCollectionStoryPages,
  createCollectionSharePreparation,
  getCompatibleShareFormats,
  releaseSharePages,
  SHARE_PALETTES,
  type GeneratedCollectionStoryCard,
} from "../share/collectionShareCard";
import {
  canCopyImage,
  canShareMultipleFiles,
  copyImageToClipboard,
  saveFile,
  shareNativeText,
  shareMultipleFiles,
  shareSingleFile,
} from "../share/shareDispatcher";
import { createShareArchive } from "../share/shareArchive";
import { isNativeAndroid } from "../share/nativeSharing";
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
  collection?: { items: Zikr[]; title: string; titleArabic?: string; titleEnglish?: string };
  contentAlignment?: "start" | "center" | "balanced";
}

function supportsTextShare(data: ShareData): boolean {
  if (isNativeAndroid()) return true;
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
  collectionTitle: initialTitle,
  collectionTitleArabic: initialTitleArabic,
  collectionTitleEnglish: initialTitleEnglish,
  collectionSubtitle,
  categoryId,
  readerIndex,
  routineMode,
  prayer,
  single: initialSingle = false,
  items: initialItems,
  collection,
  language,
  themeMode = "light",
  shareItems,
  shareItemsByLanguage,
  shareUrl,
  dialogTitle,
  dialogDescription,
  initialFormat,
  initialScope = "current",
  contentAlignment = "balanced",
}: CollectionShareModalProps) {
  const [wholeCollection, setWholeCollection] = useState(false);
  const single = initialSingle && !wholeCollection;
  const items = wholeCollection && collection ? collection.items : initialItems;
  const collectionTitle = wholeCollection && collection ? collection.title : initialTitle;
  const collectionTitleArabic = wholeCollection && collection ? collection.titleArabic : initialTitleArabic;
  const collectionTitleEnglish = wholeCollection && collection ? collection.titleEnglish : initialTitleEnglish;
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
  const [mode, setMode] = useState<"image" | "text">("image");
  const [includeCaption, setIncludeCaption] = useState(false);
  const curatedPack = useMemo(() => (!single ? getCuratedRoutinePack(categoryId) : null), [categoryId, single]);
  const [imageSource, setImageSource] = useState<"curated" | "generated">("generated");
  const [curatedIndex, setCuratedIndex] = useState(0);
  const [curatedFiles, setCuratedFiles] = useState<File[]>([]);
  const [curatedPreviewUrls, setCuratedPreviewUrls] = useState<string[]>([]);
  const [curatedLoading, setCuratedLoading] = useState(false);
  const [curatedUnavailable, setCuratedUnavailable] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [step, setStep] = useState<SharingStep>("content");
  const surface = useRef<HTMLDivElement>(null);
  const [scrollWhole, setScrollWhole] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const [pages, setPages] = useState<GeneratedCollectionStoryCard[]>([]);
  const [completedPreview, setCompletedPreview] = useState<GeneratedCollectionStoryCard[]>([]);
  const completedPages = useRef<GeneratedCollectionStoryCard[]>([]);
  const [renderedKey, setRenderedKey] = useState("");
  const [active, setActive] = useState(0);
  const navigationVersion = useRef(0);
  const chooseActive = (value: number | ((previous: number) => number)) => {
    navigationVersion.current += 1;
    setActive(value);
  };
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
  const additionHintId = useId();
  const actionHintId = useId();
  const copyHintId = useId();
  const shareHintId = useId();
  const languageId = useId();
  const presetId = useId();
  const scopeId = useId();
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
  const exportItems = useMemo<ShareItem[]>(
    () =>
      (
        stableInput.shareItemsByLanguage?.[exportLanguage] ??
        stableInput.shareItems ??
        stableInput.items.map((z) => toShareItem(z, exportLanguage))
      ).map((item) => (single && !item.reminder && (categoryId || !item.title) ? { ...item, title } : item)),
    [stableInput, exportLanguage, single, title, categoryId],
  );
  const available = getShareAvailability(exportItems);
  const content = useMemo(
    () => ({
      meaning: meaning && available.meaning > 0,
      wordMeanings: wordMeanings && available.wordMeanings > 0,
      pronunciation: pronunciation && available.pronunciation > 0,
      benefit: benefit && available.benefit > 0,
      qr,
      subtitle,
      source,
    }),
    [
      meaning,
      wordMeanings,
      pronunciation,
      benefit,
      qr,
      subtitle,
      source,
      available.meaning,
      available.wordMeanings,
      available.pronunciation,
      available.benefit,
    ],
  );

  const steps: readonly SharingStep[] =
    mode === "image" && imageSource !== "curated" ? ["content", "design", "share"] : ["content", "share"];
  const currentStep = steps.includes(step) ? step : steps[0]!;
  const changeStep = (next: SharingStep) => {
    setStep(next);
    setInspect(false);
    setStatus("");
    setError(false);
    requestAnimationFrame(() => stepHeading.current?.focus());
  };
  const presetOptions = (["arabic", "translated", "full"] as const).filter(
    (value) =>
      value === "arabic" ||
      (value === "translated"
        ? available.meaning > 0
        : available.wordMeanings + available.pronunciation + available.benefit > 0),
  );
  const presetValue =
    presetOptions.find((value) => {
      const options = sharePresetOptions(value, exportItems);
      return (
        options.meaning === (meaning && available.meaning > 0) &&
        options.wordMeanings === (wordMeanings && available.wordMeanings > 0) &&
        options.pronunciation === (pronunciation && available.pronunciation > 0) &&
        options.benefit === (benefit && available.benefit > 0)
      );
    }) ?? "custom";
  const url = single && exportItems[0]?.reminder ? exportItems[0].readingUrl : collectionUrl;
  const text = getShareText(exportItems, exportLanguage, content, title, url);
  const uniqueItems = (items: ShareItem[]) => [...new Map(items.map((item) => [item.id, item])).values()];
  const generationKey = JSON.stringify({
    exportItems,
    title,
    contentAlignment,
    collectionSubtitle,
    exportLanguage,
    subtitleKey: categoryId,
    appearance,
    format,
    content,
    single,
    url,
    qr,
    retry,
  });
  const current = pages[active];
  // Rendering may retain a later card while its replacement has not streamed yet.
  // Export readiness and payloads continue to use only the current request's pages.
  const previewPage = current ?? (generating ? completedPreview[active] : undefined);
  const total = current?.totalPages ?? previewPage?.totalPages ?? pages.length;
  const ready = Boolean(current) && renderedKey === generationKey;
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
  const canCopyText = typeof navigator.clipboard?.writeText === "function";
  const nativeText = supportsTextShare({ title, text: scopedText });
  const payload = scopedText;
  const readingLink = getReadingLink(url, single);
  const captionText = getImageCaption(isCuratedActive ? [title, readingLink].filter(Boolean).join("\n\n") : scopedText);
  const payloadReady = scope !== "selected" || selected.length > 0;
  const captionReady = payloadReady && (isCuratedActive || scope === "all" || ready || failed);
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
    let firstPage = true;
    setGenerating(true);
    setFailed(false);
    setFitFailed(false);
    setCompatibleFormats(null);
    setSelected([]);
    setPages(completedPages.current);
    setActive((value) => Math.max(0, Math.min(value, completedPages.current.length - 1)));
    setStatus("");
    const rememberedId = activeItemRef.current;
    const navigationAtStart = navigationVersion.current;
    const preparation = createCollectionSharePreparation();
    getCompatibleShareFormats(exportItems, content, single, { signal: controller.signal, preparation })
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
          preparation,
          onPage: (page) => {
            if (!controller.signal.aborted) {
              const replace = firstPage;
              firstPage = false;
              setPages((previous) => (replace ? [page] : [...previous, page]));
              setRenderedKey(generationKey);
            }
          },
        });
      })
      .then((result) => {
        if (controller.signal.aborted) {
          releaseSharePages(result);
          return;
        }
        releaseSharePages(completedPages.current);
        completedPages.current = result;
        setCompletedPreview(result);
        setPages(result);
        setRenderedKey(generationKey);
        const remembered = result.findIndex((page) =>
          page.layout?.fragments.some((fragment) => fragment.item.id === rememberedId),
        );
        // A reader can choose a streamed card before the remaining cards finish.
        // Preserve that exact page, including continuation parts with the same item ID.
        if (navigationVersion.current !== navigationAtStart) {
          setActive((value) => Math.max(0, Math.min(value, result.length - 1)));
        } else {
          setActive(Math.max(0, remembered));
        }
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
    generationKey,
  ]);

  useEffect(() => () => releaseSharePages(completedPages.current), []);

  const run = async (action: () => Promise<void> | void) => {
    if (operationLock.current) return false;
    operationLock.current = true;
    setBusy(true);
    setError(false);
    setStatus("");
    try {
      await action();
      return true;
    } catch {
      setError(true);
      setStatus(t(language, "shareStudio.actionError"));
      return false;
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
    setStatus(t(language, value === readingLink ? "shareStudio.readingLinkCopied" : "shareStudio.textCopied"));
  };
  const shareText = async (value: string, link = false) => {
    if (await shareNativeText(link ? { title, url: value } : { title, text: value })) {
      setStatus(t(language, "shareStudio.shared"));
      return;
    }
    if (!supportsTextShare(link ? { title, url: value } : { title, text: value })) {
      await copyText(value);
      return;
    }
    try {
      await navigator.share({ title, text: value });
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
    if (!isCuratedActive && !ready) return;
    const count = isCuratedActive ? totalCurated : pages.length;
    const update = isCuratedActive ? setCuratedIndex : chooseActive;
    if (!count) return;
    if (event.key === "Home") update(0);
    else if (event.key === "End") update(count - 1);
    else
      update((value) =>
        Math.min(count - 1, Math.max(0, value + ((event.key === "ArrowLeft") === (direction === "rtl") ? 1 : -1))),
      );
  };

  useEffect(() => {
    const root = surface.current;
    if (!open || !root || typeof ResizeObserver === "undefined") return;
    const fixed = Array.from(root.children).filter((child) => !child.hasAttribute("data-sharing-body"));
    const observer = new ResizeObserver(() => {
      const fixedHeight = fixed.reduce((sum, child) => sum + (child as HTMLElement).offsetHeight, 0);
      setScrollWhole(fixedHeight + 180 > root.clientHeight);
    });
    [root, ...fixed].forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [open]);

  const selectClass = "flex min-w-0 flex-col gap-2";
  const additions = [
    content.meaning && t(language, "shareStudio.translation"),
    content.wordMeanings && t(language, "shareStudio.wordMeanings"),
    content.pronunciation && t(language, "shareStudio.transliteration"),
    content.benefit && t(language, "shareStudio.benefit"),
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
      className="sharing-fullscreen sharing-collection-dialog gap-0"
    >
      <div ref={surface} className="sharing-surface sharing-collection" data-scroll-whole={scrollWhole || undefined}>
        <div className="sharing-dialog-header shrink-0 border-b border-border px-[16px] py-[8px] pe-[72px]">
          <span className="sharing-header-icon" aria-hidden="true">
            <Copy />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold" aria-hidden="true">
              {dialogTitle ?? t(language, single ? "shareStudio.singleTitle" : "shareStudio.collectionTitle")}
            </p>
            <p className="text-sm text-muted-foreground break-words">{collectionTitle}</p>
          </div>
        </div>
        <div className="shrink-0 px-4 py-1">
          <SharingSteps steps={steps} step={currentStep} onChange={changeStep} language={language} disabled={busy} />
        </div>
        <div data-testid="sharing-scroll" data-sharing-body className="min-h-0 flex-1 overflow-y-auto scroll-py-4">
          <div className="px-[16px] pb-[8px] space-y-4">
            <div
              className={`sharing-layout ${mode === "image" ? "grid gap-4" : "space-y-4"}`}
              data-inspect={inspect || undefined}
              data-step={currentStep}
              dir={direction}
            >
              <section data-testid="sharing-preview" dir={direction} className="sharing-preview min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-title font-bold">
                      {t(language, "shareStudio.previewHeading")}
                      {generating && !isCuratedActive && <span aria-hidden="true"> …</span>}
                    </h2>
                    {mode === "image" && !isCuratedActive && generating && pages.length > 0 && (
                      <p role="status" className="sr-only">
                        {t(language, "shareStudio.remaining")}
                      </p>
                    )}
                  </div>
                  {mode === "image" && (isCuratedActive ? Boolean(currentCuratedCard) : Boolean(previewPage)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 h-auto whitespace-normal text-label"
                      aria-expanded={inspect}
                      data-testid="sharing-preview-toggle"
                      onKeyDown={onPreviewKeyDown}
                      onClick={() => setInspect((value) => !value)}
                    >
                      {inspect ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
                      {t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                    </Button>
                  )}
                </div>
                {mode === "image" ? (
                  <>
                    <div role="group" aria-label={t(language, "shareStudio.preview")} aria-busy={generating}>
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
                              {
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setMode("text");
                                    changeStep("content");
                                  }}
                                >
                                  {t(language, "shareStudio.text")}
                                </Button>
                              }
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
                            aria-expanded={inspect}
                            className="sharing-preview-image focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                          >
                            <img
                              src={
                                curatedPreviewUrls[curatedIndex] ?? resolveCuratedImageUrl(currentCuratedCard.imagePath)
                              }
                              alt={language === "ar" ? currentCuratedCard.altText.ar : currentCuratedCard.altText.en}
                              className="rounded-xl shadow-raised"
                            />
                          </button>
                          {totalCurated > 1 && (
                            <div className="sharing-card-navigation">
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={curatedIndex <= 0 || busy}
                                aria-label={t(language, "shareStoryPack.previousPage")}
                                onKeyDown={onPreviewKeyDown}
                                onClick={() => setCuratedIndex((value) => Math.max(0, value - 1))}
                                className="size-11"
                              >
                                <SharingArrow language={language} action="previous" />
                              </Button>
                              <div className="flex flex-col items-center gap-1">
                                <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
                                  {t(language, "shareStudio.curatedCardPage", {
                                    page: formatNumerals(curatedIndex + 1, language),
                                    total: formatNumerals(totalCurated, language),
                                  })}
                                </span>
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
                                <SharingArrow language={language} action="next" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : previewPage ? (
                        <button
                          type="button"
                          onKeyDown={onPreviewKeyDown}
                          onClick={() => setInspect((value) => !value)}
                          aria-label={t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                          aria-expanded={inspect}
                          className="sharing-preview-image focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          <img
                            src={previewPage.dataUrl}
                            alt={previewPage.altText}
                            width={previewPage.width}
                            height={previewPage.height}
                            className="rounded-xl shadow-raised"
                          />
                        </button>
                      ) : (
                        <p role="status" className="py-12 text-center text-sm">
                          {t(language, "shareStoryPack.generating")}
                        </p>
                      )}
                      {!isCuratedActive && previewPage && total > 1 && (
                        <div className="sharing-card-navigation">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={!ready || active <= 0 || busy}
                            aria-label={t(language, "shareStoryPack.previousPage")}
                            onKeyDown={onPreviewKeyDown}
                            onClick={() => chooseActive((value) => value - 1)}
                            className="size-11"
                          >
                            <SharingArrow language={language} action="previous" />
                          </Button>
                          <span aria-live="polite" aria-atomic="true" className="text-sm font-semibold">
                            {pageLabel}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={!ready || active >= pages.length - 1 || busy}
                            aria-label={t(language, "shareStoryPack.nextPage")}
                            onKeyDown={onPreviewKeyDown}
                            onClick={() => chooseActive((value) => value + 1)}
                            className="size-11"
                          >
                            <SharingArrow language={language} action="next" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {content.meaning &&
                      current?.layout &&
                      !current.layout.fragments.some((fragment) =>
                        fragment.sections.some((section) => section.key === "translation"),
                      ) && (
                        <p className="text-sm text-muted-foreground">
                          {t(language, "shareStudio.selectedTranslationMissing")}
                        </p>
                      )}
                    {currentStep === "share" && !isCuratedActive && current?.layout && (
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
                    {currentStep === "share" && scope === "selected" && !isCuratedActive && total > 1 && (
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
                                onClick={() => chooseActive(index)}
                                disabled={busy}
                                className={`relative min-h-11 min-w-11 w-full rounded-xl border p-2 focus-visible:ring-[3px] focus-visible:ring-ring ${active === index ? "border-primary bg-muted" : "border-border"}`}
                              >
                                <img src={page.dataUrl} alt="" className="mx-auto h-24 w-full object-contain" />
                                <span>{formatNumerals(index + 1, language)}</span>
                                {active === index && (
                                  <Check aria-hidden="true" className="absolute end-1 top-1 size-4" />
                                )}
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
                      {t(language, "shareStudio.textPreview")}
                      <textarea
                        readOnly
                        value={scopedText}
                        dir="auto"
                        rows={5}
                        className="w-full resize-y rounded-xl border border-border bg-background p-3 text-base leading-relaxed font-normal"
                      />
                    </label>
                  </>
                )}
              </section>
              <section data-testid="sharing-settings" dir={direction} className="sharing-settings min-w-0 space-y-4">
                <div>
                  <h2
                    ref={stepHeading}
                    tabIndex={-1}
                    className="text-sm font-bold rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    {t(language, `shareStudio.step${currentStep}`)}
                  </h2>
                  <p className="sr-only">{t(language, `shareStudio.step${currentStep}Hint`)}</p>
                  {currentStep === "design" && (
                    <p className="mt-1 text-xs text-muted-foreground">{t(language, "shareStudio.designOptional")}</p>
                  )}
                </div>
                {currentStep === "content" && initialSingle && collection && collection.items.length > 1 && (
                  <fieldset className="space-y-2" disabled={busy}>
                    <legend className="text-sm font-semibold">{t(language, "shareStudio.sharingContent")}</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {([false, true] as const).map((whole) => (
                        <label key={String(whole)} className="sharing-choice text-sm">
                          <input
                            type="radio"
                            name={`${scopeId}-content`}
                            checked={wholeCollection === whole}
                            onChange={() => {
                              setWholeCollection(whole);
                              setScope(whole ? "all" : "current");
                              setSelected([]);
                              setActive(0);
                              setImageSource("generated");
                            }}
                          />
                          {t(language, whole ? "shareStudio.entireCollection" : "shareStudio.thisZikr")}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                {currentStep === "content" && curatedPack && !curatedUnavailable && mode === "image" && (
                  <fieldset
                    className="sharing-artwork-source mt-3 grid min-w-0 gap-2 items-start"
                    style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,8rem),1fr))" }}
                  >
                    <legend className="mb-2 text-sm font-semibold">{t(language, "shareStudio.artworkSource")}</legend>
                    <SharingArtworkChoice
                      icon={<FileText />}
                      label={t(language, "shareStudio.curatedTab")}
                      description={t(language, "shareStudio.curatedDescription")}
                      selected={imageSource === "curated"}
                      onClick={() => setImageSource("curated")}
                      disabled={busy}
                    />
                    <SharingArtworkChoice
                      icon={<Brush />}
                      label={t(language, "shareStudio.generatedTab")}
                      description={t(language, "shareStudio.generatedDescription")}
                      selected={imageSource === "generated"}
                      onClick={() => setImageSource("generated")}
                      disabled={busy}
                    />
                  </fieldset>
                )}
                {currentStep === "share" && isCuratedActive && curatedPack && (
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
                {currentStep === "share" && !isCuratedActive && total > 1 && (
                  <div>
                    <label htmlFor={scopeId} className="mb-2 block text-sm font-semibold">
                      {t(language, "shareStudio.scope")}
                    </label>
                    <Select
                      value={scope}
                      onValueChange={(value) => setScope(value as typeof scope)}
                      disabled={busy}
                      dir={direction}
                    >
                      <SelectTrigger id={scopeId} className="sharing-select-trigger" aria-haspopup="listbox">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        {(["current", "selected", "all"] as const).map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(
                              language,
                              single && value === "all" ? "shareStudio.scopeallSingle" : `shareStudio.scope${value}`,
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  </div>
                )}

                {currentStep === "content" && !isCuratedActive && (
                  <div className="sharing-content-fields">
                    {presetOptions.length > 1 && (
                      <div className={selectClass}>
                        <label htmlFor={presetId} className={FIELD_LABEL_CLASS}>
                          {t(language, "shareStudio.preset")}
                        </label>
                        <Select
                          dir={direction}
                          value={presetValue}
                          disabled={busy}
                          onValueChange={(value) => {
                            if (value === "custom") return;
                            const options = sharePresetOptions(value as "arabic" | "translated" | "full", exportItems);
                            setMeaning(Boolean(options.meaning));
                            setPronunciation(Boolean(options.pronunciation));
                            setBenefit(Boolean(options.benefit));
                            setWordMeanings(Boolean(options.wordMeanings));
                          }}
                        >
                          <SelectTrigger id={presetId} className="sharing-select-trigger" aria-haspopup="listbox">
                            <Globe aria-hidden="true" className="size-5" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[110]">
                            {[...presetOptions, "custom"].map((value) => (
                              <SelectItem key={value} value={value} disabled={value === "custom"}>
                                {t(language, `shareStudio.preset${value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className={selectClass}>
                      <label className={FIELD_LABEL_CLASS} id={languageId} htmlFor={`${languageId}-control`}>
                        {t(language, shareItemsByLanguage ? "shareStudio.contentLanguage" : "shareStudio.cardLanguage")}
                      </label>
                      <Select
                        value={exportLanguage}
                        onValueChange={(value) => setExportLanguage(value as AppLanguage)}
                        disabled={busy}
                        dir={direction}
                      >
                        <SelectTrigger
                          className="sharing-select-trigger"
                          aria-haspopup="listbox"
                          id={`${languageId}-control`}
                          aria-labelledby={languageId}
                          aria-describedby={languageHintId}
                        >
                          <Translate aria-hidden="true" className="size-5" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <p id={languageHintId} className="sr-only">
                        {t(
                          language,
                          shareItemsByLanguage ? "shareStudio.evidenceLanguageHint" : "shareStudio.languageHint",
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {currentStep === "design" && mode === "image" && !isCuratedActive && (
                  <fieldset aria-label={t(language, "shareStudio.imageSettings")} className="min-w-0 space-y-3">
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
                                className={`relative min-h-11 h-auto w-full whitespace-normal pt-3 pb-2 ${appearance === value ? SHARING_SELECTED_CLASS : ""}`}
                                style={{ paddingInline: 4 }}
                              >
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-x-2 top-1 h-1 rounded-full"
                                  style={{
                                    backgroundColor: SHARE_PALETTES[value].accent,
                                  }}
                                />
                                <SharingChoiceLabel selected={appearance === value}>
                                  <span className="font-bold">{t(language, `shareStudio.${value}Name`)}</span>
                                </SharingChoiceLabel>
                              </Button>
                            ))}
                          </div>
                        </fieldset>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
                  </fieldset>
                )}
                {currentStep === "content" && !isCuratedActive && (
                  <SharingDisclosure
                    label={t(language, "shareStudio.contentOptions")}
                    icon={<SlidersHorizontal className="size-5" />}
                    summary={
                      additions
                        ? t(language, "shareStudio.additionCount", {
                            count: formatNumerals(additions.split(" · ").length, language),
                          })
                        : undefined
                    }
                  >
                    <div className="pb-2">
                      <div className="sharing-additions">
                        {[
                          {
                            key: "includeSources",
                            value: source,
                            set: setSource,
                            available: available.source > 0,
                            count: available.source,
                          },
                          {
                            key: "meaning",
                            value: meaning,
                            set: setMeaning,
                            available: available.meaning > 0,
                            count: available.meaning,
                          },
                          {
                            key: "wordMeanings",
                            value: wordMeanings,
                            set: setWordMeanings,
                            available: available.wordMeanings > 0,
                            count: available.wordMeanings,
                          },
                          {
                            key: "pronunciation",
                            value: pronunciation,
                            set: setPronunciation,
                            available: available.pronunciation > 0,
                            count: available.pronunciation,
                          },
                          {
                            key: "benefit",
                            value: benefit,
                            set: setBenefit,
                            available: available.benefit > 0,
                            count: available.benefit,
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
                            <label key={option.key} className="sharing-choice text-sm">
                              <input
                                type="checkbox"
                                checked={option.value}
                                aria-label={t(language, `shareStudio.${option.key}`)}
                                aria-describedby={
                                  option.count != null && option.count < exportItems.length
                                    ? `${additionHintId}-${option.key}`
                                    : undefined
                                }
                                onChange={(event) => option.set(event.target.checked)}
                                disabled={busy}
                                className="size-5 accent-primary"
                              />
                              <span className="min-w-0">
                                <span className="block font-medium">
                                  {t(
                                    language,
                                    `shareStudio.${option.key === "meaning" ? "translation" : option.key === "pronunciation" ? "transliteration" : option.key === "includeSources" ? "source" : option.key === "qr" ? "qrShort" : option.key === "subtitle" ? "subtitleShort" : option.key}`,
                                  )}
                                </span>
                                {option.count != null && option.count < exportItems.length && (
                                  <span
                                    id={`${additionHintId}-${option.key}`}
                                    className="mt-1 block text-xs text-muted-foreground"
                                  >
                                    {t(language, "shareStudio.partialCoverage", {
                                      count: formatNumerals(option.count, language),
                                      total: formatNumerals(exportItems.length, language),
                                    })}
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                      </div>
                      {available.meaning === 0 && !exportItems.every((item) => item.reminder) && (
                        <p className="text-sm text-muted-foreground">
                          {t(
                            language,
                            exportItems.every((item) => item.textDirection === "ltr")
                              ? "shareStudio.translationAlreadyEnglish"
                              : "shareStudio.noTranslation",
                          )}
                        </p>
                      )}
                      {available.source > 0 && (
                        <p className="mt-3 text-xs text-muted-foreground">{t(language, "shareStudio.sourceHint")}</p>
                      )}
                      {exportItems.some((item) => item.reminder) && (
                        <p className="mt-2 text-xs text-muted-foreground">{t(language, "shareStudio.reminderHint")}</p>
                      )}
                    </div>
                  </SharingDisclosure>
                )}
                {currentStep === "share" && mode === "image" && (
                  <SharingCaption
                    language={language}
                    included={includeCaption}
                    onIncludedChange={setIncludeCaption}
                    text={captionText}
                    readingLink={readingLink}
                    busy={busy}
                    disabled={!captionReady}
                    canCopy={canCopyText}
                    onCopy={(value) => run(() => copyText(value))}
                    artwork={isCuratedActive}
                    onSaveText={(value) =>
                      void run(async () => {
                        await saveFile(new File([value], "azkar.txt", { type: "text/plain;charset=utf-8" }));
                        notify("downloaded");
                      })
                    }
                  />
                )}
                {currentStep === "share" && mode === "image" && !isCuratedActive && (
                  <p className="text-sm text-muted-foreground">
                    {t(language, `shareStudio.${format}`)} · {t(language, `shareStudio.${appearance}Name`)}
                    {additions ? ` · ${additions}` : ""}
                  </p>
                )}
                {currentStep === "share" && !(mode === "image" ? scopedNative : nativeText) && (
                  <p id={shareHintId} className="text-sm text-muted-foreground">
                    {t(language, "shareStudio.shareUnavailable")}
                  </p>
                )}
              </section>
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
          {currentStep !== "share" && (
            <SharingStepNavigation
              steps={steps}
              step={currentStep}
              onChange={changeStep}
              language={language}
              disabled={busy}
              onSkipDesign={steps.includes("design") ? () => changeStep("share") : undefined}
            />
          )}
          {currentStep === "share" && (
            <>
              {actionHint && (
                <p id={actionHintId} className="mb-2 text-sm text-muted-foreground">
                  {actionHint}
                </p>
              )}
              <div
                data-testid="sharing-export-actions"
                className={`sharing-export-actions grid gap-2 ${wide ? "ms-auto max-w-xl" : ""}`}
              >
                <Button
                  variant={(mode === "image" ? scopedNative : nativeText) ? "default" : "outline"}
                  className="min-h-12 gap-1 px-2 whitespace-nowrap"
                  aria-describedby={
                    !(mode === "image" ? scopedNative : nativeText)
                      ? shareHintId
                      : actionHint
                        ? actionHintId
                        : undefined
                  }
                  title={
                    !(mode === "image" ? scopedNative : nativeText)
                      ? t(language, "shareStudio.shareUnavailable")
                      : undefined
                  }
                  disabled={busy || (mode === "image" ? !scopeReady || !scopedNative : !nativeText || !payloadReady)}
                  aria-busy={busy}
                  onClick={() =>
                    void run(async () => {
                      if (mode !== "image") {
                        await shareText(payload);
                      } else if (isCuratedActive) {
                        if (curatedFiles.length === 1) {
                          await shareSingleFile(curatedFiles[0]!, {
                            title,
                            text: includeCaption ? captionText : undefined,
                            downloadFallback: false,
                            onStatus: notify,
                          });
                        } else {
                          await shareMultipleFiles(curatedFiles, {
                            title,
                            text: includeCaption ? captionText : undefined,
                            downloadFallback: false,
                            onStatus: notify,
                          });
                        }
                      } else if (scopedPages.length === 1) {
                        await shareSingleFile(scopedPages[0]!.file, {
                          title,
                          text: includeCaption ? captionText : undefined,
                          downloadFallback: false,
                          onStatus: notify,
                        });
                      } else {
                        await shareMultipleFiles(
                          scopedPages.map((page) => page.file),
                          {
                            title,
                            text: includeCaption ? captionText : undefined,
                            downloadFallback: false,
                            onStatus: notify,
                          },
                        );
                      }
                    })
                  }
                >
                  <Share2 aria-hidden="true" />
                  <span className="min-w-0 max-w-full break-words">{t(language, "shareStudio.share")}</span>
                </Button>
                <Button
                  variant={(mode === "image" ? scopedNative : nativeText) ? "outline" : "default"}
                  className="min-h-12 gap-1 px-2 whitespace-nowrap"
                  disabled={busy || (mode === "image" ? !scopeReady : !payloadReady)}
                  aria-describedby={actionHint ? actionHintId : undefined}
                  onClick={() =>
                    void run(async () => {
                      await saveFile(
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
                  <span className="min-w-0 max-w-full break-words">{t(language, "shareStudio.save")}</span>
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
                      : canCopyText
                        ? "shareStudio.copyText"
                        : "shareStudio.copyTextUnavailable",
                  )}
                  disabled={busy || (mode === "image" ? !scopeReady || !copyAsImage : !payloadReady || !canCopyText)}
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
                  <span className="min-w-0 max-w-full break-words">
                    {t(language, mode === "image" ? "shareStudio.copyImage" : "shareStudio.copy")}
                  </span>
                </Button>
              </div>
              <span id={copyHintId} className="sr-only">
                {t(
                  language,
                  mode === "image"
                    ? copyAsImage
                      ? "shareStoryPack.copySingle"
                      : "shareStudio.imageCopyUnavailable"
                    : canCopyText
                      ? "shareStudio.copyText"
                      : "shareStudio.copyTextUnavailable",
                )}
              </span>
              {mode !== "image" && !canCopyText && (
                <p className="mt-2 text-sm text-muted-foreground">{t(language, "shareStudio.copyTextUnavailable")}</p>
              )}
            </>
          )}
          <div
            role={error ? "alert" : "status"}
            aria-live={error ? "assertive" : "polite"}
            aria-atomic="true"
            className={
              status ? "sharing-feedback mt-2 rounded-xl bg-muted px-3 py-2 text-sm text-foreground" : "sr-only"
            }
          >
            {status}
          </div>
        </div>
      </div>
    </Modal>
  );
}
