import { Bell, Database, FileText, Info, User } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { InformationCard } from "./InformationCard";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Safari requires a focus target for this static scroll region. */

export function LegalPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "legal.title")} onBack={onBack} language={language} />
      <div
        className="flex-1 overflow-y-auto px-4 pb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        role="region"
        aria-label={t(language, "legal.title")}
        tabIndex={0}
      >
        <SectionLabel label={t(language, "legal.privacyTitle")} />
        <p className="mb-4 text-[0.875rem] leading-6 text-muted-foreground">{t(language, "legal.privacyIntro")}</p>
        <div className="flex flex-col gap-3">
          <InformationCard
            headingLevel={3}
            icon={<Database size={20} aria-hidden="true" />}
            title={t(language, "legal.localTitle")}
            body={t(language, "legal.localBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<User size={20} aria-hidden="true" />}
            title={t(language, "legal.accountTitle")}
            body={t(language, "legal.accountBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<Bell size={20} aria-hidden="true" />}
            title={t(language, "legal.permissionsTitle")}
            body={t(language, "legal.permissionsBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<Info size={20} aria-hidden="true" />}
            title={t(language, "legal.trackingTitle")}
            body={t(language, "legal.trackingBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<Database size={20} aria-hidden="true" />}
            title={t(language, "legal.controlTitle")}
            body={t(language, "legal.controlBody")}
          />
        </div>

        <SectionLabel label={t(language, "legal.termsTitle")} />
        <div className="flex flex-col gap-3">
          <InformationCard
            headingLevel={3}
            icon={<FileText size={20} aria-hidden="true" />}
            title={t(language, "legal.devotionalTitle")}
            body={t(language, "legal.devotionalBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<FileText size={20} aria-hidden="true" />}
            title={t(language, "legal.contentTitle")}
            body={t(language, "legal.contentBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<Info size={20} aria-hidden="true" />}
            title={t(language, "legal.availabilityTitle")}
            body={t(language, "legal.availabilityBody")}
          />
          <InformationCard
            headingLevel={3}
            icon={<FileText size={20} aria-hidden="true" />}
            title={t(language, "legal.changesTitle")}
            body={t(language, "legal.changesBody")}
          />
        </div>

        <aside className="mt-4 rounded-2xl border border-primary/50 bg-primary/10 p-4 text-[0.8125rem] leading-5 text-foreground">
          {t(language, "legal.reviewNotice")}
        </aside>
      </div>
    </div>
  );
}
