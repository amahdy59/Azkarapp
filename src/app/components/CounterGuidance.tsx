import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { CounterKeyboardHelp } from "./CounterKeyboardHelp";
import { CounterTapHint } from "./ZikrComponents";

/** One guidance surface: touch instructions on phones, keyboard help on wider screens. */
export function CounterGuidance({
  language,
  direction,
  reader = false,
  placement,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  reader?: boolean;
  placement?: "above" | "below";
}) {
  const wide = useMediaQuery("(min-width: 768px)");
  if ((placement === "above" && wide) || (placement === "below" && !wide)) return null;
  return (
    <div className="w-full shrink-0" data-reading-shortcuts={placement === "below" ? true : undefined}>
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
    </div>
  );
}
