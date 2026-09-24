import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check, Translate, TypeIcon } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, TextSizeOption, ZikrFontOption } from "../../types";
import { SectionLabel, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

const ZIKR_FONT_STACKS: Record<ZikrFontOption, string> = {
  humanist: '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif',
  clear: '"Noto Sans Arabic Variable", "IBM Plex Sans Arabic", sans-serif',
  naskh: '"Amiri Quran", "IBM Plex Sans Arabic", "Noto Sans Arabic Variable", serif',
};

const ZIKR_FONT_SAMPLE = "الحمد لله";

export function ReadingPanel({
  language,
  direction,
  textSize,
  zikrFont = "humanist",
  showTranslation,
  showTransliteration,
  onTextSizeChange,
  onZikrFontChange,
  onShowTranslationChange,
  onShowTransliterationChange,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  textSize: TextSizeOption;
  zikrFont?: ZikrFontOption;
  showTranslation: boolean;
  showTransliteration: boolean;
  onTextSizeChange: (value: TextSizeOption) => void;
  onZikrFontChange: (value: ZikrFontOption) => void;
  onShowTranslationChange: (value: boolean) => void;
  onShowTransliterationChange: (value: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.readingAndTypography")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.textSize")} />
        <section className="mx-4 mb-6 mt-2" aria-labelledby="reading-text-size-title">
          <h3 id="reading-text-size-title" className="sr-only">
            {t(language, "settings.textSize")}
          </h3>
          <RadioGroupPrimitive.Root
            dir={direction}
            value={textSize}
            onValueChange={(value) => onTextSizeChange(value as TextSizeOption)}
            className="grid grid-cols-3 gap-2"
            aria-labelledby="reading-text-size-title"
          >
            {(
              [
                { value: "small", label: t(language, "settings.textSmall"), sampleSize: "text-subtitle" },
                { value: "medium", label: t(language, "settings.medium"), sampleSize: "text-lg" },
                { value: "large", label: t(language, "settings.textLarge"), sampleSize: "text-headline" },
              ] as const
            ).map((option) => {
              const selected = textSize === option.value;
              return (
                <RadioGroupPrimitive.Item
                  key={option.value}
                  value={option.value}
                  data-testid={`reading-text-size-${option.value}`}
                  className={`relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-3xl border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring backdrop-blur-xl shadow-sm ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/40 bg-card text-muted-foreground"
                  }`}
                >
                  <span className={`font-bold leading-none ${option.sampleSize}`} aria-hidden="true">
                    Aa
                  </span>
                  <span className="text-xs font-semibold leading-4">{option.label}</span>
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

        <SectionLabel label={t(language, "settings.zikrFont")} />
        <section className="mx-4 mb-6 mt-2" aria-labelledby="reading-zikr-font-title">
          <h3 id="reading-zikr-font-title" className="sr-only">
            {t(language, "settings.zikrFont")}
          </h3>
          <p className="mb-3 text-xs leading-snug text-muted-foreground">{t(language, "settings.zikrFontHint")}</p>
          <RadioGroupPrimitive.Root
            dir={direction}
            value={zikrFont}
            onValueChange={(value) => onZikrFontChange(value as ZikrFontOption)}
            className="grid grid-cols-3 gap-2"
            aria-labelledby="reading-zikr-font-title"
          >
            {(
              [
                { value: "humanist", label: t(language, "settings.zikrFontHumanist") },
                { value: "clear", label: t(language, "settings.zikrFontClear") },
                { value: "naskh", label: t(language, "settings.zikrFontNaskh") },
              ] as const
            ).map((option) => {
              const selected = zikrFont === option.value;
              return (
                <RadioGroupPrimitive.Item
                  key={option.value}
                  value={option.value}
                  data-testid={`reading-zikr-font-${option.value}`}
                  className={`relative flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-3xl border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring shadow-sm ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/40 bg-card text-muted-foreground"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    dir="rtl"
                    lang="ar"
                    className="text-headline leading-tight text-foreground"
                    style={{ fontFamily: ZIKR_FONT_STACKS[option.value] }}
                  >
                    {ZIKR_FONT_SAMPLE}
                  </span>
                  <span className="text-xs font-semibold leading-4">{option.label}</span>
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

        <SectionLabel label={t(language, "settings.reading")} />
        <div className="mx-4 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Translate size={20} className="text-primary" />}
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
            hasDivider={false}
          />
        </div>
      </div>
    </div>
  );
}
