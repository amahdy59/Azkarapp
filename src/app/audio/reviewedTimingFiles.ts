/** Small registration index. Large reviewed intervals live in public/data/listening-timings. */
export interface ReviewedTimingFile {
  kind: "listening" | "quran";
  variantIds: string[];
  sha256: string;
  annotationSha256: string;
  textSha256?: string;
  language: "ar" | "en";
}
export const REVIEWED_TIMING_FILES: readonly ReviewedTimingFile[] = [
  {
    kind: "listening",
    variantIds: ["friday-dua-18-abdullah-muhammad-v1"],
    sha256: "e8c8075b87cc1293c566116ca1a4933fbde5fe00add8dde687b58f27d984bf26",
    annotationSha256: "0447832ab18db078e7757a5af228173fba620f7ac80d1a1d05713be29b34efdb",
    language: "ar",
    textSha256: "a6b46fd3b9f3297c635767ca96bd90ae8433abf6fccbe5288cf5e4b7aebc0290",
  },
];

export function reviewedTimingFilename(file: ReviewedTimingFile) {
  return `${file.kind}-${file.sha256}-${file.annotationSha256}.json`;
}
