import type { AppLanguage, ColorBlindSupport, TextSizeOption, ThemeMode } from "./types";

export const T = {
  bg: "#0A1228",
  surface: "#111B35",
  surfaceEl: "#182040",
  gold: "#C8941A",
  goldLight: "#E8B420",
  teal: "#1A7060",
  tealBg: "#0A2B25",
  textPrimary: "#F5F0E8",
  textSec: "#D4D0E0",
  textMuted: "#9290B0",
  border: "#182040",
  success: "#2D7A50",
  danger: "#C0392B",
  bgLight: "#F8F5F0",
  surfLight: "#FFFFFF",
  surfElLight: "#F2EEE9",
  goldDark: "#A87614",
  textDarkL: "#1A1228",
  textSecL: "#4A4570",
  textMutedL: "#8E8AAA",
  borderLight: "#E5E0D8",
} as const;

const PRODUCT_THEME_CLASSES = ["theme-midnight", "theme-light", "theme-dark"] as const;
const THEME_BACKGROUND: Record<ThemeMode, string> = {
  midnight: T.bg,
  light: T.bgLight,
  dark: "#0D0D0D",
};

export interface AppAppearancePreferences {
  themeMode: ThemeMode;
  language?: AppLanguage;
  textSize?: TextSizeOption;
  highContrast?: boolean;
  boldText?: boolean;
  reduceMotion?: boolean;
  forceRtl?: boolean;
  colorBlindSupport?: ColorBlindSupport;
}

/** Applies the complete root appearance contract atomically to prevent stale theme classes and startup flashes. */
export function applyAppAppearance({
  themeMode,
  language = "en",
  textSize = "medium",
  highContrast = false,
  boldText = false,
  reduceMotion = false,
  forceRtl = false,
  colorBlindSupport = "none",
}: AppAppearancePreferences) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove(...PRODUCT_THEME_CLASSES, "dark", "high-contrast", "bold-text", "reduce-motion");
  root.classList.add(`theme-${themeMode}`);
  if (themeMode !== "light") root.classList.add("dark");
  if (highContrast) root.classList.add("high-contrast");
  if (boldText) root.classList.add("bold-text");
  if (reduceMotion) root.classList.add("reduce-motion");

  const fontSizes: Record<TextSizeOption, string> = { small: "14px", medium: "16px", large: "18px" };
  root.lang = language;
  root.dir = language === "ar" || forceRtl ? "rtl" : "ltr";
  root.style.setProperty("--font-size", fontSizes[textSize]);
  root.style.setProperty("--font-weight-medium", boldText ? "700" : "500");
  root.style.setProperty("--font-weight-normal", boldText ? "500" : "400");
  root.dataset.colorBlindSupport = colorBlindSupport;
  root.style.colorScheme = themeMode === "light" && !highContrast ? "light" : "dark";

  let metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = highContrast ? "#02050D" : THEME_BACKGROUND[themeMode];
}
