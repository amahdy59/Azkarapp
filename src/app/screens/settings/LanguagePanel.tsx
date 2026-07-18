import { Globe } from "../../components/icons";
import { t } from "../../i18n";
import { LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage } from "../../types";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

export function LanguagePanel({
  language,
  direction,
  onLanguageChange,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onLanguageChange: (value: AppLanguage) => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={direction}>
      <SubHeader title={t(language, "settings.language")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.preferences")} />

        <div className="mx-4 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"
              aria-hidden="true"
            >
              <Globe size={20} className="text-primary" />
            </span>
            <div>
              <h3 className="text-[1rem] font-semibold text-foreground">{t(language, "settings.language")}</h3>
              <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                {language === "ar"
                  ? "اختر لغتك المفضلة لعرض محتوى التطبيق والأذكار"
                  : "Choose your preferred language for app interface and content"}
              </p>
            </div>
          </div>

          <div className="relative mt-2">
            <select
              data-testid="settings-language-dropdown"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
              className="w-full min-h-12 rounded-xl border border-border-control bg-background px-4 text-[0.9375rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring appearance-none cursor-pointer"
              dir={direction}
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 flex items-center px-4 text-foreground/70"
              style={{ insetInlineEnd: 0 }}
            >
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
