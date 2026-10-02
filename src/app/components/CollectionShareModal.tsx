import { useCallback, useEffect, useId, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Check, ChevronNext, ChevronPrevious, Copy, Download, Moon, Share2, Sun } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, ThemeMode, Zikr } from "../types";
import {
  generateAllCollectionStoryPages,
  type GeneratedCollectionStoryCard,
  type StoryCardItem,
} from "../share/collectionShareCard";
import {
  canCopyImage,
  copyImageToClipboard,
  downloadFile,
  downloadFilesSequentially,
  shareMultipleFiles,
  shareSingleFile,
} from "../share/shareDispatcher";
import { formatNumerals } from "../formatting";

export interface CollectionShareModalProps {
  open: boolean;
  onClose: () => void;
  collectionTitle: string;
  collectionSubtitle?: string;
  items: Zikr[];
  language: AppLanguage;
  themeMode?: ThemeMode;
}

export function CollectionShareModal({
  open,
  onClose,
  collectionTitle,
  collectionSubtitle,
  items,
  language,
  themeMode = "light",
}: CollectionShareModalProps) {
  const direction = language === "ar" ? "rtl" : "ltr";
  const [selectedTheme, setSelectedTheme] = useState<"light" | "midnight">(() =>
    themeMode === "midnight" || themeMode === "dark" ? "midnight" : "light",
  );
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [pages, setPages] = useState<GeneratedCollectionStoryCard[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationFailed, setGenerationFailed] = useState(false);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const [copiedRecently, setCopiedRecently] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const statusId = useId();
  const descriptionId = useId();

  // Reset or regenerate when opening or changing theme
  useEffect(() => {
    if (!open || items.length === 0) {
      return;
    }

    let isMounted = true;
    setIsGenerating(true);
    setActivePageIndex(0);
    setGenerationFailed(false);
    setPages(null);
    setStatusMessage(t(language, "shareStoryPack.generating"));

    const storyItems: StoryCardItem[] = items.map((z) => ({
      id: z.id,
      arabicText: z.arabicText,
      benefitArabic: z.benefitArabic,
      repetitionCount: z.repetitionCount,
      surahNameArabic: z.surahNameArabic,
    }));

    generateAllCollectionStoryPages({
      collectionTitle,
      collectionSubtitle,
      allItems: storyItems,
      themeMode: selectedTheme,
      language,
    })
      .then((generatedPages) => {
        if (!isMounted) return;
        setPages(generatedPages);
        setActivePageIndex((prev) => Math.min(prev, generatedPages.length - 1));
        setIsGenerating(false);
        setStatusMessage("");
      })
      .catch(() => {
        if (!isMounted) return;
        setIsGenerating(false);
        setGenerationFailed(true);
        setStatusMessage(t(language, "shareStoryPack.shareError"));
      });

    return () => {
      isMounted = false;
    };
  }, [open, selectedTheme, collectionTitle, collectionSubtitle, items, language, retryGeneration]);

  const totalPages = pages?.length ?? 1;
  const currentCard = pages ? pages[activePageIndex] : null;

  const goToPreviousPage = useCallback(() => {
    setActivePageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setActivePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  // Keyboard navigation: Left/Right arrows flip between pages
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (direction === "rtl") {
          goToNextPage();
        } else {
          goToPreviousPage();
        }
      } else if (e.key === "ArrowRight") {
        if (direction === "rtl") {
          goToPreviousPage();
        } else {
          goToNextPage();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, direction, goToNextPage, goToPreviousPage]);

  // Share current active card (Primary action for social status)
  const handleShareCurrent = async () => {
    if (!currentCard) return;
    try {
      await shareSingleFile(currentCard.file, {
        title: `${collectionTitle} (${activePageIndex + 1}/${totalPages})`,
        onStatus: (status) => {
          if (status === "sharing") setStatusMessage(t(language, "shareStoryPack.openingShare"));
          if (status === "shared") setStatusMessage(t(language, "shareStoryPack.sharedSuccess"));
          if (status === "downloading") setStatusMessage(t(language, "shareStoryPack.downloading"));
          if (status === "downloaded") setStatusMessage(t(language, "shareStoryPack.downloadSuccess"));
          if (status === "cancelled") setStatusMessage(t(language, "shareStoryPack.shareCancelled"));
        },
      });
    } catch {
      setStatusMessage(t(language, "shareStoryPack.shareError"));
    }
  };

  // Share all cards together
  const handleShareAll = async () => {
    if (!pages || pages.length === 0) return;
    try {
      const files = pages.map((p) => p.file);
      await shareMultipleFiles(files, {
        title: collectionTitle,
        onStatus: (status) => {
          if (status === "sharing") setStatusMessage(t(language, "shareStoryPack.openingShare"));
          if (status === "shared") setStatusMessage(t(language, "shareStoryPack.sharedSuccess"));
          if (status === "downloading") setStatusMessage(t(language, "shareStoryPack.downloading"));
          if (status === "downloaded") setStatusMessage(t(language, "shareStoryPack.downloadSuccess"));
          if (status === "cancelled") setStatusMessage(t(language, "shareStoryPack.shareCancelled"));
        },
      });
    } catch {
      setStatusMessage(t(language, "shareStoryPack.shareError"));
    }
  };

  // Download active card PNG
  const handleDownloadCurrent = () => {
    if (!currentCard) return;
    downloadFile(currentCard.file);
    setStatusMessage(t(language, "shareStoryPack.downloadSuccess"));
  };

  // Copy active card PNG to clipboard
  const handleCopyCurrent = async () => {
    if (!currentCard) return;
    const success = await copyImageToClipboard(currentCard.blob);
    if (success) {
      setCopiedRecently(true);
      setStatusMessage(t(language, "shareStoryPack.copySuccess"));
      setTimeout(() => setCopiedRecently(false), 2500);
    } else {
      // Fallback to downloading
      handleDownloadCurrent();
    }
  };

  // Download all cards sequentially
  const handleDownloadAll = async () => {
    if (!pages || pages.length === 0) return;
    setStatusMessage(t(language, "shareStoryPack.downloading"));
    await downloadFilesSequentially(pages.map((p) => p.file));
    setStatusMessage(t(language, "shareStoryPack.downloadSuccess"));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(language, "shareStoryPack.modalTitle")}
      direction={direction}
      language={language}
      maxWidthClassName="max-w-[460px]"
      className="p-5 flex flex-col gap-3.5 overflow-y-auto"
      describedById={descriptionId}
      testId="collection-share-modal"
    >
      {/* Header Info */}
      <div className="text-center pt-1">
        <h2 className="text-base font-extrabold text-foreground">{t(language, "shareStoryPack.modalTitle")}</h2>
        <DialogPrimitive.Description id={descriptionId} className="text-xs text-muted-foreground mt-1 font-medium">
          {t(language, "shareStoryPack.modalSubtitle")}
        </DialogPrimitive.Description>
      </div>

      {/* Theme Picker */}
      <div className="flex items-center justify-center gap-2 bg-muted/60 p-1.5 rounded-full border border-border/70 self-center">
        <button
          type="button"
          onClick={() => setSelectedTheme("light")}
          className={`flex min-h-11 items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            selectedTheme === "light"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={selectedTheme === "light"}
        >
          <Sun size={15} className="text-primary" aria-hidden="true" />
          <span>{t(language, "shareStoryPack.themeDaylight")}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTheme("midnight")}
          className={`flex min-h-11 items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            selectedTheme === "midnight"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={selectedTheme === "midnight"}
        >
          <Moon size={15} className="text-primary" aria-hidden="true" />
          <span>{t(language, "shareStoryPack.themeMidnight")}</span>
        </button>
      </div>

      {/* Slide Preview Canvas */}
      <div className="relative flex shrink-0 flex-col items-center justify-center h-[340px] w-full rounded-2xl bg-muted/30 border border-border/50 overflow-hidden p-2">
        {generationFailed ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p role="alert">{t(language, "shareStoryPack.shareError")}</p>
            <Button onClick={() => setRetryGeneration((value) => value + 1)}>{t(language, "common.tryAgain")}</Button>
          </div>
        ) : isGenerating || !currentCard ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div
              className="h-9 w-9 rounded-full border-3 border-primary/20 border-t-primary animate-spin"
              aria-hidden="true"
            />
            <p className="text-xs font-bold text-muted-foreground">{t(language, "shareStoryPack.generating")}</p>
          </div>
        ) : (
          <img
            src={currentCard.dataUrl}
            alt={currentCard.altText}
            className="h-full w-auto aspect-[9/16] object-contain rounded-xl shadow-md border border-border/60 transition-transform duration-fast"
          />
        )}
      </div>

      {/* Pagination Carousel Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          disabled={activePageIndex <= 0 || isGenerating}
          onClick={goToPreviousPage}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
          aria-label={t(language, "shareStoryPack.previousPage")}
        >
          <ChevronPrevious size={20} data-rtl-flip aria-hidden="true" />
        </button>

        <span
          className="text-xs font-bold text-muted-foreground px-3.5 py-1.5 rounded-full bg-muted/50 border border-border/40 tabular-nums"
          dir="auto"
        >
          {t(language, "shareStoryPack.pageCount", {
            current: formatNumerals(activePageIndex + 1, language),
            total: formatNumerals(totalPages, language),
          })}
        </span>

        <button
          type="button"
          disabled={activePageIndex >= totalPages - 1 || isGenerating}
          onClick={goToNextPage}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
          aria-label={t(language, "shareStoryPack.nextPage")}
        >
          <ChevronNext size={20} data-rtl-flip aria-hidden="true" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Primary Action: Share Current Card */}
        <Button
          type="button"
          size="lg"
          disabled={isGenerating || !currentCard}
          onClick={() => void handleShareCurrent()}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm flex items-center justify-center gap-2 focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <Share2 size={18} aria-hidden="true" />
          <span>{t(language, "shareStoryPack.shareCurrent")}</span>
        </Button>

        {/* Secondary Action: Share All Cards */}
        {totalPages > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isGenerating || !pages}
            onClick={() => void handleShareAll()}
            className="w-full min-h-11 rounded-xl border-border/80 font-bold text-foreground hover:bg-muted/70 flex items-center justify-center gap-2 focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Share2 size={16} aria-hidden="true" />
            <span>{t(language, "shareStoryPack.shareAll")}</span>
          </Button>
        )}

        {/* Quick Utilities Row: Save Image | Copy Image | Download All */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isGenerating || !currentCard}
            onClick={handleDownloadCurrent}
            className="flex-1 min-h-11 rounded-xl border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Download size={15} aria-hidden="true" />
            <span>{t(language, "shareStoryPack.downloadSingle")}</span>
          </Button>

          {canCopyImage() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGenerating || !currentCard}
              onClick={() => void handleCopyCurrent()}
              className="flex-1 min-h-11 rounded-xl border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {copiedRecently ? (
                <>
                  <Check size={15} className="text-success" aria-hidden="true" />
                  <span className="text-success">{t(language, "shareStoryPack.copySingle")}</span>
                </>
              ) : (
                <>
                  <Copy size={15} aria-hidden="true" />
                  <span>{t(language, "shareStoryPack.copySingle")}</span>
                </>
              )}
            </Button>
          )}

          {totalPages > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGenerating || !pages}
              onClick={() => void handleDownloadAll()}
              className="flex-1 min-h-11 rounded-xl border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Download size={15} aria-hidden="true" />
              <span>{t(language, "shareStoryPack.downloadAll")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status Live Region */}
      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
    </Modal>
  );
}
