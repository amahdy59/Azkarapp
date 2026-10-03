import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { formatNumerals } from "../src/app/formatting";

async function returningReader(page: Page, language: "ar" | "en") {
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language,
          themeMode: "dark",
          reduceMotion: true,
          hapticFeedback: false,
          homeVisualEffects: false,
          routineModes: { after_prayer: "core" },
        },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`situational access and reading focus stay usable in ${language} @cross-browser`, async ({ page }) => {
    await returningReader(page, language);
    const repeatedIndex = getAzkarForMode("after_prayer", "core").findIndex(
      (zikr) => zikr.id === "ap-tasbeeh-subhanallah",
    );
    expect(repeatedIndex).toBeGreaterThanOrEqual(0);
    for (const width of [320, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/home");
      const shortcuts = page.getByTestId("situational-shortcuts");
      await shortcuts.scrollIntoViewIfNeeded();
      await expect(shortcuts.getByRole("link")).toHaveCount(6);
      await page.screenshot({ path: `output/playwright/phase78/home-${language}-${width}.png` });
      await shortcuts
        .getByRole("link", { name: language === "ar" ? "أذكار الكرب والهم" : "Distress & Anxiety" })
        .click();
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reader-category", "distress_anxiety");

      await page.goto(`/#/azkar/after-prayer/${repeatedIndex + 1}`);
      const counter = page.getByTestId("counter-surface");
      await expect(counter).toBeVisible();
      const beforeLabel = (await counter.getAttribute("aria-label"))!;
      const beforeCount = Number(
        beforeLabel.match(/([0-9٠-٩]+)\s*\//)![1]!.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))),
      );
      await page
        .getByRole("button", { name: language === "ar" ? "خيارات القارئ" : "Reader options", exact: true })
        .click();
      await page.getByTestId("reader-focus-toggle").click();
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reading-focus", "true");
      const exit = page.getByRole("button", { name: language === "ar" ? "إنهاء وضع التركيز" : "Exit reading focus" });
      await expect(exit).toBeFocused();
      await counter.click();
      await expect(counter).toHaveAttribute(
        "aria-label",
        new RegExp(`${formatNumerals(beforeCount + 1, language)} / ${formatNumerals(33, language)}$`),
      );
      await expect(
        page.getByRole("button", { name: language === "ar" ? "خيارات القارئ" : "Reader options", exact: true }),
      ).not.toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const result = await new AxeBuilder({ page })
        .include('[data-testid="reader-screen"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
      await page.screenshot({ path: `output/playwright/phase78/focus-${language}-${width}.png` });
      await exit.focus();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reading-focus", "false");
    }
  });
}

test("keyboard help disables character actions while preserving native counting", async ({ page }) => {
  await returningReader(page, "en");
  await page.goto("/#/counter");
  const counter = page.getByTestId("custom-counter-surface");
  await expect(counter).toBeVisible();
  await counter.click();
  await page.getByRole("button", { name: "Keyboard shortcuts", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
  await dialog.getByRole("checkbox").uncheck();
  const axe = await new AxeBuilder({ page })
    .include('[data-testid="counter-keyboard-help"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: "output/playwright/phase78/keyboard-help-en.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.locator("#main-content").focus();
  await page.keyboard.press("r");
  await expect(counter).toHaveText(/1 \/ 100/);
  await counter.focus();
  await page.keyboard.press("Space");
  await expect(counter).toHaveText(/2 \/ 100/);
  await page.getByRole("button", { name: "Read guided after-prayer azkar" }).click();
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reader-category", "after_prayer");
});

test("travel preparation discloses verified coverage without starting downloads", async ({ page }) => {
  await returningReader(page, "en");
  await page.goto("/#/settings/downloads");
  const prepare = page.getByRole("button", { name: "Prepare offline reading and audio" });
  await expect(prepare).toBeEnabled();
  await expect(page.getByTestId("travel-readiness")).toHaveText("Travel downloads are not complete yet");
  await expect(page.getByText(/0 \/ 604 Mushaf pages/)).toBeVisible();
  await page.screenshot({ path: "output/playwright/phase78/travel-downloads-en.png" });
});

test("keyboard help remains reachable with enlarged text on a short Arabic phone @cross-browser", async ({ page }) => {
  await returningReader(page, "ar");
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto("/#/counter");
  await page.getByRole("button", { name: "اختصارات لوحة المفاتيح", exact: true }).click();
  const dialog = page.getByTestId("counter-keyboard-help");
  await expect(dialog).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const bounds = (await dialog.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(480);
  const titleBounds = await dialog.locator("h2:not(.sr-only)").evaluate((heading) => {
    const text = document.createRange();
    text.selectNodeContents(heading);
    const bounds = text.getBoundingClientRect();
    return { y: bounds.y };
  });
  const closeBounds = (await dialog.getByRole("button", { name: "إغلاق", exact: true }).boundingBox())!;
  expect(titleBounds.y).toBeGreaterThanOrEqual(closeBounds.y + closeBounds.height);
  const checkbox = dialog.getByRole("checkbox");
  await checkbox.scrollIntoViewIfNeeded();
  await expect(checkbox).toBeVisible();
  const checkboxBounds = (await checkbox.boundingBox())!;
  expect(checkboxBounds.y).toBeGreaterThanOrEqual(closeBounds.y + closeBounds.height);
  expect(checkboxBounds.y + checkboxBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  expect(await dialog.locator("label").evaluate((label) => label.scrollWidth <= label.clientWidth)).toBe(true);
  await page.screenshot({ path: "output/playwright/phase78/keyboard-help-ar-enlarged.png" });
  await dialog.getByRole("button", { name: "إغلاق", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
