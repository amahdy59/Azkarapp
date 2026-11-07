import { BAQARAH_SURAH } from "./baqarahSurah";
import {
  ALL_AZKAR as CORE_AZKAR,
  ILLNESS_RUQYAH_AZKAR as CORE_RUQYAH,
  getAzkarByCategory,
  registerLazyCollection,
  withBaqarah,
} from "./azkarCore";

export * from "./azkarCore";

export const ILLNESS_RUQYAH_AZKAR = [...CORE_RUQYAH, BAQARAH_SURAH];
registerLazyCollection("illness_ruqyah", ILLNESS_RUQYAH_AZKAR);

export const ALL_AZKAR = withBaqarah(
  CORE_AZKAR,
  getAzkarByCategory("illness_ruqyah").find(({ id }) => id === BAQARAH_SURAH.id)!,
);

export const ZIKR_LABELS: Record<string, string> = Object.fromEntries(
  ALL_AZKAR.map((zikr) => [zikr.id, zikr.translation.split(".")[0] ?? zikr.transliteration]),
);
