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
          // Center within the screen's usable scrollport. Classic scrollbars
          // reserve space independently of the outer application canvas.
          const screen =
            heading.closest<HTMLElement>(".app-screen-surface") ?? document.querySelector<HTMLElement>(".app-main")!;
          const screenBounds = screen.getBoundingClientRect();
          const main = { left: screenBounds.left + screen.clientLeft, width: screen.clientWidth };
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
          const backWidth = back?.getClientRects().length
            ? back.getBoundingClientRect().width + parseFloat(getComputedStyle(header).columnGap)
            : 0;
          const expectedLeading = rtl ? frameLeft + frameWidth - gutter - backWidth : frameLeft + gutter + backWidth;
          const subtitle = heading.parentElement?.querySelector("p");
          return {
            titleTop: title.top - bounds.top,
            topPadding: header.classList.contains("library-stationary-header")
              ? header.querySelector(".library-header-layout > :first-child")!.getBoundingClientRect().top - bounds.top
              : parseFloat(getComputedStyle(header).paddingTop),
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
          await expect(page.getByTestId("progress-empty-period")).toHaveCount(0);
          const layout = await page.locator(".progress-dashboard").evaluate((dashboard) => {
            const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            return {
              columns: getComputedStyle(dashboard.querySelector(".progress-overview-grid")!).gridTemplateColumns.split(
                " ",
              ).length,
              expectedColumns:
                dashboard.clientWidth >= rootSize * 56 ? 4 : dashboard.clientWidth >= rootSize * 18 ? 2 : 1,
            };
          });
          expect(layout.columns).toBe(layout.expectedColumns);
          const picker = (await page.getByTestId("progress-filters-toggle").boundingBox())!;
          for (const tab of await page.getByRole("tab").all()) {
            const button = (await tab.boundingBox())!;
            expect(button.height).toBeGreaterThanOrEqual(44);
            expect(Math.abs(button.y - picker.y)).toBeLessThanOrEqual(5);
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
    const dates = page.getByTestId("progress-filter-sheet");
    await expect(dates.getByRole("combobox")).toBeVisible();
    const animation = await dates.evaluate((node) => ({
      name: getComputedStyle(node).animationName,
      seconds: parseFloat(getComputedStyle(node).animationDuration),
    }));
    if (mode === "default") {
      expect(animation.name).toContain("enter");
      expect(animation.seconds).toBeGreaterThan(0);
    } else {
      expect(animation.seconds).toBeLessThanOrEqual(0.001);
    }
    await page.keyboard.press("Escape");
    await expect(dates).toBeHidden();
    await expect(toggle).toBeFocused();
  });
}
