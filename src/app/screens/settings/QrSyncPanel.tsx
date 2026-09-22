import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import type { AppLanguage } from "../../types";
import { CLOUDFLARE_DEVICE_EVENT, CLOUDFLARE_DEVICE_SECRET_KEY } from "../../../lib/cloudflareSync";
import { t } from "../../i18n";

const API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || "https://azkarapp-api.amahdy59.workers.dev";

async function api(path: string, init?: RequestInit) {
  const secret = localStorage.getItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "request_failed");
  return data;
}

async function ensureDevice() {
  const existing = localStorage.getItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  if (existing) return existing;
  const result = await api("/v1/devices", { method: "POST", body: "{}" });
  const secret = String(result.secret ?? "");
  if (!secret) throw new Error("device_failed");
  localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, secret);
  window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT));
  return secret;
}

export function QrSyncPanel({ language }: { language: AppLanguage }) {
  const [qr, setQr] = useState<string>();
  const [pairingToken, setPairingToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("pair");
    if (!token) return;
    setPairingToken(token);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  const generate = async () => {
    try {
      await ensureDevice();
      const result = await api("/v1/pairings", { method: "POST", body: "{}" });
      const token = String(result.token ?? "");
      setPairingToken(token);
      const image = await api(`/v1/pairings/qr?token=${encodeURIComponent(token)}`);
      setQr(String(image.dataUrl ?? ""));
      setMessage(t(language, "accountData.qrSyncCreated"));
    } catch {
      setMessage(t(language, "accountData.qrSyncCreateError"));
    }
  };

  const claim = async () => {
    if (!pairingToken.trim()) return;
    try {
      const result = await api("/v1/pairings/claim", {
        method: "POST",
        body: JSON.stringify({ token: pairingToken.trim() }),
      });
      localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, String(result.secret ?? ""));
      window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT));
      setMessage(t(language, "accountData.qrSyncLinked"));
    } catch {
      setMessage(t(language, "accountData.qrSyncExpired"));
    }
  };

  const unlink = async () => {
    try {
      await api("/v1/devices/current", { method: "DELETE" });
      localStorage.removeItem(CLOUDFLARE_DEVICE_SECRET_KEY);
      window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT));
      setQr(undefined);
      setPairingToken("");
      setMessage(t(language, "accountData.qrSyncUnlinked"));
    } catch {
      setMessage(t(language, "accountData.qrSyncCreateError"));
    }
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <h2 className="text-subtitle font-semibold text-foreground">{t(language, "accountData.qrSyncTitle")}</h2>
      <p className="mt-1 text-label leading-5 text-muted-foreground">{t(language, "accountData.qrSyncBody")}</p>
      {qr && (
        <img
          src={qr}
          alt={t(language, "accountData.qrSyncAlt")}
          className="mx-auto mt-4 rounded-lg bg-white p-2"
          width={236}
          height={236}
        />
      )}
      <div className="mt-3 flex gap-2">
        <input
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
      <Button type="button" className="mt-3 w-full" onClick={() => void generate()}>
        {t(language, "accountData.qrSyncGenerate")}
      </Button>
      <Button type="button" variant="ghost" className="mt-2 w-full text-destructive" onClick={() => void unlink()}>
        {t(language, "accountData.qrSyncUnlink")}
      </Button>
      {message && (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </section>
  );
}
