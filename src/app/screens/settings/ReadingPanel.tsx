import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Translate, TypeIcon } from "../../components/icons";
import { ReaderFooterPreview } from "../../components/ReaderFooterPreview";
import { ChoiceRadioItem } from "../../components/ChoiceRadioItem";
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
  readerToolLabels = true,
  onReaderToolLabelsChange,
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
  readerToolLabels?: boolean;
  onReaderToolLabelsChange?: (value: boolean) => void;
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
                { value: "small", label: t(language, "settings.textSmall") },
                { value: "medium", label: t(language, "settings.medium") },
                { value: "large", label: t(language, "settings.textLarge") },
              ] as const
            ).map((option) => {
              return (
                <ChoiceRadioItem
                  key={option.value}
                  value={option.value}
                  data-testid={`reading-text-size-${option.value}`}
                  className="px-2 py-2"
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                </ChoiceRadioItem>
              );
            })}
          </RadioGroupPrimitive.Root>
        </section>

        <SectionLabel label={t(language, "settings.zikrFont")} />
        <section className="mx-4 mb-6 mt-2" aria-labelledby="reading-zikr-font-title">
          <h3 id="reading-zikr-font-title" className="sr-only">
            {t(language, "settings.zikrFont")}
          </h3>
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
              return (
                <ChoiceRadioItem
                  key={option.value}
                  value={option.value}
                  data-testid={`reading-zikr-font-${option.value}`}
                  className="px-2 py-2"
                >
                  <span className="text-sm font-semibold" style={{ fontFamily: ZIKR_FONT_STACKS[option.value] }}>
                    {option.label}
                  </span>
                </ChoiceRadioItem>
              );
            })}
          </RadioGroupPrimitive.Root>
        </section>

        <section
          className="mx-4 rounded-2xl border border-border/40 bg-card p-4"
          aria-labelledby="reading-preview-title"
        >
          <h2 id="reading-preview-title" className="text-sm font-semibold text-muted-foreground">
            {t(language, "settings.readingPreview")}
          </h2>
          <p
            data-testid="reading-preview"
            lang="ar"
            dir="rtl"
            className="py-4 text-center leading-relaxed text-foreground"
            style={{
              fontFamily: ZIKR_FONT_STACKS[zikrFont],
              fontSize: textSize === "small" ? "1.375rem" : textSize === "large" ? "1.75rem" : "1.5rem",
            }}
          >
            {ZIKR_FONT_SAMPLE}
          </p>
          <p className="text-xs text-muted-foreground">{t(language, "settings.readingPreviewHint")}</p>
        </section>
        <SectionLabel label={t(language, "settings.readerTools")} />
        <RadioGroupPrimitive.Root
          dir={direction}
          value={readerToolLabels ? "labels" : "icons"}
          onValueChange={(value) => onReaderToolLabelsChange?.(value === "labels")}
          className="mx-4 mb-6 grid grid-cols-2 gap-2"
          aria-label={t(language, "settings.readerTools")}
        >
          <ChoiceRadioItem value="labels" className="px-3 py-3">
            {t(language, "settings.iconsWithLabels")}
          </ChoiceRadioItem>
          <ChoiceRadioItem value="icons" className="px-3 py-3">
            {t(language, "settings.iconsOnly")}
          </ChoiceRadioItem>
        </RadioGroupPrimitive.Root>
        <section
          className="mx-4 mb-6 rounded-2xl border border-border bg-card p-3"
          aria-labelledby="reader-footer-preview-title"
        >
          <h3 id="reader-footer-preview-title" className="text-sm font-semibold text-foreground">
            {t(language, "settings.footerPreview")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t(language, "settings.footerPreviewHint")}</p>
          <ReaderFooterPreview language={language} />
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
