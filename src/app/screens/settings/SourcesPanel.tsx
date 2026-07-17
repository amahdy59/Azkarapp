import { BookOpen, ExternalLink, FileText, Info, MessageChat, Star } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { InformationCard } from "./InformationCard";
import { SubHeader } from "./SettingsPrimitives";

const CORRECTION_URL = "https://github.com/amahdy59/Azkarapp/issues/new/choose";

export function SourcesPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SubHeader title={t(language, "sources.title")} onBack={onBack} language={language} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-8 pt-4">
        <InformationCard
          icon={<BookOpen size={20} aria-hidden="true" />}
          title={t(language, "sources.approachTitle")}
          body={t(language, "sources.approachBody")}
        />
        <InformationCard
          icon={<Star size={20} aria-hidden="true" />}
          title={t(language, "sources.referencesTitle")}
          body={t(language, "sources.referencesBody")}
        />
        <InformationCard
          icon={<FileText size={20} aria-hidden="true" />}
          title={t(language, "sources.reviewTitle")}
          body={t(language, "sources.reviewBody")}
        />
        <InformationCard
          icon={<Info size={20} aria-hidden="true" />}
          title={t(language, "sources.interpretationTitle")}
          body={t(language, "sources.interpretationBody")}
        />

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageChat size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold text-foreground">{t(language, "sources.correctionTitle")}</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                {t(language, "sources.correctionBody")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.open(CORRECTION_URL, "_blank", "noopener,noreferrer")}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
          >
            {t(language, "sources.reportCorrection")}
            <ExternalLink size={16} aria-hidden="true" />
          </button>
        </section>
      </div>
    </div>
  );
}
