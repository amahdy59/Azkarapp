import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { formatNumerals } from "../src/app/formatting";

async function returningReader(
  page: Page,
  language: "ar" | "en",
  materialSettings: { themeMode?: "light" | "midnight" | "dark"; reduceTransparency?: boolean } = {},
) {
  await page.addInitScript(
    ({ language, materialSettings }) => {
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
            ...materialSettings,
          },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
    },
    { language, materialSettings },
  );
}

test("keyboard instructions follow the shared breakpoint on every counter @cross-browser", async ({ page }) => {
  await returningReader(page, "en");
  for (const route of ["/#/azkar/evening/1", "/#/counter", "/#/friday/salawat"]) {
    await page.goto(route);
    const help = page.getByRole("button", { name: "Keyboard shortcuts", exact: true });
    for (const width of [320, 767, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      if (width < 768) {
        await expect(help).not.toBeVisible();
      } else {
        await expect(help).toBeVisible();
      }
    }
  }
});

for (const language of ["ar", "en"] as const) {
  for (const themeMode of ["light", "midnight", "dark"] as const) {
    for (const reduceTransparency of [false, true]) {
      const engineSmoke =
        (language === "ar" && themeMode === "dark" && reduceTransparency) ||
        (language === "en" && themeMode === "light" && !reduceTransparency);
      test(`situational material follows ${themeMode} ${reduceTransparency ? "opaque" : "glass"} in ${language}${engineSmoke ? " @cross-browser" : ""}`, async ({
        page,
      }) => {
        await returningReader(page, language, { themeMode, reduceTransparency });
        await page.goto("/#/home");
        // Theme/language contrast is independent of width. Sweep the wider
        // geometry once; keep every visual mode at the narrowest viewport.
        const widths = language === "ar" && themeMode === "light" && !reduceTransparency ? [320, 820, 1440] : [320];
        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          const card = page.getByTestId("situational-shortcuts");
          await card.scrollIntoViewIfNeeded();
          const material = await card.evaluate((element) => {
            const style = getComputedStyle(element);
            const reference = getComputedStyle(document.querySelector('[data-testid="home-tool-qibla"]')!);
            return {
              background: style.backgroundColor,
              blur: style.backdropFilter,
              color: style.color,
              referenceBackground: reference.backgroundColor,
              referenceBlur: reference.backdropFilter,
              referenceColor: reference.color,
            };
          });
          expect(material.background).toBe(material.referenceBackground);
          expect(material.blur).toBe(material.referenceBlur);
          expect(material.color).toBe(material.referenceColor);
          if (reduceTransparency) expect(material.blur).toBe("none");
          else expect(material.blur).toContain("blur(");
          const firstLink = card.getByRole("link").first();
          await firstLink.focus();
          const focus = await firstLink.evaluate((element) => {
            const style = getComputedStyle(element);
            return { outline: style.outlineWidth, shadow: style.boxShadow };
          });
          expect(focus.outline !== "0px" || focus.shadow !== "none").toBe(true);
          const targets = await card.getByRole("link").evaluateAll((links) =>
            links.map((link) => {
              const bounds = link.getBoundingClientRect();
              return { width: bounds.width, height: bounds.height };
            }),
          );
          expect(targets).toHaveLength(6);
          for (const bounds of targets) {
            expect(bounds.width).toBeGreaterThanOrEqual(44);
            expect(bounds.height).toBeGreaterThanOrEqual(44);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          const result = await new AxeBuilder({ page })
            .include('[data-testid="situational-shortcuts"]')
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(result.violations).toEqual([]);
          if (width === 320)
            await page.screenshot({
              path: `output/playwright/phase78/material-${language}-${themeMode}-${reduceTransparency ? "opaque" : "glass"}.png`,
            });
        }
      });
    }
  }
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
  await page.setViewportSize({ width: 1440, height: 900 });
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
  await expect(counter).toHaveText("1/100");
  await counter.focus();
  await page.keyboard.press("Space");
  await expect(counter).toHaveText("2/100");
  await expect(page.getByRole("button", { name: "Read guided after-prayer azkar" })).toHaveCount(0);
  await page.goto("/#/azkar/after-prayer/1");
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
  await expect(page.getByTestId("custom-counter-surface")).toBeVisible();
  await expect(page.getByRole("button", { name: "اختصارات لوحة المفاتيح", exact: true })).not.toBeVisible();
  await page.locator("#main-content").focus();
  await page.keyboard.press("?");
  const dialog = page.getByTestId("counter-keyboard-help");
  await expect(dialog).toBeVisible();
  await page.evaluate(async () => {
    document.documentElement.style.fontSize = "200%";
    await document.fonts.ready;
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
  // Use native focus to reach the setting, and compare DOM rectangles in one
  // coordinate system. WebKit locator bounds differ for scrolled descendants.
  await checkbox.focus();
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toBeVisible();
  await expect
    .poll(() =>
      checkbox.evaluate((input) => {
        const scrollport = input.parentElement!.parentElement!;
        const modal = input.closest('[role="dialog"]')!;
        const close = modal.querySelector('[data-testid="modal-close-button"]')!;
        const inputBounds = input.getBoundingClientRect();
        const scrollBounds = scrollport.getBoundingClientRect();
        const modalBounds = modal.getBoundingClientRect();
        const closeBounds = close.getBoundingClientRect();
        return {
          insideScrollport: inputBounds.top >= scrollBounds.top && inputBounds.bottom <= scrollBounds.bottom,
          belowClose: inputBounds.top >= closeBounds.bottom,
          insideDialog: inputBounds.bottom <= modalBounds.bottom,
        };
      }),
    )
    .toEqual({ insideScrollport: true, belowClose: true, insideDialog: true });
  expect(await dialog.locator("label").evaluate((label) => label.scrollWidth <= label.clientWidth)).toBe(true);
  await page.screenshot({ path: "output/playwright/phase78/keyboard-help-ar-enlarged.png" });
  await dialog.getByRole("button", { name: "إغلاق", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("dhikr picker supports arrow keys, explicit activation and cancellation @cross-browser", async ({ page }) => {
  await returningReader(page, "en");
  await page.goto("/#/counter");
  await page.getByRole("button", { name: /Subhanallahi wa bihamdihi/i }).click();
  const menu = page.getByRole("menu");
  const radios = menu.getByRole("menuitemradio");
  await radios.first().focus();
  await expect(radios.first()).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(radios.first()).toBeChecked();
  await expect(radios.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(menu).not.toBeVisible();
  const trigger = page.getByTestId("counter-zikr-filter");
  await expect(trigger).toHaveAttribute("title", "Subhanallahi wa bihamdihi, Subhanallahil-Azeem");
  await trigger.click();
  await expect(radios.nth(1)).toBeChecked();
  await radios.nth(1).focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(2)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("title", "Subhanallahi wa bihamdihi, Subhanallahil-Azeem");
});
