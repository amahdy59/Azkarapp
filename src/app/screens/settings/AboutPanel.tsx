import React from "react";
import { APP_VERSION, APP_RELEASE } from "../../releaseStamp";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Sparkles,
  Star,
  Translate,
} from "../../components/icons";
import { CrescentMark } from "../../components/CrescentMark";
import { Button } from "../../components/ui/button";
import ahmedPortrait from "../../../assets/team/ahmed-mahdy.webp";
import mohamedPortrait from "../../../assets/team/mohamed-hussien.webp";
import { SUPPORT_EMAILS, supportEmailHref } from "../../supportContact";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { RowChevron, SectionLabel, SettingsRowItem, SubHeader } from "./SettingsPrimitives";

const SITE_URL = "https://amahdy59.github.io/Azkarapp/";
const PROGRAMMERS = [
  {
    nameKey: "ahmedMahdy",
    roleKey: "ahmedRole",
    bioKey: "ahmedBio",
    portrait: ahmedPortrait,
    email: SUPPORT_EMAILS[0],
    linkedin: "https://www.linkedin.com/in/creativemahdy",
  },
  {
    nameKey: "mohamedHussien",
    roleKey: "mohamedRole",
    bioKey: "mohamedBio",
    portrait: mohamedPortrait,
    email: SUPPORT_EMAILS[1],
    linkedin: "https://www.linkedin.com/in/mohamed-hussien-a5608613b/",
  },
] as const;

function openExternal(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function AboutPanel({
  onReviewUpdate,
  language,
  onHelp,
  onLegal,
  onSources,
  onWhatsNew,
  onBack,
}: {
  onReviewUpdate?: () => void;
  language: AppLanguage;
  onHelp: () => void;
  onLegal: () => void;
  onSources: () => void;
  onWhatsNew: () => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "about.title")} onBack={onBack} language={language} />
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/40 bg-card p-8 shadow-raised">
          <CrescentMark size={64} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-sans text-2xl font-bold text-foreground">{t(language, "common.appName")}</p>
            <p className="text-sm text-center text-muted-foreground">{t(language, "about.subtitle")}</p>
            <p className="latin-ui text-xs text-muted-foreground opacity-60" lang="en" dir="ltr">
              {[APP_VERSION, APP_RELEASE].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full justify-start" onClick={onHelp}>
          <HelpCircle size={19} aria-hidden="true" />
          {t(language, "about.faq")}
        </Button>

        <section aria-label={t(language, "about.programmers")} data-testid="about-programmers">
          <SectionLabel label={t(language, "about.programmers")} />
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))" }}
          >
            {PROGRAMMERS.map((programmer) => {
              const name = t(language, `about.${programmer.nameKey}`);
              return (
                <div
                  key={programmer.email}
                  className="flex min-w-0 flex-col gap-4 rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <img
                      src={programmer.portrait}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-[1_1_8rem] break-words">
                      <h3 className="font-sans text-base font-semibold text-foreground">{name}</h3>
                      <p className="mt-1 text-sm text-primary">{t(language, `about.${programmer.roleKey}`)}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(language, `about.${programmer.bioKey}`)}
                  </p>
                  <div className="mt-auto flex min-w-0 flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`mailto:${programmer.email}`}
                        aria-label={t(language, "about.emailProgrammer", { name })}
                      >
                        {t(language, "about.email")}
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={programmer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t(language, "about.linkedinProfile", { name })}
                      >
                        LinkedIn <ExternalLink size={16} aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div>
          <SectionLabel label={t(language, "about.contentSource")} />
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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
              hasDivider={true}
              onPress={onSources}
            />
            <AboutRow
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <Translate size={20} className="text-background" />
                </div>
              }
              label={t(language, "about.quranWordMeanings")}
              sub={t(language, "about.quranWordMeaningsDescription")}
              hasDivider={false}
              onPress={onSources}
            />
          </div>
        </div>

        <div>
          <SectionLabel label={t(language, "about.support")} />
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
            <div className="flex flex-wrap gap-2 p-4" data-testid="about-contact-actions">
              {(["reportBug", "suggestFeature"] as const).map((kind) => (
                <Button key={kind} asChild variant="outline" size="sm">
                  <a href={supportEmailHref(t(language, `about.${kind}Subject`))}>{t(language, `about.${kind}`)}</a>
                </Button>
              ))}
            </div>
            {onReviewUpdate && (
              <SupportRow
                icon={<Sparkles size={18} className="text-background" />}
                label={t(language, "pwa.reviewUpdate")}
                onPress={(event) => {
                  event.currentTarget.focus();
                  onReviewUpdate();
                }}
              />
            )}
            <SupportRow
              icon={<Sparkles size={18} className="text-background" />}
              label={t(language, "about.whatsNew")}
              onPress={onWhatsNew}
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
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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
  return (
    <SettingsRowItem
      icon={icon}
      label={label}
      description={sub}
      right={right}
      onPress={onPress}
      hasDivider={hasDivider}
    />
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
  onPress?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <SettingsRowItem
      icon={icon}
      iconBg="var(--foreground)"
      label={label}
      right={right}
      onPress={onPress}
      hasDivider={hasDivider}
    />
  );
}
