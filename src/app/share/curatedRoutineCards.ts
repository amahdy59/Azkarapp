import type { AppLanguage } from "../types";
import { canCopyImage, copyImageToClipboard } from "./shareDispatcher";

export interface CuratedRoutineCard {
  id: string;
  imagePath: string;
  pageNumber: number;
  totalPages: number;
  altText: {
    ar: string;
    en: string;
  };
}

export interface CuratedRoutinePack {
  categoryId: string;
  title: {
    ar: string;
    en: string;
  };
  cards: readonly CuratedRoutineCard[];
}

export const CURATED_ROUTINE_PACKS: Readonly<Record<string, CuratedRoutinePack>> = {
  before_sleep: {
    categoryId: "before_sleep",
    title: { ar: "أذكار النوم", en: "Sleep Remembrance" },
    cards: [
      {
        id: "before-sleep-1",
        imagePath: "assets/cards/routine-before_sleep-1.jpg",
        pageNumber: 1,
        totalPages: 2,
        altText: { ar: "أذكار النوم — البطاقة ١ من ٢", en: "Sleep Remembrance — Card 1 of 2" },
      },
      {
        id: "before-sleep-2",
        imagePath: "assets/cards/routine-before_sleep-2.jpg",
        pageNumber: 2,
        totalPages: 2,
        altText: { ar: "أذكار النوم — البطاقة ٢ من ٢", en: "Sleep Remembrance — Card 2 of 2" },
      },
    ],
  },
  morning: {
    categoryId: "morning",
    title: { ar: "أذكار الصباح", en: "Morning Remembrance" },
    cards: [
      {
        id: "morning-1",
        imagePath: "assets/cards/routine-morning-1.webp",
        pageNumber: 1,
        totalPages: 3,
        altText: {
          ar: "أذكار الصباح - البطاقة الأولى (1 من 3)",
          en: "Morning Remembrance - Card 1 of 3",
        },
      },
      {
        id: "morning-2",
        imagePath: "assets/cards/routine-morning-2.webp",
        pageNumber: 2,
        totalPages: 3,
        altText: {
          ar: "أذكار الصباح - البطاقة الثانية (2 من 3)",
          en: "Morning Remembrance - Card 2 of 3",
        },
      },
      {
        id: "morning-3",
        imagePath: "assets/cards/routine-morning-3.webp",
        pageNumber: 3,
        totalPages: 3,
        altText: {
          ar: "أذكار الصباح - البطاقة الثالثة (3 من 3)",
          en: "Morning Remembrance - Card 3 of 3",
        },
      },
    ],
  },
  evening: {
    categoryId: "evening",
    title: { ar: "أذكار المساء", en: "Evening Remembrance" },
    cards: [
      {
        id: "evening-1",
        imagePath: "assets/cards/routine-evening-1.webp",
        pageNumber: 1,
        totalPages: 2,
        altText: {
          ar: "أذكار المساء - البطاقة الأولى (1 من 2)",
          en: "Evening Remembrance - Card 1 of 2",
        },
      },
      {
        id: "evening-2",
        imagePath: "assets/cards/routine-evening-2.webp",
        pageNumber: 2,
        totalPages: 2,
        altText: {
          ar: "أذكار المساء - البطاقة الثانية (2 من 2)",
          en: "Evening Remembrance - Card 2 of 2",
        },
      },
    ],
  },
};

export function getCuratedRoutinePack(categoryId?: string | null): CuratedRoutinePack | null {
  if (!categoryId) return null;
  return CURATED_ROUTINE_PACKS[categoryId] ?? null;
}

export function resolveCuratedImageUrl(imagePath: string, baseUrl: string = import.meta.env?.BASE_URL ?? "/"): string {
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${cleanBase}${cleanPath}`;
}

export function getCuratedCardFilename(card: CuratedRoutineCard, packTitle: string, language: AppLanguage): string {
  const safeBase =
    language === "en"
      ? packTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : card.id;
  const withPage = safeBase.includes(String(card.pageNumber)) ? safeBase : `${safeBase}-${card.pageNumber}`;
  const extension = card.imagePath.toLowerCase().endsWith(".jpg") ? "jpg" : "webp";
  return `${withPage}.${extension}`;
}

export async function fetchCuratedCardFile(
  card: CuratedRoutineCard,
  packTitle: string,
  language: AppLanguage,
): Promise<File> {
  const url = resolveCuratedImageUrl(card.imagePath);
  const filename = getCuratedCardFilename(card, packTitle, language);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  if (!blob.size || !["image/jpeg", "image/png", "image/webp"].includes(blob.type))
    throw new Error("Unavailable card image");
  return new File([blob], filename, { type: blob.type });
}

export async function fetchAllCuratedCardFiles(pack: CuratedRoutinePack, language: AppLanguage): Promise<File[]> {
  const packTitle = pack.title[language] ?? pack.title.ar;
  return Promise.all(pack.cards.map((card) => fetchCuratedCardFile(card, packTitle, language)));
}

export async function copyCuratedCardImage(card: CuratedRoutineCard): Promise<boolean> {
  if (!canCopyImage()) return false;
  try {
    const url = resolveCuratedImageUrl(card.imagePath);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();

    if (blob.type === "image/png") {
      return await copyImageToClipboard(blob);
    }

    if (typeof createImageBitmap === "function" && typeof document !== "undefined") {
      try {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
          if (pngBlob) {
            return await copyImageToClipboard(pngBlob);
          }
        }
      } catch {
        // Fallback to copying fetched blob directly
      }
    }

    return await copyImageToClipboard(blob);
  } catch {
    return false;
  }
}
