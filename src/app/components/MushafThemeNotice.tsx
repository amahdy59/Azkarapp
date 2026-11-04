import type { AppLanguage, MushafPageTheme } from "../types";
import { t } from "../i18n";

/** Transient confirmation, never a theme picker or a focusable action. */
export function MushafThemeNotice({ theme, language }: { theme: MushafPageTheme; language: AppLanguage }) {
  const key =
    theme === "light"
      ? "themeLight"
      : theme === "midnight"
        ? "themeMidnight"
        : theme === "oled"
          ? "themeOled"
          : "themeDark";
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="mushaf-theme-hud"
      data-notice-theme={theme}
      style={{ backgroundColor: "var(--mushaf-paper)", color: "var(--mushaf-ink)" }}
      className={`mushaf-theme-hud-surface theme-${theme}`}
    >
      <span aria-hidden="true" className="mushaf-theme-notice-swatch" />
      <span>{t(language, `mushaf.${key}`)}</span>
    </div>
  );
}
