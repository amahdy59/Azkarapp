import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const theme of ["light", "dark", "midnight"] as const) {
  for (const material of ["solid", "glass"] as const) {
    test(`static paper grain ${theme}/${material} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width: 834, height: 1000 });
      await page.addInitScript(
        ({ theme, material }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language: "ar",
                themeMode: theme,
                appMaterial: material,
                reduceMotion: true,
              },
              profile: { isGuest: true },
            }),
          );
        },
        { theme, material },
      );
      await page.goto("/#/progress/month");
      const card = page.getByTestId("progress-metric-prayers");
      await expect(card).toBeVisible();
      await expect(card).toHaveCSS("background-image", /paper-grain.*\.png/);
      if (theme === "light" && material === "solid")
        await expect(card).toHaveCSS("background-color", "rgb(251, 249, 245)");
      for (const selector of [
        ".progress-screen-controls",
        ".progress-date-details",
        ".progress-select-trigger",
        '.heatmap-day:not([data-kind="outside"])',
      ])
        await expect(page.locator(selector).first()).toHaveCSS("background-image", /paper-grain.*\.png/);
      if (material === "solid")
        await expect(card).toHaveCSS(
          "background-image",
          new RegExp(`paper-grain-${theme === "light" ? "light" : "dark"}`),
        );
      const texture = await card.evaluate(
        (node) => getComputedStyle(node).backgroundImage.match(/url\("?([^")]+)"?\)/)?.[1],
      );
      expect(texture).toBeTruthy();
      expect((await page.request.get(texture!)).ok()).toBe(true);
      await page.evaluate(() => document.fonts.ready);
      const geometry = await card.boundingBox();
      await page.screenshot({ path: info.outputPath(`grain-${theme}-${material}.png`) });
      await page.locator("html").evaluate((node) => {
        node.dataset.paperTexture = "off";
      });
      await expect(card).not.toHaveCSS("background-image", /paper-grain/);
      if (theme === "light" && material === "solid")
        await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
      expect(await card.boundingBox()).toEqual(geometry);
      await page.locator("html").evaluate((node) => {
        node.dataset.paperTexture = "on";
      });
      for (const fallback of ["high-contrast", "reduce-transparency"]) {
        await page.locator("html").evaluate((node, name) => node.classList.add(name), fallback);
        await expect(card).not.toHaveCSS("background-image", /paper-grain/);
        await page.locator("html").evaluate((node, name) => node.classList.remove(name), fallback);
      }
      await expect(card).toHaveCSS("background-image", /paper-grain/);
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="progress-metric-prayers"]').analyze()).violations,
      ).toEqual([]);
      // Wide layouts exposed flat rectangles/rows that a single textured card
      // assertion missed. Cover the complete canvas and nested filled owners.
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const [route, selectors] of [
        [
          "/#/settings/appearance",
          [
            ".settings-screen",
            ".settings-nav-pane [data-material-card]",
            '[data-testid="settings-sub-appearance"]',
            '[data-testid="settings-sub-reading"]',
          ],
        ],
        ["/#/azkar", [".library-canvas", ".library-stationary-header", ".library-section-tabs"]],
        [
          "/#/quran-wird",
          [".quran-today-card", ".quran-wird-overview .paper-surface", '.quran-wird-week-day[aria-current="date"]'],
        ],
      ] as const) {
        await page.goto(route);
        for (const selector of selectors) {
          const surface = page.locator(selector).first();
          await expect(surface).toBeVisible();
          await expect
            .poll(() =>
              surface.evaluate((node) => {
                // A transparent Glass header reveals its textured canvas. An
                // untextured filled rectangle must fail before reaching it.
                for (let owner: Element | null = node; owner; owner = owner.parentElement) {
                  const style = getComputedStyle(owner);
                  if (/paper-grain.*\.png/.test(style.backgroundImage)) return true;
                  if (!["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor)) return false;
                }
                return false;
              }),
            )
            .toBe(true);
          if (material === "solid")
            await expect(surface).toHaveCSS(
              "background-image",
              new RegExp(`paper-grain-${theme === "light" ? "light" : "dark"}`),
            );
        }
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: info.outputPath(`grain-${theme}-${material}-${route.split("/")[2]}.png`),
        });
      }
      await page.goto("/#/progress/month");
      await expect(card).toBeVisible();
      await page.emulateMedia({ forcedColors: "active" });
      await expect(card).not.toHaveCSS("background-image", /paper-grain/);
      if (theme === "light" && material === "solid" && info.project.name === "desktop-chromium") {
        await page.emulateMedia({ media: "screen", forcedColors: "none" });
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setEmulatedMedia", {
          features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
        });
        await expect(card).toHaveCSS("background-image", /paper-grain/);
      }
      await page.emulateMedia({ forcedColors: "none", media: "print" });
      await expect(card).not.toHaveCSS("background-image", /paper-grain/);
    });
  }
}

for (const mushafTheme of ["light", "dark", "midnight", "oled"] as const) {
  test(`Mushaf ${mushafTheme} paper retains the shared grain @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript((mushafTheme) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", themeMode: "light", reduceMotion: true },
          profile: { isGuest: true },
          khatmahPage: 42,
          mushafTheme,
        }),
      );
    }, mushafTheme);
    await page.goto("/#/quran-wird");
    await page.getByRole("button", { name: "متابعة القراءة", exact: true }).click();
    const paper = page.locator(".mushaf-page-canvas").first();
    await expect(paper).toBeVisible();
    // The text canvas is transparent structure, not a second paper sheet.
    await expect(paper).toHaveCSS("background-image", "none");
    await expect
      .poll(() => paper.evaluate((node) => getComputedStyle(node).getPropertyValue("--paper-grain")))
      .toMatch(new RegExp(`paper-grain-${mushafTheme === "light" ? "light" : "dark"}`));
    await expect
      .poll(() =>
        paper.evaluate((node) => {
          let layers = 0;
          for (let owner: Element | null = node; owner; owner = owner.parentElement) {
            const style = getComputedStyle(owner);
            if (/paper-grain/.test(style.backgroundImage)) layers++;
            if (!["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor)) break;
          }
          return layers;
        }),
      )
      .toBe(1);
    await page.screenshot({ path: info.outputPath(`mushaf-grain-${mushafTheme}.png`) });
    expect(await paper.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  });
}

for (const homeMaterial of ["solid", "glass"] as const) {
  test(`Home cards and scrolled prayer strip retain grain ${homeMaterial} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript((homeMaterial) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: "ar",
            themeMode: "light",
            homeMaterial,
            appMaterial: "solid",
            reduceMotion: true,
            paperTexture: true,
          },
          profile: { isGuest: true },
        }),
      );
    }, homeMaterial);
    await page.goto("/#/home");
    const prayer = page.getByTestId("prayer-card-fajr");
    const asset = new RegExp(`paper-grain-${homeMaterial === "solid" ? "light" : "dark"}`);
    await expect(prayer).toHaveCSS("background-image", asset);
    await page.locator(".home-content-scroll").evaluate((node) => {
      node.scrollTop = 500;
    });
    const strip = page.getByTestId("home-sticky-prayers");
    await expect(strip).toHaveAttribute("data-scrolled", /true/);
    await expect(strip).toHaveCSS("background-image", asset);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath(`home-grain-${homeMaterial}.png`) });
  });
}

for (const language of ["ar", "en"] as const) {
  test(`paper texture switch survives reload ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, themeMode: "midnight" },
            profile: { isGuest: true },
          }),
        );
    }, language);
    await page.goto("/#/settings/appearance");
    const toggle = page.getByRole("switch", { name: t(language, "settings.paperTexture"), exact: true });
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await toggle.focus();
    await page.keyboard.press(" ");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.locator("html")).toHaveAttribute("data-paper-texture", "off");
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.paperTexture))
      .toBe(false);
    await page.screenshot({ path: info.outputPath(`texture-switch-${language}.png`) });
    expect(await toggle.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    await page.goto("/#/progress/month");
    await expect(page.getByTestId("progress-metric-prayers")).not.toHaveCSS("background-image", /paper-grain/);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-paper-texture", "off");
    await expect(page.getByTestId("progress-metric-prayers")).toBeVisible();
    await page.goto("/#/settings/appearance");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-paper-texture", "on");
  });
}
