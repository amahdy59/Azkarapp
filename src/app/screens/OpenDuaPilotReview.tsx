import { useEffect, useRef, useState } from "react";
import { AUDIO_CATALOG } from "../audio/audioManifest";
import { getAudioBaseUrl } from "../audio/resolveAudioAsset";
import {
  EMPTY_OPEN_DUA_REVIEW,
  OPEN_DUA_PILOT,
  exportOpenDuaReviews,
  loadOpenDuaReviews,
  matchesOpenDuaCandidate,
  saveOpenDuaReviews,
  type OpenDuaReview,
} from "../audio/openDuaPilot";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { audioReviewT as copy } from "../i18n/audioReview";
import type { AppLanguage } from "../types";
import wakingUrl from "../../../docs/audio/opendua-pilot/media/OD-003.mp3";
import forgivenessUrl from "../../../docs/audio/opendua-pilot/media/OD-046.mp3";
import praiseUrl from "../../../docs/audio/opendua-pilot/media/OD-254.mp3";

const MEDIA = [wakingUrl, forgivenessUrl, praiseUrl];
const TITLES = ["waking", "forgiveness", "praise"] as const;

export function OpenDuaPilotReview({ language, onPlay }: { language: AppLanguage; onPlay?: () => void }) {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState("current");
  const [reviews, setReviews] = useState(loadOpenDuaReviews);
  const [saveFailed, setSaveFailed] = useState(false);
  const [error, setError] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const candidate = OPEN_DUA_PILOT.candidates[index]!;
  const asset = AUDIO_CATALOG.assets[candidate.assetId];
  const variant = asset?.segments[0]?.variants.find(
    (v) => v.voiceId === asset.defaultVoiceId && v.reviewStatus === "approved",
  );
  const matches = matchesOpenDuaCandidate(candidate, AUDIO_CATALOG);
  const currentUrl = variant ? `${getAudioBaseUrl()}/${variant.relativePath}?sha256=${variant.sha256}` : undefined;
  const url = matches ? (recording === "additional" ? MEDIA[index] : currentUrl) : undefined;
  const review = reviews[candidate.sha256] ?? EMPTY_OPEN_DUA_REVIEW;

  useEffect(() => {
    const audio = audioRef.current;
    setError(false);
    setDuration(null);
    return () => {
      audio?.pause();
      audio?.removeAttribute("src");
      audio?.load();
    };
  }, [url]);

  const updateReview = (update: Partial<OpenDuaReview>) => {
    const next = { ...reviews, [candidate.sha256]: { ...review, ...update, updatedAt: new Date().toISOString() } };
    setReviews(next);
    setSaveFailed(!saveOpenDuaReviews(next));
  };
  return (
    <section
      className="mx-auto mt-4 grid min-w-0 max-w-4xl grid-cols-1 gap-4"
      dir={language === "ar" ? "rtl" : "ltr"}
      aria-labelledby="opendua-heading"
    >
      <h2 id="opendua-heading" className="text-xl font-bold">
        {copy(language, "title")}
      </h2>
      <p>{copy(language, "help")}</p>
      <p className="rounded-xl border border-border bg-card p-3 text-sm">{copy(language, "pending")}</p>
      <label id="opendua-sample-label" className="font-bold">
        {copy(language, "candidate")}
      </label>
      <Select
        value={String(index)}
        onValueChange={(value) => setIndex(Number(value))}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <SelectTrigger aria-labelledby="opendua-sample-label" className="min-w-0 whitespace-normal text-start">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TITLES.map((title, i) => (
            <SelectItem key={title} value={String(i)}>
              {copy(language, title)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">{copy(language, "currentText")}</h3>
          <p className="zikr-text mt-3 text-xl leading-10" dir="rtl" lang="ar">
            {asset?.canonicalArabicText}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">{copy(language, "sourceText")}</h3>
          <p id="opendua-transcript" className="zikr-text mt-3 text-xl leading-10" dir="rtl" lang="ar">
            {candidate.transcriptArabic}
          </p>
        </div>
      </div>
      <p role="status" className="text-sm">
        {copy(language, matches ? "matched" : "mismatch")}
      </p>
      <fieldset className="min-w-0 rounded-2xl border border-border bg-card p-4">
        <legend className="px-2 font-bold">{copy(language, "recording")}</legend>
        <div className="mb-3 flex flex-wrap gap-3">
          {(["current", "additional"] as const).map((choice) => (
            <label
              key={choice}
              className="flex min-h-11 min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-xl border border-border-control px-3 focus-within:ring-[3px] focus-within:ring-ring"
            >
              <input
                type="radio"
                name="opendua-recording"
                value={choice}
                checked={recording === choice}
                onChange={() => setRecording(choice)}
                className="shrink-0"
              />
              <span className="min-w-0 break-words">{copy(language, choice)}</span>
            </label>
          ))}
        </div>
        {/* The full equivalent transcript is visible above and linked to the audio. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Audio-only recording with its full adjacent transcript. */}
        <audio
          key={url}
          ref={audioRef}
          controls
          preload="metadata"
          src={url}
          aria-label={copy(language, "player")}
          aria-describedby="opendua-transcript"
          className="min-w-0 w-full"
          onPlay={onPlay}
          onError={() => setError(true)}
          onLoadedMetadata={(event) => {
            const seconds = event.currentTarget.duration;
            if (Number.isFinite(seconds)) setDuration(seconds);
          }}
        />
        {duration !== null && (
          <p className="mt-2 text-sm">{copy(language, "duration", { seconds: duration.toFixed(3) })}</p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {copy(language, "error")}
          </p>
        )}
      </fieldset>
      <p className="break-words text-sm" dir="ltr" lang="en">
        {OPEN_DUA_PILOT.attribution}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-11 items-center underline"
          href={OPEN_DUA_PILOT.licenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {copy(language, "licence")}
        </a>
        <a
          className="inline-flex min-h-11 items-center underline"
          href={candidate.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {copy(language, "original")}
        </a>
      </div>
      <details className="min-w-0 text-sm">
        <summary className="min-h-11 cursor-pointer">{copy(language, "identity")}</summary>
        <p className="break-all" dir="ltr">
          {candidate.sha256}
        </p>
      </details>
      <p id="opendua-review-help" className="text-sm text-muted-foreground">
        {copy(language, "reviewerHelp")}
      </p>
      <label className="grid gap-2 font-bold">
        {copy(language, "reviewer")}
        <input
          value={review.reviewer}
          maxLength={160}
          onChange={(event) => updateReview({ reviewer: event.currentTarget.value })}
          className="min-h-11 min-w-0 w-full rounded-xl border border-border-control bg-card px-3"
        />
      </label>
      <label id="opendua-decision-label" className="font-bold">
        {copy(language, "decision")}
      </label>
      <Select
        value={review.decision}
        onValueChange={(decision) => updateReview({ decision: decision as OpenDuaReview["decision"] })}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <SelectTrigger
          aria-labelledby="opendua-decision-label"
          aria-describedby="opendua-review-help"
          className="min-w-0 whitespace-normal text-start"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unreviewed">{copy(language, "unreviewed")}</SelectItem>
          <SelectItem value="reviewed-match" disabled={!review.reviewer.trim() || !matches}>
            {copy(language, "checked")}
          </SelectItem>
          <SelectItem value="rejected">{copy(language, "rejected")}</SelectItem>
          <SelectItem value="needs-new-recording">{copy(language, "replacement")}</SelectItem>
        </SelectContent>
      </Select>
      <label className="grid gap-2 font-bold">
        {copy(language, "notes")}
        <textarea
          value={review.notes}
          maxLength={4000}
          onChange={(event) => updateReview({ notes: event.currentTarget.value })}
          className="min-h-24 min-w-0 w-full rounded-xl border border-border-control bg-card p-3 font-normal"
        />
      </label>
      {saveFailed && <p role="alert">{copy(language, "saveFailed")}</p>}
      <a
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-control bg-card px-4 font-bold"
        download="opendua-pilot-review.json"
        href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportOpenDuaReviews(reviews), null, 2))}`}
      >
        {copy(language, "export")}
      </a>
      <p className="mb-4 text-sm text-muted-foreground">{copy(language, "exportHelp")}</p>
    </section>
  );
}
