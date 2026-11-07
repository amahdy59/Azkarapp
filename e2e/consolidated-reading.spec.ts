import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

test("Mushaf chrome stays fixed while the fitted Quran page keeps fifteen slots @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true, mushafLayout: "single" },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/quran/42");
  const canvas = page.locator('[data-mushaf-page="42"]');
  await expect(canvas).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
  await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(15);
  const reader = page.locator("[data-mushaf-reader]");
  const header = reader.locator(".mushaf-desktop-top");
  const footer = reader.locator(".mushaf-desktop-bottom");
  await expect(header).toBeVisible();
  await expect(footer).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = [await header.boundingBox(), await footer.boundingBox()];
  const column = (await canvas.locator("[data-mushaf-column]").boundingBox())!;
  expect(column.width).toBeGreaterThan(0);
  expect(column.y).toBeGreaterThanOrEqual(before[0]!.y + before[0]!.height - 1);
  expect(column.y + column.height).toBeLessThanOrEqual(before[1]!.y + 1);
  await reader.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-mushaf-page="43"] [data-mushaf-column] > div')).toHaveCount(15);
  expect([await header.boundingBox(), await footer.boundingBox()]).toEqual(before);
  await page.screenshot({ path: info.outputPath("mushaf-primary-paper.png") });
});

test("Home reminder loads without its external host and recovers from packaged acquisition failure @cross-browser", async ({
  page,
}) => {
  let blocked = true;
  await page.route(/https:\/\/pub-.*\.r2\.dev\//, (route) => route.abort());
  await page.route(/\/assets\/home-reminder-readings-.*\.bin/, (route) => (blocked ? route.abort() : route.continue()));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/home");
  const status = page.getByTestId("home-reminder-status");
  await expect(status).toContainText("Could not load your reminder");
  blocked = false;
  await status.getByRole("button", { name: t("en", "mushaf.retry"), exact: true }).click();
  await expect(page.getByTestId("home-daily-evidence")).toBeVisible();
  await expect(status).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("home-daily-evidence")).toBeVisible();
});

for (const width of [320, 834, 1440]) {
  test(`bilingual Quran has persistent chrome, Quran type and full per-ayah sharing at ${width} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    });
    await page.goto("/#/quran/3");
    await page
      .getByRole("button", { name: t("ar", "mushaf.moreActions"), exact: true })
      .first()
      .click();
    await page.getByTestId("quick-mode-bilingual").click();
    const view = page.getByTestId("bilingual-stream-view");
    await expect(view).toBeVisible();
    const scroll = page.getByTestId("bilingual-scroll");
    const header = view.locator("header"),
      footer = view.locator("footer");
    const before = [await header.boundingBox(), await footer.boundingBox()];
    await scroll.evaluate((node) => (node.scrollTop = node.scrollHeight));
    expect([await header.boundingBox(), await footer.boundingBox()]).toEqual(before);
    expect(await view.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    const arabic = view.locator('article p[lang="ar"]').first();
    expect(await arabic.evaluate((node) => getComputedStyle(node).fontFamily)).toMatch(/QCF|qcf|Amiri/i);
    const share = view.locator('[data-testid^="bilingual-share-"]').first();
    await share.click();
    await expect(page.getByTestId("ayah-share-studio")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(share).toBeFocused();
    await scroll.evaluate((node) => (node.scrollTop = 0));
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="bilingual-stream-view"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath("bilingual.png") });
  });
}
