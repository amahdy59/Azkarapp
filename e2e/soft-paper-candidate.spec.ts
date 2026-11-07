import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const profile of [
  { language: "ar", width: 1440, scale: 1 },
  { language: "en", width: 390, scale: 1 },
  { language: "ar", width: 320, scale: 2 },
] as const) {
  test(`soft paper candidate ${profile.language}/${profile.width}/${profile.scale} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: profile.width, height: 1000 });
    const origin = new URL(String(info.project.use.baseURL)).origin;
    await page.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );
    await page.addInitScript((profile) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: profile.language,
            themeMode: "light",
            appMaterial: "solid",
            reduceMotion: true,
            paperTexture: true,
          },
          profile: { isGuest: true },
        }),
      );
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.fontSize = `${profile.scale * 100}%`;
      });
    }, profile);
    await page.goto("/#/azkar");
    await page.getByTestId("library-section-collections").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".library-stationary-header")).toHaveCSS("background-image", /paper-grain-light/);
    await page.screenshot({ path: info.outputPath("library-soft.png") });
    await page.goto("/#/progress");
    const card = page.getByTestId("progress-metric-prayers");
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("background-image", /paper-grain-light/);
    await page.evaluate(() => document.fonts.ready);
    const geometry = await card.boundingBox();
    const hit = () =>
      card.getByRole("button").evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      });
    expect(await hit()).toBe(true);
    await page.screenshot({ path: info.outputPath("progress-soft.png") });
    await page.locator("html").evaluate((node) => {
      node.dataset.paperTexture = "off";
    });
    await expect(card).not.toHaveCSS("background-image", /paper-grain/);
    expect(await card.boundingBox()).toEqual(geometry);
    expect(await hit()).toBe(true);
    await page.locator("html").evaluate((node) => {
      node.dataset.paperTexture = "on";
    });
    expect(await card.boundingBox()).toEqual(geometry);
    expect((await new AxeBuilder({ page }).include(".progress-screen").analyze()).violations).toEqual([]);
    await expect(card).toHaveCSS("background-image", /paper-grain-light/);
  });
}
