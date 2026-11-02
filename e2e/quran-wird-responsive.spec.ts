import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Quran wird uses readable tablet and desktop columns in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.clock.setFixedTime(new Date("2026-10-19T13:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, themeMode: "midnight" },
          profile: { isGuest: true },
          quranReadingPosition: { page: 42, surahNumber: 2, ayahNumber: 256, juzNumber: 3 },
          quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
          wirdHistory: { "2026-10-18": [1, 2] },
        }),
      );
    }, language);
    await page.goto("/#/quran-wird");
    const content = page.getByTestId("quran-wird-content");
    const today = content.locator('section[aria-labelledby="wird-today-title"]');
    const plan = content.locator('section[aria-labelledby="wird-plan-title"]');
    const week = content.locator('section[aria-labelledby="wird-week-title"]');
    const settleTextLayout = () =>
      page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
    const expectWholeWeekLabels = async () => {
      const labels = await week.getByRole("listitem").evaluateAll((items) =>
        items.map((item) => {
          const label = item.querySelector<HTMLElement>("span.text-foreground")!;
          const range = document.createRange();
          range.selectNodeContents(label);
          const cell = item.getBoundingClientRect();
          const text = label.getBoundingClientRect();
          return {
            text: label.textContent,
            lines: range.getClientRects().length,
            fits: label.scrollWidth <= label.clientWidth + 1 && text.left >= cell.left && text.right <= cell.right,
            width: label.clientWidth,
            scroll: label.scrollWidth,
            bounds: [cell.left, text.left, text.right, cell.right],
          };
        }),
      );
      expect(labels).toHaveLength(7);
      expect(
        labels.every((label) => label.lines === 1 && label.fits),
        JSON.stringify(labels),
      ).toBe(true);
    };
    await expect(today).toBeVisible();
    for (const width of [390, 834, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await settleTextLayout();
      // Read both peers in the same rendering task; a late font/image update
      // must not combine heights from different layout frames in WebKit.
      const [todayBox, planBox] = await content.evaluate((node) =>
        ["wird-today-title", "wird-plan-title"].map((id) =>
          node.querySelector(`section[aria-labelledby="${id}"]`)!.getBoundingClientRect().toJSON(),
        ),
      );
      if (width === 390) expect(planBox.y).toBeGreaterThan(todayBox.y + todayBox.height);
      else {
        expect(Math.abs(todayBox.y - planBox.y)).toBeLessThanOrEqual(1);
        expect(Math.abs(todayBox.y + todayBox.height - planBox.y - planBox.height)).toBeLessThanOrEqual(1);
        expect(await content.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(2);
        expect(Math.abs(todayBox.x - planBox.x)).toBeGreaterThan(250);
        const first = (await week.getByRole("listitem").first().boundingBox())!;
        const last = (await week.getByRole("listitem").last().boundingBox())!;
        expect(Math.abs(first.y - last.y)).toBeLessThanOrEqual(1);
      }
      expect(await content.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      const chart = plan.locator(".recorded-pages-chart");
      const bars = await chart.locator(".recorded-pages-track").evaluateAll((tracks) =>
        tracks.map((track) => ({
          height: track.getBoundingClientRect().height,
          fill: track.firstElementChild!.getBoundingClientRect().height,
        })),
      );
      expect(bars).toHaveLength(7);
      expect(bars.filter((bar) => bar.fill > 1)).toHaveLength(1);
      expect(Math.max(...bars.map((bar) => bar.fill))).toBeGreaterThanOrEqual(bars[0]!.height - 3);
      const chartInsetGap = await plan.evaluate((node) => {
        const style = getComputedStyle(node);
        const inset = parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth);
        return Math.abs(
          node.getBoundingClientRect().bottom -
            node.querySelector(".recorded-pages-chart")!.getBoundingClientRect().bottom -
            inset,
        );
      });
      expect(chartInsetGap).toBeLessThanOrEqual(1);
      await expectWholeWeekLabels();
      await week.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`quran-week-${language}-${width}.png`) });
      await page.screenshot({ path: testInfo.outputPath(`quran-wird-${language}-${width}.png`), fullPage: true });
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    for (const width of [320, 834]) {
      await page.setViewportSize({ width, height: 900 });
      await settleTextLayout();
      expect(await content.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      await expectWholeWeekLabels();
      await week.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`quran-week-${language}-${width}-enlarged.png`) });
    }
    await expect(week.locator('[aria-current="date"]')).toHaveCount(1);
    expect((await new AxeBuilder({ page }).include('[data-testid="quran-wird-content"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: testInfo.outputPath(`quran-wird-${language}-320-enlarged.png`), fullPage: true });
  });
}
