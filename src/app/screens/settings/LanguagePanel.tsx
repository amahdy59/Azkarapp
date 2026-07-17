import { Check } from "../../components/icons";
import { t } from "../../i18n";
import { LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

export function LanguagePanel({
  language,
  selectedLanguage,
  onChange,
  onBack,
}: {
  language: AppLanguage;
  selectedLanguage: AppLanguage;
  onChange: (value: AppLanguage) => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "settings.language")} onBack={onBack} language={language} />
      <div
        className="flex-1 overflow-y-auto px-4 pb-8 pt-3"
        role="radiogroup"
        aria-label={t(language, "settings.language")}
      >
        <div className="flex flex-col gap-3">
          {LANGUAGES_LIST.map((item) => {
            const active = selectedLanguage === item.code;
            return (
              <button
                key={item.code}
                role="radio"
                aria-checked={active}
                type="button"
                onClick={() => onChange(item.code as AppLanguage)}
                className={`relative flex h-[64px] w-full items-center justify-center gap-3 rounded-2xl border bg-card px-4 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "border-primary shadow-sm" : "border-border"
                }`}
                dir={item.code === "ar" ? "rtl" : "ltr"}
                lang={item.code}
              >
                <div className="flex w-full items-center justify-center gap-3">
                  {active && (
                    <div className="absolute left-4">
                      <Check size={20} className="text-primary" aria-hidden="true" />
                    </div>
                  )}

                  <span
                    className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground"
                    aria-hidden="true"
                  >
                    {item.code}
                  </span>
                  <span className="font-sans text-[17px] font-semibold text-foreground">{item.native}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
