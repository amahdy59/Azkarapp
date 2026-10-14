import { describe, expect, it } from "vitest";
import { buildArchiveEntryPath, getArchiveCategoryFolder, sanitizeArchiveName } from "./audioArchive";
import type { SavedAudioFile } from "./audioOfflineCache";

describe("sanitizeArchiveName", () => {
  it("replaces forbidden filesystem characters with dashes and trims whitespace", () => {
    expect(sanitizeArchiveName('Surah 3:190-200 <"test">/\\|?*')).toBe("Surah 3-190-200 -test");
    expect(sanitizeArchiveName("   Morning   Azkar   ")).toBe("Morning Azkar");
  });
});

describe("getArchiveCategoryFolder", () => {
  it("maps devotional categories and Quran to bilingual folder names", () => {
    expect(getArchiveCategoryFolder("morning")).toBe("01 - Morning Azkar (أذكار الصباح)");
    expect(getArchiveCategoryFolder("evening")).toBe("02 - Evening Azkar (أذكار المساء)");
    expect(getArchiveCategoryFolder("before_sleep")).toBe("03 - Sleep Azkar (أذكار النوم)");
    expect(getArchiveCategoryFolder("after_prayer")).toBe("05 - Post-Prayer Azkar (أذكار بعد الصلاة)");
    expect(getArchiveCategoryFolder("waking_up")).toBe("06 - Waking Up Azkar (أذكار الاستيقاظ)");
    expect(getArchiveCategoryFolder("other")).toBe("07 - Duas & Other Azkar (أدعية وأذكار متنوعة)");
    expect(getArchiveCategoryFolder(undefined, "quran")).toBe("04 - Quran (القرآن الكريم)");
    expect(getArchiveCategoryFolder("friday_kahf")).toBe("04 - Quran (القرآن الكريم)");
  });
});

describe("buildArchiveEntryPath", () => {
  const azkarFile: SavedAudioFile = {
    id: "m-hm-1",
    titleArabic: "آية الكرسي",
    titleEnglish: "Ayat Al-Kursi",
    voiceName: "Abdullah Muhammad",
    voiceId: "abdullah-muhammad",
    fileName: "m-hm-1.wav",
    byteSize: 12345,
    category: "morning",
    orderIndex: 1,
  };

  const quranFile: SavedAudioFile = {
    id: "quran-002",
    titleArabic: "سورة البقرة",
    titleEnglish: "Surah Al-Baqarah",
    voiceName: "Muhammad Shari",
    voiceId: "muhammad-alshara",
    fileName: "002-baqarah.mp3",
    byteSize: 54321,
    contentKind: "quran",
    surahNumber: 2,
  };

  it("builds a clean Arabic path with category folder, padded track number, and reciter", () => {
    const path = buildArchiveEntryPath(azkarFile, 1, "ar");
    expect(path).toBe("01 - Morning Azkar (أذكار الصباح)/01 - آية الكرسي - عبد الله محمد.wav");
  });

  it("builds a clean English path with category folder, padded track number, and reciter", () => {
    const path = buildArchiveEntryPath(azkarFile, 1, "en");
    expect(path).toBe("01 - Morning Azkar (أذكار الصباح)/01 - Ayat Al-Kursi - Abdullah Muhammad.wav");
  });

  it("formats Quran surah with 3-digit padding and localized surah title", () => {
    const pathAr = buildArchiveEntryPath(quranFile, 1, "ar");
    expect(pathAr).toBe("04 - Quran (القرآن الكريم)/002 - سورة البقرة - محمد شرعي.mp3");

    const pathEn = buildArchiveEntryPath(quranFile, 1, "en");
    expect(pathEn).toBe("04 - Quran (القرآن الكريم)/002 - Surah Al-Baqarah - Muhammad Shari.mp3");
  });

  it("sanitizes forbidden characters from titles in the entry path", () => {
    const problematicFile: SavedAudioFile = {
      ...azkarFile,
      titleEnglish: 'Dua: "Protection" / Refuge?',
      fileName: "test.mp3",
    };
    const path = buildArchiveEntryPath(problematicFile, 3, "en");
    expect(path).toBe("01 - Morning Azkar (أذكار الصباح)/03 - Dua- -Protection- - Refuge - Abdullah Muhammad.mp3");
  });
});
