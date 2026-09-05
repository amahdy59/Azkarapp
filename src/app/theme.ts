import type { AppLanguage, ColorBlindSupport, TextSizeOption, ZikrFontOption, ThemeMode } from "./types";
import { t } from "./i18n";

const PRODUCT_THEME_CLASSES = ["theme-midnight", "theme-light", "theme-dark"] as const;
/** Mirrors the --background value per theme in src/styles/theme.css, for the theme-color meta tag. */
const THEME_BACKGROUND: Record<ThemeMode, string> = {
  midnight: "#0A1228",
  light: "#F8F5F0",
  dark: "#0D0D0D",
};

export interface AppAppearancePreferences {
  themeMode: ThemeMode;
  language?: AppLanguage;
  textSize?: TextSizeOption;
  highContrast?: boolean;
  boldText?: boolean;
  reduceMotion?: boolean;
  reduceTransparency?: boolean;
  forceRtl?: boolean;
  colorBlindSupport?: ColorBlindSupport;
  zikrFont?: ZikrFontOption;
}

/** Applies the complete root appearance contract atomically to prevent stale theme classes and startup flashes. */
export function applyAppAppearance({
  themeMode,
  language = "en",
  textSize = "medium",
  highContrast = false,
  boldText = false,
  reduceMotion = false,
  reduceTransparency = false,
  forceRtl = false,
  colorBlindSupport = "none",
  zikrFont = "humanist",
}: AppAppearancePreferences) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove(
    ...PRODUCT_THEME_CLASSES,
    "dark",
    "high-contrast",
    "bold-text",
    "reduce-motion",
    "reduce-transparency",
  );
  root.classList.add(`theme-${themeMode}`);
  if (themeMode !== "light") root.classList.add("dark");
  if (highContrast) root.classList.add("high-contrast");
  if (boldText) root.classList.add("bold-text");
  if (reduceMotion) root.classList.add("reduce-motion");
  if (reduceTransparency) root.classList.add("reduce-transparency");

  const fontSizes: Record<TextSizeOption, string> = { small: "14px", medium: "16px", large: "18px" };
  root.lang = language;
  root.dir = language === "ar" || forceRtl ? "rtl" : "ltr";
  root.style.setProperty("--font-size", fontSizes[textSize]);
  root.style.setProperty("--font-weight-medium", boldText ? "700" : "500");
  root.style.setProperty("--font-weight-normal", boldText ? "500" : "400");
  root.dataset.colorBlindSupport = colorBlindSupport;
  // "humanist" is the token's own default, so it carries no attribute — the
  // stylesheet then has nothing to override and the default costs no rule.
  if (zikrFont === "humanist") delete root.dataset.zikrFont;
  else root.dataset.zikrFont = zikrFont;
  root.style.colorScheme = themeMode === "light" && !highContrast ? "light" : "dark";
  const skipLink = document.querySelector<HTMLAnchorElement>(".skip-link");
  if (skipLink) skipLink.textContent = t(language, "common.skipToMain");

  let metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = highContrast ? "#02050D" : THEME_BACKGROUND[themeMode];
}
