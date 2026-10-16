import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    test(`independent app and Home materials ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, appMaterial: "solid", homeMaterial: "glass", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      await expect(page.locator(".home-photo-canvas")).toHaveClass(/home-force-glass/);
      const homeScene = await page.getByTestId("time-of-day-scene-window").locator("img").getAttribute("src");
      await page.getByTestId("nav-settings").click();
      const appearance = language === "ar" ? "المظهر واللغة" : "Appearance & language";
      await page.getByRole("button", { name: new RegExp(appearance) }).click();
      const app = page.getByRole("radiogroup", {
        name: language === "ar" ? "مظهر التطبيق" : "App appearance",
        exact: true,
      });
      await expect(app.getByRole("radio")).toHaveCount(2);
      await app.getByRole("radio", { name: language === "ar" ? "زجاجي" : "Glass", exact: true }).click();
      await expect(app.locator('[aria-checked="true"] > [aria-hidden="true"]')).toHaveCSS("transform", "none");
      await app.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`simple-appearance-${language}-${width}.png`) });
      await page.getByText(language === "ar" ? "تخصيص الرئيسية" : "Customize Home", { exact: true }).click();
      await expect(
        page.getByRole("switch", { name: language === "ar" ? "مثل التطبيق" : "Same as app", exact: true }),
      ).toHaveAttribute("aria-checked", "true");
      await expect(page.locator("html")).toHaveAttribute("data-app-material-resolved", "glass");
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-app-material", "glass");
      await page.getByTestId(width === 1440 ? "desktop-brand-home" : "nav-home").click();
      await expect(page).toHaveURL(/#\/home$/);
      await expect(page.locator(".home-photo-canvas")).toHaveClass(/home-force-glass/);
      await page.getByTestId("nav-azkar").click();
      await expect(page.getByTestId("category-card-morning")).toBeVisible();
      await expect(page.getByTestId("category-card-morning")).toHaveCSS("opacity", "1");
      await expect(page.getByTestId("category-card-morning")).toHaveCSS("animation-name", "none");
      await expect(page.getByTestId("app-scene").locator("img")).toHaveCount(1);
      await expect(page.getByTestId("app-scene").locator("img")).toHaveAttribute("src", homeScene!);
      await expect(page.getByTestId("category-card-morning")).toHaveCSS("background-color", /0\.88/);
      await page.screenshot({ path: testInfo.outputPath(`app-glass-${language}-${width}.png`) });
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      if (width === 390) {
        for (const theme of ["light", "dark"]) {
          await page.locator("html").evaluate((root, theme) => {
            root.classList.remove("theme-midnight", "theme-light", "theme-dark");
            root.classList.add(`theme-${theme}`);
            root.classList.toggle("dark", theme !== "light");
          }, theme);
          expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
          await page.screenshot({ path: testInfo.outputPath(`app-glass-${theme}-${language}.png`) });
        }
      }
      await page.getByTestId("category-card-morning").click();
      await expect(page.locator(".app-shell")).toHaveAttribute("data-material-reading", "true");
      await expect(page.getByTestId("app-scene")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
