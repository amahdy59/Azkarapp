import { AlertTriangle, Bookmark, CloudOff, Download, Search, VolumeX } from "./icons";
import { Button } from "./ui/button";

export type AppStateKind =
  "empty-search" | "empty-saved" | "network-error" | "offline" | "audio-error" | "download-error" | "interrupted";

const COPY: Record<AppStateKind, { title: string; description: string }> = {
  "empty-search": { title: "No azkar found", description: "Try another word in Arabic, English, or transliteration." },
  "empty-saved": { title: "No saved azkar yet", description: "Bookmark a zikr to find it here." },
  "network-error": {
    title: "Couldn’t connect",
    description: "Check your connection and try again. Your local progress is safe.",
  },
  offline: { title: "You’re offline", description: "Downloaded content and counting remain available." },
  "audio-error": { title: "Audio unavailable", description: "Continue reading now or retry the recitation." },
  "download-error": { title: "Download interrupted", description: "Free some space or reconnect, then resume." },
  interrupted: { title: "Session paused", description: "Continue where you stopped or restart this zikr." },
};

const ICONS = {
  "empty-search": Search,
  "empty-saved": Bookmark,
  "network-error": AlertTriangle,
  offline: CloudOff,
  "audio-error": VolumeX,
  "download-error": Download,
  interrupted: AlertTriangle,
};

export function StatePanel({
  kind,
  actionLabel,
  onAction,
  title,
  description,
}: {
  kind: AppStateKind;
  actionLabel?: string;
  onAction?: () => void;
  title?: string;
  description?: string;
}) {
  const copy = COPY[kind];
  const Icon = ICONS[kind];
  return (
    <section
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center"
      role="status"
    >
      <Icon size={32} className="text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-[1.0625rem] font-semibold text-foreground">{title ?? copy.title}</h2>
      <p className="mt-1 max-w-sm text-[0.875rem] leading-[22px] text-muted-foreground">
        {description ?? copy.description}
      </p>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-4 px-5">
          {actionLabel}
        </Button>
      )}
    </section>
  );
}
