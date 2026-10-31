import { useEffect, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import { shouldAnnounceCount } from "../counterAnnouncement";
import { formatRatio } from "../formatting";
import { t } from "../i18n";

export function useCounterAnnouncement(count: number, target: number, language: AppLanguage, identity: string) {
  const [message, setMessage] = useState("");
  const previous = useRef({ count, target, language, identity });
  useEffect(() => {
    const prior = previous.current;
    previous.current = { count, target, language, identity };
    if (prior.identity !== identity || prior.language !== language || prior.target !== target || count < prior.count) {
      setMessage("");
    } else if (count !== prior.count && shouldAnnounceCount(count, target)) {
      setMessage(
        `${count >= target ? `${t(language, "counter.done")} · ` : ""}${formatRatio(count, target, language)}`,
      );
    }
  }, [count, target, language, identity]);
  return message;
}
