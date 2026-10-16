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
      await page.getByTestId("nav-settings").click();
      const appearance = language === "ar" ? "المظهر واللغة" : "Appearance & language";
      await page.getByRole("button", { name: new RegExp(appearance) }).click();
      const app = page.getByRole("radiogroup", {
        name: language === "ar" ? "مظهر التطبيق" : "App appearance",
        exact: true,
      });
      const home = page.getByRole("radiogroup", {
        name: language === "ar" ? "مظهر الرئيسية" : "Home appearance",
        exact: true,
      });
      await app.getByRole("radio", { name: language === "ar" ? "زجاجي" : "Glass", exact: true }).click();
      await home.getByRole("radio", { name: language === "ar" ? "مثل التطبيق" : "Same as app", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-app-material-resolved", "glass");
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-app-material", "glass");
      await page.getByTestId(width === 1440 ? "desktop-brand-home" : "nav-home").click();
      await expect(page).toHaveURL(/#\/home$/);
      await expect(page.locator(".home-photo-canvas")).toHaveClass(/home-force-glass/);
      await page.getByTestId("nav-azkar").click();
      await expect(page.getByTestId("category-card-morning")).toBeVisible();
      await expect(page.getByTestId("category-card-morning")).toHaveCSS("background-color", /0\.88/);
      await page.screenshot({ path: testInfo.outputPath(`app-glass-${language}-${width}.png`) });
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      await page.getByTestId("category-card-morning").click();
      await expect(page.locator(".app-shell")).toHaveAttribute("data-material-reading", "true");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
