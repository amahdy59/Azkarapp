import { useId, useState } from "react";
import { Share2 } from "./icons";
import { Button } from "./ui/button";
import {
  prepareZikrShareCardFonts,
  shareZikrCard,
  type ShareZikrCardOptions,
  type ZikrShareCardInput,
  type ZikrShareCardStatus,
  type ZikrShareResult,
} from "../share/zikrShareCard";

export interface ZikrShareButtonLabels {
  action: string;
  generating: string;
  openingShareSheet: string;
  shared: string;
  copying: string;
  copied: string;
  downloading: string;
  downloaded: string;
  cancelled: string;
  error: string;
}

export interface ZikrShareButtonProps {
  card: ZikrShareCardInput;
  labels: ZikrShareButtonLabels;
  className?: string;
  disabled?: boolean;
  fallback?: ShareZikrCardOptions["fallback"];
  onStatusChange?: (status: ZikrShareCardStatus) => void;
  onResult?: (result: ZikrShareResult) => void;
}

const BUSY_STATUSES: ReadonlySet<ZikrShareCardStatus> = new Set([
  "generating",
  "openingShareSheet",
  "copying",
  "downloading",
]);

/**
 * Accessible, localization-neutral action for a Reader toolbar or share sheet.
 * The caller owns every visible and announced string.
 */
export function ZikrShareButton({
  card,
  labels,
  className,
  disabled = false,
  fallback,
  onStatusChange,
  onResult,
}: ZikrShareButtonProps) {
  const statusId = useId();
  const [status, setStatus] = useState<ZikrShareCardStatus | null>(null);
  const busy = status ? BUSY_STATUSES.has(status) : false;

  const updateStatus = (nextStatus: ZikrShareCardStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  const handleShare = async () => {
    try {
      const result = await shareZikrCard(card, { fallback, onStatus: updateStatus });
      onResult?.(result);
    } catch {
      // `shareZikrCard` has already emitted the localizable error status.
    }
  };

  const announcedMessage = status ? labels[status] : "";

  return (
    <>
      <Button
        type="button"
        size="lg"
        className={className}
        disabled={disabled || busy}
        aria-describedby={statusId}
        aria-busy={busy || undefined}
        onPointerEnter={() => void prepareZikrShareCardFonts()}
        onFocus={() => void prepareZikrShareCardFonts()}
        onClick={() => void handleShare()}
      >
        <Share2 aria-hidden="true" />
        {status && busy ? labels[status] : labels.action}
      </Button>
      <span
        id={statusId}
        className="sr-only"
        role={status === "error" ? "alert" : "status"}
        aria-live={status === "error" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {announcedMessage}
      </span>
    </>
  );
}
