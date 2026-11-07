import { BarChart3, Compass, Settings, Sparkles } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { NAVIGATION_FOCUS } from "../components/ui/controlStyles";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

function ToolCard({
  title,
  description,
  Icon,
  onClick,
  featured = false,
}: {
  title: string;
  description: string;
  Icon: typeof Compass;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-32 min-w-0 w-full flex-wrap items-start gap-4 rounded-3xl border p-5 text-start shadow-raised transition-[background-color,border-color,transform] active:scale-[0.99] ${NAVIGATION_FOCUS} ${
        featured ? "border-primary/45 bg-primary/10 hover:bg-primary/15" : "border-border/50 bg-card hover:bg-muted"
      }`}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
          featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
        aria-hidden="true"
      >
        <Icon size={24} />
      </span>
      <span className="min-w-0 flex-1 basis-[12rem] [overflow-wrap:anywhere]">
        <span className="block text-title font-extrabold text-foreground">{title}</span>
        <span className="mt-1 block text-sm font-semibold leading-6 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

export function MoreScreen({
  language,
  direction,
  onOpenQibla,
  onOpenMasbaha,
  onOpenSettings,
  onOpenProgress,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpenQibla?: () => void;
  onOpenMasbaha: () => void;
  onOpenSettings: () => void;
  onOpenProgress?: () => void;
}) {
  return (
    <ScreenContainer dir={direction} screenName={t(language, "more.title")}>
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col min-h-screen">
        <Header
          pageGutters
          title={t(language, "more.title")}
          subtitle={t(language, "more.subtitle")}
          language={language}
        />
        <div className="grid w-full grid-cols-1 gap-4 px-page py-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {(
            [
              [onOpenQibla, Compass, "qibla.title", "more.qiblaDescription"],
              [onOpenMasbaha, Sparkles, "counter.tasbeehTitle", "more.masbahaDescription"],
              [onOpenSettings, Settings, "common.settings", "more.settingsDescription"],
              [onOpenProgress, BarChart3, "common.progress", "more.progressDescription"],
            ] as const
          ).map(
            ([onClick, Icon, title, description]) =>
              onClick && (
                <ToolCard
                  key={title}
                  title={t(language, title)}
                  description={t(language, description)}
                  Icon={Icon}
                  onClick={onClick}
                  featured={Icon === Compass}
                />
              ),
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
