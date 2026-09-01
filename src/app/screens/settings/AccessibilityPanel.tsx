import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { AlignRight, Check, Contrast, Eye, Info, Pause, Smartphone, TypeIcon } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ColorBlindSupport, TextSizeOption } from "../../types";
import { SectionLabel, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

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

/**
 * One option in a mutually exclusive group. Previously a plain button carrying
 * `aria-pressed`, which models an independent toggle — four of them announced
 * as four unrelated on/off controls rather than one single-choice group, and
 * their container's `aria-label` sat on a roleless div where it is ignored.
 * Now a Radix radio item, matching Text size in this same panel.
 */
function PanelRadioOption({ value, active, label }: { value: string; active: boolean; label: string }) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      className={`min-h-11 flex-1 rounded-2xl border px-3 py-3 text-[0.8125rem] font-semibold transition-[color,background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border/40 bg-card text-foreground"
      }`}
    >
      {label}
    </RadioGroupPrimitive.Item>
  );
}

export function AccessibilityPanel({
  language,
  direction,
  textSize,
  showTranslation,
  showTransliteration,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  onTextSizeChange,
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
  showTranslation: boolean;
  showTransliteration: boolean;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  onTextSizeChange: (value: TextSizeOption) => void;
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
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.accessibility")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.visual")} />

        {/* Calendar system used to sit here, first in this panel and under the
            "Visual" label. It is a locale preference, not an accessibility aid,
            and now lives beside Language in Settings → Preferences. */}

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
                  className={`relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-3xl border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring backdrop-blur-xl shadow-sm ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/40 bg-card text-muted-foreground"
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

        <div className="mx-4 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
                aria-hidden="true"
              >
                <Eye size={20} className="text-primary" />
              </span>
              <h3 id="color-blind-title" className="text-[1rem] font-semibold text-foreground">
                {t(language, "settings.colorBlindSupport")}
              </h3>
            </div>
            <RadioGroupPrimitive.Root
              dir={direction}
              value={colorBlindSupport}
              onValueChange={(value) => onColorBlindSupportChange(value as ColorBlindSupport)}
              className="grid grid-cols-2 gap-2"
              aria-labelledby="color-blind-title"
            >
              {colorBlindOptions.map((option) => (
                <PanelRadioOption
                  key={option}
                  value={option}
                  active={colorBlindSupport === option}
                  label={formatColorBlindSupport(option, language)}
                />
              ))}
            </RadioGroupPrimitive.Root>
          </div>
        </div>

        <SectionLabel label={t(language, "settings.motion")} />
        <div className="mx-4 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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
        <div className="mx-4 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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
            hasDivider={false}
          />
        </div>

        {/* Not a row. Screen reader support is not something the user turns on,
            so presenting it with the same anatomy as the working toggles above
            gave it a control's affordance without a control's behaviour. It is
            reassurance, so it reads as help text. */}
        <p className="mx-4 mt-2 flex items-start gap-2 px-1 text-[0.75rem] leading-5 text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>{t(language, "settings.screenReaderNote")}</span>
        </p>
      </div>
    </div>
  );
}
