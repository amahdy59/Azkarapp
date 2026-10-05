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
  const engineSmoke = ["phone", "desktop", "enlarged"].includes(scenario.name);
  test(`expanded listening fills the reader canvas: ${scenario.name}${engineSmoke ? " @cross-browser" : ""}`, async ({
    page,
  }, testInfo) => {
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
    if ("textScale" in scenario) {
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
    }
    const arabic = scenario.language === "ar";
    if (arabic) {
      await page.getByTestId("reader-audio-dock-button").click();
    } else {
      await page.getByRole("button", { name: "Reader options", exact: true }).click();
      await page.getByRole("menuitem", { name: "Play English translation", exact: true }).click();
    }
    const player = page.getByRole("region", { name: arabic ? "مشغل الصوت" : "Audio player", exact: true });
    const canvas = page.getByTestId("reader-card");
    // Verify the initial dock, before scrolling or expanding can conceal containment failures.
    await expect(player).toHaveAttribute("data-variant", "compact");
    const checkCompactContainment = async () => {
      const bounds = (await canvas.boundingBox())!;
      const mainBounds = (await page.locator(".app-main").boundingBox())!;
      const dockBounds = (await player.locator(".audio-compact-card").boundingBox())!;
      expect(Math.abs(dockBounds.y + dockBounds.height - (mainBounds.y + mainBounds.height))).toBeLessThanOrEqual(1);
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
      const compact = await player.locator(".audio-compact-row").evaluate((row) => {
        const controls = Array.from(row.querySelectorAll("button")).map((button) => button.getBoundingClientRect());
        const context = row.querySelector(".audio-compact-context")!.getBoundingClientRect();
        const title = row.querySelector('[data-testid="audio-compact-title"]')!.getBoundingClientRect();
        const metadata = row.querySelector(".audio-compact-meta")!.getBoundingClientRect();
        return {
          count: controls.length,
          alignment: Math.max(
            ...controls.map((box) => Math.abs(box.y + box.height / 2 - (controls[0].y + controls[0].height / 2))),
          ),
          textInside: [title, metadata].every((box) => box.x >= context.x - 1 && box.right <= context.right + 1),
          collision: controls.some((box) => box.x < context.right - 1 && box.right > context.x + 1),
          direction: getComputedStyle(row).direction,
          closeAtStart: controls[0].x < context.x,
          expandAtEnd: controls[2].x > context.x,
          overflow: row.scrollWidth - row.clientWidth,
        };
      });
      expect(compact.count).toBe(3);
      expect(compact.alignment).toBeLessThanOrEqual(1);
      expect(compact.textInside).toBe(true);
      expect(compact.collision).toBe(false);
      expect(compact.direction).toBe(arabic ? "rtl" : "ltr");
      expect(compact.closeAtStart).toBe(!arabic);
      expect(compact.expandAtEnd).toBe(!arabic);
      expect(compact.overflow).toBeLessThanOrEqual(1);
      await expect(player.getByTestId("audio-compact-waveform")).toBeVisible();
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
    if (scenario.name === "narrow" || "textScale" in scenario) {
      const scan = await new AxeBuilder({ page })
        .include(".floating-audio-player--compact")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
    }
    const expand = player.getByRole("button", { name: arabic ? "توسيع المشغل" : "Expand player", exact: true });
    await expand.focus();
    await page.keyboard.press("Enter");
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await expect(player.getByTestId("audio-queue-position")).toBeVisible();
    await expect(player.getByTestId("audio-expanded-identity")).not.toContainText(arabic ? "المقطع" : "Track");
    const waveformContrast = await player.getByTestId("audio-seek-waveform").evaluate((element) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const surface = element.closest(".audio-player-surface")!;
      context.fillStyle = getComputedStyle(surface).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      const background = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      context.fillStyle = getComputedStyle(element.querySelector(":scope > span")!).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      const track = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      const luminance = (rgb: number[]) =>
        rgb.reduce((sum, channel, index) => {
          const value = channel / 255;
          return (
            sum +
            (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index]!
          );
        }, 0);
      const a = luminance(background);
      const b = luminance(track);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(waveformContrast).toBeGreaterThanOrEqual(3);
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
    const symmetry = await player.locator(".audio-expanded-transport").evaluate((element) => {
      const controls = Array.from(element.querySelectorAll("button"));
      const centers = controls.map((button) => {
        const bounds = button.getBoundingClientRect();
        const icon = button.querySelector("svg")!.getBoundingClientRect();
        return { x: bounds.x + bounds.width / 2, y: icon.y + icon.height / 2 };
      });
      const middle = centers[Math.floor(centers.length / 2)];
      return {
        direction: getComputedStyle(element).direction,
        mirrorError: Math.max(
          ...centers.map((center, index) =>
            Math.abs((center.x + centers[centers.length - 1 - index].x) / 2 - middle.x),
          ),
        ),
        alignmentError: Math.max(...centers.map((center) => Math.abs(center.y - middle.y))),
      };
    });
    expect(symmetry.direction).toBe(arabic ? "rtl" : "ltr");
    expect(symmetry.mirrorError).toBeLessThanOrEqual(1);
    expect(symmetry.alignmentError).toBeLessThanOrEqual(1);
    await expect(player.getByTestId("audio-seek-waveform")).toBeVisible();
    await expect(player.getByRole("switch")).toHaveCount(1);
    await expect(player.getByTestId("audio-expanded-identity").getByTestId("audio-reciter-select")).toBeVisible();
    const speedAlignment = await player.locator(".audio-speed-select").evaluate((element) => {
      const value = element.querySelector('[data-slot="select-value"]')!.getBoundingClientRect();
      const icon = element.querySelector("svg")!.getBoundingClientRect();
      return Math.abs(value.y + value.height / 2 - (icon.y + icon.height / 2));
    });
    expect(speedAlignment).toBeLessThanOrEqual(1);
    if (!("textScale" in scenario)) {
      const volumeControl = player.getByRole("button", { name: arabic ? "مستوى الصوت" : "Volume", exact: true });
      const isIOS = await page.evaluate(() => /iPad|iPhone|iPod/.test(navigator.userAgent));
      if (isIOS) {
        await expect(volumeControl).toHaveCount(0);
      } else {
        const volume = (await volumeControl.boundingBox())!;
        const continuation = (await player.getByRole("switch").boundingBox())!;
        expect(Math.abs(volume.y + volume.height / 2 - (continuation.y + continuation.height / 2))).toBeLessThanOrEqual(
          1,
        );
      }
    }
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
    // Fitting content belongs at the center of the reading canvas. Overflow
    // must instead start at the top, with both ends reachable by scrolling.
    const alignment = await reading.evaluate((el) => {
      const region = el.getBoundingClientRect();
      const content = el.querySelector('[data-testid="reading-text-transition"]')!.getBoundingClientRect();
      const style = getComputedStyle(el);
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);
      const available = el.clientHeight - paddingTop - paddingBottom;
      const fits = content.height <= available;
      const verticalError = fits
        ? Math.abs(content.y + content.height / 2 - (region.y + (el.clientHeight + paddingTop - paddingBottom) / 2))
        : Math.abs(content.top - region.top - paddingTop);
      const horizontalError = Math.abs(content.x + content.width / 2 - (region.x + region.width / 2));
      el.scrollTop = el.scrollHeight;
      const end = el.querySelector('[data-testid="reading-text-transition"]')!.getBoundingClientRect();
      const endReachable = end.bottom <= region.top + el.clientHeight - paddingBottom + 1;
      el.scrollTop = 0;
      return { verticalError, horizontalError, endReachable };
    });
    expect(alignment.verticalError).toBeLessThanOrEqual(1);
    expect(alignment.horizontalError).toBeLessThanOrEqual(1);
    expect(alignment.endReachable).toBe(true);
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
