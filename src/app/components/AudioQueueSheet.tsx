import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";

export function AudioQueueSheet({
  onClose,
  controller,
  language,
}: {
  onClose: () => void;
  controller: AudioController;
  language: AppLanguage;
}) {
  const currentButton = useRef<HTMLButtonElement>(null);
  const [body, setBody] = useState<HTMLDivElement | null>(null);
  // Positioning publishes the available height after the portal mounts. Reveal
  // the selected row once that scroll viewport has its actual bounded size.
  useEffect(() => {
    if (!body) return;
    let frame = 0;
    const reveal = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        currentButton.current?.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    };
    const observer = new ResizeObserver(reveal);
    observer.observe(body);
    reveal();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [body]);
  return (
    <Popover.Portal>
      <Popover.Content
        side="top"
        align="center"
        sideOffset={8}
        collisionPadding={8}
        aria-label={t(language, "listening.queue")}
        dir={language === "ar" ? "rtl" : "ltr"}
        data-testid="audio-queue-sheet"
        data-dropdown-surface=""
        className="audio-queue-sheet z-[120] flex flex-col overflow-hidden rounded-[var(--ds-radius-overlay)] border border-border-control bg-popover text-popover-foreground shadow-overlay"
        onEscapeKeyDown={(event) => event.stopPropagation()}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          currentButton.current?.focus({ preventScroll: true });
          currentButton.current?.scrollIntoView({ block: "center", behavior: "instant" });
        }}
      >
        <SheetHeader title={t(language, "listening.queue")} language={language} onClose={onClose} />
        <div ref={setBody} className="audio-queue-body">
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
      </Popover.Content>
    </Popover.Portal>
  );
}
