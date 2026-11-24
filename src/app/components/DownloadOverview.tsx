import type { ReactNode } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { Card } from "./Card";
import { AlertTriangle, CheckCircle2, Download, X } from "./icons";
import { DownloadProgress } from "./DownloadProgress";
import { Button } from "./ui/button";

/** Presentation only. Acquisition, verified readiness and cancellation belong to the screen. */
export function DownloadOverview({
  language,
  phase,
  title,
  description,
  action,
  disabled,
  onAction,
  size,
  progress,
  children,
}: {
  language: AppLanguage;
  phase: "idle" | "active" | "checking" | "ready" | "failed" | "cancelled";
  title: string;
  description: ReactNode;
  action: string;
  disabled: boolean;
  onAction: () => void;
  size?: ReactNode;
  progress?: { completed: number; total: number; label: string; context?: string };
  children?: ReactNode;
}) {
  const Icon = phase === "ready" ? CheckCircle2 : phase === "failed" ? AlertTriangle : Download;
  return (
    <Card as="section" data-testid="download-overview" data-phase={phase} className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={26} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1" style={{ minWidth: "min(100%, 12rem)" }}>
          <h2 className="text-title font-semibold text-foreground">{title}</h2>
          <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
        </div>
      </div>
      {children}
      {phase === "active" && (
        <div className="min-h-12">
          {progress && progress.total > 0 ? (
            <DownloadProgress {...progress} language={language} active />
          ) : (
            <p className="text-sm text-muted-foreground">{t(language, "downloads.preparingTransfer")}</p>
          )}
        </div>
      )}
      <Button
        data-testid="download-overview-action"
        variant={phase === "active" ? "outline" : "default"}
        size="lg"
        className="w-full"
        disabled={disabled}
        onClick={(event) => {
          // The second click of a double-click must not cancel the transfer just started.
          if (phase === "active" && event.detail > 1) return;
          onAction();
        }}
      >
        {phase === "active" ? <X size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
        {action}
      </Button>
      {size && <p className="text-center text-sm text-muted-foreground">{size}</p>}
      {phase === "active" && <p className="text-sm text-muted-foreground">{t(language, "downloads.keepAppOpen")}</p>}
    </Card>
  );
}
