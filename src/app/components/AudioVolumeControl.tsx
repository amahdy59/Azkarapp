import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { AudioController } from "../audio/AudioProvider";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { Volume2, VolumeX } from "./icons";

export function AudioVolumeControl({ controller, language }: { controller: AudioController; language: AppLanguage }) {
  const [open, setOpen] = useState(false);
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  if (isIOS) return null;
  const level = controller.preferences.muted ? 0 : controller.preferences.volume;
  const percentage = Math.round(level * 100);
  const volumeLabel = t(language, "audioPlayer.volume");
  const muted = controller.preferences.muted || level === 0;
  const icon = muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={volumeLabel}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {icon}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={8}
          aria-label={volumeLabel}
          data-testid="audio-volume-popover"
          dir={language === "ar" ? "rtl" : "ltr"}
          onEscapeKeyDown={(event) => event.stopPropagation()}
          className="audio-volume-popover z-50 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-2 text-foreground shadow-overlay"
        >
          <span className="text-micro font-bold tabular-nums">{formatNumerals(percentage, language)}%</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={level}
            onChange={(event) => controller.setVolume(Number(event.currentTarget.value))}
            aria-label={volumeLabel}
            aria-orientation="vertical"
            aria-valuetext={`${formatNumerals(percentage, language)}%`}
            className="audio-volume-range cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          />
          <button
            type="button"
            aria-label={t(language, controller.preferences.muted ? "audioPlayer.unmute" : "audioPlayer.mute")}
            aria-pressed={controller.preferences.muted}
            onClick={controller.toggleMuted}
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {icon}
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
