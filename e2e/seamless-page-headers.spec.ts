import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";

const readingPages = [
  { name: "reader", path: "/azkar/evening/2", header: "reader-desktop-hero" },
  { name: "masbaha", path: "/counter", header: "custom-counter-desktop-hero" },
  { name: "salawat", path: "/friday/salawat", header: "salawat-desktop-hero" },
] as const;

async function assertReadableActions(header: Locator) {
  for (const action of await header.getByRole("button").all()) {
    if (!(await action.isVisible())) continue;
    // DOM geometry is in CSS pixels; Firefox's protocol bounding box can
    // serialize an exact 44px target as 43.999996px after text enlargement.
    const r = await action.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    });
    expect(r.width).toBeGreaterThanOrEqual(44);
    expect(r.height).toBeGreaterThanOrEqual(44);
    // A route can mount while the preceding modal's finite exit releases its
    // pointer lock. Require real hit recovery, using the existing assertion timeout.
    await expect
      .poll(() =>
        action.evaluate((node) => {
          const r = node.getBoundingClientRect();
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return !!hit && node.contains(hit);
        }),
      )
      .toBe(true);
  }
}

for (const language of ["ar", "en"] as const) {
  for (const appearance of [
    { name: "light", themeMode: "light", appMaterial: "solid", highContrast: false },
    { name: "dark", themeMode: "dark", appMaterial: "solid", highContrast: false },
    { name: "midnight", themeMode: "midnight", appMaterial: "solid", highContrast: false },
    { name: "glass", themeMode: "light", appMaterial: "glass", highContrast: false },
    { name: "contrast", themeMode: "light", appMaterial: "solid", highContrast: true },
  ] as const) {
    test(`reading and counting headers share the canvas ${appearance.name} ${language} @cross-browser`, async ({
      page,
    }, info) => {
      await page.addInitScript(
        ({ language, appearance }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, ...appearance, paperTexture: true },
              profile: { isGuest: true },
            }),
          );
        },
        { language, appearance },
      );
      for (const route of readingPages) {
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "";
        });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("/#" + route.path);
        const header = page.getByTestId(route.header);
        await expect(header).toBeVisible();
        await expect(header).toHaveAttribute("data-seamless-header");
        const surface = await header.evaluate((node) => {
          const style = getComputedStyle(node);
          const title = node.querySelector("h1")!;
          const probe = document.createElement("span");
          probe.style.color = "var(--foreground)";
          node.appendChild(probe);
          const ink = getComputedStyle(probe).color;
          probe.remove();
          return {
            background: style.backgroundColor,
            image: style.backgroundImage,
            radius: style.borderRadius,
            title: getComputedStyle(title).color,
            ink,
          };
        });
        expect(surface.background).toBe("rgba(0, 0, 0, 0)");
        expect(surface.image).toBe("none");
        expect(surface.radius).toBe("0px");
        expect(surface.title).toBe(surface.ink);
        expect((await header.boundingBox())!.y).toBeCloseTo(0, 0);
        await expect(header.getByTestId("reader-scene")).toHaveCount(0);
        await assertReadableActions(header);
        if (appearance.name === "light" && info.project.name === "desktop-chromium") {
          await page.screenshot({ path: info.outputPath(`${route.name}-${language}-1440.png`), scale: "css" });
          const axe = await new AxeBuilder({ page }).include("[data-seamless-header]").analyze();
          expect(axe.violations).toEqual([]);
        } else if (info.project.name === "desktop-chromium") {
          await page.screenshot({
            path: info.outputPath(`${route.name}-${appearance.name}-${language}-1440.png`),
            scale: "css",
          });
        }
        await page.setViewportSize({ width: 768, height: 900 });
        await expect(header).toBeVisible();
        await assertReadableActions(header);
        const more = header.getByRole("button", {
          name: t(
            language,
            route.name === "reader"
              ? "reader.menu"
              : route.name === "masbaha"
                ? "counter.settings"
                : "common.moreOptions",
          ),
          exact: true,
        });
        await more.click();
        const menu = route.name === "masbaha" ? page.getByTestId("masbaha-settings-sheet") : page.getByRole("menu");
        await expect(menu).toBeVisible();
        expect(
          await menu.evaluate((node) => {
            const r = node.getBoundingClientRect();
            const color = getComputedStyle(node).backgroundColor;
            const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return (
              color !== "transparent" &&
              !color.startsWith("rgba(") &&
              r.left >= 0 &&
              r.right <= innerWidth + 1 &&
              !!hit &&
              node.contains(hit)
            );
          }),
        ).toBe(true);
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(more).toBeFocused();
        await page.setViewportSize({ width: 320, height: 740 });
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "200%";
        });
        const compact =
          route.name === "masbaha"
            ? page.locator(".masbaha-header")
            : page.getByTestId("shared-screen-header").filter({ visible: true }).first();
        await expect(compact).toBeVisible();
        await assertReadableActions(compact);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
        expect(await compact.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        if (appearance.name === "light" && info.project.name === "desktop-chromium") {
          await page.screenshot({ path: info.outputPath(`${route.name}-${language}-320-200.png`), scale: "css" });
        }
      }
    });
  }

  test(`ordinary page headers retain their theme canvas ${language} @cross-browser`, async ({ page }, info) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", appMaterial: "solid", paperTexture: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of [
      "/azkar",
      "/azkar/evening",
      "/azkar/friday-kahf/1",
      "/quran-wird",
      "/quran-wird/benefits",
      "/progress",
      "/settings",
      "/qibla",
      "/benefits",
      "/friday",
      "/search",
      "/more",
      "/learn",
      "/learn/dalil-al-mutamir/p-1",
    ]) {
      await page.goto("/#" + path);
      const header = page
        .locator(
          ".shared-screen-header:visible, .library-stationary-header:visible, [data-seamless-header]:visible, .learn-reader-header:visible",
        )
        .first();
      await expect(header).toBeVisible();
      const paint = await header.evaluate((node) => {
        let canvas = node.parentElement;
        let background = "rgba(0, 0, 0, 0)";
        while (canvas && background === "rgba(0, 0, 0, 0)") {
          background = getComputedStyle(canvas).backgroundColor;
          canvas = canvas.parentElement;
        }
        const style = getComputedStyle(node);
        return { header: style.backgroundColor, canvas: background, image: style.backgroundImage };
      });
      expect(["rgba(0, 0, 0, 0)", paint.canvas]).toContain(paint.header);
      expect(paint.image).not.toContain("gradient");
      if (info.project.name === "desktop-chromium") {
        await page.screenshot({
          path: info.outputPath(`page-${path.replaceAll("/", "-")}-${language}.png`),
          scale: "css",
        });
      }
    }
  });
}
