import { useEffect, useState } from "react";
import { Sparkles } from "../../components/icons";
import { t } from "../../i18n";
import { loadReleaseNotes, notesFor, type ReleaseNotes } from "../../releaseNotes";
import type { AppLanguage } from "../../types";
import { InformationCard } from "./InformationCard";
import { SubHeader } from "./SettingsPrimitives";
import { latestBundledRelease, loadReleaseHistory } from "../../releaseHistory";

/**
 * The update prompt shows the release notes for a few seconds, in a corner, next
 * to a button most people tap immediately — and then the app reloads and they
 * are gone. This gives the same notes a permanent home, so the copy we maintain
 * for every deployment is readable after the update rather than only before it.
 */
export function WhatsNewPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [notes, setNotes] = useState<ReleaseNotes | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [releaseHistory, setReleaseHistory] = useState<ReleaseNotes[]>([latestBundledRelease]);

  useEffect(() => {
    let cancelled = false;
    void loadReleaseNotes().then((loaded) => {
      if (cancelled) return;
      setNotes(loaded);
      setHasLoaded(true);
    });
    void loadReleaseHistory().then((history) => {
      if (!cancelled) setReleaseHistory(history);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const releases = notes
    ? [notes, ...releaseHistory.filter((entry) => entry.release !== notes.release)]
    : releaseHistory;
  const renderNotes = (release: ReleaseNotes) => (
    <ul className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
      {notesFor(release, language).map((item, index) => (
        <li key={index} className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-sm leading-6 text-foreground">{item}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "about.releaseNotes")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <InformationCard
          icon={<Sparkles size={20} aria-hidden="true" />}
          title={t(language, "about.releaseNotes")}
          body={t(language, hasLoaded && !notes ? "about.releaseNotesOffline" : "about.releaseNotesIntro")}
        />

        {releases[0] && (
          <section aria-labelledby="release-latest-heading">
            <h2 id="release-latest-heading" className="mb-3 text-base font-bold text-foreground">
              {t(language, "about.releaseVersion", { release: releases[0].release })}
            </h2>
            {renderNotes(releases[0])}
          </section>
        )}
        <section aria-labelledby="release-history-heading">
          <h2 id="release-history-heading" className="mb-3 text-base font-bold text-foreground">
            {t(language, "about.releaseHistory")}
          </h2>
          {releases.slice(1, visibleCount).map((release) => (
            <details key={release.release} className="mb-3 rounded-2xl border border-border bg-card">
              <summary className="min-h-11 cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                {t(language, "about.releaseVersion", { release: release.release })}
              </summary>
              {renderNotes(release)}
            </details>
          ))}
          {releases.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 20)}
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, "about.moreReleases")}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
