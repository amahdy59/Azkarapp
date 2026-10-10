import type { AppLanguage, MushafPageTheme } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
export function AyahMarker({
  number,
  language,
  theme = "light",
  isHighlighted = false,
}: {
  number: string | number;
  language: AppLanguage;
  theme?: MushafPageTheme;
  isHighlighted?: boolean;
}) {
  const displayNum = formatNumerals(number, language);
  const isOled = theme === "oled";

  return (
    <span
      className="relative inline-flex shrink-0 select-none items-center justify-center align-middle mx-0.5"
      role="img"
      aria-label={t(language, "reader.ayahLabel", { ayah: displayNum })}
    >
      {/* Authentic Madani Octagram Rosette in manuscript gold ink */}
      <svg width="1.3em" height="1.3em" viewBox="0 0 32 32" fill="none" className="select-none" aria-hidden="true">
        <rect
          x="5.5"
          y="5.5"
          width="21"
          height="21"
          rx="3.5"
          stroke="var(--mushaf-rule-ink, var(--accent, #d4b47c))"
          strokeWidth={isHighlighted ? "1.5" : "1.2"}
          strokeOpacity={isHighlighted ? "1" : "0.85"}
        />
        <rect
          x="5.5"
          y="5.5"
          width="21"
          height="21"
          rx="3.5"
          stroke="var(--mushaf-rule-ink, var(--accent, #d4b47c))"
          strokeWidth={isHighlighted ? "1.5" : "1.2"}
          strokeOpacity={isHighlighted ? "1" : "0.85"}
          transform="rotate(45 16 16)"
        />
        <circle
          cx="16"
          cy="16"
          r="8.5"
          fill={isHighlighted ? "var(--primary)" : "none"}
          fillOpacity={isHighlighted ? 0.35 : undefined}
          stroke="var(--mushaf-rule-ink, var(--accent, #d4b47c))"
          strokeWidth={isHighlighted ? "1.5" : "1"}
          strokeOpacity={isHighlighted ? "1" : "0.75"}
        />
        <circle cx="16" cy="3.5" r="1.1" fill="var(--mushaf-rule-ink, var(--accent, #d4b47c))" />
        <circle cx="16" cy="28.5" r="1.1" fill="var(--mushaf-rule-ink, var(--accent, #d4b47c))" />
        <circle cx="3.5" cy="16" r="1.1" fill="var(--mushaf-rule-ink, var(--accent, #d4b47c))" />
        <circle cx="28.5" cy="16" r="1.1" fill="var(--mushaf-rule-ink, var(--accent, #d4b47c))" />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-sans text-[0.42em] font-bold leading-none ${
          isHighlighted ? "text-primary font-black" : isOled ? "text-white" : "text-foreground"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden="true"
      >
        {displayNum}
      </span>
    </span>
  );
}
