import { useId } from "react";
import { CATEGORIES } from "../content/categories";
import { t } from "../i18n";
import { routeToHash } from "../routing";
import type { AppLanguage, CategoryId } from "../types";

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
  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-3xl border p-4 text-foreground ${onGlass ? "hero-glass home-glass-surface" : "border-border bg-card shadow-raised"}`}
      data-testid="situational-shortcuts"
    >
      <h2 id={titleId} className="text-subtitle font-extrabold">
        {t(language, "home.situationalTitle")}
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_CATEGORIES.map((id) => {
          const category = CATEGORIES.find((item) => item.id === id)!;
          return (
            <a
              key={id}
              href={routeToHash({ view: "reader", categoryId: id, index: 0 })!}
              className={`flex min-h-12 items-center rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] ${onGlass ? "focus-visible:ring-on-media" : "focus-visible:ring-ring"}`}
              onClick={(event) => {
                if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                onOpen(id);
              }}
            >
              {language === "ar" ? category.nameArabic : category.name}
            </a>
          );
        })}
      </div>
    </section>
  );
}
