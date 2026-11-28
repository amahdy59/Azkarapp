import { useEffect, useId, useRef, useState } from "react";
import { PLAY_STORE_QR, PLAY_STORE_URL } from "../share/appShareLinks";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { canShareApplication, prepareAppQrFile, shareApplication } from "../share/appSharing";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Copy, Share2 } from "./icons";
import { Button } from "./ui/button";
import { NAVIGATION_FOCUS } from "./ui/controlStyles";

export interface AppShareSheetProps {
  language: AppLanguage;
  direction: "rtl" | "ltr";
  onClose: () => void;
}

export function AppShareSheet(props: AppShareSheetProps) {
  const { language, direction, onClose } = props;
  const descriptionId = useId();
  const manualLink = useRef<HTMLInputElement>(null);
  const canShare = canShareApplication();
  const [file] = useState<File | null>(() => {
    if (!canShare) return null;
    try {
      return prepareAppQrFile();
    } catch {
      return null;
    }
  });
  type Feedback = "" | "shared" | "cancelled" | "copied" | "copyError" | "shareError";
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>("");
  const active = useRef(false);
  const error = feedback.endsWith("Error");
  const manualCopy = feedback === "copyError";
  const message = feedback ? t(language, `${error ? "appSharing" : "shareStudio"}.${feedback}`) : "";
  const run = async (action: () => Promise<Feedback>, failure: Feedback) => {
    if (active.current) return;
    active.current = true;
    setBusy(true);
    setFeedback("");
    try {
      setFeedback(await action());
    } catch {
      setFeedback(failure);
    } finally {
      active.current = false;
      setBusy(false);
    }
  };
  const onShare = () => void run(() => shareApplication(t(language, "appSharing.title"), file), "shareError");
  const onCopy = () =>
    void run(async () => {
      await navigator.clipboard.writeText(PLAY_STORE_URL);
      return "copied";
    }, "copyError");
  useEffect(() => {
    if (!manualCopy) return;
    manualLink.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    manualLink.current?.focus({ preventScroll: true });
    manualLink.current?.select();
  }, [manualCopy]);
  return (
    <ResponsiveSheet
      open
      protectedSurface
      title={t(language, "appSharing.title")}
      language={language}
      direction={direction}
      onClose={onClose}
      describedById={descriptionId}
      testId="app-share-sheet"
      maxWidthClassName="max-w-sm"
      dialogClassName="app-share-dialog"
    >
      <SheetHeader
        title={t(language, "appSharing.title")}
        language={language}
        direction={direction}
        onClose={onClose}
      />
      <div className="app-share-content min-h-0 space-y-4 overflow-y-auto overscroll-contain p-5">
        <figure className="flex flex-col items-center gap-3">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(language, "appSharing.openPlayStore")}
            className={`block max-w-full rounded-xl ${NAVIGATION_FOCUS}`}
          >
            <img
              src={PLAY_STORE_QR}
              alt={t(language, "appSharing.playStoreQrAlt")}
              width={224}
              height={224}
              className="h-auto w-56 max-w-full rounded-xl"
            />
          </a>
          <figcaption id={descriptionId} className="text-center text-sm leading-relaxed text-muted-foreground">
            {t(language, "appSharing.scanHint")}
          </figcaption>
        </figure>
        <div className="space-y-4">
          <div className="space-y-1" aria-busy={busy}>
            <Button type="button" className="w-full" disabled={busy} onClick={canShare ? onShare : onCopy}>
              {canShare ? <Share2 aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {t(language, canShare ? "appSharing.title" : "appSharing.copyLink")}
            </Button>
            {canShare && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                disabled={busy}
                onClick={onCopy}
              >
                {t(language, "appSharing.copyLink")}
              </Button>
            )}
          </div>
          <p
            role={error ? "alert" : "status"}
            className={`text-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
          >
            {message}
          </p>
          {manualCopy && (
            <input
              ref={manualLink}
              aria-label={t(language, "shareStudio.link")}
              type="text"
              readOnly
              dir="ltr"
              value={PLAY_STORE_URL}
              onFocus={(event) => event.currentTarget.select()}
              className={`min-h-11 w-full min-w-0 rounded-xl border border-border-control bg-background px-3 py-2 text-sm text-foreground ${NAVIGATION_FOCUS}`}
            />
          )}
        </div>
      </div>
    </ResponsiveSheet>
  );
}

export default AppShareSheet;
