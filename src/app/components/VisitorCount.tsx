import { useEffect, useState } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";

const API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || "https://azkarapp-api.amahdy59.workers.dev";
const VISITOR_KEY = "azkarapp.visitor-id.v1";

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function VisitorCount({ language }: { language: AppLanguage }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void fetch(`${API_URL}/v1/visitors`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { total?: number } | null) => {
        if (active && typeof data?.total === "number") setCount(data.total);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (count === null) return null;
  return (
    <p
      className="mt-6 pb-2 text-center text-xs text-muted-foreground"
      aria-label={t(language, "accountData.visitorCountLabel")}
    >
      {t(language, "accountData.visitorCount", {
        count: count.toLocaleString(language === "ar" ? "ar-EG" : "en-US"),
      })}
    </p>
  );
}
