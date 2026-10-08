import { ALL_AZKAR, getAzkarByCategory, registerLazyCollection } from "./azkar";
import { COMPREHENSIVE_DUAS } from "./comprehensiveDuas";
import type { Zikr } from "../types";

export const COMPREHENSIVE_DUA_ITEMS = COMPREHENSIVE_DUAS.filter((zikr) => !zikr.isCollectionIntroduction);

/** Both search surfaces use the same reviewed inventory and canonical order. */
export const SEARCHABLE_AZKAR = [
  ...ALL_AZKAR.filter((zikr) => !zikr.isCollectionIntroduction),
  ...COMPREHENSIVE_DUA_ITEMS,
];

export function resolveSearchResultIndex(zikr: Pick<Zikr, "id" | "category">): number {
  if (zikr.category === "comprehensive_duas") {
    registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
  }
  return getAzkarByCategory(zikr.category).findIndex((item) => item.id === zikr.id);
}
