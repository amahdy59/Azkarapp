import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { CounterKeyboardHelp } from "./CounterKeyboardHelp";
import { CounterTapHint } from "./ZikrComponents";
import { useCounterGuidance } from "../hooks/useCounterGuidance";

/** One guidance surface: touch instructions on phones, keyboard help on wider screens. */
export function CounterGuidance({
  language,
  direction,
  reader = false,
  placement,
  hasStarted = false,
  showKeyboardHelp = true,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  reader?: boolean;
  placement?: "above" | "below";
  hasStarted?: boolean;
  hideWhenDismissed?: boolean;
  showKeyboardHelp?: boolean;
}) {
  const wide = useMediaQuery("(min-width: 768px)");
  const { expanded } = useCounterGuidance(hasStarted);
  if ((placement === "above" && wide) || (placement === "below" && !wide)) return null;
  if (!expanded) return null;
  return (
    <div className="w-full shrink-0" data-reading-shortcuts>
      <CounterTapHint
        expanded={true}
        text={t(language, "reader.tapAnywhere")}
        desktopText={t(language, "reader.tapAnywhereDesktop")}
        keyboardHelp={
          showKeyboardHelp && (
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
          )
        }
      />
    </div>
  );
}
