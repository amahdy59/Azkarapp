import { BookOpen, ExternalLink, FileText, Info, MessageChat, Star } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { InformationCard } from "./InformationCard";
import { SubHeader } from "./SettingsPrimitives";

const CORRECTION_URL = "https://github.com/amahdy59/Azkarapp/issues/new/choose";

export function SourcesPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
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

        <InformationCard
          icon={<MessageChat size={20} aria-hidden="true" />}
          title={t(language, "sources.correctionTitle")}
          body={t(language, "sources.correctionBody")}
          actionLabel={t(language, "sources.reportCorrection")}
          actionIcon={<ExternalLink size={16} aria-hidden="true" />}
          onAction={() => window.open(CORRECTION_URL, "_blank", "noopener,noreferrer")}
        />
      </div>
    </div>
  );
}
