import { Home, Plane, Heart, PrayerRug, BookOpen, Info } from "./icons";
import { useId, useState } from "react";
import { CATEGORIES } from "../content/categories";
import { t } from "../i18n";
import { routeToHash } from "../routing";
import type { AppLanguage, CategoryId } from "../types";

const SHORTCUT_ICONS = {
  home: Home,
  travel: Plane,
  distress_anxiety: Heart,
  mosque: PrayerRug,
  food_drink: BookOpen,
  illness_ruqyah: Info,
};

const QUICK_CATEGORIES = ["home", "travel", "distress_anxiety", "mosque", "food_drink", "illness_ruqyah"] as const;

/** Uses existing collections and routing; no duplicate devotional content. */
export function SituationalShortcuts({
  language,
  onOpen,
  onGlass = false,
}: {
  language: AppLanguage;
  onOpen: (category: CategoryId) => void;
  onGlass?: boolean;
}) {
  const titleId = useId();
  const [showAll, setShowAll] = useState(false);
  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-3xl border p-4 text-foreground ${onGlass ? "hero-glass home-glass-surface" : "border-border bg-card shadow-raised"}`}
      data-testid="situational-shortcuts"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={titleId} className="text-subtitle font-extrabold">
          {t(language, "home.situationalTitle")}
        </h2>
        <button
          type="button"
          aria-expanded={showAll}
          aria-controls={`${titleId}-links`}
          onClick={() => setShowAll((value) => !value)}
          className="min-h-11 rounded-xl px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {t(language, showAll ? "settings.showFewerShortcuts" : "reader.viewAll")}
        </button>
      </div>
      <div id={`${titleId}-links`} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(showAll ? QUICK_CATEGORIES : QUICK_CATEGORIES.slice(0, 3)).map((id) => {
          const Icon = SHORTCUT_ICONS[id];
          const category = CATEGORIES.find((item) => item.id === id)!;
          return (
            <a
              key={id}
              href={routeToHash({ view: "reader", categoryId: id, index: 0 })!}
              className={`${onGlass ? "home-glass-inset" : "bg-card hover:bg-muted"} flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] ${onGlass ? "focus-visible:ring-on-media" : "focus-visible:ring-ring"}`}
              onClick={(event) => {
                if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                onOpen(id);
              }}
            >
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              {language === "ar" ? category.nameArabic : category.name}
            </a>
          );
        })}
      </div>
    </section>
  );
}
