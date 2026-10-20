import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [language, width] of [
  ["ar", 390],
  ["en", 1440],
] as const) {
  test(`glass refinement evidence ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            appMaterial: "glass",
            homeMaterial: "glass",
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    const stage = process.env.GLASS_EVIDENCE_STAGE ?? "after";
    const capture = async (name: string) => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `output/playwright/glass-refinement/${stage}/${testInfo.project.name}/${language}-${width}-${name}.png`,
        scale: "css",
      });
    };
    for (const route of ["home", "azkar", "progress", "settings/appearance"]) {
      await page.goto("/#/" + route);
      const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
      await expect.poll(() => scene.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
      await expect(scene).toHaveCSS("opacity", "1");
      await capture(route.replaceAll("/", "-"));
      if (route === "home" || route === "progress") {
        const scrollport = page.locator(route === "home" ? ".home-content-scroll" : ".app-screen-surface");
        await scrollport.evaluate((node) => {
          node.scrollTop = 220;
        });
        await expect(
          page.getByTestId(route === "home" ? "home-utility-header" : "progress-sticky-controls"),
        ).toHaveAttribute("data-scrolled", "true");
        if (route === "progress")
          await expect(page.getByTestId("progress-sticky-controls")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await capture(route + "-scrolled");
      }
    }
  });

  for (const route of ["azkar", "progress", "settings", "settings/appearance"]) {
    test(`glass header scroll ownership ${route} ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 520 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: "midnight",
              appMaterial: "glass",
              homeMaterial: "glass",
              reduceMotion: true,
            },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/" + route);
      const scope = page.locator(
        width === 1440 && route.startsWith("settings")
          ? route === "settings"
            ? ".settings-nav-pane"
            : ".settings-detail-pane"
          : ".app-main-view",
      );
      // Exercise the real vertical scrollport, rather than a synthetic event
      // target selected by the elevation implementation itself.
      await expect
        .poll(() =>
          scope.evaluate((root) => {
            const viewport = [root, ...root.querySelectorAll<HTMLElement>("*")]
              .filter(
                (node) =>
                  node.checkVisibility() &&
                  /auto|scroll/.test(getComputedStyle(node).overflowY) &&
                  node.scrollHeight > node.clientHeight + 8,
              )
              .sort((a, b) => b.clientHeight - a.clientHeight)[0];
            if (!viewport) return false;
            viewport.setAttribute("data-elevation-probe", "true");
            viewport.scrollTop = 0;
            return true;
          }),
        )
        .toBe(true);
      const viewport = page.locator('[data-elevation-probe="true"]');
      await expect(viewport).toHaveCount(1);
      const header =
        route === "progress"
          ? page.getByTestId("progress-sticky-controls")
          : route === "azkar"
            ? page.locator("[data-material-ui] header").first()
            : route === "settings/appearance" && width === 1440
              ? page.locator(".settings-detail-pane .shared-screen-header")
              : page.getByTestId("shared-screen-header").first();
      await expect(header).not.toHaveAttribute("data-scrolled");
      await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(header).toHaveCSS("backdrop-filter", "none");
      await expect(page.locator(".app-main-view")).toHaveCSS("view-transition-name", "none");
      const material = () =>
        header.evaluate((node) => {
          const style = getComputedStyle(node);
          return [style.backgroundColor, style.backgroundImage];
        });
      const restingMaterial = await material();
      const capture = (state: string) =>
        page.screenshot({
          path: `output/playwright/glass-refinement/header-consistent/${testInfo.project.name}/${language}-${width}-${route.replaceAll("/", "-")}-${state}.png`,
          scale: "css",
        });
      await page.evaluate(() => document.fonts.ready);
      await capture("rest");
      if (route === "azkar") {
        await expect(viewport).toHaveAttribute("data-testid", "library-content-scroll");
        const headerBounds = await header.boundingBox();
        const listBounds = await viewport.boundingBox();
        expect(listBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y + headerBounds!.height - 1);
        await viewport.evaluate((node) => {
          node.scrollTop = 120;
        });
        await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBe(120);
        expect(await header.boundingBox()).toEqual(headerBounds);
        expect(await material()).toEqual(restingMaterial);
        await expect(header).toHaveCSS("backdrop-filter", "none");
        await expect(header).not.toHaveAttribute("data-scrolled");
        await viewport.focus();
        await page.keyboard.press("End");
        await expect
          .poll(() => viewport.evaluate((node) => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop)))
          .toBeLessThan(2);
        expect(await header.boundingBox()).toEqual(headerBounds);
        await capture("scrolled");
        expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
        await page.locator("html").evaluate((root) => root.classList.add("high-contrast"));
        await expect(header).toHaveCSS("backdrop-filter", "none");
        await expect(header).toHaveCSS("background-color", /^rgb\(/);
        return;
      }
      await viewport.evaluate((node) => {
        node.scrollTop = 120;
      });
      await expect(header).toHaveAttribute("data-scrolled", "true");
      if (route === "progress") {
        await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        expect(await material()).toEqual(restingMaterial);
      } else {
        await expect(header).toHaveCSS("background-color", "rgba(15, 23, 42, 0.36)");
        expect(await material()).not.toEqual(restingMaterial);
      }
      await expect(header).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      if (route === "progress") {
        await expect(header.locator(".shared-screen-header")).toHaveCSS("backdrop-filter", "none");
        await expect(header.locator(".shared-screen-header")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      }
      await header.evaluate((node) => {
        const probe = document.createElement("div");
        probe.setAttribute("data-nested-scroll-probe", "true");
        probe.style.cssText = "position:absolute;width:1px;height:1px;overflow:auto;";
        probe.innerHTML = '<span style="display:block;width:200px;height:200px"></span>';
        node.append(probe);
        probe.scrollLeft = 60;
        probe.scrollTop = 40;
        probe.dispatchEvent(new Event("scroll"));
        probe.scrollTop = 0;
        probe.dispatchEvent(new Event("scroll"));
      });
      await expect(header).toHaveAttribute("data-scrolled", "true");
      await page.locator("[data-nested-scroll-probe]").evaluate((node) => node.remove());
      await capture("scrolled");
      const fixedBounds = await header.boundingBox();
      for (const top of [240, 96, 48, 12]) {
        await viewport.evaluate((node, top) => {
          node.scrollTop = top;
        }, top);
        await expect(header).toHaveAttribute("data-scrolled", "true");
        await expect(header).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
        expect(await header.boundingBox()).toEqual(fixedBounds);
      }
      await capture("scroll-up-protected");
      expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${language}-${width}-${route.replaceAll("/", "-")}-protected.png`),
        scale: "css",
      });
      for (const [top, elevated] of [
        [2, false],
        [9, true],
        [3, true],
        [2, false],
      ] as const) {
        await viewport.evaluate((node, top) => {
          node.scrollTop = top;
        }, top);
        if (elevated) await expect(header).toHaveAttribute("data-scrolled", "true");
        else await expect(header).not.toHaveAttribute("data-scrolled");
        if (elevated && route !== "progress") expect(await material()).not.toEqual(restingMaterial);
        else expect(await material()).toEqual(restingMaterial);
        await expect(header).toHaveCSS("backdrop-filter", elevated ? "blur(32px) saturate(1.35)" : "none");
      }
      // The stationary Glass treatment must not leak into opaque modes.
      await page.locator("html").evaluate((root) => root.classList.add("high-contrast"));
      await expect(header).toHaveCSS("backdrop-filter", "none");
      await expect(header).toHaveCSS("background-color", /^rgb\(/);
      await page.locator("html").evaluate((root) => {
        root.classList.remove("high-contrast");
        root.setAttribute("data-app-material-resolved", "solid");
      });
      await expect(header).toHaveCSS("backdrop-filter", "none");
      await expect(header).toHaveCSS("background-color", /^rgb\(/);
    });
  }
}
