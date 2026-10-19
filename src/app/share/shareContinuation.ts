/** Exact offsets only: never insert punctuation into reviewed text. */
export function shareSentenceEnds(text: string, language = "ar"): number[] {
  const sentences = [...new Intl.Segmenter(language, { granularity: "sentence" }).segment(text)];
  return sentences.map((sentence) => sentence.index + sentence.segment.length);
}

/** Prefer complete sentences; an oversized sentence can use an existing clause/pause. */
export function shareContinuationEnd(
  text: string,
  start: number,
  limit: number,
  sentenceEnds: readonly number[],
  fresh: boolean,
): number {
  if (limit >= text.length) return text.length;
  const sentence = sentenceEnds.filter((end) => end > start && end <= limit).at(-1);
  if (sentence !== undefined) return sentence;
  // Try the sentence on a fresh card before considering an internal clause.
  if (!fresh) return start;
  const clauses = [...text.slice(start, limit).matchAll(/(?:[،,؛;:—]|[ۖۗۘۙۚۛۜ])(?:[\s\u200e\u200f]*)/gu)];
  const clause = clauses.at(-1);
  return clause ? start + clause.index + clause[0].length : limit;
}

export const SHARE_CONTINUATION_HEIGHT = 56;
