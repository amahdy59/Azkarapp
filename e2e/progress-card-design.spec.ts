import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function seed(page: Page, language: "ar" | "en", theme: string, highContrast = false) {
  await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
  await page.addInitScript(
    ({ language, theme, highContrast }) => {
      const options = new URL(location.href).searchParams;
      const recorded = options.get("recorded") === "1";
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: theme,
            appMaterial: options.get("material") ?? "solid",
            highContrast,
            reduceMotion: true,
            calendarType: "gregorian",
          },
          profile: { isGuest: true },
          dailyCompletions: recorded ? [{ dayKey: "2026-10-15", category: "morning", timeZone: "Africa/Cairo" }] : [],
          prayerTracking: recorded ? [{ dayKey: "2026-10-15", prayer: "dhuhr", location: "home" }] : [],
          wirdHistory: recorded ? { "2026-10-15": [1, 2] } : {},
          quranWirdDailyGoals: recorded ? { "2026-10-15": 2 } : {},
        }),
      );
    },
    { language, theme, highContrast },
  );
}

for (const language of ["ar", "en"] as const) {
  for (const theme of ["light", "dark", "midnight"]) {
    test(`adaptive metric cards keep clear values and theme surfaces in ${language} ${theme} @cross-browser`, async ({
      page,
    }, info) => {
      await seed(page, language, theme);
      for (const material of ["solid", "glass"]) {
        for (const recorded of [false, true]) {
          await page.goto(`/?material=${material}&recorded=${recorded ? 1 : 0}#/progress`);
          const grid = page.getByTestId("progress-overview");
          await expect(grid).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          for (const width of [390, 834, 1440, 320]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.locator("html").evaluate((node, enlarged) => {
              node.style.fontSize = enlarged ? "200%" : "100%";
            }, width === 320);
            const geometry = await grid.evaluate((node) =>
              [...node.children].map((card) => {
                const box = card.getBoundingClientRect();
                const button = card.querySelector("button")!;
                const footer = card.querySelector(".progress-metric-footer")!.getBoundingClientRect();
                const number = card.querySelector(".progress-metric-count")!.getBoundingClientRect();
                const quantity = card.querySelector(".progress-metric-quantity")!.getBoundingClientRect();
                const rtl = getComputedStyle(card).direction === "rtl";
                return {
                  top: box.top,
                  right: box.right,
                  bottom: box.bottom,
                  left: box.left,
                  overflow: card.scrollWidth > card.clientWidth + 1,
                  buttonHeight: button.getBoundingClientRect().height,
                  numberSize: parseFloat(getComputedStyle(card.querySelector(".progress-metric-count")!).fontSize),
                  captionSize: parseFloat(getComputedStyle(card.querySelector(".progress-metric-caption")!).fontSize),
                  footerBottom: footer.bottom,
                  background: getComputedStyle(card).backgroundColor,
                  radius: parseFloat(getComputedStyle(card).borderTopLeftRadius),
                  valueAligned: Math.abs(rtl ? number.right - quantity.right : number.left - quantity.left) <= 1,
                };
              }),
            );
            expect(geometry).toHaveLength(4);
            for (const card of geometry) {
              expect(card.overflow).toBe(false);
              expect(card.buttonHeight).toBeGreaterThanOrEqual(44);
              expect(card.numberSize).toBeGreaterThanOrEqual(30);
              expect(card.captionSize).toBeGreaterThanOrEqual(12);
              expect(card.radius).toBeGreaterThan(0);
              expect(card.valueAligned).toBe(true);
              // Glass deliberately retains the app's shared translucent
              // material; Solid is opaque. Contrast is checked below.
              const paint = card.background.match(/^rgba?\(([^)]+)\)$/);
              expect(paint).not.toBeNull();
              const channels = paint![1].split(",").map(Number);
              const alpha = channels.length === 4 ? channels[3] : 1;
              expect(alpha).toBeGreaterThan(0);
              if (material === "solid") expect(alpha).toBe(1);
            }
            expect(new Set(geometry.map((card) => card.background)).size).toBe(1);
            for (const card of geometry)
              for (const peer of geometry.filter((peer) => Math.abs(peer.top - card.top) <= 1)) {
                expect(Math.abs(card.footerBottom - peer.footerBottom)).toBeLessThanOrEqual(1);
              }
            if (width === 390 || width === 1440)
              await grid.screenshot({
                path: info.outputPath(
                  `cards-${language}-${theme}-${material}-${recorded ? "recorded" : "empty"}-${width}.png`,
                ),
              });
          }
          await page.locator("html").evaluate((node) => {
            node.style.fontSize = "100%";
          });
          await page.setViewportSize({ width: 390, height: 1000 });
          expect(
            (
              await new AxeBuilder({ page })
                .include('[data-testid="progress-overview"]')
                .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
                .analyze()
            ).violations,
          ).toEqual([]);
          const prayers = page.getByTestId("progress-metric-prayers");
          if (!recorded)
            await expect(prayers).toContainText(language === "ar" ? "لا سجلات محفوظة بعد" : "No saved records yet");
          const button = prayers.getByRole("button");
          await button.focus();
          await expect(button).toBeFocused();
          await button.press("Enter");
          await expect(page.getByTestId("progress-tab-trends")).toHaveAttribute("aria-selected", "true");
        }
      }
    });
  }
  test(`metric cards retain system-color and high-contrast recovery in ${language} @cross-browser`, async ({
    page,
  }) => {
    await seed(page, language, "midnight", true);
    await page.goto("/?material=glass&recorded=1#/progress");
    const grid = page.getByTestId("progress-overview");
    await expect(grid).toBeVisible();
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await expect(page.locator("html")).toHaveClass(/high-contrast/);
    for (const forcedColors of ["none", "active"] as const) {
      await page.emulateMedia({ forcedColors });
      const bounds = await grid.evaluate((node) => ({ width: node.clientWidth, content: node.scrollWidth }));
      expect(bounds.content).toBeLessThanOrEqual(bounds.width + 1);
      await grid.getByRole("button").first().focus();
      await expect(grid.getByRole("button").first()).toBeFocused();
    }
  });
}
