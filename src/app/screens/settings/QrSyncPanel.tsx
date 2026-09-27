import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import type { AppLanguage } from "../../types";
import {
  claimCloudflarePairing,
  CLOUDFLARE_DEVICE_EVENT,
  createCloudflarePairing,
  hasCloudflareDevice,
  unlinkCloudflareDevice,
} from "../../../lib/cloudflareSync";
import { t } from "../../i18n";
import { formatNumerals } from "../../formatting";

function formatMinutesSeconds(totalSeconds: number, language: AppLanguage) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const str = `${mins}:${secs.toString().padStart(2, "0")}`;
  return formatNumerals(str, language);
}

export function QrSyncPanel({ language }: { language: AppLanguage }) {
  const [isLinked, setIsLinked] = useState<boolean>(hasCloudflareDevice);
  const [confirmingUnlink, setConfirmingUnlink] = useState(false);
  const [qr, setQr] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [pairingToken, setPairingToken] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const handleDeviceChange = () => {
      setIsLinked(hasCloudflareDevice());
    };
    window.addEventListener(CLOUDFLARE_DEVICE_EVENT, handleDeviceChange);
    window.addEventListener("storage", handleDeviceChange);
    return () => {
      window.removeEventListener(CLOUDFLARE_DEVICE_EVENT, handleDeviceChange);
      window.removeEventListener("storage", handleDeviceChange);
    };
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("pair");
    if (!token) return;
    setPairingToken(token);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const generate = async () => {
    if (pending) return;
    setPending(true);
    try {
      const pairing = await createCloudflarePairing();
      setIsLinked(hasCloudflareDevice());
      setPairingToken(pairing.token);
      setQr(pairing.dataUrl);
      setExpiresAt(pairing.expiresAt);
      setMessage(t(language, "accountData.qrSyncCreated"));
    } catch {
      setMessage(t(language, "accountData.qrSyncCreateError"));
    } finally {
      setPending(false);
    }
  };

  const claim = async () => {
    if (pending || !pairingToken.trim()) return;
    setPending(true);
    try {
      await claimCloudflarePairing(pairingToken.trim());
      setIsLinked(true);
      setMessage(t(language, "accountData.qrSyncLinked"));
    } catch {
      setMessage(t(language, "accountData.qrSyncExpired"));
    } finally {
      setPending(false);
    }
  };

  const unlink = async () => {
    if (pending) return;
    setPending(true);
    try {
      await unlinkCloudflareDevice();
      setIsLinked(false);
      setConfirmingUnlink(false);
      setQr(undefined);
      setExpiresAt(null);
      setPairingToken("");
      setMessage(t(language, "accountData.qrSyncUnlinked"));
    } catch {
      setMessage(t(language, "accountData.qrSyncCreateError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <fieldset
      disabled={pending}
      aria-busy={pending}
      aria-label={t(language, "accountData.qrSyncLinkAnother")}
      className="min-w-0 space-y-4"
    >
      {/* This Device Card */}
      <section className="rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="text-subtitle font-semibold text-foreground">{t(language, "accountData.qrSyncThisDevice")}</h2>
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className={`size-2.5 rounded-full ${isLinked ? "bg-success" : "bg-muted-foreground"}`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-foreground">
            {t(language, isLinked ? "accountData.qrSyncStatusLinked" : "accountData.qrSyncStatusNotLinked")}
          </span>
        </div>

        {isLinked && (
          <div className="mt-4 border-t border-border/60 pt-3">
            {confirmingUnlink ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive leading-relaxed">
                  {t(language, "accountData.qrSyncUnlinkConfirm")}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => void unlink()}
                  >
                    {t(language, "accountData.qrSyncConfirmUnlinkAction")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmingUnlink(false)}
                  >
                    {t(language, "accountData.qrSyncCancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmingUnlink(true)}
              >
                {t(language, "accountData.qrSyncUnlink")}
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Link Another Device Card */}
      <section className="rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="text-subtitle font-semibold text-foreground">{t(language, "accountData.qrSyncLinkAnother")}</h2>
        <p className="mt-1 text-label leading-5 text-muted-foreground">{t(language, "accountData.qrSyncBody")}</p>

        {qr && (
          <div className="mt-4 flex flex-col items-center">
            <img
              src={qr}
              alt={t(language, "accountData.qrSyncAlt")}
              className="rounded-lg bg-white p-2 shadow-sm"
              width={236}
              height={236}
            />
            {secondsLeft > 0 ? (
              <span className="mt-2.5 text-xs font-semibold text-muted-foreground">
                {t(language, "accountData.qrSyncExpiresIn", {
                  time: formatMinutesSeconds(secondsLeft, language),
                })}
              </span>
            ) : (
              <div className="mt-3 text-center">
                <p className="text-xs font-semibold text-warning">{t(language, "accountData.qrSyncExpiredNotice")}</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void generate()}>
                  {t(language, "accountData.qrSyncGenerate")}
                </Button>
              </div>
            )}
          </div>
        )}

        {!qr && (
          <Button type="button" className="mt-3.5 w-full" onClick={() => void generate()}>
            {t(language, "accountData.qrSyncGenerate")}
          </Button>
        )}

        <div className="mt-5 border-t border-border/60 pt-4">
          <label htmlFor="pairing-token-input" className="block text-xs font-semibold text-muted-foreground mb-1.5">
            {t(language, "accountData.qrSyncOrEnterToken")}
          </label>
          <div className="flex gap-2">
            <input
              id="pairing-token-input"
              value={pairingToken}
              onChange={(event) => setPairingToken(event.target.value)}
              aria-label={t(language, "accountData.qrSyncToken")}
              placeholder={t(language, "accountData.qrSyncTokenPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <Button type="button" variant="outline" onClick={() => void claim()}>
              {t(language, "accountData.qrSyncLink")}
            </Button>
          </div>
        </div>

        {message && (
          <p role="status" className="mt-3 text-xs font-medium text-primary">
            {message}
          </p>
        )}
      </section>
    </fieldset>
  );
}
