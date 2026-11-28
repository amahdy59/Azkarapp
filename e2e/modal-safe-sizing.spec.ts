import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";
import { enlargeReading } from "./helpers/enlarged-reading";

const insets = { top: 32, right: 12, bottom: 24, left: 8 };
const scenarios = [
  { width: 390, height: 872, language: "ar", themeMode: "midnight", appMaterial: "glass", scale: 1 },
  { width: 390, height: 844, language: "en", themeMode: "light", appMaterial: "solid", scale: 1 },
  { width: 320, height: 740, language: "ar", themeMode: "light", appMaterial: "solid", scale: 2 },
  { width: 834, height: 1112, language: "en", themeMode: "dark", appMaterial: "glass", scale: 1 },
  { width: 1440, height: 900, language: "ar", themeMode: "midnight", appMaterial: "solid", scale: 1 },
  { width: 740, height: 390, language: "en", themeMode: "light", appMaterial: "solid", scale: 1 },
] as const;

async function supplyInsets(page: Page, values = insets) {
  await page.evaluate((values) => {
    for (const [edge, value] of Object.entries(values))
      document.documentElement.style.setProperty(`--safe-area-inset-${edge}`, `${value}px`);
  }, values);
}

async function expectBounds(page: Page, dialog: Locator, values = insets) {
  await expect
    .poll(async () => {
      const box = (await dialog.boundingBox())!;
      const viewport = page.viewportSize()!;
      return (
        box.x >= values.left + 15 &&
        box.y >= values.top + 15 &&
        box.x + box.width <= viewport.width - values.right - 15 &&
        box.y + box.height <= viewport.height - values.bottom - 15
      );
    })
    .toBe(true);
  const overflow = await dialog.evaluate((node) => ({
    amount: node.scrollWidth - node.clientWidth,
    children: [...node.querySelectorAll<HTMLElement>("*")]
      .filter((child) => child.scrollWidth > child.clientWidth + 2)
      .map((child) => ({ name: child.className, width: child.clientWidth, scroll: child.scrollWidth })),
  }));
  expect(overflow.amount, JSON.stringify(overflow)).toBeLessThanOrEqual(1);
}

async function expectTarget(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeInViewport();
  const box = (await control.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }),
  ).toBe(true);
}

for (const scenario of scenarios) {
  const label = `${scenario.language}-${scenario.width}-${scenario.scale}`;
  test.describe(label, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(scenario);
      await page.addInitScript((scenario) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language: scenario.language,
              themeMode: scenario.themeMode,
              appMaterial: scenario.appMaterial,
              highContrast: scenario.width === 320,
              reduceMotion: true,
              routineModes: { before_sleep: "complete" },
            },
            profile: { isGuest: true },
          }),
        );
      }, scenario);
    });

    test("sharing respects system bars, dropdown bounds and focus @cross-browser", async ({ page }, info) => {
      await page.goto("/#/azkar/before-sleep");
      const opener = page.getByTestId("share-collection-button");
      await opener.click();
      const dialog = page.getByTestId("collection-share-modal");
      await expect(dialog.getByTestId("sharing-preview").getByRole("img")).toBeVisible();
      await supplyInsets(page);
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      await expectBounds(page, dialog);
      const close = dialog.getByTestId("modal-close-button");
      await expectTarget(close);
      await sharingStep(dialog, "content");
      const select = dialog.getByRole("combobox").first();
      await select.click();
      const popup = page.getByRole("listbox");
      await expect(popup).toBeVisible();
      const bounds = (await popup.boundingBox())!;
      expect(bounds.y).toBeGreaterThanOrEqual(insets.top);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(scenario.height - insets.bottom + 1);
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
      await expect(dialog).toBeVisible();
      await expect(select).toBeFocused();
      await expectTarget(close);
      await close.focus();
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath(`sharing-${label}-simulated-insets.png`), scale: "css" });
      const larger = { ...insets, top: 64, bottom: 48 };
      await supplyInsets(page, larger);
      await expectBounds(page, dialog, larger);
      const zero = { top: 0, right: 0, bottom: 0, left: 0 };
      await supplyInsets(page, zero);
      await expectBounds(page, dialog, zero);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test("enlarged excerpt uses content height and preserves every word @cross-browser", async ({ page }, info) => {
      const position = getAzkarForMode("before_sleep", "complete").findIndex(({ id }) => id === "s-hm-99-ikhlas") + 1;
      expect(position).toBeGreaterThan(0);
      await page.goto(`/#/azkar/before-sleep/${position}`);
      const opener = page
        .getByTestId("canonical-surah-passage")
        .getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true });
      await opener.click();
      await supplyInsets(page);
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      const dialog = page.getByRole("dialog", { name: t(scenario.language, "quranZoom.title"), exact: true });
      const text = dialog.getByTestId("quran-enlarged-text");
      await expect(text).toHaveAttribute("data-layout-ready", "true");
      await expectBounds(page, dialog);
      if (scenario.height > 800 && scenario.scale === 1) {
        expect((await dialog.boundingBox())!.height).toBeLessThan(scenario.height * 0.85);
        const empty = await dialog
          .locator(".quran-enlarged-viewport")
          .evaluate(
            (node) => node.clientHeight - node.querySelector(".quran-enlarged-measure")!.getBoundingClientRect().height,
          );
        expect(empty).toBeLessThanOrEqual(2);
      }
      await enlargeReading(dialog, scenario.language);
      const expected = await dialog
        .locator(".quran-enlarged-measure [data-zoom-word]")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-zoom-word")));
      const seen: (string | null)[] = [];
      const next = dialog.getByRole("button", { name: t(scenario.language, "common.next"), exact: true });
      for (let portion = 0; portion <= expected.length; portion++) {
        await expect(text).toHaveAttribute("data-layout-ready", "true");
        seen.push(
          ...(await text
            .locator("[data-zoom-word]")
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-zoom-word")))),
        );
        const overflow = await text.evaluate((node) => {
          const frame = node.parentElement!.getBoundingClientRect();
          return [...node.querySelectorAll("[data-zoom-word]")].every((word) => {
            const box = word.getBoundingClientRect();
            return (
              box.left >= frame.left - 1 &&
              box.right <= frame.right + 1 &&
              box.top >= frame.top - 1 &&
              box.bottom <= frame.bottom + 1
            );
          });
        });
        expect(overflow).toBe(true);
        if (!(await next.count()) || (await next.isDisabled())) break;
        await next.click();
      }
      expect(seen).toEqual(expected);
      await expectTarget(dialog.getByTestId("modal-close-button"));
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="quran-enlarged-reading"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath(`excerpt-${label}-simulated-insets.png`), scale: "css" });
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect(page).toHaveURL(new RegExp(`before-sleep/${position}$`));
    });
  });
}
