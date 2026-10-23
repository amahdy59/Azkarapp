import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    test(`four independent appearance combinations ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.setFixedTime(new Date("2026-10-17T14:00:00+03:00"));
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: "midnight",
              appMaterial: "solid",
              homeMaterial: "glass",
              reduceMotion: true,
            },
            profile: { isGuest: true },
          }),
        );
      }, language);
      const app = page.getByRole("radiogroup", {
        name: language === "ar" ? "مظهر التطبيق" : "App appearance",
        exact: true,
      });
      const home = page.getByRole("radiogroup", {
        name: language === "ar" ? "مظهر الرئيسية" : "Home appearance",
        exact: true,
      });
      const label = (material: "glass" | "solid") =>
        language === "ar" ? (material === "glass" ? "زجاجي" : "معتم") : material === "glass" ? "Glass" : "Opaque";
      const settings = () =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") || "{}").settings);
      let sharedScene: string | null = null;
      for (const [appMaterial, homeMaterial] of [
        ["solid", "glass"],
        ["glass", "glass"],
        ["glass", "solid"],
        ["solid", "solid"],
      ] as const) {
        await page.goto("/#/settings/appearance");
        await expect(home).toBeVisible();
        await home.getByRole("radio", { name: label(homeMaterial), exact: true }).click();
        await app.getByRole("radio", { name: label(appMaterial), exact: true }).click();
        // Reselecting the app is also independent: an explicit Home choice survives.
        await app.getByRole("radio", { name: label(appMaterial), exact: true }).click();
        await expect
          .poll(async () => ({
            appMaterial: (await settings()).appMaterial,
            homeMaterial: (await settings()).homeMaterial,
          }))
          .toEqual({ appMaterial, homeMaterial });
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute("data-app-material-resolved", appMaterial);
        await expect(home.getByRole("radio", { name: label(homeMaterial), exact: true })).toHaveAttribute(
          "aria-checked",
          "true",
        );
        await page.goto("/#/home");
        const canvas = page.locator(".home-photo-canvas");
        if (homeMaterial === "glass") {
          await expect(canvas).toHaveClass(/home-force-glass/);
          sharedScene = await page.getByTestId("time-of-day-scene-window").locator("img").getAttribute("src");
        } else {
          await expect(canvas).not.toHaveClass(/home-force-glass/);
          await expect(page.getByTestId("prayer-card-asr")).not.toHaveClass(/hero-glass/);
        }
        await page.goto("/#/azkar");
        await expect(page.getByTestId("category-card-morning")).toBeVisible();
        if (appMaterial === "glass") {
          await expect(page.getByTestId("app-scene").locator("img")).toHaveAttribute("src", sharedScene!);
        } else await expect(page.getByTestId("app-scene")).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({
          path: testInfo.outputPath(`${language}-${width}-app-${appMaterial}-home-${homeMaterial}.png`),
          scale: "css",
        });
      }
      await page.goto("/#/settings/appearance");
      await page.getByRole("switch", { name: language === "ar" ? "مثل التطبيق" : "Same as app", exact: true }).click();
      await app.getByRole("radio", { name: label("glass"), exact: true }).click();
      await expect.poll(async () => (await settings()).homeMaterial).toBe("inherit");
      await expect(home.getByRole("radio", { name: label("glass"), exact: true })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      // Material changes update inherited ink as well as checked state. Wait for
      // the selected label itself before axe snapshots the newly applied theme.
      for (const group of [app, home]) {
        const selected = group.getByRole("radio", { name: label("glass"), exact: true });
        await expect(selected).toHaveCSS("color", "rgb(10, 18, 40)");
        await expect(selected.locator("span.relative.z-10")).toHaveCSS("color", "rgb(10, 18, 40)");
      }
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
    });
  }
}
