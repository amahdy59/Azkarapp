export interface AyahTranslation {
  text: string;
  source: "Pickthall" | "Saheeh International";
}

/** Only explicit verse-number boundaries from existing reviewed content are eligible. */
export function numberedAyahTranslation(text: string, ayah: number, stripOpening = false): string | null {
  const markers = [...text.matchAll(/\((\d+)\)/gu)];
  if (markers.filter((marker) => Number(marker[1]) === ayah).length !== 1) return null;
  const index = markers.findIndex((marker) => Number(marker[1]) === ayah);
  const marker = markers[index]!;
  let result = text.slice(index ? markers[index - 1]!.index + markers[index - 1]![0].length : 0, marker.index).trim();
  if (!index && stripOpening) result = result.replace(/^In the name of Allah, the Beneficent, the Merciful\.\s*/u, "");
  return result || null;
}

export async function loadAyahTranslation(verseKey: string): Promise<AyahTranslation | null> {
  if (!/^\d+:\d+$/u.test(verseKey)) return null;
  const [surah, ayah] = verseKey.split(":").map(Number);
  let text = "",
    source: AyahTranslation["source"] = "Pickthall",
    stripOpening = false;
  if ([32, 67, 109, 112, 113, 114].includes(surah!) || (surah === 2 && [255, 285, 286].includes(ayah!))) {
    const { QURAN_PASSAGES } = await import("./quranPassages");
    const passage =
      (
        {
          32: QURAN_PASSAGES.asSajdah,
          67: QURAN_PASSAGES.alMulk,
          109: QURAN_PASSAGES.alKafirun,
          112: QURAN_PASSAGES.alIkhlas,
          113: QURAN_PASSAGES.alFalaq,
          114: QURAN_PASSAGES.anNas,
        } as Record<number, { translation: string; hasBasmalah?: boolean }>
      )[surah!] ?? (ayah === 255 ? QURAN_PASSAGES.ayatAlKursi : QURAN_PASSAGES.lastTwoAlBaqarah);
    text = passage.translation;
    stripOpening = "hasBasmalah" in passage && Boolean(passage.hasBasmalah);
  } else if (surah === 18) {
    const { FRIDAY_KAHF } = await import("./fridayKahf");
    text = FRIDAY_KAHF[0]?.translation ?? "";
    source = "Saheeh International";
  } else if (surah === 2) {
    const { BAQARAH_SURAH } = await import("./baqarahSurah");
    text = BAQARAH_SURAH.translation;
    source = "Saheeh International";
  }
  const result = numberedAyahTranslation(text, ayah!, stripOpening);
  return result ? { text: result, source } : null;
}
