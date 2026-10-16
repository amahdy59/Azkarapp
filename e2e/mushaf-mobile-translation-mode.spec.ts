import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

test("Compact mode retains Arabic recovery offline in every theme @cross-browser", async ({
  page,
  context,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.route("**/data/translations/**", (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true, mushafLayout: "single" },
        khatmahPage: 3,
      }),
    );
  });
  await page.goto("/#/quran/3");
  const canvas = page.locator('[data-mushaf-page="3"]');
  await expect(canvas).toBeVisible();
  await page.getByTestId("mushaf-more-actions").click();
  await page.getByTestId("quick-page-translation-switch").click();
  const retry = page.getByRole("button", { name: t("ar", "mushaf.retry"), exact: true });
  await expect(retry).toBeVisible();
  await expect(page.getByRole("radio", { name: "English", exact: true })).toBeChecked();
  for (const theme of ["light", "dark", "midnight"] as const) {
    await page.getByTestId("mushaf-more-actions").click();
    await page.getByTestId(`quick-theme-${theme}`).click();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mushaf-quick-menu")).toBeHidden();
    await expect(page.locator(".quran-pane-choice span").first()).toHaveCSS(
      "color",
      theme === "light" ? "rgb(23, 23, 23)" : "rgb(245, 240, 232)",
    );
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="mushaf-translation-toolbar"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`offline-${theme}.png`), scale: "css" });
  }
  await context.setOffline(true);
  await retry.click();
  await expect(retry).toBeVisible();
  await page.getByRole("radio", { name: "العربية", exact: true }).check();
  await expect(canvas).toBeVisible();
  await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(15);
  await page.screenshot({ path: testInfo.outputPath("arabic-preserved.png"), scale: "css" });
  await page.getByTestId("mushaf-exit-translation").click();
  await expect(page.getByTestId("mushaf-top-center-index")).toBeFocused();
  await expect(page).toHaveURL(/quran\/3$/);
});
