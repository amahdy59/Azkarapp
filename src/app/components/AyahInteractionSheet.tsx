import { useCallback, useEffect, useId, useState } from "react";
import { Bookmark, Check, Copy, Share2, X } from "./icons";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { getSurahDisplayName } from "../content/surahInfo";
import { formatNumerals } from "../formatting";
import { reportError } from "../../lib/observability";

type Feedback = { message: string; error: boolean } | null;

export function AyahInteractionSheet({
  isOpen,
  onClose,
  verseKey,
  text,
  language,
  isBookmarked,
  onBookmark,
}: {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string | null;
  text: string | null;
  language: AppLanguage;
  isBookmarked: boolean;
  onBookmark: () => void;
}) {
  const descriptionId = useId();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setFeedback(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFeedback({ message: t(language, "reader.ayahCopied"), error: false });
    } catch (error) {
      reportError(error, "mushaf-ayah-copy");
      setFeedback({ message: t(language, "reader.copyError"), error: true });
    }
  }, [language, text]);

  const handleShare = useCallback(async () => {
    if (!verseKey || !text) return;
    const [surah, ayah] = verseKey.split(":");
    const surahName = getSurahDisplayName(Number(surah), language);
    const ayahLabel = t(language, "reader.ayahLabel", { ayah: formatNumerals(Number(ayah), language) });
    const shareText = `${text}\n\n[${surahName} · ${ayahLabel}]`;

    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
        setFeedback({ message: t(language, "reader.ayahShared"), error: false });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setFeedback({ message: t(language, "reader.ayahCopied"), error: false });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setFeedback({ message: t(language, "reader.shareCancelled"), error: false });
        return;
      }
      reportError(error, "mushaf-ayah-share");
      setFeedback({ message: t(language, "reader.shareError"), error: true });
    }
  }, [language, text, verseKey]);

  let headerTitle = "";
  if (verseKey) {
    const [surah, ayah] = verseKey.split(":");
    headerTitle = `${getSurahDisplayName(Number(surah), language)} · ${t(language, "reader.ayahLabel", {
      ayah: formatNumerals(Number(ayah), language),
    })}`;
  }

  const actionClass =
    "flex min-h-14 w-full min-w-0 items-center justify-between gap-4 rounded-2xl px-5 py-3 text-start transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-wait disabled:opacity-55";

  return (
    <ResponsiveSheet
      open={isOpen}
      onClose={onClose}
      title={headerTitle || t(language, "reader.interactionSheetAria")}
      direction={language === "ar" ? "rtl" : "ltr"}
      describedById={descriptionId}
      testId="ayah-interaction-sheet"
    >
      <div className="flex flex-col pb-6 pt-3">
        <div className="flex items-start justify-between gap-3 px-5 pb-4">
          <div className="min-w-0 flex-1">
            <p aria-hidden="true" className="text-xl font-bold leading-tight tracking-tight text-foreground">
              {headerTitle}
            </p>
            <p id={descriptionId} className="sr-only">
              {t(language, "reader.interactionSheetAria")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-me-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={t(language, "common.close")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mx-5 mb-3 max-h-36 overflow-y-auto rounded-xl bg-muted/55 px-4 py-3">
          {text ? (
            <p className="zikr-text text-end text-xl leading-9" lang="ar" dir="rtl">
              {text}
            </p>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground" role="status">
              {t(language, "reader.loadingAyah")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 px-3">
          <button type="button" onClick={() => void handleCopy()} className={actionClass} disabled={!text}>
            <span className="font-semibold">{t(language, "reader.copyAyah")}</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              {copied ? (
                <Check size={18} className="text-primary" aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onBookmark();
              setFeedback({
                message: t(language, isBookmarked ? "reader.ayahBookmarkRemoved" : "reader.ayahBookmarkSaved"),
                error: false,
              });
            }}
            className={actionClass}
          >
            <span className="font-semibold">
              {t(language, isBookmarked ? "reader.removeAyahBookmark" : "reader.bookmarkAyah")}
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <Bookmark size={18} className={isBookmarked ? "fill-primary text-primary" : ""} aria-hidden="true" />
            </span>
          </button>

          <button type="button" onClick={() => void handleShare()} className={actionClass} disabled={!text}>
            <span className="font-semibold">{t(language, "reader.shareAyah")}</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <Share2 size={18} aria-hidden="true" />
            </span>
          </button>
        </div>

        {feedback && (
          <p
            className={`mx-5 mt-3 text-sm font-semibold ${feedback.error ? "text-destructive" : "text-primary"}`}
            role={feedback.error ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </ResponsiveSheet>
  );
}
