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
      className="border-border bg-card p-5 text-foreground sm:p-6"
    >
      <div className="relative">
        {/* Close Button — dynamically positioned based on direction */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "common.cancel")}
          className="absolute end-3 top-3 z-10 flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-[color,background-color,border-color,transform] hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:end-4 sm:top-4"
        >
          <X size={18} />
        </button>

        {/* Shareable Card Content */}
        <div
          ref={cardRef}
          className="flex flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-primary/12 via-card to-card p-6 text-center shadow-inner"
          dir={direction}
        >
          {/* Logo Badge */}
          <div className="flex items-center gap-2 text-[0.875rem] font-black tracking-wider text-primary">
            <PalmTreeMark
              size={20}
              filled={palms > 0}
              className={palms > 0 ? "text-primary" : "text-muted-foreground opacity-40"}
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
          <dl className="my-5 grid w-full grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/70 px-2 py-3 shadow-sm rtl:divide-x-reverse">
            <div className="flex min-w-0 flex-col items-center gap-1 px-2">
              <PalmTreeMark
                size={24}
                filled={palms > 0}
                className={palms > 0 ? "text-primary" : "text-muted-foreground/40"}
              />
              <dd className={`text-[0.9375rem] font-black ${palms > 0 ? "text-primary" : "text-muted-foreground/60"}`}>
                {formatNumerals(palms, language)}
              </dd>
              <dt className="text-[0.6875rem] font-bold text-muted-foreground">{t(language, "shareModal.palms")}</dt>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1 px-2">
              <span className="text-[1.25rem]" aria-hidden="true">
                🍂
              </span>
              <dd className="text-[0.9375rem] font-black text-primary">{formatNumerals(golden, language)}</dd>
              <dt className="text-[0.6875rem] font-bold text-muted-foreground">{t(language, "shareModal.golden")}</dt>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1 px-2">
              <span className="text-[1.25rem]" aria-hidden="true">
                🍃
              </span>
              <dd className="text-[0.9375rem] font-black text-success">{formatNumerals(green, language)}</dd>
              <dt className="text-[0.6875rem] font-bold text-muted-foreground">{t(language, "shareModal.green")}</dt>
            </div>
          </dl>

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
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-[0.9375rem] font-black text-primary-foreground shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-primary active:scale-95 disabled:cursor-wait disabled:opacity-60"
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
