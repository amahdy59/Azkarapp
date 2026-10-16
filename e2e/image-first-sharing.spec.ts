import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

for (const language of ["ar", "en"] as const) {
  test(`image-first sharing and milestone PNG ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/progress");
    await page
      .getByRole("button", { name: language === "ar" ? "مشاركة بطاقة التقدم" : "Share Progress Card", exact: true })
      .click();
    const modal = page.getByTestId("collection-share-modal");
    const methods = modal.getByRole("group", {
      name: language === "ar" ? "طريقة المشاركة" : "Sharing method",
      exact: true,
    });
    const image = methods.getByRole("button", { name: language === "ar" ? "صورة" : "Image", exact: true });
    const text = methods.getByRole("button", { name: language === "ar" ? "نص" : "Text", exact: true });
    await expect(image).toHaveAttribute("aria-pressed", "true");
    const widths = await Promise.all(
      [image, text].map((button) => button.evaluate((node) => node.getBoundingClientRect().width)),
    );
    expect(widths[0]).toBeGreaterThan(widths[1]! * 1.5);
    const preview = modal.getByTestId("sharing-preview").getByRole("img");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("width", "1080");
    await expect(preview).toHaveAttribute("height", "1350");
    await modal
      .getByText(language === "ar" ? "قراءة نص هذه البطاقة" : "Read the text on this card", { exact: true })
      .click();
    const cardText = modal.getByText(language === "ar" ? "أيام النخيل: ٠" : "Palm days: ٠", { exact: false }).first();
    await expect(cardText).toBeVisible();
    const download = page.waitForEvent("download");
    await modal
      .getByTestId("sharing-actions")
      .getByRole("button", { name: language === "ar" ? "حفظ" : "Save", exact: true })
      .click();
    const saved = await download;
    expect(saved.suggestedFilename()).toMatch(/\.png$/);
    const bytes = await readFile((await saved.path())!);
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.length).toBeGreaterThan(10000);
    await saved.saveAs(testInfo.outputPath(`milestone-${language}.png`));
    await expect(cardText).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`image-first-${language}.png`) });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    for (const button of await methods.getByRole("button").all()) {
      await expect(button).toBeVisible();
      expect(await button.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    const actions = modal.getByTestId("sharing-actions");
    for (const button of await actions.getByRole("button").all()) {
      await expect(button).toBeVisible();
      expect(await button.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  });
}
