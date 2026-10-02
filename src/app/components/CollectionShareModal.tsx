import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronNext, ChevronPrevious, Download, Share2 } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, ThemeMode, Zikr, RoutineMode, PrayerName } from "../types";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import {
  generateAllCollectionStoryPages,
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
  const [format, setFormat] = useState<ShareFormat>("story");
  const [meaning, setMeaning] = useState(language === "en");
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
  const operationLock = useRef(false);
  const descriptionId = useId();
  const formatId = useId();
  const themeId = useId();
  const url = categoryId
    ? getShareUrl(categoryId, single ? readerIndex : undefined, undefined, { routineMode, prayer })
    : undefined;
  const exportLanguage: AppLanguage = meaning ? "en" : "ar";
  // Screen composition can recreate arrays on its minute/audio clock. Only changed
  // content should restart an expensive export, never a parent render alone.
  const itemsJson = JSON.stringify({ items, shareItems });
  const stableInput = useMemo(() => JSON.parse(itemsJson) as { items: Zikr[]; shareItems?: ShareItem[] }, [itemsJson]);
  const title = (exportLanguage === "ar" ? collectionTitleArabic : collectionTitleEnglish) ?? collectionTitle;
  const content = useMemo(() => ({ meaning, pronunciation, benefit }), [meaning, pronunciation, benefit]);
  const exportItems = useMemo<ShareItem[]>(
    () =>
      stableInput.shareItems ??
      stableInput.items.map((z) => ({
        id: z.id,
        arabicText: z.arabicText,
        title: exportLanguage === "ar" ? z.surahNameArabic : z.surahNameEnglish,
        translation: z.translation,
        transliteration: z.transliteration,
        benefit: getLocalizedZikrBenefit(z, exportLanguage),
        sourceReference: getLocalizedSourceReference(z, exportLanguage),
        repetitionCount: z.repetitionCount,
      })),
    [stableInput, exportLanguage],
  );
  const text = getShareText(exportItems, exportLanguage, content, title, url);
  const current = pages[active];
  const total = current?.totalPages ?? pages.length;
  const ready = Boolean(current);
  const allReady = ready && !generating;
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
    setPages([]);
    setActive(0);
    setStatus("");
    generateAllCollectionStoryPages({
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
    })
      .then((result) => {
        ownedPages = result;
        if (controller.signal.aborted) {
          releaseSharePages(result);
          return;
        }
        setPages(result);
        setGenerating(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPages([]);
        setGenerating(false);
        setFailed(true);
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
  const save = () => {
    if (current) {
      downloadFile(current.file);
      setStatus(t(language, "shareStudio.downloaded"));
    }
  };
  const copyText = async (value: string) => {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(value);
    setStatus(t(language, "shareStudio.copied"));
  };
  const shareText = async (value: string, link = false) => {
    if (typeof navigator.share !== "function") {
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
  const currentNative = current && canShareMultipleFiles([current.file]);
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
      maxWidthClassName={inspect ? "max-w-5xl" : "max-w-xl"}
      className="overflow-y-auto p-5 gap-4"
    >
      <div className="pe-12">
        <p className="text-lg font-bold" aria-hidden="true">
          {t(language, single ? "shareStudio.singleTitle" : "shareStoryPack.modalTitle")}
        </p>
        <DialogPrimitive.Description id={descriptionId} className="mt-1 text-sm text-muted-foreground">
          {t(language, "shareStudio.description")}
        </DialogPrimitive.Description>
      </div>
      <div role="group" aria-label={t(language, "shareStudio.method")} className="grid grid-cols-3 gap-2">
        {(["image", "text", "link"] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? "default" : "outline"}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            disabled={busy || (value === "link" && !url)}
            className="min-h-11"
          >
            {t(language, `shareStudio.${value}`)}
          </Button>
        ))}
      </div>
      {mode === "image" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className={selectClass}>
              <label id={themeId}>{t(language, "shareStoryPack.themeLabel")}</label>
              <Select
                value={appearance}
                onValueChange={(value) => setAppearance(value as ShareAppearance)}
                disabled={busy}
                dir={direction}
              >
                <SelectTrigger aria-labelledby={themeId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  {(["olive", "gold", "lavender"] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(language, `shareStudio.${value}`)}
                    </SelectItem>
                  ))}
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
                    <SelectItem key={value} value={value}>
                      {t(language, `shareStudio.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
              { key: "benefit", value: benefit, set: setBenefit, available: exportItems.some((item) => item.benefit) },
              { key: "qr", value: qr, set: setQr, available: mode === "image" && Boolean(url) },
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
          </div>
        </details>
      )}
      {mode === "image" ? (
        <>
          <div role="group" aria-label={t(language, "shareStudio.preview")}>
            {failed ? (
              <div className="py-10 text-center">
                <p role="alert">{t(language, "shareStoryPack.shareError")}</p>
                <Button className="mt-3" onClick={() => setRetry((value) => value + 1)}>
                  {t(language, "common.tryAgain")}
                </Button>
              </div>
            ) : current ? (
              <button
                type="button"
                onKeyDown={onPreviewKeyDown}
                onClick={() => setInspect((value) => !value)}
                aria-label={t(language, inspect ? "shareStudio.closeInspect" : "shareStudio.inspect")}
                aria-pressed={inspect}
                className={`flex w-full items-center justify-center rounded-2xl border border-border bg-muted/30 p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${inspect ? "h-[65vh]" : "h-[min(48vh,420px)]"}`}
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
                    {fragment.parts > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {t(language, "shareStudio.continuation", { current: fragment.part, total: fragment.parts })}
                      </p>
                    )}
                    {[...fragment.sections, ...(fragment.citation ? [fragment.citation] : [])].map(
                      (section, sectionIndex) => (
                        <p
                          key={`${section.key}-${sectionIndex}`}
                          lang={section.direction === "rtl" ? "ar" : "en"}
                          dir={section.direction}
                          className={`whitespace-pre-wrap break-words text-base leading-relaxed ${section.direction === "rtl" ? "zikr-text" : ""}`}
                        >
                          {section.key !== "arabic" && (
                            <strong className="block text-sm">{t(exportLanguage, `shareStudio.${section.key}`)}</strong>
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
          <div className="flex flex-col gap-2">
            <Button
              disabled={!ready || busy}
              aria-busy={busy}
              onClick={() =>
                void run(async () => {
                  if (!current) return;
                  if (!currentNative) {
                    save();
                    return;
                  }
                  await shareSingleFile(current.file, { title, downloadFallback: false, onStatus: notify });
                })
              }
              className="min-h-12"
            >
              {currentNative ? <Share2 aria-hidden="true" /> : <Download aria-hidden="true" />}
              {t(language, currentNative ? "shareStoryPack.shareCurrent" : "shareStoryPack.downloadSingle")}
            </Button>
            {currentNative && (
              <Button variant="outline" disabled={!ready || busy} onClick={() => void run(save)} className="min-h-11">
                <Download aria-hidden="true" />
                {t(language, "shareStoryPack.downloadSingle")}
              </Button>
            )}
            <details className="rounded-2xl border border-border px-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">
                {t(language, "shareStudio.more")}
              </summary>
              <div className="grid gap-2 pb-3">
                {canCopyImage() && (
                  <Button
                    variant="outline"
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
                    className="min-h-11"
                  >
                    {t(language, "shareStoryPack.copySingle")}
                  </Button>
                )}
                {total > 1 && (
                  <>
                    <Button
                      variant="outline"
                      disabled={!allReady || busy || !canShareMultipleFiles(pages.map((page) => page.file))}
                      onClick={() =>
                        void run(async () => {
                          await shareMultipleFiles(
                            pages.map((page) => page.file),
                            { title, downloadFallback: false, onStatus: notify },
                          );
                        })
                      }
                      className="min-h-11"
                    >
                      {t(language, "shareStoryPack.shareAll")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!allReady || busy}
                      onClick={() =>
                        void run(async () => {
                          const archive = await createShareArchive(
                            pages.map((page) => page.file),
                            text,
                          );
                          downloadFile(archive);
                          setStatus(t(language, "shareStudio.downloaded"));
                        })
                      }
                      className="min-h-11"
                    >
                      {t(language, "shareStudio.archive")}
                    </Button>
                    <p className="text-xs text-muted-foreground">{t(language, "shareStudio.bulkHint")}</p>
                  </>
                )}
              </div>
            </details>
          </div>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {t(language, mode === "text" ? "shareStudio.textPreview" : "shareStudio.linkPreview")}
            <textarea
              readOnly
              value={mode === "text" ? text : (url ?? "")}
              dir="auto"
              rows={mode === "text" ? 9 : 3}
              className="w-full resize-y rounded-xl border border-border bg-background p-3 text-base leading-relaxed font-normal"
            />
          </label>
          <Button
            disabled={busy || (mode === "link" && !url)}
            onClick={() => void run(() => shareText(mode === "text" ? text : (url ?? ""), mode === "link"))}
            className="min-h-12"
          >
            {t(language, typeof navigator.share === "function" ? "shareStudio.share" : "shareStudio.copy")}
          </Button>
          {typeof navigator.share === "function" && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => copyText(mode === "text" ? text : (url ?? "")))}
              className="min-h-11"
            >
              {t(language, "shareStudio.copy")}
            </Button>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">{t(language, "shareStudio.destinationHint")}</p>
      <div
        role={error ? "alert" : "status"}
        aria-live={error ? "assertive" : "polite"}
        aria-atomic="true"
        className="text-sm text-foreground"
      >
        {status}
      </div>
    </Modal>
  );
}
