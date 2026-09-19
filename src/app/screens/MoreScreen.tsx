import { Compass, Settings, Sparkles } from "../components/icons";
import { Header } from "../components/LayoutShells";
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
      className={`group flex min-h-32 w-full items-start gap-4 rounded-3xl border p-5 text-start shadow-raised transition-[background-color,border-color,transform] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
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
      <span className="min-w-0 flex-1">
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
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpenQibla: () => void;
  onOpenMasbaha: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <ScreenContainer dir={direction} screenName={t(language, "more.title")}>
      <Header title={t(language, "more.title")} subtitle={t(language, "more.subtitle")} language={language} />
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          title={t(language, "qibla.title")}
          description={t(language, "more.qiblaDescription")}
          Icon={Compass}
          onClick={onOpenQibla}
          featured
        />
        <ToolCard
          title={t(language, "counter.tasbeehTitle")}
          description={t(language, "more.masbahaDescription")}
          Icon={Sparkles}
          onClick={onOpenMasbaha}
        />
        <ToolCard
          title={t(language, "common.settings")}
          description={t(language, "more.settingsDescription")}
          Icon={Settings}
          onClick={onOpenSettings}
        />
      </div>
    </ScreenContainer>
  );
}
