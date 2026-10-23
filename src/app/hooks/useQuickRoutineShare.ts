import { useEffect, useRef, useState } from "react";
import { getCuratedRoutinePack } from "../share/curatedRoutineCards";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { prepareQuickRoutineShare } from "../share/quickRoutineShare";

type Prepared = Awaited<ReturnType<typeof prepareQuickRoutineShare>>;
export interface QuickRoutineShare {
  available: boolean;
  label: string;
  busy: boolean;
  message: string;
  error: boolean;
  prepare: () => void;
  share: () => void;
}
export function useQuickRoutineShare(categoryId: string, language: AppLanguage): QuickRoutineShare {
  const [feedback, setFeedback] = useState({ busy: false, message: "", error: false });
  const prepared = useRef<Promise<Prepared> | null>(null);
  const identity = `${categoryId}/${language}`;
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const active = useRef(false);
  useEffect(() => {
    currentIdentity.current = identity;
    prepared.current = null;
    setFeedback({ busy: false, message: "", error: false });
    return () => {
      currentIdentity.current = "";
    };
  }, [identity]);
  const prepare = () => {
    if (!prepared.current) {
      prepared.current = import("../share/quickRoutineShare").then((module) =>
        module.prepareQuickRoutineShare(categoryId, language),
      );
      void prepared.current.catch(() => {
        if (currentIdentity.current === identity) prepared.current = null;
      });
    }
    return prepared.current;
  };
  const share = async () => {
    if (active.current) return;
    active.current = true;
    setFeedback({ busy: true, message: t(language, "shareStoryPack.openingShare"), error: false });
    try {
      const pack = await prepare();
      if (currentIdentity.current !== identity) return;
      const module = await import("../share/quickRoutineShare");
      const result = await module.shareQuickRoutinePack(pack);
      if (currentIdentity.current === identity)
        setFeedback({
          busy: false,
          message: t(
            language,
            result === "cancelled"
              ? "shareStoryPack.shareCancelled"
              : result === "downloaded"
                ? "shareStudio.downloaded"
                : "shareStudio.shared",
          ),
          error: false,
        });
    } catch {
      if (currentIdentity.current === identity)
        setFeedback({ busy: false, message: t(language, "home.quickShareError"), error: true });
    } finally {
      active.current = false;
    }
  };
  return {
    available: !!getCuratedRoutinePack(categoryId),
    label: t(language, "home.quickShareCards", { name: getCuratedRoutinePack(categoryId)?.title[language] ?? "" }),
    ...feedback,
    prepare: () => {
      void prepare();
    },
    share: () => {
      void share();
    },
  };
}
