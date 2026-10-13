import React, { useState } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { ChoiceRadioItem } from "../../components/ChoiceRadioItem";
import { Button } from "../../components/ui/button";
import { PreAppLayout } from "../../components/PreAppLayout";
import { t } from "../../i18n";
import { LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage } from "../../types";

export function LanguageScreen({
  initialLanguage,
  onContinue,
}: {
  initialLanguage: AppLanguage;
  onContinue: (lang: AppLanguage) => void;
}) {
  const [selected, setSelected] = useState<AppLanguage>(initialLanguage);
  // Keep the overall page direction based on the current selection
  const isArabic = selected === "ar";
  // Onboarding copy follows the language being previewed, not a stored
  // preference — there is no saved language yet at this point in the flow.
  const language = selected;

  return (
    <PreAppLayout
      className="slide-in-from-right"
      contentClassName="pre-app-flow-centered"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-4 shrink-0">
        <div className="relative w-[32px] h-[32px]" aria-hidden="true">
          <div className="absolute" style={{ inset: "-18.75% 0 0 -18.75%" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="22" cy="22" r="16" fill="currentColor" className="text-primary" />
              <circle cx="14" cy="14" r="14" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </div>
        <p className="text-subtitle font-semibold text-foreground font-sans">Azkar</p>
        <h1 className="text-lg font-semibold text-foreground font-sans leading-[24px] text-center">
          {t(language, "onboarding.chooseLanguage")}
        </h1>
        <p className="text-xs text-muted-foreground font-sans leading-[16px]">
          {t(language, "onboarding.changeLater")}
        </p>
      </div>

      <RadioGroupPrimitive.Root
        dir={isArabic ? "rtl" : "ltr"}
        value={selected}
        onValueChange={(next) => setSelected(next as AppLanguage)}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-4 min-[900px]:flex-none min-[900px]:overflow-visible"
        aria-label={t(language, "onboarding.availableLanguages")}
      >
        {LANGUAGES_LIST.map((lang) => {
          return (
            <ChoiceRadioItem
              key={lang.code}
              value={lang.code}
              data-testid={`language-option-${lang.code}`}
              className="min-h-16 w-full px-4"
              dir={lang.code === "ar" ? "rtl" : "ltr"}
              lang={lang.code}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider" aria-hidden="true">
                  {lang.code}
                </span>
                <span className="text-title font-semibold text-foreground">{lang.native}</span>
              </div>
            </ChoiceRadioItem>
          );
        })}
      </RadioGroupPrimitive.Root>

      <div className="shrink-0 px-6 pb-8 min-[900px]:pt-3">
        <Button
          data-testid="confirm-language"
          onClick={() => onContinue(selected)}
          className="min-h-14 w-full text-title"
        >
          {t(language, "common.continue")}
        </Button>
      </div>
    </PreAppLayout>
  );
}
