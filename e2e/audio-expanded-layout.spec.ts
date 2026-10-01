import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const scenario of [
  { name: "narrow", width: 320, height: 568, language: "en", theme: "midnight" },
  { name: "phone", width: 390, height: 844, language: "ar", theme: "light" },
  { name: "tablet", width: 768, height: 1024, language: "ar", theme: "dark" },
  { name: "rail", width: 1024, height: 768, language: "en", theme: "light" },
  { name: "desktop", width: 1440, height: 900, language: "ar", theme: "midnight" },
  { name: "enlarged", width: 390, height: 844, language: "en", theme: "light", textScale: true },
  { name: "landscape", width: 844, height: 390, language: "ar", theme: "light" },
] as const) {
  test(`expanded listening fills the reader canvas: ${scenario.name} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.addInitScript(({ language, theme }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: theme, reduceMotion: true },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
      HTMLMediaElement.prototype.play = function () {
        Object.defineProperty(this, "duration", { configurable: true, value: 120 });
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      };
    }, scenario);
    await page.goto("/#/azkar/evening/1");
    const arabic = scenario.language === "ar";
    await page.getByRole("button", { name: arabic ? "خيارات القارئ" : "Reader options", exact: true }).click();
    await page
      .getByRole("menuitem", { name: arabic ? "تشغيل التلاوة العربية" : "Play English translation", exact: true })
      .click();
    const player = page.getByRole("region", { name: arabic ? "مشغل الصوت" : "Audio player", exact: true });
    await player.getByRole("button", { name: arabic ? "توسيع المشغل" : "Expand player", exact: true }).click();
    await expect(player).toHaveAttribute("data-variant", "expanded");
    if ("textScale" in scenario) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("audio-attribution-trigger")).toHaveCount(0);
    const canvas = page.getByTestId("reader-card");
    await expect
      .poll(async () => {
        const a = await player.boundingBox();
        const b = await canvas.boundingBox();
        return a && b
          ? Math.max(
              Math.abs(a.x - b.x),
              Math.abs(a.y - b.y),
              Math.abs(a.width - b.width),
              Math.abs(a.height - b.height),
            )
          : 100;
      })
      .toBeLessThanOrEqual(1);
    expect(await player.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    const reading = player.getByRole("region", { name: arabic ? "جارٍ التشغيل" : "Now playing" });
    await expect(reading).toBeVisible();
    expect((await reading.boundingBox())!.height).toBeGreaterThanOrEqual(90);
    const initialZikr = await page.getByTestId("reader-screen").getAttribute("data-zikr-id");
    await reading.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", initialZikr!);
    // Native reading scroll and controls retain keyboard access without trapping the surrounding shell.
    await page.keyboard.press("End");
    await expect.poll(() => reading.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2)).toBe(true);
    for (const button of await player.getByRole("button").all()) {
      await button.scrollIntoViewIfNeeded();
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    const collapse = player.getByRole("button", { name: arabic ? "تصغير المشغل" : "Minimize player", exact: true });
    await collapse.focus();
    // Firefox includes overflowing native containers in its tab order.
    for (let step = 0; step < 4 && (await player.evaluate((el) => el.contains(document.activeElement))); step++) {
      await page.keyboard.press("Shift+Tab");
    }
    expect(await player.evaluate((el) => el.contains(document.activeElement))).toBe(false);
    expect(await page.evaluate(() => document.activeElement?.closest("[inert]"))).toBeNull();
    const scan = await new AxeBuilder({ page })
      .include(".audio-player-surface")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await reading.evaluate((el) => {
      el.scrollTop = 0;
    });
    await reading.evaluate((el) => (el as HTMLElement).blur());
    await player.locator(".audio-expanded-layout").evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.mouse.move(0, 0);
    await page.screenshot({ path: testInfo.outputPath(`expanded-${scenario.name}.png`) });
    const voice = player.getByTestId("audio-reciter-select");
    await voice.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByTestId("audio-recording-source")).toBeVisible();
    const menuScan = await new AxeBuilder({ page })
      .include('[role="listbox"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(menuScan.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await expect(voice).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(player).toHaveAttribute("data-variant", "compact");
    await expect(
      player.getByRole("button", { name: arabic ? "توسيع المشغل" : "Expand player", exact: true }),
    ).toBeFocused();
    await expect(canvas.locator("[inert]")).toHaveCount(0);
  });
}
