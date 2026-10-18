import { canShareMultipleFiles, downloadFile, shareMultipleFiles, SHARED_APP_URL } from "./shareDispatcher";
import { fetchAllCuratedCardFiles, getCuratedRoutinePack } from "./curatedRoutineCards";
import { createFileArchive } from "./shareArchive";
import type { AppLanguage } from "../types";

/** Prepare on intent so a ready pack can enter native sharing within the click. */
export async function prepareQuickRoutineShare(categoryId: string, language: AppLanguage) {
  const pack = getCuratedRoutinePack(categoryId);
  if (!pack) throw new Error("No approved cards for this routine");
  const files = await fetchAllCuratedCardFiles(pack, language);
  return { files, title: pack.title[language] };
}
export async function shareQuickRoutinePack(pack: Awaited<ReturnType<typeof prepareQuickRoutineShare>>) {
  if (canShareMultipleFiles(pack.files)) {
    return (await shareMultipleFiles(pack.files, { title: pack.title, downloadFallback: false })).method;
  }
  const archive = await createFileArchive(
    [
      ...pack.files,
      new File([`${pack.title}\n\n${SHARED_APP_URL}\n`], "wa-zaker.txt", { type: "text/plain;charset=utf-8" }),
    ],
    "azkar-cards.zip",
  );
  downloadFile(archive);
  return "downloaded" as const;
}
