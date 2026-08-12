import { useRef, useState } from "react";
import { X, Share2 } from "../components/icons";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { PalmTreeMark } from "./RoutineGarden";
import { Modal } from "./ResponsiveSheet";
import { reportError } from "../../lib/observability";

interface ShareableCardModalProps {
  palms: number;
  golden: number;
  green: number;
  dateStr: string;
  language: AppLanguage;
  onClose: () => void;
}

export function ShareableCardModal({ palms, golden, green, dateStr, language, onClose }: ShareableCardModalProps) {
  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<{ message: string; error: boolean } | null>(null);

  const handleShare = async () => {
    if (isSharing) return;
    try {
      setIsSharing(true);
      setShareStatus({ message: t(language, "shareModal.sharing"), error: false });
      if (navigator.share) {
        await navigator.share({
          title: t(language, "shareModal.title"),
          text: t(language, "shareModal.text", {
            palms: formatNumerals(palms, language),
            golden: formatNumerals(golden, language),
          }),
          url: window.location.origin,
        });
        setShareStatus({ message: t(language, "shareModal.shared"), error: false });
      } else {
        const text = t(language, "shareModal.copyText");
        await navigator.clipboard.writeText(text);
        setShareStatus({ message: t(language, "shareModal.copied"), error: false });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus({ message: t(language, "shareModal.cancelled"), error: false });
      } else {
        reportError(error, "progress-share");
        setShareStatus({ message: t(language, "shareModal.error"), error: true });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "shareModal.dialogAria")}
      direction={direction}
      maxWidthClassName="max-w-sm"
      className="border-primary/30 p-6 dark:border-white/10"
    >
      <div className="relative">
        {/* Close Button — dynamically positioned based on direction */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "common.cancel")}
          className={`absolute top-4 ${isArabic ? "right-4" : "left-4"} z-10 flex size-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all`}
        >
          <X size={18} />
        </button>

        {/* Shareable Card Content */}
        <div
          ref={cardRef}
          className="flex flex-col items-center rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent p-6 text-center shadow-inner dark:from-amber-500/20"
        >
          {/* Logo Badge */}
          <div className="flex items-center gap-2 text-[0.875rem] font-black tracking-wider text-amber-600 dark:text-amber-400">
            <PalmTreeMark
              size={20}
              filled={palms > 0}
              className={palms > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400 opacity-40"}
            />
            <span>{t(language, "common.azkar")}</span>
          </div>

          <p className="mt-4 text-[1.125rem] font-black leading-snug text-foreground">
            {t(language, "shareModal.mayAllahAccept")}
          </p>

          <p className="mt-1.5 text-[0.8125rem] font-semibold text-muted-foreground">
            {t(language, "shareModal.completedSubtitle")}
          </p>

          {/* Stats Badge Pill Row */}
          <div className="my-5 flex w-full items-center justify-around rounded-2xl border border-amber-500/30 bg-card/90 py-3 px-4 shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <PalmTreeMark
                size={24}
                filled={palms > 0}
                className={palms > 0 ? "text-amber-500" : "text-muted-foreground/40"}
              />
              <span
                className={`text-[0.9375rem] font-black ${palms > 0 ? "text-amber-500" : "text-muted-foreground/60"}`}
              >
                {formatNumerals(palms, language)}
              </span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "shareModal.palms")}
              </span>
            </div>
            <span className="h-8 w-px bg-amber-500/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[1.25rem]">🍂</span>
              <span className="text-[0.9375rem] font-black text-amber-600 dark:text-amber-400">
                {formatNumerals(golden, language)}
              </span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "shareModal.golden")}
              </span>
            </div>
            <span className="h-8 w-px bg-amber-500/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[1.25rem]">🍃</span>
              <span className="text-[0.9375rem] font-black text-emerald-600 dark:text-emerald-400">
                {formatNumerals(green, language)}
              </span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "shareModal.green")}
              </span>
            </div>
          </div>

          {/* Date Label */}
          <span className="text-[0.75rem] font-extrabold text-muted-foreground" dir="auto">
            {dateStr}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={isSharing}
            aria-busy={isSharing || undefined}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-[0.9375rem] font-black text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            <Share2 size={18} />
            <span>{t(language, "shareModal.shareMilestone")}</span>
          </button>
        </div>
        {shareStatus && (
          <p
            className={`mt-3 text-center text-[0.8125rem] font-semibold ${shareStatus.error ? "text-destructive" : "text-primary"}`}
            role={shareStatus.error ? "alert" : "status"}
            aria-live={shareStatus.error ? undefined : "polite"}
          >
            {shareStatus.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
