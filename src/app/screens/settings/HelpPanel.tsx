import { BarChart3, BookOpen, Bookmark, Bell, Database, ExternalLink, HelpCircle, Wifi } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

const ISSUE_URL = "https://github.com/amahdy59/Azkarapp/issues/new/choose";

const FAQ_ITEMS = [
  { question: "help.readingQ", answer: "help.readingA", icon: BookOpen },
  { question: "help.savedQ", answer: "help.savedA", icon: Bookmark },
  { question: "help.remindersQ", answer: "help.remindersA", icon: Bell },
  { question: "help.offlineQ", answer: "help.offlineA", icon: Wifi },
  { question: "help.syncQ", answer: "help.syncA", icon: Database },
  { question: "help.gardenQ", answer: "help.gardenA", icon: BarChart3 },
  { question: "help.accessibilityQ", answer: "help.accessibilityA", icon: HelpCircle },
];

export function HelpPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "help.title")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <HelpCircle size={24} className="text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-[1.125rem] font-semibold text-foreground">{t(language, "help.introTitle")}</h2>
          <p className="mt-1 text-[0.875rem] leading-6 text-muted-foreground">{t(language, "help.introBody")}</p>
        </section>

        <SectionLabel label={t(language, "help.faq")} />
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {FAQ_ITEMS.map(({ question, answer, icon: Icon }) => (
            <details className="group border-b border-border last:border-b-0" key={question}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring">
                <Icon size={19} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="flex-1 text-start text-[0.875rem] font-semibold leading-5 text-foreground">
                  {t(language, question)}
                </span>
                <span
                  className="text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p
                className="px-4 pb-4 text-[0.8125rem] leading-6 text-muted-foreground"
                style={{ paddingInlineStart: 50 }}
              >
                {t(language, answer)}
              </p>
            </details>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-[0.9375rem] font-semibold text-foreground">{t(language, "help.stillNeedHelp")}</h2>
          <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{t(language, "help.reportHint")}</p>
          <button
            type="button"
            onClick={() => window.open(ISSUE_URL, "_blank", "noopener,noreferrer")}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[0.8125rem] font-semibold text-primary-foreground"
          >
            {t(language, "help.reportIssue")}
            <ExternalLink size={16} aria-hidden="true" />
          </button>
        </section>
      </div>
    </div>
  );
}
