/** Resource identity is independent of navigation placement and publication format. */
export type LearningResourceKind = "book" | "guide" | "hadith-collection";
export type LearningResourceId = "al-mukhtar" | "dalil-al-mutamir" | "al-wird-an-nabawi";
export type LearningLanguage = "ar" | "en";
export type LearningEditionId = LearningResourceId | "dalil-al-mutamir:en";
/** Keep legacy Arabic record/cache identities intact. */
export function learningEditionId(resource: { id: LearningResourceId; language: LearningLanguage }): LearningEditionId {
  return resource.language === "en" && resource.id === "dalil-al-mutamir" ? "dalil-al-mutamir:en" : resource.id;
}
export type PdfEdition = "light" | "dark" | "navy";

export interface LearningAsset {
  path: string;
  sha256: string;
  bytes: number;
  mime: string;
}

export interface LearningResource {
  id: LearningResourceId;
  kind: LearningResourceKind;
  language: LearningLanguage;
  status?: "draft-for-review";
  title: string;
  author: string;
  pack: LearningAsset;
  images: LearningAsset[];
  pdfs: Record<PdfEdition, LearningAsset>;
}

/** No raw HTML, CSS, events, arbitrary URLs or executable SVG enters the reader. */
export type LearningNode =
  | string
  | {
      tag: string;
      className?: string;
      target?: string;
      asset?: string;
      alt?: string;
      artwork?: number;
      lang?: LearningLanguage;
      dir?: "rtl" | "ltr";
      href?: string;
      diagram?: "tawaf" | "sai";
      label?: string;
      children: LearningNode[];
    };

export interface LearningUnit {
  id: string;
  title: string;
  sourcePage: number;
  nodes: LearningNode[];
  text: string;
}

export interface LearningPack {
  schema: 1;
  resourceId: LearningResourceId;
  language: LearningLanguage;
  units: LearningUnit[];
  contents: { title: string; unitId: string }[];
}
