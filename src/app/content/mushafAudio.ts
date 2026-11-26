import type { CategoryId } from "../types";

/** Existing full-surah recordings only; availability is not inferred from a page. */
export function getMushafRecording(surah: number): { category: CategoryId; zikrId: string } | undefined {
  switch (surah) {
    case 2:
      return { category: "illness_ruqyah", zikrId: "ir-baqarah" };
    case 18:
      return { category: "friday_kahf", zikrId: "friday-kahf" };
    case 32:
      return { category: "before_sleep", zikrId: "s-hm-110a" };
    case 67:
      return { category: "before_sleep", zikrId: "s-hm-110b" };
  }
}
