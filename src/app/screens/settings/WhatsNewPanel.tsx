import { useEffect, useState } from "react";
import { Sparkles } from "../../components/icons";
import { t } from "../../i18n";
import { loadReleaseNotes, notesFor, type ReleaseNotes } from "../../releaseNotes";
import type { AppLanguage } from "../../types";
import { InformationCard } from "./InformationCard";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

/**
 * The update prompt shows the release notes for a few seconds, in a corner, next
 * to a button most people tap immediately — and then the app reloads and they
 * are gone. This gives the same notes a permanent home, so the copy we maintain
 * for every deployment is readable after the update rather than only before it.
 */
export function WhatsNewPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [notes, setNotes] = useState<ReleaseNotes | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadReleaseNotes().then((loaded) => {
      if (cancelled) return;
      setNotes(loaded);
      setHasLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = notes ? notesFor(notes, language) : [];

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "about.whatsNew")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <InformationCard
          icon={<Sparkles size={20} aria-hidden="true" />}
          title={t(language, "about.whatsNew")}
          body={t(language, hasLoaded && !notes ? "about.whatsNewUnavailable" : "about.whatsNewIntro")}
        />

        {items.length > 0 && (
          <div>
            <SectionLabel label={t(language, "about.whatsNewDescription")} />
            <ul className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-[0.875rem] leading-6 text-foreground">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
