import { createHash } from "node:crypto";
import original from "./book3_al_wird_an_nabawi_pages.json" with { type: "json" };
import navigation from "./wird-source-navigation.json" with { type: "json" };

if (createHash("sha256").update(JSON.stringify(original)).digest("hex") !== navigation.beforePagesSha256)
  throw new Error("Changed Wird navigation source; reconcile its original page mapping");

export const wirdContents = navigation.contents;
export const wirdChapterStarts = new Set(wirdContents.map((item) => item.pdfPage));
export const wirdInlineHeading = (page) => wirdContents.find((item) => item.pdfPage === page && item.headingPlacement);

export function wirdSourceChapter(page) {
  if (JSON.stringify(page) !== JSON.stringify(original[page.page - 1]))
    throw new Error(`Changed Wird navigation record p${page.page}`);
  return wirdContents.findLast((entry) => entry.pdfPage <= page.page)?.title ?? page.chapter;
}
