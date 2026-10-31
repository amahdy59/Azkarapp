import type { AppLanguage, Zikr } from "../types";
import type { AudioPreferences } from "./audioTypes";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getSavedAudioFiles,
  prepareSavedAudioFile,
  type AudioDownloadProgress,
  type SavedAudioFile,
} from "./audioOfflineCache";
import { getAudioVoiceName } from "./audioVoices";
import { createFileArchive } from "../share/shareArchive";

/** Sanitizes strings for safe cross-platform folder and file names (Windows, macOS, Linux, iOS, Android). */
export function sanitizeArchiveName(text: string): string {
  // Strip tashkeel (Arabic diacritics) to avoid combining characters and Windows MAX_PATH failures
  const withoutTashkeel = text.replace(/[\u0617-\u061a\u064b-\u0652\u0670]/g, "");
  return withoutTashkeel
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/** Resolves a standardized, human-readable bilingual category folder name. */
export function getArchiveCategoryFolder(category?: string, contentKind?: string): string {
  if (contentKind === "quran" || category === "friday_kahf" || category === "quran") {
    return "04 - Quran (القرآن الكريم)";
  }
  switch (category) {
    case "morning":
      return "01 - Morning Azkar (أذكار الصباح)";
    case "evening":
      return "02 - Evening Azkar (أذكار المساء)";
    case "before_sleep":
      return "03 - Sleep Azkar (أذكار النوم)";
    case "after_prayer":
      return "05 - Post-Prayer Azkar (أذكار بعد الصلاة)";
    case "waking_up":
      return "06 - Waking Up Azkar (أذكار الاستيقاظ)";
    default:
      return "07 - Duas & Other Azkar (أدعية وأذكار متنوعة)";
  }
}

/** Builds a clean, numbered, human-understandable relative path for an archive entry. */
export function buildArchiveEntryPath(
  file: SavedAudioFile,
  indexInCategory: number,
  language: AppLanguage = "ar",
): string {
  const folder = getArchiveCategoryFolder(file.category, file.contentKind);
  const trackNumber =
    file.contentKind === "quran" && typeof file.surahNumber === "number"
      ? String(file.surahNumber).padStart(3, "0")
      : String(indexInCategory).padStart(2, "0");

  const rawTitle =
    (language === "ar" ? file.titleArabic : file.titleEnglish) || file.titleArabic || file.titleEnglish || file.id;
  // Use first line only (strips multi-line study notes, bulleted explanations, and citation details)
  const firstLineTitle = (rawTitle || "").split(/\r?\n/)[0]?.trim() || "";
  let title = sanitizeArchiveName(firstLineTitle);
  // Bounded title length prevents MAX_PATH (260 char) extraction failures on Windows
  if (title.length > 60) {
    title = title
      .slice(0, 60)
      .trim()
      .replace(/[-.]+$/, "");
  }

  const voiceLookup = file.voiceId ? getAudioVoiceName(file.voiceId, language) : undefined;
  const voice = sanitizeArchiveName(voiceLookup ?? file.voiceName);

  const extension = file.fileName.split(".").pop() || "mp3";

  return `${folder}/${trackNumber} - ${title} - ${voice}.${extension}`;
}

/** Missing files follow the normal verified downloader; exports never remove offline copies. */
export async function prepareAudioArchive(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
  options: {
    language?: AppLanguage;
    signal?: AbortSignal;
    onDetail?: (detail: AudioDownloadProgress) => void;
    onArchiveProgress?: (completed: number, total: number) => void;
  } = {},
) {
  const language = options.language ?? "ar";
  await downloadAudioForZikrs(zikrs, preferences, { signal: options.signal, onDetail: options.onDetail });
  options.signal?.throwIfAborted();
  const files = await getSavedAudioFiles(zikrs, preferences);
  if (
    !files.length ||
    files.reduce((sum, file) => sum + file.byteSize, 0) !== estimateAudioDownloadBytes(zikrs, preferences)
  )
    throw new Error("Incomplete audio archive");

  const categoryCounters = new Map<string, number>();

  async function* entries() {
    options.onArchiveProgress?.(0, files.length);
    for (let index = 0; index < files.length; index++) {
      options.signal?.throwIfAborted();
      const file = files[index]!;
      const folder = getArchiveCategoryFolder(file.category, file.contentKind);
      const counter = (categoryCounters.get(folder) ?? 0) + 1;
      categoryCounters.set(folder, counter);
      const entryName = buildArchiveEntryPath(file, counter, language);

      yield await prepareSavedAudioFile(zikrs, preferences, file.id, entryName);
      options.onArchiveProgress?.(index + 1, files.length);
    }
  }
  return createFileArchive(entries(), "wa-zaker-audio.zip", { signal: options.signal });
}
