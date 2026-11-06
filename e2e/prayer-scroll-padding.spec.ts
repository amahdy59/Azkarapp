import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`prayer card padding at enlarged text ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.clock.setFixedTime(new Date("2026-10-18T08:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            homeMaterial: "glass",
            appMaterial: "glass",
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    await page.getByTestId("home-sticky-prayers").waitFor();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await page.evaluate(() => document.fonts.ready);
    const sticky = page.getByTestId("home-sticky-prayers");
    const scroll = sticky.locator("..");
    const assertFit = async () => {
      await expect
        .poll(() =>
          sticky.evaluate((node) => {
            const cards = [...node.querySelectorAll('[data-density="summary"]')];
            return cards.every((card) => {
              const box = card.getBoundingClientRect();
              return [...card.querySelectorAll("h3, [data-prayer-timing] p, [data-prayer-compact-countdown]")].every(
                (child) => {
                  const b = child.getBoundingClientRect();
                  return (
                    b.left >= box.left + 12 && b.right <= box.right - 12 && child.scrollWidth <= child.clientWidth + 1
                  );
                },
              );
            });
          }),
        )
        .toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    };
    await assertFit();
    await scroll.evaluate((node) => (node.scrollTop = 180));
    await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
    await assertFit();
    const compact = page.getByTestId("home-compact-prayer");
    await expect(compact).toBeInViewport();
    const action = compact.getByRole("button");
    await expect(action).toBeVisible();
    const actionBox = (await action.boundingBox())!;
    const summaryBox = (await compact.boundingBox())!;
    expect(actionBox.height).toBeGreaterThanOrEqual(44);
    expect(summaryBox.y + summaryBox.height - actionBox.y - actionBox.height).toBeGreaterThanOrEqual(6);
    expect(actionBox.x).toBeGreaterThan(summaryBox.x + 10);
    expect(actionBox.x + actionBox.width).toBeLessThan(summaryBox.x + summaryBox.width - 10);
    await page.screenshot({ path: testInfo.outputPath(`padding-enlarged-${language}.png`), scale: "css" });
  });
}
