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
  { name: "compact-boundary", width: 599, height: 800, language: "en", theme: "dark" },
  { name: "rail-boundary", width: 900, height: 768, language: "ar", theme: "midnight" },
  { name: "sidebar-boundary", width: 1200, height: 800, language: "en", theme: "light" },
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
    const canvas = page.getByTestId("reader-card");
    // Verify the initial dock, before scrolling or expanding can conceal containment failures.
    await expect(player).toHaveAttribute("data-variant", "compact");
    const checkCompactContainment = async () => {
      const bounds = (await canvas.boundingBox())!;
      // Batch geometry reads to avoid dozens of protocol round trips in WebKit.
      const buttons = await player.getByRole("button").evaluateAll((elements) =>
        elements
          .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
          .map((el) => {
            const { x, width, height } = el.getBoundingClientRect();
            return { x, width, height };
          }),
      );
      for (const box of buttons) {
        expect(box.x).toBeGreaterThanOrEqual(bounds.x - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      const stripVisible = await player.getByRole("progressbar").isVisible();
      const seekVisible = await player
        .getByRole("slider", { name: arabic ? "تقديم أو تأخير الصوت" : "Seek audio" })
        .isVisible();
      expect(Number(stripVisible) + Number(seekVisible)).toBe(1);
    };
    await checkCompactContainment();
    if (scenario.width >= 1200) {
      await page.getByTestId("reader-sidebar-close").click();
      await checkCompactContainment();
    }
    await page.screenshot({ path: testInfo.outputPath(`compact-${scenario.name}.png`) });
    await player.getByRole("button", { name: arabic ? "توسيع المشغل" : "Expand player", exact: true }).click();
    await expect(player).toHaveAttribute("data-variant", "expanded");
    if ("textScale" in scenario) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("audio-attribution-trigger")).toHaveCount(0);
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
    if (!("textScale" in scenario)) {
      const bounds = (await player.boundingBox())!;
      const play = (await player
        .getByRole("button", { name: arabic ? /^(تشغيل الصوت|إيقاف الصوت مؤقتًا)$/ : /^(Play audio|Pause audio)$/ })
        .boundingBox())!;
      expect(play.y).toBeGreaterThanOrEqual(bounds.y);
      expect(play.y + play.height).toBeLessThanOrEqual(Math.min(bounds.y + bounds.height, scenario.height) + 1);
    }
    const reading = player.getByRole("region", { name: arabic ? "جارٍ التشغيل" : "Now playing" });
    const transport = (await player.locator(".audio-expanded-transport").boundingBox())!;
    const options = player.locator(".audio-expanded-options");
    expect((await options.boundingBox())!.y).toBeGreaterThanOrEqual(transport.y + transport.height);
    expect(
      await options.evaluate((el) =>
        Boolean(el.previousElementSibling?.classList.contains("audio-expanded-transport")),
      ),
    ).toBe(true);
    await expect(reading).toBeVisible();
    if (!arabic) {
      await expect(player.getByTestId("audio-player-zikr-text")).toHaveAttribute("lang", "en");
      await expect(player.getByTestId("audio-player-arabic-text")).toBeHidden();
      const toggle = player.getByRole("button", { name: /^(Show|Hide) Arabic$/ });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(player.getByTestId("audio-player-arabic-text")).toBeVisible();
      await page.keyboard.press("Space");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toBeFocused();
      await expect(player.getByTestId("audio-player-arabic-text")).toBeHidden();
      await reading.evaluate((el) => {
        el.scrollTop = 0;
      });
    }
    expect((await reading.boundingBox())!.height).toBeGreaterThanOrEqual(90);
    if (!("textScale" in scenario)) {
      // Read both rectangles in one frame: the loading status can disappear
      // between separate browser calls and move both elements together.
      await expect
        .poll(() =>
          player.evaluate((el) => {
            const text = el.querySelector('[data-testid="audio-player-zikr-text"]')!.getBoundingClientRect();
            const metadata = el.querySelector(".audio-expanded-meta")!.getBoundingClientRect();
            return text.top - metadata.bottom;
          }),
        )
        .toBeLessThanOrEqual(24);
    }
    const initialZikr = await page.getByTestId("reader-screen").getAttribute("data-zikr-id");
    await reading.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", initialZikr!);
    // Native reading scroll and controls retain keyboard access without trapping the surrounding shell.
    await page.keyboard.press("End");
    await expect.poll(() => reading.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2)).toBe(true);
    const targets = await player.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => {
        button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        const { width, height, top, bottom } = button.getBoundingClientRect();
        const surface = button.closest(".audio-player-surface")!.getBoundingClientRect();
        const visibleHeight = Math.min(bottom, surface.bottom, innerHeight) - Math.max(top, surface.top, 0);
        return { width, height, visibleHeight };
      }),
    );
    for (const box of targets) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.visibleHeight).toBeGreaterThanOrEqual(box.height - 1);
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
    await expect(page.getByTestId("audio-recording-source")).toHaveCount(0);
    await expect(voice).not.toHaveText("");
    const menuScan = await new AxeBuilder({ page })
      .include('[role="listbox"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(menuScan.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await expect(voice).toBeFocused();
    const speed = player.getByRole("combobox", { name: arabic ? /السرعة/ : /Speed/ });
    await speed.click();
    await expect(page.getByRole("option")).toHaveCount(5);
    await page.getByRole("option").nth(3).click();
    await expect(speed).toHaveAccessibleName(arabic ? "السرعة: ١.٥×" : "Speed: 1.5×");
    await speed.click();
    await page.keyboard.press("Escape");
    await expect(speed).toBeFocused();
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await page.keyboard.press("Escape");
    await expect(player).toHaveAttribute("data-variant", "compact");
    await expect(
      player.getByRole("button", { name: arabic ? "توسيع المشغل" : "Expand player", exact: true }),
    ).toBeFocused();
    await expect(canvas.locator("[inert]")).toHaveCount(0);
  });
}
