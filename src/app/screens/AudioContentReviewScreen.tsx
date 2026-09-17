import { useMemo, useRef, useState } from "react";
import { ALL_AZKAR } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { AUDIO_CATALOG } from "../audio/audioManifest";
import { QURAN_AUDIO_REVIEW_CANDIDATES } from "../audio/audioReviewCandidates";
import { createArabicTextFingerprint } from "../audio/arabicMatching";
import { getAudioBaseUrl } from "../audio/resolveAudioAsset";

type ReviewDecision = "unreviewed" | "manually-reviewed" | "approved" | "rejected" | "needs-new-recording";
type ReviewRecord = { decision: ReviewDecision; notes: string };
const STORAGE_KEY = "azkar.audio-content-review.v1";

function loadReviews(): Record<string, ReviewRecord> {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function AudioContentReviewScreen({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>(loadReviews);
  const [playbackError, setPlaybackError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseUrl = getAudioBaseUrl();
  const zikrs = useMemo(() => [...ALL_AZKAR, ...COMPREHENSIVE_DUAS], []);
  const filtered = zikrs.filter((zikr) =>
    `${zikr.id} ${zikr.canonicalKey} ${zikr.arabicText}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  const updateReview = (zikrId: string, update: Partial<ReviewRecord>) => {
    const next = {
      ...reviews,
      [zikrId]: { decision: reviews[zikrId]?.decision ?? "unreviewed", notes: reviews[zikrId]?.notes ?? "", ...update },
    };
    setReviews(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const playVariant = async (url: string) => {
    setPlaybackError("");
    audioRef.current ??= new Audio();
    audioRef.current.pause();
    audioRef.current.src = url;
    try {
      await audioRef.current.play();
    } catch (error) {
      setPlaybackError(error instanceof Error ? error.message : "Could not play the review recording.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background p-4 text-foreground" dir="ltr">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">Audio content review</h1>
          <p className="text-sm text-muted-foreground">Development-only notes do not approve production mappings.</p>
        </div>
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border px-4 font-bold">
          Close review
        </button>
      </header>
      <div className="mx-auto mt-4 max-w-6xl">
        <label className="grid gap-1 text-sm font-bold">
          Filter by ID, canonical key, or Arabic text
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            className="min-h-11 rounded-xl border border-border-control bg-card px-3"
          />
        </label>
        {playbackError && (
          <p role="alert" className="mt-3 text-destructive">
            {playbackError}
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {filtered.length} of {zikrs.length} instances.
        </p>
      </div>

      <main className="mx-auto mt-4 grid max-w-6xl gap-4">
        {filtered.map((zikr) => {
          const candidateAssetId = QURAN_AUDIO_REVIEW_CANDIDATES.find((candidate) =>
            candidate.zikrIds.includes(zikr.id),
          )?.assetId;
          const assetId = AUDIO_CATALOG.assignments[zikr.id] ?? candidateAssetId;
          const asset = assetId ? AUDIO_CATALOG.assets[assetId] : undefined;
          const variant = asset?.segments[0]?.variants[0];
          const source = variant ? AUDIO_CATALOG.sources[variant.sourceId] : undefined;
          const textMatches = asset ? createArabicTextFingerprint(zikr.arabicText) === asset.normalizedTextHash : false;
          const review = reviews[zikr.id] ?? { decision: "unreviewed", notes: "" };
          const variantUrl = variant && baseUrl ? `${baseUrl}/${variant.relativePath.replace(/^\/+/, "")}` : "";
          return (
            <article key={zikr.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Displayed Arabic text</p>
                  <p className="mt-1 text-right text-xl leading-10" dir="rtl" lang="ar">
                    {zikr.arabicText}
                  </p>
                </div>
                <dl className="grid content-start gap-2 text-sm sm:grid-cols-[160px_1fr]">
                  <dt className="text-muted-foreground">Instance ID</dt>
                  <dd>
                    <code>{zikr.id}</code>
                  </dd>
                  <dt className="text-muted-foreground">Canonical key</dt>
                  <dd>
                    <code>{zikr.canonicalKey}</code>
                  </dd>
                  <dt className="text-muted-foreground">Audio asset ID</dt>
                  <dd>
                    <code>{assetId ?? "unmatched"}</code>
                  </dd>
                  <dt className="text-muted-foreground">Source transcript</dt>
                  <dd dir="rtl" lang="ar">
                    {asset?.canonicalArabicText ?? "—"}
                  </dd>
                  <dt className="text-muted-foreground">Normalized match</dt>
                  <dd>{asset ? (textMatches ? "Matched automatically" : "Mismatch") : "Not tested"}</dd>
                  <dt className="text-muted-foreground">Source</dt>
                  <dd>{source?.name ?? "No recording source"}</dd>
                  <dt className="text-muted-foreground">Voice / reciter</dt>
                  <dd>{variant?.voiceId ?? "—"}</dd>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd>{variant ? `${Math.round(variant.durationMs / 1000)} seconds` : "—"}</dd>
                  <dt className="text-muted-foreground">Manifest status</dt>
                  <dd>{asset?.reviewStatus ?? "unmatched"}</dd>
                </dl>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!variantUrl}
                  onClick={() => void playVariant(variantUrl)}
                  className="min-h-11 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50"
                >
                  Play review recording
                </button>
                <select
                  aria-label={`Review decision for ${zikr.id}`}
                  value={review.decision}
                  onChange={(event) => updateReview(zikr.id, { decision: event.currentTarget.value as ReviewDecision })}
                  className="min-h-11 rounded-xl border border-border-control bg-background px-3"
                >
                  <option value="unreviewed">Unreviewed</option>
                  <option value="manually-reviewed">Manually reviewed</option>
                  <option value="approved">Approved in review notes</option>
                  <option value="rejected">Rejected</option>
                  <option value="needs-new-recording">Needs new recording</option>
                </select>
              </div>
              <label className="mt-3 grid gap-1 text-sm font-bold">
                Reviewer notes
                <textarea
                  value={review.notes}
                  onChange={(event) => updateReview(zikr.id, { notes: event.currentTarget.value })}
                  className="min-h-24 rounded-xl border border-border-control bg-background p-3 font-normal"
                />
              </label>
            </article>
          );
        })}
      </main>
    </div>
  );
}
