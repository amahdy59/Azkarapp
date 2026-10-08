/** Small registration index. Large reviewed intervals live in public/data/listening-timings. */
export interface ReviewedTimingFile {
  kind: "listening" | "quran";
  variantIds: string[];
  sha256: string;
  annotationSha256: string;
  textSha256?: string;
  language: "ar" | "en";
}
export const REVIEWED_TIMING_FILES: readonly ReviewedTimingFile[] = [];

export function reviewedTimingFilename(file: ReviewedTimingFile) {
  return `${file.kind}-${file.sha256}-${file.annotationSha256}.json`;
}
