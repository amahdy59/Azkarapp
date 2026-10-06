import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getEstimatedPrayerTimes } from "../src/app/content/prayerTimes";

const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

async function openHome(page: Page, language: "ar" | "en") {
  // Repeated theme reloads can surface a waiting-worker notice in Firefox.
  // Defer through the real control so it cannot obstruct the prayer flow.
  const later = page.getByRole("button", { name: language === "ar" ? "لاحقاً" : "Later", exact: true });
  await page.addLocatorHandler(later, async () => {
    await later.click();
  });
  await page.clock.setFixedTime(new Date("2026-09-05T13:40:00+03:00"));
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (localStorage.getItem("azkarapp.state.v1")) return;
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { isGuest: true },
      }),
    );
  }, language);
  await page.goto("/#/home");
  await expect(page.getByTestId("prayer-card-fajr")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function checkGeometry(page: Page) {
  const panel = page.getByTestId("home-prayer-moment");
  await expect(panel.getByTestId("prayer-moment-virtue")).toBeVisible();
  await expect(panel.getByTestId("prayer-moment-hero")).toHaveCount(0);
  const measures = await page.evaluate(() => {
    const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const content = document.querySelector('[data-testid="home-content-grid"]')!.getBoundingClientRect();
    const strip = document.querySelector('[data-testid="home-prayer-strip"]')!.getBoundingClientRect();
    const panel = document.querySelector('[data-testid="home-prayer-moment"]')!.getBoundingClientRect();
    const quote = document.querySelector('[data-testid="prayer-moment-virtue"] p[lang]')!;
    const heading = document.querySelector('[data-testid="prayer-actions-card"] h2')!;
    return {
      rootSize,
      contentWidth: content.width,
      stripWidth: strip.width,
      panelWidth: panel.width,
      centerOffset:
        strip.x + strip.width / 2 - (innerWidth >= 1024 ? panel.x + panel.width / 2 : content.x + content.width / 2),
      columnWidthDifference: innerWidth >= 1024 ? strip.width - panel.width : 0,
      quoteFont: getComputedStyle(quote).fontFamily,
      headingFont: getComputedStyle(heading).fontFamily,
      summaryOverflow: [
        ...document.querySelectorAll(
          '[data-density="summary"] h3, [data-density="summary"] p, [id^="prayer-summary-status-"]',
        ),
      ].some((el) => el.scrollWidth > el.clientWidth + 1),
    };
  });
  expect(measures.contentWidth).toBeLessThanOrEqual(70 * measures.rootSize);
  expect(measures.stripWidth).toBeLessThanOrEqual(40 * measures.rootSize);
  expect(measures.panelWidth).toBeLessThanOrEqual(40 * measures.rootSize);
  expect(Math.abs(measures.centerOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(measures.columnWidthDifference)).toBeLessThanOrEqual(1);
  expect(measures.quoteFont).toBe(measures.headingFont);
  expect(measures.summaryOverflow).toBe(false);
  const overflow = await panel.evaluate((panel) => {
    return [...panel.querySelectorAll("h2, h3, h4, p, span[id]")]
      .filter(
        (element) =>
          element.scrollWidth > element.clientWidth + 1 || getComputedStyle(element).textOverflow === "ellipsis",
      )
      .map((element) => element.textContent);
  });
  expect(overflow).toEqual([]);
  const checklist = await panel.locator("ol").evaluate((list) => ({
    gap: getComputedStyle(list).rowGap,
    circles: [...list.querySelectorAll(".tracking-check")].map((circle) => circle.getBoundingClientRect().width),
    rootSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
    labelIcons: list.querySelectorAll("li > div svg").length,
  }));
  expect(["normal", "0px"]).toContain(checklist.gap);
  expect(checklist.labelIcons).toBe(0);
  for (const width of checklist.circles) expect(width).toBeCloseTo(checklist.rootSize * 1.25, 2);
  const bounds = (await panel.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual((await page.evaluate(() => innerWidth)) + 1);
  for (const control of await panel.locator("input[type=checkbox], button").all()) {
    const bounds = (await control.boundingBox())!;
    // Firefox rect subtraction can return 43.999969 for a 44px CSS target.
    // Normalize only floating-point noise; retain the same 44px requirement.
    expect(Number(bounds.width.toFixed(3))).toBeGreaterThanOrEqual(44);
    expect(Number(bounds.height.toFixed(3))).toBeGreaterThanOrEqual(44);
  }
  const action = panel.getByTestId("prayer-open-adhkar");
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const language of ["ar", "en"] as const) {
  // Each viewport checks all five prayers within the normal per-test deadline,
  // including WebKit under concurrent local development workloads.
  for (const views of [[[320, 700]], [[390, 844]], [[643, 275]], [[820, 900]], [[1440, 900]], [[1885, 1000]]]) {
    test(`compact prayer panels reflow across ${language} ${views[0][0]} view @cross-browser`, async ({
      page,
    }, testInfo) => {
      await openHome(page, language);
      for (const [width, height] of views) {
        await page.setViewportSize({ width, height });
        for (const prayer of prayers) {
          const time = getEstimatedPrayerTimes(new Date("2026-09-05T12:00:00+03:00"))[prayer];
          const instant = new Date(`2026-09-05T${time}:00+03:00`);
          instant.setMinutes(instant.getMinutes() + 2);
          await page.clock.setFixedTime(instant);
          await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
          const tile = page.getByTestId(`prayer-card-${prayer}`);
          await expect(tile).toHaveAttribute("data-prayer-state", "current");
          if ((await tile.getByRole("button").getAttribute("aria-expanded")) !== "true") {
            await tile.getByRole("button").click();
          }
          await expect(page.getByTestId("home-prayer-moment")).toHaveAttribute("data-prayer", prayer);
          await checkGeometry(page);
          const tiles = await page.locator('[data-density="summary"]').evaluateAll((tiles) =>
            tiles.map((tile) => {
              const button = tile.querySelector("button")!;
              return {
                width: button.getBoundingClientRect().width,
                height: button.getBoundingClientRect().height,
                gap: parseFloat(getComputedStyle(button).rowGap),
                statusGap:
                  tile.querySelector('[id^="prayer-summary-status-"]')!.getBoundingClientRect().top -
                  tile.querySelector("p")!.getBoundingClientRect().bottom,
                wrapping: [...tile.querySelectorAll('h3, p, [id^="prayer-summary-status-"]')].some(
                  (el) => getComputedStyle(el).whiteSpace !== "nowrap",
                ),
                overflow: [...tile.querySelectorAll('h3, p, [id^="prayer-summary-status-"]')].some(
                  (el) => el.scrollWidth > el.clientWidth + 1,
                ),
              };
            }),
          );
          expect(tiles.every((tile) => tile.width >= 44 && tile.height >= 44 && !tile.overflow)).toBe(true);
          expect(tiles.every((tile) => tile.gap === 6)).toBe(true);
          expect(tiles.every((tile) => !tile.wrapping && Math.abs(tile.statusGap - 6) < 0.01)).toBe(true);
          const timeStyles = await page.locator('[id^="prayer-summary-time-"]').evaluateAll((times) =>
            times.map((time) => ({
              size: getComputedStyle(time).fontSize,
              weight: getComputedStyle(time).fontWeight,
            })),
          );
          expect(
            timeStyles.every(
              (time) => time.size === `${width < 360 ? 12 : width < 640 ? 14 : 15}px` && Number(time.weight) >= 700,
            ),
          ).toBe(true);
          if ((width === 390 && prayer === "fajr") || (width === 1440 && prayer === "dhuhr")) {
            await page.getByTestId("home-prayer-strip").scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `output/playwright/compact-prayer/${testInfo.project.name}-${language}-${width}-${prayer}.png`,
              fullPage: true,
            });
          }
        }
        const first = (await page.getByTestId("prayer-card-fajr").boundingBox())!;
        const last = (await page.getByTestId("prayer-card-isha").boundingBox())!;
        expect(first.y < last.y || (language === "ar" ? first.x > last.x : first.x < last.x)).toBe(true);
      }
    });
  }

  test(`compact prayer ${language} themes, enlarged text and keyboard @cross-browser`, async ({ page }) => {
    await openHome(page, language);
    await page.setViewportSize({ width: 390, height: 700 });
    for (const [themeMode, reduceTransparency] of [
      ["light", false],
      ["midnight", false],
      ["dark", true],
    ] as const) {
      await page.evaluate(
        ({ themeMode, reduceTransparency }) => {
          const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
          Object.assign(state.settings, { themeMode, reduceTransparency });
          localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
        },
        { themeMode, reduceTransparency },
      );
      await page.reload();
      await page.getByTestId("prayer-card-dhuhr").getByRole("button").click();
      await checkGeometry(page);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="home-prayer-strip"]')
            .include('[data-testid="home-prayer-moment"]')
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.locator("html").evaluate((element) => {
      element.style.fontSize = "200%";
    });
    await checkGeometry(page);
    const tileRows = await page
      .locator('[data-density="summary"]')
      .evaluateAll((tiles) => new Set(tiles.map((el) => el.getBoundingClientRect().y)).size);
    expect(tileRows).toBeGreaterThan(1);
    const input = page.getByTestId("prayer-action-location").locator("input");
    await input.focus();
    await page.keyboard.press("Space");
    await expect(input).toBeChecked();
    await expect(page.getByTestId("prayer-actions-progress")).toContainText(language === "ar" ? "١ من ٤" : "1 of 4");
    await page.keyboard.press("Space");
    await expect(input).not.toBeChecked();
    await page.getByTestId("prayer-actions-more-info").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("prayer-actions-more-info")).toBeFocused();
    await page.emulateMedia({ forcedColors: "active" });
    await checkGeometry(page);
    await page.goto("/#/prayer/dhuhr");
    await expect(page.getByTestId("prayer-moment-screen")).toBeVisible();
    await expect(page.getByTestId("prayer-open-adhkar")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
