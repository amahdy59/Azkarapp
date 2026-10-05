import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { formatNumerals } from "../src/app/formatting";

for (const language of ["ar", "en"] as const) {
  for (const reduceMotion of [false, true]) {
    test(`rapid navigation and counting preserve the latest ${language} entry, reduced motion ${reduceMotion} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: reduceMotion ? "reduce" : "no-preference" });
      await page.addInitScript(
        ({ language, reduceMotion }) => {
          if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, reduceMotion, routineModes: { morning: "complete" } },
              profile: { isGuest: true },
            }),
          );
        },
        { language, reduceMotion },
      );
      const azkar = getAzkarForMode("morning", "complete");
      const index = azkar.findIndex((zikr, index) => zikr.repetitionCount === 100 && index + 2 < azkar.length);
      expect(index).toBeGreaterThanOrEqual(0);
      const entry = azkar[index]!;
      await page.goto(`./#/azkar/morning/${index + 1}`);
      const reader = page.getByTestId("reader-screen");
      const counter = page.getByTestId("counter-surface");
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(0, language)} / ${formatNumerals(100, language)}$`),
      );
      // A burst in one task exercises input arriving before React has rendered.
      await counter.evaluate((element) => {
        for (let i = 0; i < 7; i++) (element as HTMLElement).click();
      });
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(7, language)} / ${formatNumerals(100, language)}$`),
      );
      const nextLabel = language === "ar" ? "التالي" : "Next";
      const previousLabel = language === "ar" ? "السابق" : "Prev";
      await reader.evaluate(
        async (element, labels) => {
          for (const label of labels) {
            const button = [...element.querySelectorAll("button")].find(
              (button) => button.textContent?.trim() === label,
            );
            if (!button) throw new Error(`Missing navigation button: ${label}`);
            button.click();
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          }
        },
        [nextLabel, nextLabel, previousLabel, nextLabel, previousLabel, previousLabel],
      );
      await expect(reader).toHaveAttribute("data-zikr-index", String(index));
      const text = page.getByTestId("reading-text-transition");
      await expect(text.locator(`[data-reading-entry="${entry.id}"]:not([inert])`)).toHaveCount(1);
      await expect(text.locator(":scope > div")).toHaveCount(1);
      await reader.evaluate(
        async (element, labels) => {
          for (const label of labels) {
            [...element.querySelectorAll("button")].find((button) => button.textContent?.trim() === label)!.click();
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          }
        },
        [nextLabel, nextLabel, previousLabel],
      );
      await expect(reader).toHaveAttribute("data-zikr-index", String(index + 1));
      await expect(text.locator(`[data-reading-entry="${azkar[index + 1]!.id}"]:not([inert])`)).toHaveCount(1);
      await page.getByRole("button", { name: previousLabel, exact: true }).click();
      await expect(reader).toHaveAttribute("data-zikr-index", String(index));
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(7, language)} / ${formatNumerals(100, language)}$`),
      );
      await counter.click();
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(8, language)} / ${formatNumerals(100, language)}$`),
      );
      await page.reload();
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(8, language)} / ${formatNumerals(100, language)}$`),
      );
      await page.setViewportSize({ width: 1180, height: 820 });
      await expect(reader).toBeVisible();
      await expect(counter).toBeVisible();
      // WebKit may replace the responsive reader after the first visibility
      // check. Measure the final control atomically, retaining exact bounds.
      await expect(async () => {
        const bounds = await counter.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(820);
      }).toPass({ timeout: 15_000 });
      await page.screenshot({ path: testInfo.outputPath(`reading-landscape-${language}-${reduceMotion}.png`) });
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    });
  }

  test(`Later survives navigation, reload and repeated update events in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    let release = "future-release-a";
    let notesAvailable = true;
    await page.route("**/release-notes.json*", (route) =>
      route.fulfill({
        status: notesAvailable ? 200 : 503,
        json: notesAvailable
          ? { release, en: ["Reading", "Sharing", "Progress"], ar: ["القراءة", "المشاركة", "التقدم"] }
          : {},
      }),
    );
    await page.addInitScript((language) => {
      if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("./#/home");
    const title = page.getByText(language === "ar" ? "يتوفر تحديث جديد" : "An update is ready", { exact: true });
    await expect(title).toBeVisible();
    await page.getByRole("button", { name: language === "ar" ? "لاحقاً" : "Later", exact: true }).click();
    await expect(title).not.toBeVisible();
    notesAvailable = false;
    await page.evaluate(() => window.dispatchEvent(new Event("azkar-update-available")));
    await page.goto("./#/settings/about");
    await expect(title).not.toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: language === "ar" ? "حول تطبيق أذكار" : "About Azkar", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("azkar-update-available")));
    await expect(
      page.getByRole("button", { name: language === "ar" ? "مراجعة التحديث المتاح" : "Review available update" }),
    ).toBeVisible();
    await expect(title).not.toBeVisible();
    await page
      .getByRole("button", { name: language === "ar" ? "مراجعة التحديث المتاح" : "Review available update" })
      .click();
    await expect(title).toBeVisible();
    await expect(
      page.getByRole("button", { name: language === "ar" ? "تحديث" : "Refresh", exact: true }),
    ).toBeFocused();
    await page.getByRole("button", { name: language === "ar" ? "لاحقاً" : "Later", exact: true }).click();
    await expect(
      page.getByRole("button", { name: language === "ar" ? "مراجعة التحديث المتاح" : "Review available update" }),
    ).toBeFocused();
    notesAvailable = true;
    release = "future-release-b";
    await page.evaluate(() => window.dispatchEvent(new Event("azkar-update-available")));
    await expect(title).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`update-deferral-${language}.png`) });
  });
}
