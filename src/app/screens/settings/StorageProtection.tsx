import { useEffect, useRef, useState } from "react";
import {
  getDownloadPersistence,
  requestDownloadPersistence,
  type DownloadPersistence,
} from "../../content/downloadStorage";
import { Button } from "../../components/ui/button";
import { Lock } from "../../components/icons";
import { isNativeAndroid } from "../../native/platform";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";

/** Optional browser protection belongs beside backup and local-save status. */
export function StorageProtection({ language }: { language: AppLanguage }) {
  const [storage, setStorage] = useState<DownloadPersistence | null>(null);
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(false);
  const requesting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    if (!isNativeAndroid())
      void getDownloadPersistence().then((value) => {
        if (mounted.current) setStorage(value);
      });
    return () => {
      mounted.current = false;
    };
  }, []);
  if (isNativeAndroid()) return null;
  const request = async () => {
    if (requesting.current) return;
    requesting.current = true;
    setBusy(true);
    setRequested(true);
    const value = await requestDownloadPersistence();
    if (mounted.current) {
      setStorage(value);
      setBusy(false);
    }
    requesting.current = false;
  };
  return (
    <details className="group mt-4 border-t border-border/40 pt-2" data-testid="storage-protection">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
        <Lock size={18} className="shrink-0 text-primary" aria-hidden="true" />
        {t(language, "firstUse.storage")}
      </summary>
      <div className="space-y-3 py-3 text-sm">
        <p className="text-muted-foreground">{t(language, "firstUse.storageHelp")}</p>
        <p role="status">
          {t(
            language,
            storage === "granted"
              ? "firstUse.storageGranted"
              : storage === "unsupported"
                ? "firstUse.storageUnsupported"
                : requested && storage === "denied"
                  ? "firstUse.storageDenied"
                  : "firstUse.storageOptional",
          )}
        </p>
        {storage !== "granted" && storage !== "unsupported" && (
          <Button variant="outline" disabled={busy || storage === null} aria-busy={busy} onClick={() => void request()}>
            {t(language, "firstUse.protectStorage")}
          </Button>
        )}
      </div>
    </details>
  );
}
