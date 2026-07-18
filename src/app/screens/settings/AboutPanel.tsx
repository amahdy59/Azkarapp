import React from "react";
import { BookOpen, ExternalLink, FileText, Globe, HelpCircle, Info, MessageChat, Star } from "../../components/icons";
import { CrescentMark } from "../../components/CrescentMark";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { RowChevron, SectionLabel, SubHeader } from "./SettingsPrimitives";

const SITE_URL = "https://amahdy59.github.io/Azkarapp/";

function openExternal(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function openMailto(email: string, subject: string) {
  if (typeof window !== "undefined") {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
}

export function AboutPanel({
  language,
  onHelp,
  onLegal,
  onSources,
  onBack,
}: {
  language: AppLanguage;
  onHelp: () => void;
  onLegal: () => void;
  onSources: () => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "about.title")} onBack={onBack} language={language} />
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8">
          <CrescentMark size={36} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-sans text-[1.5rem] font-bold text-foreground">Azkar</p>
            <p className="latin-ui text-[0.875rem] text-muted-foreground" lang="en" dir="ltr">
              {t(language, "about.subtitle")}
            </p>
            <p className="latin-ui text-[0.75rem] text-muted-foreground opacity-60" lang="en" dir="ltr">
              Version 2.0.1
            </p>
          </div>
        </div>

        <div>
          <SectionLabel label={t(language, "about.contentSource")} />
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <AboutRow
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <BookOpen size={20} className="text-background" />
                </div>
              }
              label="Hisnul Muslim"
              sub={t(language, "about.sourceDescription")}
              onPress={onSources}
            />
            <AboutRow
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <Star size={20} className="text-background" />
                </div>
              }
              label={t(language, "about.references")}
              sub={t(language, "about.referencesDescription")}
              hasDivider={false}
              onPress={onSources}
            />
          </div>
        </div>

        <div>
          <SectionLabel label={t(language, "about.support")} />
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SupportRow
              icon={<MessageChat size={18} className="text-background" />}
              label={t(language, "about.sendFeedback")}
              onPress={() => openMailto("support@azkarapp.dev", "Azkar feedback")}
            />
            <SupportRow
              icon={<HelpCircle size={18} className="text-background" />}
              label={t(language, "about.faq")}
              onPress={onHelp}
            />
            <SupportRow
              icon={<Globe size={18} className="text-background" />}
              label={t(language, "about.website")}
              right={<ExternalLink size={16} className="text-muted-foreground" />}
              hasDivider={false}
              onPress={() => openExternal(SITE_URL)}
            />
          </div>
        </div>

        <div className="pb-8">
          <SectionLabel label={t(language, "about.legal")} />
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <SupportRow
              icon={<Info size={18} className="text-background" />}
              label={t(language, "about.privacy")}
              onPress={onLegal}
            />
            <SupportRow
              icon={<FileText size={18} className="text-background" />}
              label={t(language, "about.terms")}
              hasDivider={false}
              onPress={onLegal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutRow({
  icon,
  label,
  sub,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon}
      <div className="flex flex-1 flex-col items-start gap-0.5">
        <p className="font-sans text-[0.9375rem] font-medium leading-[22px] text-foreground">{label}</p>
        {sub && <p className="font-sans text-[0.875rem] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </>
  );

  return (
    <div className="relative">
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          className="flex h-[72px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70"
        >
          {content}
        </button>
      ) : (
        <div className="flex h-[72px] w-full items-center gap-4 bg-card px-4">{content}</div>
      )}
      {hasDivider && (
        <div className="absolute bottom-0 h-px bg-border" style={{ insetInlineStart: 64, insetInlineEnd: 0 }} />
      )}
    </div>
  );
}

function SupportRow({
  icon,
  label,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPress}
        className="flex h-[56px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">{icon}</div>
        <p className="flex-1 font-sans text-[0.9375rem] font-medium text-foreground">{label}</p>
        {right}
      </button>
      {hasDivider && (
        <div className="absolute bottom-0 h-px bg-border" style={{ insetInlineStart: 64, insetInlineEnd: 0 }} />
      )}
    </div>
  );
}
