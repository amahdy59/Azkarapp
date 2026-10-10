/**
 * Offline-first English translations for the Holy Qur'an (Saheeh International).
 *
 * Surahs are lazy-loaded on demand from `public/data/translations/en/<surah>.json`
 * and cached in memory. Never rejects or throws: if an offline asset or network request
 * fails, graceful empty fallbacks are returned so reading is never disrupted.
 */

const translationCache = new Map<string, Record<string, string>>();
const pendingRequests = new Map<string, Promise<Record<string, string>>>();
const TRANSLATION_CACHE_NAME = "azkar-quran-translations-v1";
let cacheGeneration = 0;

export function __resetQuranTranslationsCacheForTesting() {
  cacheGeneration += 1;
  translationCache.clear();
  pendingRequests.clear();
}

function getSurahTranslationUrl(surah: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.endsWith("/") ? base : `${base}/`}data/translations/en/${surah}.json`;
}

/**
 * Loads a complete surah's English translation on demand.
 */
export function loadSurahEnglishTranslation(surahNumber: number | string): Promise<Record<string, string>> {
  const surah = String(surahNumber);
  if (!/^[1-9]\d{0,2}$/u.test(surah) || Number(surah) > 114) return Promise.resolve({});
  const cached = translationCache.get(surah);
  if (cached) return Promise.resolve(cached);

  const pending = pendingRequests.get(surah);
  if (pending) return pending;

  const generation = cacheGeneration;
  const request = (async () => {
    const url = getSurahTranslationUrl(surah);
    let cache: Cache | undefined;
    try {
      cache = await globalThis.caches?.open(TRANSLATION_CACHE_NAME);
    } catch {
      // Cache denial must not prevent reading an available local asset.
    }
    let response: Response | undefined;
    try {
      response = await cache?.match(url);
    } catch {
      // The network/local asset remains an independent recovery path.
    }
    response ??= await fetch(url);
    if (!response.ok) return null;
    const cachedCopy = cache ? response.clone() : undefined;
    const value: unknown = await response.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const entries = Object.entries(value);
    if (
      !entries.length ||
      entries.some(([key, text]) => !/^[1-9]\d{0,2}$/u.test(key) || typeof text !== "string" || !text.trim())
    )
      return null;
    if (cache && cachedCopy) {
      try {
        await cache.put(url, cachedCopy);
      } catch {
        // In-memory reading still works when device storage is full.
      }
    }
    return Object.fromEntries(entries) as Record<string, string>;
  })()
    .then((value: unknown) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const data = value as Record<string, string>;
        if (generation === cacheGeneration) translationCache.set(surah, data);
        return data;
      }
      return {};
    })
    .catch(() => ({}) as Record<string, string>)
    .finally(() => {
      if (pendingRequests.get(surah) === request) pendingRequests.delete(surah);
    });

  pendingRequests.set(surah, request);
  return request;
}

/**
 * Synchronously retrieves an ayah's English translation if its surah is already in cache.
 */
export function getAyahEnglishTranslation(verseKey: string): string | null {
  if (!/^[1-9]\d{0,2}:[1-9]\d{0,2}$/u.test(verseKey)) return null;
  const [surah, ayah] = verseKey.split(":");
  if (!surah || !ayah) return null;
  const map = translationCache.get(surah);
  return map?.[ayah] ?? null;
}

/**
 * Asynchronously loads and returns an ayah's English translation.
 */
export async function loadAyahEnglishTranslation(verseKey: string): Promise<string | null> {
  if (!/^[1-9]\d{0,2}:[1-9]\d{0,2}$/u.test(verseKey)) return null;
  const [surah, ayah] = verseKey.split(":");
  if (!surah || !ayah) return null;
  const map = await loadSurahEnglishTranslation(surah);
  return map[ayah] ?? null;
}

export interface QuranPageVerseTranslation {
  verseKey: string;
  ayahNumber: number;
  text: string;
}

/**
 * Loads translations for all unique verses on a page.
 */
export async function loadPageEnglishTranslation(
  pageVerses: ReadonlyArray<{ k: string }>,
): Promise<QuranPageVerseTranslation[]> {
  const uniqueKeys = Array.from(new Set(pageVerses.map((v) => v.k)));
  const surahs = Array.from(new Set(uniqueKeys.map((k) => k.split(":")[0] ?? "").filter(Boolean)));

  await Promise.all(surahs.map((surah) => loadSurahEnglishTranslation(surah)));

  const result: QuranPageVerseTranslation[] = [];
  for (const verseKey of uniqueKeys) {
    const [, ayah] = verseKey.split(":");
    const text = getAyahEnglishTranslation(verseKey);
    if (text) {
      result.push({
        verseKey,
        ayahNumber: Number(ayah),
        text,
      });
    }
  }

  return result;
}
