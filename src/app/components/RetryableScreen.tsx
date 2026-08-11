import { createElement, type ComponentProps, type ComponentType, useEffect, useState } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { reportError } from "../../lib/observability";
import { ScreenFallback } from "./ScreenFallback";
import { StatePanel } from "./StatePanel";

function documentLanguage(): AppLanguage {
  return typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar" : "en";
}

/** Code-splits a screen while keeping chunk failures recoverable without discarding local state. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function retryableScreen<Loaded extends ComponentType<any>>(loader: () => Promise<{ default: Loaded }>) {
  type Props = ComponentProps<Loaded>;
  return function RetryableScreen(props: Props) {
    const language =
      "language" in props && (props.language === "ar" || props.language === "en") ? props.language : documentLanguage();
    const [attempt, setAttempt] = useState(0);
    const [Screen, setScreen] = useState<Loaded | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      let active = true;
      setFailed(false);
      void loader()
        .then((module) => {
          if (active) setScreen(() => module.default);
        })
        .catch((error) => {
          reportError(error, "screen-chunk-load");
          if (active) setFailed(true);
        });
      return () => {
        active = false;
      };
    }, [attempt]);

    if (failed) {
      const retried = attempt > 0;
      return (
        <div className="flex h-full items-center justify-center bg-background p-4">
          <StatePanel
            kind="route-error"
            language={language}
            focusOnMount
            actionLabel={t(language, retried ? "common.refreshApp" : "common.tryAgain")}
            onAction={retried ? () => window.location.reload() : () => setAttempt((value) => value + 1)}
            secondaryActionLabel={t(language, "common.goToLibrary")}
            onSecondaryAction={() => {
              window.location.hash = "#/library";
            }}
          />
        </div>
      );
    }

    if (!Screen) return <ScreenFallback language={language} />;
    return createElement(Screen, props);
  };
}
