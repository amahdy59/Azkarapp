import { BarChart3, BookOpen, Bookmark, Bell, Database, ExternalLink, HelpCircle, Wifi } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { Button } from "../../components/ui/button";
import { routeToHash } from "../../routing";
import { supportEmailHref } from "../../supportContact";
import { SubHeader } from "./SettingsPrimitives";

const ISSUE_URL = "https://github.com/amahdy59/Azkarapp/issues/new/choose";

const FAQ_ITEMS = [
  { question: "help.readingQ", answer: "help.readingA", icon: BookOpen },
  { question: "help.savedQ", answer: "help.savedA", icon: Bookmark },
  {
    question: "help.remindersQ",
    answer: "help.remindersA",
    icon: Bell,
    link: { panel: "notifications", label: "notifications.title" },
  },
  {
    question: "help.offlineQ",
    answer: "help.offlineA",
    icon: Wifi,
    link: { panel: "downloads", label: "downloads.title" },
  },
  {
    question: "help.syncQ",
    answer: "help.syncA",
    icon: Database,
    link: { panel: "account-data", label: "settings.accountData" },
  },
  { question: "help.gardenQ", answer: "help.gardenA", icon: BarChart3 },
  {
    question: "help.accessibilityQ",
    answer: "help.accessibilityA",
    icon: HelpCircle,
    link: { panel: "accessibility", label: "settings.accessibility" },
  },
] as const;

export function HelpPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "help.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
          {FAQ_ITEMS.map(({ question, answer, icon: Icon, ...item }) => (
            <details className="group border-b border-border last:border-b-0" key={question}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring">
                <Icon size={19} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="flex-1 text-start text-sm font-semibold leading-5 text-foreground">
                  {t(language, question)}
                </span>
                <span
                  className="text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="space-y-2 px-4 pb-4">
                <p className="text-label leading-6 text-muted-foreground">{t(language, answer)}</p>
                {"link" in item && (
                  <Button asChild variant="outline" size="sm">
                    <a href={routeToHash({ view: "settings", settingsPanel: item.link.panel })!}>
                      {t(language, item.link.label)}
                    </a>
                  </Button>
                )}
              </div>
            </details>
          ))}
        </div>
        <section className="rounded-3xl border border-border/40 bg-card p-4 shadow-raised">
          <h2 className="text-subtitle font-semibold">{t(language, "help.stillNeedHelp")}</h2>
          <p className="mt-1 text-label text-muted-foreground">{t(language, "help.reportHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild>
              <a href={supportEmailHref(t(language, "about.reportBugSubject"))}>{t(language, "help.emailSupport")}</a>
            </Button>
            <Button asChild variant="outline">
              <a href={ISSUE_URL} target="_blank" rel="noopener noreferrer">
                {t(language, "help.reportIssue")} <ExternalLink size={16} aria-hidden="true" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
