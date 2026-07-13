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

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-4 shrink-0">
        <div className="relative w-[32px] h-[32px]">
          <div className="absolute" style={{ inset: "-18.75% 0 0 -18.75%" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="22" cy="22" r="16" fill="currentColor" className="text-primary" />
              <circle cx="14" cy="14" r="14" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </div>
        <p className="text-[15px] font-semibold text-foreground font-sans">Azkar</p>
        <p className="text-[18px] font-semibold text-foreground font-sans leading-[24px] text-center">
          Choose Your Language
        </p>
        <p className="text-[12px] text-muted-foreground font-sans leading-[16px]">
          You can change this later in Settings
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-2 pb-4">
        {LANGUAGES_LIST.map((lang) => {
          const active = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className="flex items-center gap-3 rounded-xl px-4 w-full transition-all active:scale-[0.98] h-[64px] bg-card border"
              style={{
                borderInlineStart: active ? `4px solid var(--primary)` : `4px solid transparent`,
                borderColor: active ? `color-mix(in srgb, var(--primary) 40%, transparent)` : `var(--border)`,
              }}
            >
              <span className="text-[26px] leading-none shrink-0">{lang.flag}</span>
              <p
                className="flex-1 text-start text-[17px] font-semibold text-foreground font-sans leading-[24px]"
                dir="auto"
              >
                {lang.native}
              </p>
              <p className="text-[11px] text-muted-foreground font-sans uppercase">{lang.code}</p>
              {active && <Check size={20} className="shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-8 shrink-0">
        <button
          onClick={() => onContinue(selected)}
          className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
