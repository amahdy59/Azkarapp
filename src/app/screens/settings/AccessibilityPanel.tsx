import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { AlignRight, Contrast, Droplets, Eye, Info, Pause, Smartphone, TypeIcon } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ColorBlindSupport } from "../../types";
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
      className={`min-h-11 flex-1 rounded-2xl border px-3 py-3 text-label font-semibold transition-[color,background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
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
  highContrast,
  boldText,
  reduceMotion,
  reduceTransparency,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onReduceTransparencyChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onColorBlindSupportChange,
  onOpenReading,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onReduceTransparencyChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onOpenReading: () => void;
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

        <div className="mx-4 mb-4">
          <button
            type="button"
            onClick={onOpenReading}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-start text-sm font-bold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language, "settings.readingControlsLink")}
          </button>
        </div>
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
          {/* Sits with contrast and bold text rather than with motion: it is a
              legibility setting, and someone who turned those on is looking for
              this one. */}
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Droplets size={20} className="text-primary" />}
            label={t(language, "settings.reduceTransparency")}
            description={t(language, "settings.reduceTransparencyHint")}
            checked={reduceTransparency}
            onChange={() => onReduceTransparencyChange(!reduceTransparency)}
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
              <h3 id="color-blind-title" className="text-base font-semibold text-foreground">
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
        <p className="mx-4 mt-2 flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>{t(language, "settings.screenReaderNote")}</span>
        </p>
      </div>
    </div>
  );
}
