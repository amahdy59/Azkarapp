import { resolveListeningTiming, type ListeningTimingAnnotation } from "./listeningTimings";
import { resolveQuranTiming, type QuranTimingAnnotation } from "./quranTimings";
import { REVIEWED_TIMING_FILES, reviewedTimingFilename, type ReviewedTimingFile } from "./reviewedTimingFiles";
import type { ResolvedAudioSegment } from "./audioTypes";

async function readTiming(file: ReviewedTimingFile, signal: AbortSignal): Promise<unknown> {
  if (
    !/^[a-f0-9]{64}$/.test(file.sha256) ||
    !/^[a-f0-9]{64}$/.test(file.annotationSha256) ||
    (file.textSha256 && !/^[a-f0-9]{64}$/.test(file.textSha256))
  )
    return null;
  const response = await fetch(`${import.meta.env.BASE_URL}data/listening-timings/${reviewedTimingFilename(file)}`, {
    signal,
  });
  if (!response.ok || Number(response.headers.get("content-length")) > 750_000) return null;
  const body = await response.text();
  if (body.length > 750_000) return null;
  const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body)))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  if (digest !== file.annotationSha256 || signal.aborted) return null;
  return JSON.parse(body);
}
export async function loadReviewedListeningTiming(
  segment: ResolvedAudioSegment,
  text: string,
  language: "ar" | "en",
  signal: AbortSignal,
  files = REVIEWED_TIMING_FILES,
) {
  try {
    const candidates = files.filter(
      (file) =>
        file.kind === "listening" &&
        file.sha256 === segment.sha256 &&
        file.language === language &&
        file.variantIds.includes(segment.variantId),
    );
    if (!candidates.length) return null;
    const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const matching = candidates.filter((file) => file.textSha256 === digest);
    if (matching.length !== 1 || signal.aborted) return null;
    const annotation = (await readTiming(matching[0]!, signal)) as ListeningTimingAnnotation | null;
    return annotation?.textSha256 === digest && !signal.aborted
      ? resolveListeningTiming(segment, text, language, [annotation])
      : null;
  } catch {
    return null;
  }
}
export async function loadReviewedQuranTiming(
  segment: ResolvedAudioSegment,
  signal: AbortSignal,
  files = REVIEWED_TIMING_FILES,
) {
  try {
    const candidates = files.filter(
      (file) =>
        file.kind === "quran" &&
        file.language === "ar" &&
        file.sha256 === segment.sha256 &&
        file.variantIds.includes(segment.variantId),
    );
    if (candidates.length !== 1) return null;
    const annotation = (await readTiming(candidates[0]!, signal)) as QuranTimingAnnotation | null;
    return annotation && !signal.aborted ? resolveQuranTiming(segment, [annotation]) : null;
  } catch {
    return null;
  }
}
