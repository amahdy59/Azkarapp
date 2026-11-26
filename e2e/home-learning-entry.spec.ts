import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { learningT } from "../src/app/i18n/learning";

async function setupHomeBooks(
  page: Page,
  language: "ar" | "en",
  scenario: { width: number; scale: number; material: string; saved: boolean },
) {
  await page.setViewportSize({ width: scenario.width, height: scenario.scale === 2 ? 1100 : 1000 });
  await fixtureReminderCatalogue(page);
  await page.addInitScript(
    ({ language, scenario }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: scenario.material === "solid" ? "light" : "midnight",
              appMaterial: scenario.material,
              homeMaterial: scenario.material,
              reduceMotion: true,
            },
            profile: { isGuest: true },
          }),
        );
      if (scenario.saved && !localStorage.getItem("azkar.learning.v1"))
        localStorage.setItem(
          "azkar.learning.v1",
          JSON.stringify({
            "dalil-al-mutamir": { bookmarks: ["p-6"], position: { unitId: "p-6", offset: 0.3 } },
          }),
        );
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.fontSize = `${scenario.scale * 100}%`;
      });
    },
    { language, scenario },
  );
}

for (const language of ["ar", "en"] as const) {
  for (const scenario of [
    { width: 390, scale: 1, material: "solid", saved: false },
    { width: 320, scale: 2, material: "glass", saved: true },
    { width: 834, scale: 1, material: "solid", saved: true },
    { width: 1440, scale: 1, material: "glass", saved: true },
  ]) {
    test(`Home books ${language} ${scenario.width} ${scenario.saved ? "continue" : "discover"} @cross-browser`, async ({
      page,
    }, info) => {
      await setupHomeBooks(page, language, scenario);
      const requests: string[] = [];
      page.on("request", (request) => {
        if (request.url().includes("/__learning-assets__/")) requests.push(request.url());
      });
      await page.goto("/#/home");
      const section = page.getByTestId("home-learning");
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      expect(requests).toEqual([]);
      expect(
        await section.evaluate((element) => {
          const routines = document.querySelector('[data-testid="home-wird-row"]')!;
          const tools = document.querySelector('[data-testid="home-tool-masbaha"]')!;
          return {
            afterRoutines: Boolean(routines.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
            beforeTools: Boolean(element.compareDocumentPosition(tools) & Node.DOCUMENT_POSITION_FOLLOWING),
            fits: element.scrollWidth <= element.clientWidth + 1,
          };
        }),
      ).toEqual({ afterRoutines: true, beforeTools: true, fits: true });
      for (const button of await section.getByRole("button").all()) {
        await button.scrollIntoViewIfNeeded();
        expect(
          await button.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const ink = range.getBoundingClientRect();
            return {
              target: box.width >= 44 && box.height >= 44,
              hit: element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)),
              fits:
                ink.left >= box.left - 1 &&
                ink.right <= box.right + 1 &&
                ink.top >= box.top - 1 &&
                ink.bottom <= box.bottom + 1,
            };
          }),
        ).toEqual({ target: true, hit: true, fits: true });
        await button.focus();
        await expect(button).toBeFocused();
      }
      expect((await new AxeBuilder({ page }).include('[data-testid="home-learning"]').analyze()).violations).toEqual(
        [],
      );
      await page.screenshot({ path: info.outputPath("home-books.png") });
    });
  }

  for (const saved of [false, true]) {
    test(`Home books navigation ${language} ${saved ? "continue" : "discover"} @cross-browser`, async ({ page }) => {
      const scenario = { width: 390, scale: 1, material: "solid", saved };
      await setupHomeBooks(page, language, scenario);
      await page.goto("/#/home");
      const section = page.getByTestId("home-learning");
      await expect(section).toBeVisible();
      if (scenario.saved) {
        const saved = await page.evaluate(() => localStorage.getItem("azkar.learning.v1"));
        const resume = section.getByRole("button", { name: learningT(language, "continue"), exact: true });
        await resume.focus();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/learn\/dalil-al-mutamir\/p-6$/);
        await expect(page.getByTestId("learning-content")).toBeVisible();
        const record = await page.evaluate(
          () => JSON.parse(localStorage.getItem("azkar.learning.v1")!)["dalil-al-mutamir"],
        );
        expect(record.bookmarks).toEqual(JSON.parse(saved!)["dalil-al-mutamir"].bookmarks);
        expect(record.lastReadAt).toBeGreaterThan(0);
        await page.goto("/#/home");
        await page
          .getByTestId("home-learning")
          .getByRole("button", { name: learningT(language, "allBooks"), exact: true })
          .click();
      } else {
        await expect(section.getByRole("button")).toHaveCount(1);
        await section.getByRole("button", { name: learningT(language, "exploreBooks"), exact: true }).click();
      }
      await expect(page).toHaveURL(/#\/learn$/);
      await page.goto("/#/azkar");
      await expect(page.locator(".library-stationary-header")).toBeVisible();
      await expect(page.locator(".library-stationary-header").getByRole("button", { name: /Learn|تعلّم/ })).toHaveCount(
        0,
      );
    });
  }
}
