import { isNativeAndroid } from "../../native/platform";
import { useEffect, useRef, useState } from "react";
import type { AppLanguage, Zikr } from "../../types";
import type { AudioPreferences } from "../../audio/audioTypes";
import { getSavedAudioFiles, prepareSavedAudioFile, type SavedAudioFile } from "../../audio/audioOfflineCache";
import { saveFileToDevice } from "../../share/shareDispatcher";
import { Button } from "../../components/ui/button";
import { Download } from "../../components/icons";
import { t } from "../../i18n";
import { formatNumerals } from "../../formatting";

/** Screen orchestration: exported files are separate from the app's offline cache. */
export function AudioFileExports({
  zikrs,
  preferences,
  language,
  disabled,
  revision,
}: {
  zikrs: readonly Zikr[];
  preferences: AudioPreferences;
  language: AppLanguage;
  disabled: boolean;
  revision: unknown;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<SavedAudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!open || disabled) return;
    let current = true;
    setLoading(true);
    setError("");
    void getSavedAudioFiles(zikrs, preferences)
      .then((result) => {
        if (current) setFiles(result);
      })
      .catch(() => {
        if (current) setError(t(language, "downloads.exportError"));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [open, disabled, zikrs, preferences, revision, language]);
  return (
    <details className="mt-3 border-t border-border/40 pt-2" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
        {t(language, "downloads.exportFiles")}
      </summary>
      {open && (
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">{t(language, "downloads.exportHelp")}</p>
          <p role="status" className="text-sm">
            {loading ? t(language, "downloads.checking") : message}
          </p>
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          {!loading && !error && files.length === 0 && (
            <p className="text-sm text-muted-foreground">{t(language, "downloads.exportEmpty")}</p>
          )}
          {!loading &&
            files.map((file) => (
              <div key={file.id} className="space-y-2 rounded-xl border border-border p-3">
                <p className="break-words text-sm font-semibold">
                  {language === "ar" ? file.titleArabic : file.titleEnglish}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file.voiceName} ·{" "}
                  <bdi dir="ltr">{formatNumerals((file.byteSize / 1_000_000).toFixed(1), language)} MB</bdi>
                </p>
                <Button
                  variant="outline"
                  className="h-auto min-h-11 max-w-full whitespace-normal py-2"
                  disabled={disabled || saving !== null}
                  aria-label={`${t(language, "downloads.saveFile")} · ${language === "ar" ? file.titleArabic : file.titleEnglish} · ${file.voiceName}`}
                  onClick={async () => {
                    setSaving(file.id);
                    setError("");
                    setMessage(t(language, "downloads.preparingFile"));
                    try {
                      const result = await prepareSavedAudioFile(zikrs, preferences, file.id);
                      if (!mounted.current) return;
                      await saveFileToDevice(result);
                      if (!mounted.current) return;
                      setMessage(
                        t(
                          language,
                          isNativeAndroid() ? "downloads.fileSavedOnDevice" : "downloads.fileHandedToBrowser",
                        ),
                      );
                    } catch (error) {
                      if (error instanceof DOMException && error.name === "AbortError") {
                        if (mounted.current) setMessage("");
                        return;
                      }
                      if (mounted.current) {
                        setError(t(language, "downloads.exportError"));
                        setMessage("");
                      }
                    } finally {
                      if (mounted.current) setSaving(null);
                    }
                  }}
                >
                  <Download size={18} aria-hidden="true" />
                  {t(language, saving === file.id ? "downloads.preparingFile" : "downloads.saveFile")}
                </Button>
              </div>
            ))}
        </div>
      )}
    </details>
  );
}
