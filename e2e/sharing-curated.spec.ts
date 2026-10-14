import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

for (const category of ["morning", "evening"] as const) {
  test(`curated ${category} cards preview and save actual images @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
      );
    });
    await page.goto(`/#/azkar/${category}`);
    await page.getByTestId("share-collection-button").click();
    const modal = page.getByTestId("collection-share-modal");
    await modal.getByRole("button", { name: "البطاقات المعتمدة", exact: true }).click();
    const image = modal.locator(`img[src$="routine-${category}-1.webp"]`).first();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(900);
    await modal.getByRole("button", { name: "البطاقة التالية" }).click();
    await expect(modal.locator(`img[src$="routine-${category}-2.webp"]`).first()).toBeVisible();
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: "حفظ", exact: true }).click();
    const saved = await download;
    const archive = await readFile((await saved.path())!);
    expect(archive.subarray(0, 2).toString()).toBe("PK");
    for (let i = 1; i <= (category === "morning" ? 3 : 2); i++) {
      const original = await readFile(`public/assets/cards/routine-${category}-${i}.webp`);
      expect(archive.includes(original)).toBe(true);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-testid="collection-share-modal"]')
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`curated-${category}.png`) });
  });
}

test("all supplied curated images are available on the first offline visit after install", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Service worker coverage is checked in Chromium.");
  await page.goto("/");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    const sizes = await page.evaluate(async () => {
      const paths = ["morning-1", "morning-2", "morning-3", "evening-1", "evening-2"];
      return Promise.all(
        paths.map(async (path) => {
          const response = await fetch(`assets/cards/routine-${path}.webp`);
          if (!response.ok) throw new Error("Missing offline image");
          return (await response.blob()).size;
        }),
      );
    });
    expect(sizes).toEqual([53622, 60654, 48974, 51324, 57152]);
  } finally {
    await context.setOffline(false);
  }
});
