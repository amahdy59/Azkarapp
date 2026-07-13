import { AlertTriangle, CloudOff, Download, Search, VolumeX } from "lucide-react";

export type AppStateKind =
  "empty-search" | "network-error" | "offline" | "audio-error" | "download-error" | "interrupted";

const COPY: Record<AppStateKind, { title: string; description: string }> = {
  "empty-search": { title: "No azkar found", description: "Try another word in Arabic, English, or transliteration." },
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
}: {
  kind: AppStateKind;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const copy = COPY[kind];
  const Icon = ICONS[kind];
  return (
    <section
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center"
      role="status"
    >
      <Icon size={32} className="text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-[17px] font-semibold text-foreground">{copy.title}</h2>
      <p className="mt-1 max-w-sm text-[14px] leading-[22px] text-muted-foreground">{copy.description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export function ContentSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading content">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-[72px] animate-pulse rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}
