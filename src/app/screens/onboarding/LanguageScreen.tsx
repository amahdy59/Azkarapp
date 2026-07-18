import React, { useState } from "react";
import { Check } from "../../components/icons";
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

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-4 shrink-0">
        <div className="relative w-[32px] h-[32px]" aria-hidden="true">
          <div className="absolute" style={{ inset: "-18.75% 0 0 -18.75%" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="22" cy="22" r="16" fill="currentColor" className="text-primary" />
              <circle cx="14" cy="14" r="14" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </div>
        <p className="text-[0.9375rem] font-semibold text-foreground font-sans">Azkar</p>
        <h1 className="text-[1.125rem] font-semibold text-foreground font-sans leading-[24px] text-center">
          {isArabic ? "اختر لغتك" : "Choose Your Language"}
        </h1>
        <p className="text-[0.75rem] text-muted-foreground font-sans leading-[16px]">
          {isArabic ? "يمكنك تغييرها لاحقًا من الإعدادات" : "You can change this later in Settings"}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-4"
        role="radiogroup"
        aria-label={isArabic ? "اللغات المتاحة" : "Available Languages"}
      >
        {LANGUAGES_LIST.map((lang) => {
          const active = selected === lang.code;
          return (
            <button
              key={lang.code}
              role="radio"
              aria-checked={active}
              data-testid={`language-option-${lang.code}`}
              onClick={() => setSelected(lang.code)}
              className={`relative flex items-center justify-center gap-3 rounded-2xl px-4 w-full transition-all active:scale-[0.98] h-[64px] bg-card border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active ? "border-primary shadow-sm" : "border-border"
              }`}
              dir={lang.code === "ar" ? "rtl" : "ltr"}
              lang={lang.code}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                {active && (
                  <div className="absolute left-4">
                    <Check size={20} className="text-primary" aria-hidden="true" />
                  </div>
                )}

                <span
                  className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider"
                  aria-hidden="true"
                >
                  {lang.code}
                </span>
                <span className="text-[1.0625rem] font-semibold text-foreground">{lang.native}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-8 shrink-0">
        <button
          data-testid="confirm-language"
          onClick={() => onContinue(selected)}
          className="w-full flex items-center justify-center rounded-2xl transition-all active:scale-95 h-[56px] bg-primary text-[1.0625rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isArabic ? "متابعة" : "Continue"}
        </button>
      </div>
    </div>
  );
}
