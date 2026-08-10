import { AlertTriangle, Bookmark, CloudOff, Download, Search, VolumeX } from "./icons";
import { Button } from "./ui/button";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export type AppStateKind =
  "empty-search" | "empty-saved" | "network-error" | "offline" | "audio-error" | "download-error" | "interrupted";

const COPY_KEYS: Record<AppStateKind, { title: string; description: string }> = {
  "empty-search": { title: "search.emptyTitle", description: "search.emptyDescription" },
  "empty-saved": { title: "library.savedEmptyTitle", description: "library.savedEmptyBody" },
  "network-error": { title: "common.networkError", description: "common.networkErrorDescription" },
  offline: { title: "syncStatus.offlineTitle", description: "syncStatus.offlineNotice" },
  "audio-error": { title: "reader.audioUnavailable", description: "reader.audioUnavailableDescription" },
  "download-error": { title: "downloads.downloadError", description: "downloads.downloadErrorDescription" },
  interrupted: { title: "reader.sessionPaused", description: "reader.sessionPausedDescription" },
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
  language = "en",
}: {
  kind: AppStateKind;
  actionLabel?: string;
  onAction?: () => void;
  title?: string;
  description?: string;
  language?: AppLanguage;
}) {
  const copy = COPY_KEYS[kind];
  const Icon = ICONS[kind];
  const isAlert = kind === "network-error" || kind === "audio-error" || kind === "download-error";
  return (
    <section
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center"
      role={isAlert ? "alert" : "status"}
    >
      <Icon size={32} className="text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-[1.0625rem] font-semibold text-foreground">{title ?? t(language, copy.title)}</h2>
      <p className="mt-1 max-w-sm text-[0.875rem] leading-[22px] text-muted-foreground">
        {description ?? t(language, copy.description)}
      </p>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-4 px-5">
          {actionLabel}
        </Button>
      )}
    </section>
  );
}
