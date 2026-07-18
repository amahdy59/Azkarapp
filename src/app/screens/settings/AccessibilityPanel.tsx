import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { AlignRight, Check, Contrast, Eye, Info, Pause, Smartphone, TypeIcon } from "../../components/icons";
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
      className={`min-h-11 flex-1 rounded-xl border px-3 py-3 text-[0.8125rem] font-semibold transition-all active:scale-[0.98] ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function AccessibilityPanel({
  language,
  direction,
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
  direction: "ltr" | "rtl";
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
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "settings.accessibility")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.visual")} />

        <section className="mx-4 mb-6 mt-2" aria-labelledby="text-size-title">
          <h3 id="text-size-title" className="mb-3 text-[0.875rem] font-semibold text-foreground">
            {t(language, "settings.textSize")}
          </h3>
          <RadioGroupPrimitive.Root
            dir={direction}
            value={textSize}
            onValueChange={(value) => onTextSizeChange(value as TextSizeOption)}
            className="grid grid-cols-3 gap-2"
            aria-labelledby="text-size-title"
          >
            {(
              [
                { value: "small", label: t(language, "settings.textSmall"), sampleSize: "text-[0.9375rem]" },
                { value: "medium", label: t(language, "settings.medium"), sampleSize: "text-[1.125rem]" },
                { value: "large", label: t(language, "settings.textLarge"), sampleSize: "text-[1.375rem]" },
              ] as const
            ).map((option) => {
              const selected = textSize === option.value;
              return (
                <RadioGroupPrimitive.Item
                  key={option.value}
                  value={option.value}
                  data-testid={`text-size-option-${option.value}`}
                  className={`relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <span className={`font-bold leading-none ${option.sampleSize}`} aria-hidden="true">
                    Aa
                  </span>
                  <span className="text-[0.75rem] font-semibold leading-4">{option.label}</span>
                  {selected && (
                    <span className="absolute end-1.5 top-1.5 text-primary" aria-hidden="true">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                  )}
                </RadioGroupPrimitive.Item>
              );
            })}
          </RadioGroupPrimitive.Root>
        </section>

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
          <p className="mb-2 text-[0.8125rem] font-semibold text-muted-foreground">
            {t(language, "settings.arabicFont")}
          </p>
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
