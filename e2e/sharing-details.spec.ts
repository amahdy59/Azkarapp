import { expect, test } from "@playwright/test";
import { ALL_AZKAR } from "../src/app/content/azkar";
import { readFileSync } from "node:fs";

const glossary = JSON.parse(
  readFileSync(new URL("../src/app/content/quranWordMeanings.data.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Record<string, string>>>;

for (const sample of [
  { position: 4, name: "kursi", key: "quran-002-255" },
  { position: 5, name: "ikhlas", key: "quran-112" },
  { position: 6, name: "falaq", key: "quran-113" },
]) {
  test(`shares complete ${sample.name} with sourced word explanations @cross-browser`, async ({ page }, info) => {
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
    });
    await page.goto(`./#/azkar/morning/${sample.position}`);
    await page.getByRole("button", { name: "خيارات القارئ", exact: true }).click();
    await page.getByRole("menuitem", { name: "مشاركة الذكر", exact: true }).click();
    const modal = page.getByTestId("collection-share-modal");
    await modal.getByText("تخصيص المحتوى", { exact: true }).click();
    await modal.getByRole("checkbox", { name: "شرح الكلمات الصعبة", exact: true }).check();
    await expect(modal.getByRole("img").or(modal.getByRole("alert"))).toBeVisible();
    if (await modal.getByRole("alert").isVisible())
      await modal.getByRole("button", { name: "صورة قراءة طويلة", exact: true }).click();
    await expect(modal.getByRole("img")).toBeVisible();
    await expect(modal.getByText("بطاقة ١ من ١", { exact: true })).toBeVisible();
    await modal.getByText("قراءة نص هذه البطاقة", { exact: true }).click();
    const zikr = ALL_AZKAR.find((entry) => entry.canonicalKey.startsWith(sample.key))!;
    const chapter =
      sample.name === "kursi" ? { "255": glossary["2"]!["255"]! } : glossary[sample.name === "ikhlas" ? "112" : "113"]!;
    for (const verse of Object.values(chapter))
      for (const [word, meaning] of Object.entries(verse)) {
        await expect(modal.getByText(word, { exact: true })).toBeVisible();
        await expect(modal.getByText(word, { exact: true }).locator("..")).toContainText(meaning);
      }
    await expect(modal.getByText(zikr.arabicText, { exact: true })).toBeVisible();
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
    await (await download).saveAs(info.outputPath(`${sample.name}-glossary.png`));
    await page.screenshot({ path: info.outputPath(`${sample.name}-dialog.png`) });
  });
}
