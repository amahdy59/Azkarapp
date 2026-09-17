export interface QuranAudioReviewCandidate {
  assetId: string;
  zikrIds: readonly string[];
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  expectedSegmentIds: readonly string[];
  status: "needs-source-review";
}

const quranCandidate = (
  assetId: string,
  zikrIds: readonly string[],
  surah: number,
  ayahStart: number,
  ayahEnd: number,
): QuranAudioReviewCandidate => ({
  assetId,
  zikrIds,
  surah,
  ayahStart,
  ayahEnd,
  expectedSegmentIds: Array.from(
    { length: ayahEnd - ayahStart + 1 },
    (_, index) => `${surah.toString().padStart(3, "0")}-${ayahStart + index}`,
  ),
  status: "needs-source-review",
});

/** Review requirements only; these are not production assignments or playable assets. */
export const QURAN_AUDIO_REVIEW_CANDIDATES = [
  quranCandidate("quran-002-255", ["m-hm-75", "e-hm-75", "s-hm-100", "ap-ref-9"], 2, 255, 255),
  quranCandidate("quran-112", ["m-hm-76a", "e-hm-76a", "s-hm-99-ikhlas"], 112, 1, 4),
  quranCandidate("quran-113", ["m-hm-76b", "e-hm-76b", "s-hm-99-falaq"], 113, 1, 5),
  quranCandidate("quran-114", ["m-hm-76c", "e-hm-76c", "s-hm-99-nas"], 114, 1, 6),
  quranCandidate("quran-002-285-286", ["s-hm-101"], 2, 285, 286),
  quranCandidate("quran-109", ["s-hm-109a"], 109, 1, 6),
  quranCandidate("quran-032", ["s-hm-110a"], 32, 1, 30),
  quranCandidate("quran-067", ["s-hm-110b"], 67, 1, 30),
] as const;

export const REJECTED_LEGACY_AUDIO_MATCHES = Object.freeze({
  "m-hm-75a": "Legacy ID substring matched Qur'an 2:255.",
  "e-hm-75a": "Legacy ID substring matched Qur'an 2:255.",
  "s-hm-106-subhanallah": "Citation digits 3113 matched surah 113.",
  "s-hm-106-alhamdulillah": "Citation digits 3113 matched surah 113.",
  "s-hm-106-allahu-akbar": "Citation digits 3113 matched surah 113.",
  "wu-hm-1": "Citation digits 11/113 matched surah 113.",
});
