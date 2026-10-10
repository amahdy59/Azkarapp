import { useRef, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { Button } from "./ui/button";
import { Download, X } from "./icons";
import { DownloadProgress } from "./DownloadProgress";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";

export function OfflineResourceRow({
  id,
  title,
  detail,
  state,
  size,
  completed,
  total,
  language,
  disabled,
  active,
  action,
  onDownload,
  onCancel,
  onRemove,
}: {
  id: string;
  title: string;
  detail: string;
  state: ReactNode;
  size: ReactNode;
  completed: number;
  total: number;
  language: AppLanguage;
  disabled: boolean;
  active: boolean;
  action: string;
  onDownload: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const removeRequestedRef = useRef(false);
  return (
    <section className="space-y-3 py-4" aria-labelledby={`${id}-title`} data-testid={`offline-resource-${id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            ref={headingRef}
            tabIndex={-1}
            id={`${id}-title`}
            className="text-subtitle font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <span className="text-xs text-muted-foreground">{size}</span>
      </div>
      <p className="text-sm text-foreground">{state}</p>
      {total > 0 && (
        <DownloadProgress completed={completed} total={total} label={title} language={language} active={active} />
      )}
      <div className="flex flex-wrap gap-2">
        {active ? (
          <Button
            className="h-auto min-h-11 max-w-full whitespace-normal py-2"
            variant="outline"
            onClick={onCancel}
            aria-label={`${t(language, "downloads.cancelDownload")} · ${title}`}
          >
            <X size={18} aria-hidden="true" />
            {t(language, "downloads.cancelDownload")}
          </Button>
        ) : (
          <Button
            className="h-auto min-h-11 max-w-full whitespace-normal py-2"
            variant="outline"
            disabled={disabled || total === 0 || completed >= total}
            onClick={onDownload}
            aria-label={`${action} · ${title}`}
          >
            <Download size={18} aria-hidden="true" />
            {action}
          </Button>
        )}
        {completed > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={disabled || active}
                aria-label={`${t(language, "downloads.removeResource")} · ${title}`}
              >
                {t(language, "downloads.removeResource")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              dir={language === "ar" ? "rtl" : "ltr"}
              onCloseAutoFocus={(event) => {
                // The confirmed removal may unmount its trigger. Restore to the resource.
                if (!removeRequestedRef.current) return;
                event.preventDefault();
                removeRequestedRef.current = false;
                headingRef.current?.focus();
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{t(language, "downloads.removeTitle", { title })}</AlertDialogTitle>
                <AlertDialogDescription>{t(language, "downloads.removeDescription")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t(language, "common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    removeRequestedRef.current = true;
                    onRemove();
                  }}
                >
                  {t(language, "downloads.removeResource")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </section>
  );
}
