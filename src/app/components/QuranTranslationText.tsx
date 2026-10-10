import { memo, useEffect, useRef } from "react";
import type { TextSizeOption } from "../types";
import type { QuranTranslationVerse } from "../content/quranTranslation";
import "./quran-listening-translation.css";

const FONT_SIZES: Record<"listening" | "page", Record<TextSizeOption, string>> = {
  listening: {
    small: "1.125rem",
    medium: "1.25rem",
    large: "1.5rem",
  },
  page: {
    small: "0.875rem",
    medium: "0.9375rem",
    large: "1.125rem",
  },
};

/** Shared English presentation; playback and content loading belong to its caller. */
export const QuranTranslationText = memo(function QuranTranslationText({
  verses,
  activeVerseKey,
  follow,
  pageNumber,
  textSize = "medium",
  variant = "listening",
  label,
  className = "",
  onManualBrowse,
}: {
  verses: readonly QuranTranslationVerse[];
  activeVerseKey: string | null;
  follow: boolean;
  pageNumber: number;
  textSize?: TextSizeOption;
  variant?: "listening" | "page";
  label: string;
  className?: string;
  onManualBrowse?: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const region = viewport.current;
    const pause = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) onManualBrowse?.();
    };
    region?.addEventListener("keydown", pause);
    return () => region?.removeEventListener("keydown", pause);
  }, [onManualBrowse]);
  useEffect(() => {
    if (viewport.current) viewport.current.scrollTop = 0;
  }, [pageNumber]);
  useEffect(() => {
    const region = viewport.current;
    const active = region?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!region || !active || !follow) return;
    const reveal = () => {
      const bounds = active.getBoundingClientRect();
      const view = region.getBoundingClientRect();
      if (region.scrollHeight > region.clientHeight && (bounds.top < view.top || bounds.bottom > view.bottom)) {
        region.scrollTo?.({ top: region.scrollTop + bounds.top - view.top, behavior: "instant" });
      }
    };
    reveal();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(reveal);
    observer?.observe(region);
    return () => observer?.disconnect();
  }, [activeVerseKey, follow, pageNumber, verses, textSize, variant]);
  return (
    <div
      ref={viewport}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Independent native English reading scroll region.
      tabIndex={0}
      role="region"
      aria-label={label}
      dir="ltr"
      lang="en"
      className={`quran-meaning-text ${className} focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring`}
      style={{ fontSize: FONT_SIZES[variant][textSize] }}
      onWheel={onManualBrowse}
      onTouchMove={onManualBrowse}
      onPointerDown={onManualBrowse}
    >
      {verses.map((verse) => (
        <p
          key={verse.verseKey}
          data-translation-verse={verse.verseKey}
          aria-current={activeVerseKey === verse.verseKey ? "true" : undefined}
        >
          <span className="audio-translation-marker">{verse.marker}</span>
          <span>{verse.text}</span>
        </p>
      ))}
    </div>
  );
});
