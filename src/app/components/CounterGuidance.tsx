import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { CounterKeyboardHelp } from "./CounterKeyboardHelp";
import { CounterTapHint } from "./ZikrComponents";
import { HandTap } from "./icons";
import { useCounterGuidance } from "../hooks/useCounterGuidance";

/** One guidance surface: touch instructions on phones, keyboard help on wider screens. */
export function CounterGuidance({
  language,
  direction,
  reader = false,
  placement,
  hasStarted = false,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  reader?: boolean;
  placement?: "above" | "below";
  hasStarted?: boolean;
}) {
  const wide = useMediaQuery("(min-width: 768px)");
  const { expanded, reopen } = useCounterGuidance(hasStarted);
  if ((placement === "above" && wide) || (placement === "below" && !wide)) return null;
  return (
    <div className="w-full shrink-0" data-reading-shortcuts={placement === "below" ? true : undefined}>
      {expanded ? (
        <CounterTapHint
          text={t(language, "reader.tapAnywhere")}
          desktopText={t(language, "reader.tapAnywhereDesktop")}
          keyboardHelp={
            <CounterKeyboardHelp
              compact
              language={language}
              direction={direction}
              shortcuts={[
                { keys: ["Space"], label: t(language, "reader.shortcutCount") },
                ...(reader ? [{ keys: ["→", "←"], label: t(language, "reader.shortcutNavigate") }] : []),
                { keys: ["R"], label: t(language, "reader.shortcutReset") },
                ...(reader ? [{ keys: ["Esc"], label: t(language, "reader.shortcutBack") }] : []),
              ]}
            />
          }
        />
      ) : (
        <button
          type="button"
          className="counter-guidance-reopen mx-auto flex size-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          onClick={reopen}
          aria-label={t(language, "reader.showCountingGuidance")}
          title={t(language, "reader.showCountingGuidance")}
          data-testid="counter-guidance-reopen"
        >
          <HandTap size={22} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
