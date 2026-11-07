import { openProgress } from "./helpers/open-progress";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const mode of ["default", "app", "os"] as const) {
    test(`single-owner Library/Quran arrivals ${language} ${mode} @cross-browser`, async ({ page }, info) => {
      page.on("crash", () =>
        info.annotations.push({ type: "browser-crash", description: "The page process reported a crash." }),
      );
      const width = mode === "app" ? 320 : language === "ar" ? 390 : 1280;
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
      await page.addInitScript(
        ({ language, mode }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: "midnight",
                appMaterial: language === "ar" ? "glass" : "solid",
                reduceMotion: mode === "app",
              },
              profile: { isGuest: true },
            }),
          );
        },
        { language, mode },
      );
      await page.goto("/#/home");
      await page.getByTestId("nav-quran").click();
      await expect(page.getByTestId("quran-wird-content")).toBeVisible();
      await expect(
        page.getByTestId("shared-screen-header").getByRole("button", { name: /Back|رجوع/, exact: true }),
      ).toHaveCount(0);
      await page.getByTestId("nav-azkar").click();
      await expect(page.getByTestId("library-section-collections")).toBeVisible();
      if (mode === "app")
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "200%";
        });
      await page.evaluate(() => document.fonts.ready);
      // Live text enlargement invalidates WebKit's container/font layout over
      // successive rendering steps. Compare the tab change with settled text,
      // rather than mixing that change with the preceding resize's reflow.
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      );
      const header = page.locator(".library-stationary-header");
      const before = (await header.boundingBox())!;
      const saved = page.getByTestId("library-section-saved");
      await saved.click();
      await expect(saved).toHaveAttribute("aria-selected", "true");
      const panel = page.getByTestId("library-content-scroll");
      await expect(panel).toHaveCSS("animation-name", "fade-in");
      const duration = await panel.evaluate((node) => parseFloat(getComputedStyle(node).animationDuration));
      if (mode === "default") expect(duration).toBeGreaterThan(0.1);
      else expect(duration).toBeLessThanOrEqual(0.001);
      const finish = saved.locator(".tab-selection-finish");
      await expect(finish).toHaveCSS("transform", "none");
      if (width < 600) {
        await expect(page.locator(".responsive-filter-context")).toHaveText(language === "ar" ? "الكل" : "All");
        const after = (await header.boundingBox())!;
        expect(Math.abs(after.height - before.height), JSON.stringify({ before, after })).toBeLessThanOrEqual(1);
        const titleLines = await header
          .getByRole("heading", { level: 1 })
          .evaluate((node) => node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight));
        expect(titleLines).toBeLessThanOrEqual(3);
      }
      await page.getByTestId("library-section-collections").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("library-section-collections")).toBeFocused();
      await expect(page.getByTestId("category-card-morning")).toHaveCSS("animation-name", "none");
      if (width >= 600) {
        const search = (await page.getByRole("textbox").boundingBox())!;
        const groups = (await page.getByTestId("library-category-group-scroll").boundingBox())!;
        expect(groups.y).toBeGreaterThanOrEqual(search.y + search.height);
        expect(groups.width).toBeGreaterThan(search.width * 0.95);
      }
      await page.screenshot({ path: info.outputPath("library-filters.png"), scale: "css" });
      const frames = await page.getByTestId("category-card-morning").evaluate(async (node) => {
        const initial = node.getBoundingClientRect();
        const samples: number[] = [];
        const start = performance.now();
        await new Promise<void>((resolve) => {
          const sample = (now: number) => {
            samples.push(now);
            if (now - start < 650) requestAnimationFrame(sample);
            else resolve();
          };
          requestAnimationFrame(sample);
        });
        const final = node.getBoundingClientRect();
        return {
          gaps: samples.slice(1).map((time, i) => time - samples[i]!),
          movement: Math.abs(initial.y - final.y),
          animation: getComputedStyle(node).animationName,
        };
      });
      expect(frames.movement).toBeLessThanOrEqual(1);
      expect(frames.animation).toBe("none");
      // Observe the DOM while returning to already-loaded pages. A short-lived
      // fallback is a regression even if it disappears before an assertion.
      await page.evaluate(() => {
        document.documentElement.dataset.loadingFlashes = "0";
        new MutationObserver((records) => {
          for (const record of records)
            for (const node of record.addedNodes) {
              if (
                node instanceof Element &&
                (node.matches('[data-testid="screen-loading"]') || node.querySelector('[data-testid="screen-loading"]'))
              ) {
                document.documentElement.dataset.loadingFlashes = String(
                  Number(document.documentElement.dataset.loadingFlashes) + 1,
                );
              }
            }
        }).observe(document.getElementById("main-content")!, { subtree: true, childList: true });
      });
      for (let pass = 0; pass < 2; pass++) {
        await page.getByTestId("nav-quran").click();
        await expect(page.getByTestId("quran-wird-content")).toBeVisible();
        await page.getByTestId("nav-azkar").click();
        await expect(page.getByTestId("library-section-collections")).toBeVisible();
      }
      await expect(page.locator("html")).toHaveAttribute("data-loading-flashes", "0");
      await openProgress(page);
      await expect(page.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "month");
      await expect(page).toHaveURL(/#\/progress\/month$/);
      const metric = page.getByTestId("progress-metric-prayers").getByRole("button");
      const badge = metric.locator(".control-cue");
      // Establish keyboard modality: programmatic focus after a pointer click
      // intentionally does not force the browser's :focus-visible state.
      await page.keyboard.press("Tab");
      await metric.focus();
      const metricGeometry = await metric.boundingBox();
      await expect(badge).toHaveCSS("scale", mode === "default" ? "1.05" : "1");
      await page.keyboard.down(" ");
      await expect(metric).toHaveAttribute("data-key-pressed", "");
      await expect(badge).toHaveCSS("scale", mode === "default" ? "0.98" : "1");
      expect(await metric.boundingBox()).toEqual(metricGeometry);
      await page.keyboard.press("Tab");
      await page.keyboard.up(" ");
      await expect(metric).not.toHaveAttribute("data-key-pressed");
      await expect(page).toHaveURL(/#\/progress\/month$/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await info.attach("frame-samples.json", {
        body: JSON.stringify({ language, mode, width, ...frames }),
        contentType: "application/json",
      });
      await page.screenshot({ path: info.outputPath("month-progress.png"), scale: "css" });
    });
  }
}
