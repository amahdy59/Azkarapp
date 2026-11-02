import { useEffect, useRef } from "react";
import { Modal, SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";

export function AudioQueueSheet({
  open,
  onClose,
  controller,
  language,
}: {
  open: boolean;
  onClose: () => void;
  controller: AudioController;
  language: AppLanguage;
}) {
  const currentButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      currentButton.current?.focus({ preventScroll: true });
      currentButton.current?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(language, "listening.queue")}
      language={language}
      direction={language === "ar" ? "rtl" : "ltr"}
      showCloseButton={false}
      testId="audio-queue-sheet"
      className="audio-queue-sheet"
    >
      <SheetHeader title={t(language, "listening.queue")} language={language} onClose={onClose} />
      <div className="audio-queue-body">
        <p className="mb-3 text-sm text-muted-foreground">{t(language, "listening.queueHelp")}</p>
        <ol className="m-0 space-y-2 p-0">
          {controller.state.plan?.entries.map((entry, index) => (
            <li key={entry.entryId}>
              <Button
                ref={index === controller.state.entryIndex ? currentButton : undefined}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal text-start"
                aria-current={index === controller.state.entryIndex ? "true" : undefined}
                onClick={() => {
                  controller.selectEntry(index);
                  onClose();
                }}
              >
                <span className="shrink-0 tabular-nums">{formatNumerals(index + 1, language)}</span>
                <span className="min-w-0 break-words">
                  {language === "ar" ? entry.titleArabic : entry.titleEnglish}
                  {index === controller.state.entryIndex && (
                    <span className="block text-xs text-muted-foreground">{t(language, "listening.current")}</span>
                  )}
                </span>
              </Button>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
