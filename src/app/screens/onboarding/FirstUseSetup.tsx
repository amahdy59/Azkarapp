import { useEffect, useRef, useState } from "react";
import { Modal, SheetHeader } from "../../components/ResponsiveSheet";
import "../../components/ui/pill-controls.css";
import { Button } from "../../components/ui/button";
import { Bell, Lock, MapPin } from "../../components/icons";
import {
  getDownloadPersistence,
  requestDownloadPersistence,
  type DownloadPersistence,
} from "../../content/downloadStorage";
import { readNotificationPermission, requestNotificationPermission } from "../../notifications";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";

/** Optional first-use setup. Permission calls stay behind the existing service boundaries. */
export function FirstUseSetup({ language, onClose }: { language: AppLanguage; onClose: () => void }) {
  const [permission, setPermission] = useState(readNotificationPermission);
  const [storage, setStorage] = useState<DownloadPersistence | null>(null);
  const [storageRequested, setStorageRequested] = useState(false);
  const [busy, setBusy] = useState<"notifications" | "storage" | null>(null);
  const [error, setError] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    void getDownloadPersistence().then((value) => {
      if (mounted.current) setStorage(value);
    });
    return () => {
      mounted.current = false;
    };
  }, []);
  const request = async (kind: "notifications" | "storage") => {
    if (busy) return;
    setBusy(kind);
    setError(false);
    try {
      if (kind === "notifications") {
        const value = await requestNotificationPermission();
        if (mounted.current) setPermission(value);
      } else {
        setStorageRequested(true);
        const value = await requestDownloadPersistence();
        if (mounted.current) setStorage(value);
      }
    } catch {
      if (mounted.current) setError(true);
    } finally {
      if (mounted.current) setBusy(null);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "firstUse.title")}
      direction={language === "ar" ? "rtl" : "ltr"}
      testId="first-use-setup"
      maxWidthClassName="max-w-[32rem]"
      showCloseButton={false}
    >
      <SheetHeader
        title={t(language, "firstUse.title")}
        language={language}
        onClose={onClose}
        className="compact-sheet-header"
      />
      <div className="min-h-0 space-y-5 overflow-y-auto p-4 [overflow-wrap:anywhere]" style={{ padding: 16 }}>
        <p className="text-sm leading-relaxed text-muted-foreground">{t(language, "firstUse.intro")}</p>
        <section
          className="space-y-3 rounded-2xl border border-border p-4"
          style={{ padding: 16 }}
          aria-labelledby="setup-notifications"
        >
          <h3 id="setup-notifications" className="flex items-center gap-2 font-bold">
            <Bell size={20} aria-hidden="true" />
            <span className="min-w-0">{t(language, "notifications.title")}</span>
          </h3>
          <p className="text-sm text-muted-foreground">{t(language, "firstUse.reminders")}</p>
          <p role="status" className="text-sm">
            {t(
              language,
              `notifications.permission${permission === "granted" ? "Granted" : permission === "denied" ? "Denied" : permission === "unsupported" ? "Unsupported" : "Default"}`,
            )}
          </p>
          {permission === "default" && (
            <Button
              className="max-w-full whitespace-normal"
              disabled={busy !== null}
              aria-busy={busy === "notifications"}
              onClick={() => void request("notifications")}
            >
              {t(language, "notifications.requestPermission")}
            </Button>
          )}
          <a
            href="#/settings/notifications"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-primary underline focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language, "firstUse.reviewReminders")}
          </a>
        </section>
        <section
          className="space-y-3 rounded-2xl border border-border p-4"
          style={{ padding: 16 }}
          aria-labelledby="setup-storage"
        >
          <h3 id="setup-storage" className="flex items-center gap-2 font-bold">
            <Lock size={20} aria-hidden="true" />
            <span className="min-w-0">{t(language, "firstUse.storage")}</span>
          </h3>
          <p className="text-sm text-muted-foreground">{t(language, "firstUse.storageHelp")}</p>
          <p role="status" className="text-sm">
            {t(
              language,
              storage === "granted"
                ? "firstUse.storageGranted"
                : storage === "unsupported"
                  ? "firstUse.storageUnsupported"
                  : storageRequested && storage === "denied"
                    ? "firstUse.storageDenied"
                    : "firstUse.storageOptional",
            )}
          </p>
          {storage !== "granted" && storage !== "unsupported" && (
            <Button
              className="max-w-full whitespace-normal"
              variant="outline"
              disabled={busy !== null}
              aria-busy={busy === "storage"}
              onClick={() => void request("storage")}
            >
              {t(language, "firstUse.protectStorage")}
            </Button>
          )}
        </section>
        <a
          href="#/settings/location"
          onClick={onClose}
          className="flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary underline focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <MapPin size={20} aria-hidden="true" />
          {t(language, "firstUse.location")}
        </a>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {t(language, "firstUse.error")}
          </p>
        )}
        <Button className="w-full whitespace-normal" onClick={onClose}>
          {t(language, "firstUse.continue")}
        </Button>
      </div>
    </Modal>
  );
}
