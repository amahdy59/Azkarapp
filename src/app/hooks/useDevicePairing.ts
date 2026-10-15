import { useEffect, useState } from "react";
import { claimCloudflarePairing, createCloudflarePairing, unlinkCloudflareDevice } from "../../lib/cloudflareSync";
import { useDeviceLinkStatus } from "./useDeviceLinkStatus";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Owns pairing requests and expiry; the panel only presents their current state. */
export function useDevicePairing(language: AppLanguage) {
  const isLinked = useDeviceLinkStatus();
  const [confirmingUnlink, setConfirmingUnlink] = useState(false);
  const [qr, setQr] = useState<string>();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [pairingToken, setPairingToken] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

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
    if (pending) return;
    if (!pairingToken.trim()) {
      setMessage(t(language, "accountData.qrSyncRequired"));
      return;
    }
    setPending(true);
    try {
      await claimCloudflarePairing(pairingToken.trim());
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

  return {
    isLinked,
    confirmingUnlink,
    setConfirmingUnlink,
    qr,
    secondsLeft,
    pairingToken,
    setPairingToken,
    message,
    pending,
    generate,
    claim,
    unlink,
  };
}
