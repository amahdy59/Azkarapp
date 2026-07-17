import { AlignRight, Contrast, Eye, Info, Pause, Smartphone, TypeIcon } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ArabicFontOption, ColorBlindSupport, TextSizeOption } from "../../types";
import { RowValue, SectionLabel, SettingsRowItem, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

function formatColorBlindSupport(value: ColorBlindSupport, language: AppLanguage) {
  switch (value) {
    case "deuteranopia":
      return t(language, "settings.colorBlindDeuteranopia");
    case "protanopia":
      return t(language, "settings.colorBlindProtanopia");
    case "tritanopia":
      return t(language, "settings.colorBlindTritanopia");
    default:
      return t(language, "settings.colorBlindNone");
  }
}

function PanelOptionButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 flex-1 rounded-xl border px-3 py-3 text-[13px] font-semibold transition-all active:scale-[0.98] ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function AccessibilityPanel({
  language,
  textSize,
  arabicFont,
  showTranslation,
  showTransliteration,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  onTextSizeChange,
  onArabicFontChange,
  onShowTranslationChange,
  onShowTransliterationChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onColorBlindSupportChange,
  onBack,
}: {
  language: AppLanguage;
  textSize: TextSizeOption;
  arabicFont: ArabicFontOption;
  showTranslation: boolean;
  showTransliteration: boolean;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  onTextSizeChange: (value: TextSizeOption) => void;
  onArabicFontChange: (value: ArabicFontOption) => void;
  onShowTranslationChange: (value: boolean) => void;
  onShowTransliterationChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onBack: () => void;
}) {
  const colorBlindOptions: ColorBlindSupport[] = ["none", "deuteranopia", "protanopia", "tritanopia"];

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SubHeader title={t(language, "settings.accessibility")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.visual")} />

        {/* Text Size Slider */}
        <div className="mx-4 mb-6 mt-2 flex flex-col items-center">
          <div className="relative flex w-[75%] items-center justify-between">
            <span className="absolute -left-8 font-semibold text-foreground">A</span>
            <span className="absolute -right-8 text-xl font-bold text-foreground">A</span>

            <div className="relative flex h-1.5 w-full items-center rounded-full bg-border">
              {/* Thumbs */}
              <button
                type="button"
                onClick={() => onTextSizeChange("small")}
                aria-pressed={textSize === "small"}
                className="absolute left-0 -ml-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${t(language, "settings.textSmall")} ${t(language, "settings.textSize")}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "small" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("medium")}
                aria-pressed={textSize === "medium"}
                className="absolute left-1/2 -ml-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${t(language, "settings.medium")} ${t(language, "settings.textSize")}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "medium" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("large")}
                aria-pressed={textSize === "large"}
                className="absolute right-0 -mr-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${t(language, "settings.textLarge")} ${t(language, "settings.textSize")}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "large" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 flex w-[85%] justify-between text-[13px] font-semibold">
            <span className={textSize === "small" ? "text-primary" : "text-muted-foreground"}>
              {t(language, "settings.textSmall")}
            </span>
            <span className={textSize === "medium" ? "text-primary" : "text-muted-foreground"}>
              {t(language, "settings.medium")}
            </span>
            <span className={textSize === "large" ? "text-primary" : "text-muted-foreground"}>
              {t(language, "settings.textLarge")}
            </span>
          </div>
        </div>

        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Contrast size={20} className="text-primary" />}
            label={t(language, "settings.highContrast")}
            checked={highContrast}
            onChange={() => onHighContrastChange(!highContrast)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<TypeIcon size={20} className="text-primary" />}
            label={t(language, "settings.boldText")}
            checked={boldText}
            onChange={() => onBoldTextChange(!boldText)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Eye size={20} className="text-primary" />}
            label={t(language, "settings.colorBlindSupport")}
            right={<RowValue value={formatColorBlindSupport(colorBlindSupport, language)} withChevron={false} />}
            hasDivider={false}
          />
        </div>
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2" aria-label={t(language, "settings.colorBlindSupport")}>
          {colorBlindOptions.map((option) => (
            <PanelOptionButton
              key={option}
              active={colorBlindSupport === option}
              label={formatColorBlindSupport(option, language)}
              onClick={() => onColorBlindSupportChange(option)}
            />
          ))}
        </div>

        <SectionLabel label={t(language, "settings.motion")} />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Pause size={20} className="text-primary" />}
            label={t(language, "settings.reduceMotion")}
            checked={reduceMotion}
            onChange={() => onReduceMotionChange(!reduceMotion)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Smartphone size={20} className="text-primary" />}
            label={t(language, "settings.hapticFeedback")}
            checked={hapticFeedback}
            onChange={() => onHapticFeedbackChange(!hapticFeedback)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label={t(language, "settings.reading")} />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<TypeIcon size={20} className="text-primary" />}
            label={t(language, "settings.showTranslation")}
            checked={showTranslation}
            onChange={() => onShowTranslationChange(!showTranslation)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<TypeIcon size={20} className="text-primary" />}
            label={t(language, "settings.showTransliteration")}
            checked={showTransliteration}
            onChange={() => onShowTransliterationChange(!showTransliteration)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<AlignRight size={20} className="text-primary" />}
            label={t(language, "settings.rtlLayout")}
            checked={forceRtl}
            onChange={() => onForceRtlChange(!forceRtl)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Info size={20} className="text-primary" />}
            label={t(language, "settings.screenReader")}
            right={<RowValue value={t(language, "settings.alwaysOn")} withChevron={false} />}
            hasDivider={false}
          />
        </div>
        <div className="mx-4 mt-3">
          <p className="mb-2 text-[13px] font-semibold text-muted-foreground">{t(language, "settings.arabicFont")}</p>
          <div className="grid grid-cols-2 gap-2">
            <PanelOptionButton
              active={arabicFont === "ibm_plex"}
              label={t(language, "settings.fontPlex")}
              onClick={() => onArabicFontChange("ibm_plex")}
            />
            <PanelOptionButton
              active={arabicFont === "noto_sans"}
              label={t(language, "settings.fontNoto")}
              onClick={() => onArabicFontChange("noto_sans")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
