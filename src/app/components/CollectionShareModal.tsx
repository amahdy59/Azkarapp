import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronNext, ChevronPrevious, Download, Share2 } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, ThemeMode, Zikr, RoutineMode, PrayerName } from "../types";
import {
  generateAllCollectionStoryPages,
  getCompatibleShareFormats,
  releaseSharePages,
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
  defaultShareAppearance,
  getShareText,
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
}: CollectionShareModalProps) {
  const direction = language === "ar" ? "rtl" : "ltr";
  const [appearance, setAppearance] = useState<ShareAppearance>(() => defaultShareAppearance(categoryId, themeMode));
  const [format, setFormat] = useState<ShareFormat>(() =>
    single && (shareItems ?? items.map((item) => toShareItem(item, language))).every((item) => item.reminder)
      ? "portrait"
      : "story",
  );
  const [meaning, setMeaning] = useState(false);
  const [exportLanguage, setExportLanguage] = useState<AppLanguage>(language);
  const [pronunciation, setPronunciation] = useState(false);
  const [benefit, setBenefit] = useState(false);
  const [qr, setQr] = useState(false);
  const [mode, setMode] = useState<"image" | "text" | "link">("image");
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
  const [scope, setScope] = useState<"current" | "selected" | "all">("current");
  const [selected, setSelected] = useState<number[]>([]);
  const activeItemRef = useRef<string | undefined>(undefined);
  const operationLock = useRef(false);
  const descriptionId = useId();
  const formatId = useId();
  const languageId = useId();
  const collectionUrl = categoryId
    ? getShareUrl(categoryId, single ? readerIndex : undefined, undefined, { routineMode, prayer })
    : undefined;
  // Screen composition can recreate arrays on its minute/audio clock. Only changed
  // content should restart an expensive export, never a parent render alone.
  const itemsJson = JSON.stringify({ items, shareItems });
  const stableInput = useMemo(() => JSON.parse(itemsJson) as { items: Zikr[]; shareItems?: ShareItem[] }, [itemsJson]);
  const title = (exportLanguage === "ar" ? collectionTitleArabic : collectionTitleEnglish) ?? collectionTitle;
  const content = useMemo(() => ({ meaning, pronunciation, benefit, qr }), [meaning, pronunciation, benefit, qr]);
  const exportItems = useMemo<ShareItem[]>(
    () =>
      (stableInput.shareItems ?? stableInput.items.map((z) => toShareItem(z, exportLanguage))).map((item) =>
        single && !item.title ? { ...item, title } : item,
      ),
    [stableInput, exportLanguage, single, title],
  );
  const url = single && exportItems[0]?.reminder ? exportItems[0].readingUrl : collectionUrl;
  const text = getShareText(exportItems, exportLanguage, content, title, url);
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
  const scopedNative = scopedPages.length > 0 && canShareMultipleFiles(scopedPages.map((page) => page.file));
  const scopeReady = scopedPages.length > 0 && (scope === "current" ? ready : allReady);
  const scopedText =
    scope === "current"
      ? getShareText(
          current?.layout?.fragments.map((fragment) => fragment.item) ?? exportItems,
          exportLanguage,
          content,
          title,
          url,
        )
      : scope === "selected"
        ? getShareText(
            scopedPages.flatMap((page) => page.layout?.fragments.map((fragment) => fragment.item) ?? []),
            exportLanguage,
            content,
            title,
            url,
          )
        : text;
  const nativeText = supportsTextShare(mode === "link" ? { title, url } : { title, text: scopedText });
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
    setStatus(t(language, `shareStudio.${value}`));
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
        setStatus(t(language, "shareStudio.cancelled"));
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

  const selectClass = "flex flex-col gap-2 text-sm font-semibold";
  const pageLabel = t(language, "shareStoryPack.pageCount", {
    current: formatNumerals(active + 1, language),
    total: formatNumerals(total || 1, language),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(language, single ? "shareStudio.singleTitle" : "shareStoryPack.modalTitle")}
      direction={direction}
      language={language}
      describedById={descriptionId}
      testId="collection-share-modal"
      maxWidthClassName={inspect ? "max-w-5xl" : "max-w-4xl"}
      className="!max-h-[92dvh] !w-[calc(100%-16px)] gap-0"
    >
      <div className="shrink-0 border-b border-border px-[16px] py-[12px] pe-[96px]">
        <p className="text-lg font-bold" aria-hidden="true">
          {t(language, "shareStudio.share")}
        </p>
      </div>
      <div
        role="group"
        aria-label={t(language, "shareStudio.method")}
        className="mx-[16px] my-[12px] grid shrink-0 grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-[8px]"
      >
        {(["image", "text", "link"] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? "default" : "outline"}
            aria-pressed={mode === value}
            onClick={() => {
              if (value === "text" && !ready) setScope("all");
              setMode(value);
            }}
            disabled={busy || (value === "link" && !url)}
            className="min-h-11 h-auto whitespace-normal break-words px-[4px]"
          >
            <span className="min-w-0 break-words">{t(language, `shareStudio.${value}`)}</span>
          </Button>
        ))}
      </div>
      <div
        data-testid="sharing-scroll"
        className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[16px] space-y-4 scroll-py-4"
      >
        {!single && mode !== "link" && total > 1 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t(language, "shareStudio.scope")}</legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2">
              {(["current", "selected", "all"] as const).map((value) => (
                <Button
                  key={value}
                  variant={scope === value ? "default" : "outline"}
                  aria-pressed={scope === value}
                  disabled={busy}
                  onClick={() => setScope(value)}
                  className="min-h-11 h-auto whitespace-normal px-[8px] py-2"
                >
                  <span className="min-w-0 break-words">{t(language, `shareStudio.scope${value}`)}</span>
                </Button>
              ))}
            </div>
            <p className="mt-2 text-sm" role="status">
              {t(language, "shareStudio.imageCount", { count: formatNumerals(scopedPages.length, language) })}
            </p>
            {scope === "selected" && (
              <p className="text-sm text-muted-foreground">{t(language, "shareStudio.selectionHint")}</p>
            )}
          </fieldset>
        )}
        {mode === "image" ? (
          <>
            <div role="group" aria-label={t(language, "shareStudio.preview")}>
              {failed ? (
                <div className="py-10 text-center">
                  <p role="alert">{t(language, fitFailed ? "shareStudio.fitError" : "shareStoryPack.shareError")}</p>
                  {fitFailed ? (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {compatibleFormats?.map((value) => (
                        <Button key={value} onClick={() => setFormat(value)}>
                          {t(language, `shareStudio.${value}`)}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScope("all");
                          setMode("text");
                        }}
                      >
                        {t(language, "shareStudio.text")}
                      </Button>
                      {url && (
                        <Button variant="outline" onClick={() => setMode("link")}>
                          {t(language, "shareStudio.link")}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button className="mt-3" onClick={() => setRetry((value) => value + 1)}>
                      {t(language, "common.tryAgain")}
                    </Button>
                  )}
                </div>
              ) : current ? (
                <button
                  type="button"
                  onKeyDown={onPreviewKeyDown}
                  onClick={() => setInspect((value) => !value)}
                  aria-label={t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                  aria-pressed={inspect}
                  className={`flex w-full items-center justify-center rounded-2xl border border-border bg-muted/30 p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${inspect ? "h-[70vh]" : "h-[clamp(200px,calc(92dvh-370px),560px)]"}`}
                >
                  <img
                    src={current.dataUrl}
                    alt={current.altText}
                    width={current.width}
                    height={current.height}
                    className="h-full max-w-full w-auto object-contain rounded-xl"
                  />
                </button>
              ) : (
                <p role="status" className="py-12 text-center text-sm">
                  {t(language, "shareStoryPack.generating")}
                </p>
              )}
              {ready && (
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
              {ready && (
                <Button
                  variant="outline"
                  className="mt-2 min-h-11 w-full"
                  aria-pressed={inspect}
                  onClick={() => setInspect((value) => !value)}
                >
                  {t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                </Button>
              )}
            </div>
            {generating && ready && (
              <p role="status" className="text-sm text-muted-foreground">
                {t(language, "shareStudio.remaining")}
              </p>
            )}
            {current?.layout && (
              <details className="rounded-2xl border border-border px-3">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">
                  {t(language, "shareStudio.readCard")}
                </summary>
                <div className="pb-3 space-y-4">
                  {current.layout.fragments.map((fragment, index) => (
                    <div key={`${fragment.item.id}-${index}`}>
                      {fragment.item.title && <h3 className="font-semibold">{fragment.item.title}</h3>}
                      <p className="text-sm text-muted-foreground">
                        {t(
                          exportLanguage,
                          fragment.item.reminder ? "shareStudio.reminder" : "shareStudio.repetitions",
                          { count: formatNumerals(fragment.item.repetitionCount ?? 1, exportLanguage) },
                        )}
                      </p>
                      {[...fragment.sections, ...(fragment.citation ? [fragment.citation] : [])].map(
                        (section, sectionIndex) => (
                          <p
                            key={`${section.key}-${sectionIndex}`}
                            lang={section.direction === "rtl" ? "ar" : "en"}
                            dir={section.direction}
                            className={`whitespace-pre-wrap break-words text-base leading-relaxed ${section.direction === "rtl" ? "zikr-text" : ""}`}
                          >
                            {section.key !== "arabic" && (
                              <strong className="block text-sm">
                                {t(exportLanguage, `shareStudio.${section.key}`)}
                              </strong>
                            )}
                            {section.text}
                          </p>
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
            {total > 1 && (
              <details open={scope === "selected" || undefined} className="rounded-2xl border border-border p-3">
                <summary className="min-h-11 flex cursor-pointer items-center text-sm font-semibold">
                  {t(language, "shareStudio.overview")}
                </summary>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {pages.map((page, index) => (
                    <div key={page.file.name}>
                      <button
                        type="button"
                        aria-label={t(language, "shareStudio.goToCard", { count: formatNumerals(index + 1, language) })}
                        aria-pressed={active === index}
                        onClick={() => setActive(index)}
                        disabled={busy}
                        className="min-h-11 min-w-11 w-full rounded-xl border border-border p-2 focus-visible:ring-[3px] focus-visible:ring-ring"
                      >
                        <img src={page.dataUrl} alt="" className="mx-auto h-24 w-full object-contain" />
                        <span>{formatNumerals(index + 1, language)}</span>
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
                          {t(language, "shareStudio.selectCard", { count: formatNumerals(index + 1, language) })}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
            {canCopyImage() && (
              <details className="rounded-2xl border border-border px-3">
                <summary className="min-h-11 flex cursor-pointer items-center font-semibold text-sm">
                  {t(language, "shareStudio.more")}
                </summary>
                <Button
                  variant="outline"
                  className="min-h-11 mb-3"
                  disabled={!ready || busy}
                  onClick={() =>
                    void run(async () => {
                      if (!current) return;
                      if (!(await copyImageToClipboard(current.blob))) {
                        setError(true);
                        setStatus(t(language, "shareStudio.copyFailed"));
                        return;
                      }
                      setStatus(t(language, "shareStoryPack.copySuccess"));
                    })
                  }
                >
                  {t(language, "shareStoryPack.copySingle")}
                </Button>
              </details>
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
        {mode === "image" && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t(language, "shareStoryPack.themeLabel")}</legend>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2">
                {(["olive", "gold", "lavender"] as const).map((value) => (
                  <Button
                    key={value}
                    variant={appearance === value ? "default" : "outline"}
                    aria-pressed={appearance === value}
                    disabled={busy}
                    onClick={() => setAppearance(value)}
                    className="min-h-11 h-auto flex-col whitespace-normal px-[8px] py-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-5 w-12 rounded border ${value === "olive" ? "bg-share-olive-surface border-share-olive-accent" : value === "gold" ? "bg-share-gold-surface border-share-gold-accent" : "bg-share-lavender-surface border-share-lavender-accent"}`}
                    />
                    {t(language, `shareStudio.${value}`)}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <div className={selectClass}>
                <label id={languageId}>{t(language, "shareStudio.cardLanguage")}</label>
                <Select
                  value={exportLanguage}
                  onValueChange={(value) => setExportLanguage(value as AppLanguage)}
                  disabled={busy}
                  dir={direction}
                >
                  <SelectTrigger aria-labelledby={languageId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[110]">
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={selectClass}>
                <label id={formatId}>{t(language, "shareStudio.format")}</label>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as ShareFormat)}
                  disabled={busy}
                  dir={direction}
                >
                  <SelectTrigger aria-labelledby={formatId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[110]">
                    {(["story", "square", "portrait", "tall"] as const).map((value) => (
                      <SelectItem
                        key={value}
                        value={value}
                        disabled={compatibleFormats !== null && !compatibleFormats.includes(value)}
                      >
                        {t(language, `shareStudio.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t(language, "shareStudio.compatibilityHint")}</p>
          </>
        )}
        {mode !== "link" && (
          <details className="rounded-2xl border border-border px-3">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-sm">
              {t(language, "shareStudio.contentOptions")}
            </summary>
            <div className="pb-2">
              {[
                {
                  key: "meaning",
                  value: meaning,
                  set: setMeaning,
                  available: exportItems.some((item) => item.translation),
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
              <p className="text-xs text-muted-foreground">{t(language, "shareStudio.sourceAlways")}</p>
              {exportItems.some((item) => item.reminder) && (
                <p className="mt-2 text-xs text-muted-foreground">{t(language, "shareStudio.reminderHint")}</p>
              )}
            </div>
          </details>
        )}
        <div
          role={error ? "alert" : "status"}
          aria-live={error ? "assertive" : "polite"}
          aria-atomic="true"
          className="text-sm text-foreground"
        >
          {status}
        </div>
        <DialogPrimitive.Description id={descriptionId} className="mt-1 text-sm text-muted-foreground">
          {t(language, "shareStudio.description")}
        </DialogPrimitive.Description>
        <p className="text-xs text-muted-foreground">{t(language, "shareStudio.destinationHint")}</p>
      </div>
      <div
        data-testid="sharing-actions"
        className="shrink-0 border-t border-border bg-card p-[12px] space-y-2 pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        {mode === "image" ? (
          <>
            <Button
              className="min-h-12 h-auto whitespace-normal w-full"
              disabled={!scopeReady || busy}
              aria-busy={busy}
              onClick={() =>
                void run(async () => {
                  if (scopedNative) {
                    if (scopedPages.length === 1)
                      await shareSingleFile(scopedPages[0]!.file, { title, downloadFallback: false, onStatus: notify });
                    else
                      await shareMultipleFiles(
                        scopedPages.map((page) => page.file),
                        { title, downloadFallback: false, onStatus: notify },
                      );
                  } else if (scopedPages.length === 1) {
                    downloadFile(scopedPages[0]!.file);
                    notify("downloaded");
                  } else {
                    downloadFile(
                      await createShareArchive(
                        scopedPages.map((page) => page.file),
                        scopedText,
                      ),
                    );
                    notify("downloaded");
                  }
                })
              }
            >
              {scopedNative ? <Share2 aria-hidden="true" /> : <Download aria-hidden="true" />}
              {t(
                language,
                scopedNative
                  ? scope === "current"
                    ? "shareStoryPack.shareCurrent"
                    : "shareStudio.shareChosen"
                  : scopedPages.length <= 1
                    ? "shareStoryPack.downloadSingle"
                    : "shareStudio.saveChosen",
              )}
            </Button>
            {scopedNative && (
              <Button
                variant="outline"
                className="min-h-11 w-full"
                disabled={!scopeReady || busy}
                onClick={() =>
                  void run(async () => {
                    downloadFile(
                      scopedPages.length === 1
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
                {t(language, scopedPages.length <= 1 ? "shareStoryPack.downloadSingle" : "shareStudio.saveChosen")}
              </Button>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              className="min-h-12 flex-1"
              disabled={
                busy || (mode === "link" && !url) || (mode === "text" && scope === "selected" && !selected.length)
              }
              onClick={() => void run(() => shareText(mode === "text" ? scopedText : (url ?? ""), mode === "link"))}
            >
              {t(language, nativeText ? "shareStudio.share" : "shareStudio.copy")}
            </Button>
            {nativeText && (
              <Button
                variant="outline"
                className="min-h-11"
                disabled={busy || (mode === "text" && scope === "selected" && !selected.length)}
                onClick={() => void run(() => copyText(mode === "text" ? scopedText : (url ?? "")))}
              >
                {t(language, "shareStudio.copy")}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
