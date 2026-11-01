import { expect, test } from "@playwright/test";

const routes = [
  "azkar",
  "progress",
  "settings",
  "quran-wird",
  "qibla",
  "friday",
  "benefits",
  "prayer/dhuhr",
  "quran-wird/benefits",
  "azkar/morning",
  "search",
  "more",
];

for (const language of ["ar", "en"] as const) {
  for (const viewport of [
    { width: 390, height: 844, enlarged: false },
    { width: 834, height: 1112, enlarged: false },
    { width: 1680, height: 1000, enlarged: false },
    { width: 320, height: 720, enlarged: true },
  ]) {
    test(`ordinary page titles share frame, title row and gutters in ${language} at ${viewport.width}${viewport.enlarged ? " with 200% text" : ""} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(
        ({ language, enlarged }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, appMaterial: "solid", themeMode: "light", reduceMotion: true },
              profile: { isGuest: true },
            }),
          );
          if (enlarged)
            document.addEventListener("DOMContentLoaded", () => {
              document.documentElement.style.fontSize = "200%";
            });
        },
        { language, enlarged: viewport.enlarged },
      );

      for (const route of routes) {
        await page.goto(`/#/${route}`);
        const title = page.getByRole("heading", { level: 1 }).first();
        await expect(title).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const geometry = await title.evaluate((heading) => {
          const header = heading.closest(".shared-screen-header, .library-stationary-header")!;
          const main = document.querySelector(".app-main")!.getBoundingClientRect();
          const bounds = header.getBoundingClientRect();
          const title = heading.getBoundingClientRect();
          const rtl = getComputedStyle(heading).direction === "rtl";
          const root = getComputedStyle(document.documentElement);
          const gutter = parseFloat(root.getPropertyValue("--spacing-page")) * parseFloat(root.fontSize);
          const frameWidth = Math.min(
            main.width,
            parseFloat(root.getPropertyValue("--content-page")) * parseFloat(root.fontSize),
          );
          const frameLeft = main.left + (main.width - frameWidth) / 2;
          const back = header.querySelector('button[aria-label="Back"], button[aria-label="رجوع"]');
          const backWidth = back
            ? back.getBoundingClientRect().width + parseFloat(getComputedStyle(header).columnGap)
            : 0;
          const expectedLeading = rtl ? frameLeft + frameWidth - gutter - backWidth : frameLeft + gutter + backWidth;
          const subtitle = heading.parentElement?.querySelector("p");
          return {
            titleTop: title.top - bounds.top,
            topPadding: parseFloat(getComputedStyle(header).paddingTop),
            leading: rtl ? title.right : title.left,
            expectedLeading,
            fontSize: getComputedStyle(heading).fontSize,
            expectedSize: `${parseFloat(root.fontSize) * (matchMedia("(min-width: 40rem)").matches ? 1.5 : 1.25)}px`,
            // Arabic font ink can extend outside its line box without being
            // clipped. Only a clipping overflow rule hides that visible ink.
            clipped:
              (getComputedStyle(heading).overflowX !== "visible" && heading.scrollWidth > heading.clientWidth + 1) ||
              (getComputedStyle(heading).overflowY !== "visible" && heading.scrollHeight > heading.clientHeight + 1),
            wrapping: getComputedStyle(heading).whiteSpace,
            subtitleBelow:
              !subtitle ||
              getComputedStyle(subtitle).display === "none" ||
              subtitle.getBoundingClientRect().top >= title.bottom - 1,
            overflow:
              document.querySelector(".app-screen-surface")?.scrollWidth ??
              document.querySelector(".app-main")!.scrollWidth,
            mainWidth: main.width,
          };
        });
        expect(Math.abs(geometry.titleTop - geometry.topPadding), route).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.leading - geometry.expectedLeading), route).toBeLessThanOrEqual(1);
        expect(geometry.fontSize, route).toBe(geometry.expectedSize);
        expect(geometry.clipped, route).toBe(false);
        expect(geometry.wrapping, route).toBe("normal");
        expect(geometry.subtitleBelow, route).toBe(true);
        expect(geometry.overflow, route).toBeLessThanOrEqual(geometry.mainWidth + 1);
        if (route === "progress") {
          const emptyLayout = await page.getByTestId("progress-empty-period").evaluate((empty) => {
            const image = empty.querySelector("img")!;
            const imageBounds = image.getBoundingClientRect();
            const emptyBounds = empty.getBoundingClientRect();
            const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const dashboard = document.querySelector(".progress-dashboard")!.getBoundingClientRect();
            const grid = document.querySelector(".progress-overview-grid")!;
            const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
            return {
              radius: parseFloat(getComputedStyle(image).borderTopLeftRadius),
              imageWidth: imageBounds.width,
              height: emptyBounds.height,
              columns,
              expectedColumns: dashboard.width >= rootSize * 56 ? 4 : dashboard.width >= rootSize * 18 ? 2 : 1,
              horizontal: dashboard.width >= rootSize * 32,
              rowAligned:
                Math.abs(imageBounds.top + imageBounds.height / 2 - emptyBounds.top - emptyBounds.height / 2) <= 1,
            };
          });
          expect(emptyLayout.radius).toBeGreaterThan(0);
          expect(emptyLayout.columns).toBe(emptyLayout.expectedColumns);
          if (emptyLayout.horizontal) {
            expect(emptyLayout.rowAligned).toBe(true);
            expect(emptyLayout.imageWidth).toBeLessThanOrEqual(176);
            expect(emptyLayout.height).toBeLessThan(260);
          }
          if (viewport.width >= 600) {
            const picker = await page.locator(".progress-range-toolbar [role=combobox]").boundingBox();
            for (const tab of await page.getByRole("tab").all()) {
              const button = (await tab.boundingBox())!;
              expect(Math.abs(button.height - picker!.height)).toBeLessThanOrEqual(1);
              expect(Math.abs(button.y - picker!.y)).toBeLessThanOrEqual(1);
            }
          }
        }
        if (route === "progress" || route === "azkar" || route === "settings") {
          await page.screenshot({
            path: testInfo.outputPath(`${route}-${language}-${viewport.width}.png`),
            scale: "css",
          });
        }
      }
    });
  }
}

for (const mode of ["default", "app", "os"] as const) {
  test(`Progress filter feedback respects ${mode} motion without delaying actions @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
    await page.addInitScript((reduced) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", appMaterial: "solid", themeMode: "light", reduceMotion: reduced },
          profile: { isGuest: true },
        }),
      );
    }, mode === "app");
    await page.goto("about:blank");
    await page.goto("/#/progress");
    const toggle = page.getByTestId("progress-filters-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.focus();
    await toggle.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const dates = page.locator(".progress-date-filter");
    await expect(dates.getByRole("combobox")).toBeVisible();
    const animation = await dates.evaluate((node) => ({
      name: getComputedStyle(node).animationName,
      seconds: parseFloat(getComputedStyle(node).animationDuration),
    }));
    if (mode === "default") {
      expect(animation.name).toBe("fade-in");
      expect(animation.seconds).toBe(0.15);
    } else {
      expect(animation.seconds).toBeLessThanOrEqual(0.001);
    }
    await toggle.press("Enter");
    await expect(dates).toBeHidden();
    await expect(toggle).toBeFocused();
  });
}
