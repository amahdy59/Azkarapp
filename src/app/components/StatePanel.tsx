import { useEffect, useRef } from "react";
import { AlertTriangle, Bookmark, CloudOff, Download, Search, VolumeX } from "./icons";
import { Button } from "./ui/button";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export type AppStateKind =
  | "empty-search"
  | "empty-saved"
  | "network-error"
  | "route-error"
  | "offline"
  | "audio-error"
  | "download-error"
  | "interrupted";

export type StateAnnouncement = "none" | "polite" | "assertive";

const COPY_KEYS: Record<AppStateKind, { title: string; description: string }> = {
  "empty-search": { title: "search.emptyTitle", description: "search.emptyDescription" },
  "empty-saved": { title: "library.savedEmptyTitle", description: "library.savedEmptyBody" },
  "network-error": { title: "common.networkError", description: "common.networkErrorDescription" },
  "route-error": { title: "common.contentLoadError", description: "common.contentLoadErrorDescription" },
  offline: { title: "syncStatus.offlineTitle", description: "syncStatus.offlineNotice" },
  "audio-error": { title: "reader.audioUnavailable", description: "reader.audioUnavailableDescription" },
  "download-error": { title: "downloads.downloadError", description: "downloads.downloadErrorDescription" },
  interrupted: { title: "reader.sessionPaused", description: "reader.sessionPausedDescription" },
};

const ICONS = {
  "empty-search": Search,
  "empty-saved": Bookmark,
  "network-error": AlertTriangle,
  "route-error": AlertTriangle,
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
  secondaryActionLabel,
  onSecondaryAction,
  announcement,
  focusOnMount = false,
  isBusy = false,
}: {
  kind: AppStateKind;
  actionLabel?: string;
  onAction?: () => void;
  title?: string;
  description?: string;
  language?: AppLanguage;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  announcement?: StateAnnouncement;
  focusOnMount?: boolean;
  isBusy?: boolean;
}) {
  const copy = COPY_KEYS[kind];
  const Icon = ICONS[kind];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const defaultAnnouncement: StateAnnouncement =
    kind === "network-error" || kind === "route-error" || kind === "audio-error" || kind === "download-error"
      ? "assertive"
      : "none";
  const liveMode = announcement ?? defaultAnnouncement;

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <section
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center"
      role={liveMode === "assertive" ? "alert" : liveMode === "polite" ? "status" : undefined}
      aria-live={liveMode === "polite" ? "polite" : undefined}
      aria-busy={isBusy || undefined}
    >
      <Icon size={32} className="text-primary" aria-hidden="true" />
      <h2
        ref={headingRef}
        tabIndex={focusOnMount ? -1 : undefined}
        className="mt-3 text-[1.0625rem] font-semibold text-foreground"
      >
        {title ?? t(language, copy.title)}
      </h2>
      <p className="mt-1 max-w-sm text-[0.875rem] leading-[22px] text-muted-foreground">
        {description ?? t(language, copy.description)}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-4 flex w-full max-w-sm flex-col-reverse justify-center gap-2 sm:flex-row">
          {secondaryActionLabel && onSecondaryAction && (
            <Button type="button" variant="outline" onClick={onSecondaryAction} disabled={isBusy} className="px-5">
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button type="button" onClick={onAction} disabled={isBusy} className="px-5">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
