import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 820, 1440]) {
    test(`footer tools collapse without changing counting or item choice in ${language} at ${width}px @cross-browser`, async ({
      page,
    }, testInfo) => {
      const ar = language === "ar";
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/azkar/morning/1");
      const tools = page.getByTestId("reader-support-actions");
      const counter = page.getByTestId("counter-surface");
      await expect(tools).toBeVisible();
      const toolBounds = (await tools.boundingBox())!;
      const primaryBounds = (await page.getByTestId("counter-panel").boundingBox())!;
      expect(primaryBounds.y - toolBounds.y - toolBounds.height).toBeGreaterThanOrEqual(16);
      for (const button of await tools.getByRole("button").all()) {
        const alignment = await button.evaluate((element) => {
          const icon = element.querySelector("svg")!.getBoundingClientRect();
          const button = element.getBoundingClientRect();
          const label = element.querySelector("span");
          const text = label?.getBoundingClientRect();
          return {
            iconOffset: Math.abs(icon.y + icon.height / 2 - (button.y + button.height / 2)),
            textOffset: text?.height ? Math.abs(text.y + text.height / 2 - (button.y + button.height / 2)) : 0,
          };
        });
        expect(alignment.iconOffset).toBeLessThanOrEqual(1);
        expect(alignment.textOffset).toBeLessThanOrEqual(1);
      }
      await page.evaluate(() => document.fonts.ready);
      if (width === 1440) {
        await page.getByTestId("reader-sidebar-close").click();
        const row = await page.locator(".reader-footer-composition").evaluate((el) => {
          const actions = el.querySelector(".reader-tools-actions")!.getBoundingClientRect();
          const primary = el.querySelector(".reader-primary-actions")!.getBoundingClientRect();
          const toggle = el.querySelector(".reader-tools-disclosure")!.getBoundingClientRect();
          const centers = [actions, toggle].map((box) => box.y + box.height / 2);
          const composition = el.getBoundingClientRect();
          const toolCells = Array.from(el.querySelectorAll('[data-testid="reader-support-actions"] button')).map(
            (button) => button.getBoundingClientRect(),
          );
          const previous = el.querySelector(".adaptive-counter-row > div:first-child button")!.getBoundingClientRect();
          const next = el.querySelector(".adaptive-counter-row > div:last-child button")!.getBoundingClientRect();
          const counter = el.querySelector('[data-testid="counter-surface"]')!.getBoundingClientRect();
          const edges = [...toolCells, toggle].sort((a, b) => a.x - b.x);
          const navigation = [previous, next].sort((a, b) => a.x - b.x);
          return {
            alignment: Math.max(...centers) - Math.min(...centers),
            twoRows: primary.top >= actions.bottom,
            labelsFit: Array.from(el.querySelectorAll("[data-testid=reader-support-actions] button > span")).every(
              (label) => label.scrollWidth <= label.clientWidth + 1,
            ),
            symmetry: Math.abs(primary.x + primary.width / 2 - (composition.x + composition.width / 2)),
            gridEdges: Math.max(
              Math.abs(navigation[0].x - edges[0].x),
              Math.abs(navigation[0].right - edges[0].right),
              Math.abs(counter.x - edges[1].x),
              Math.abs(counter.right - edges[2].right),
              Math.abs(navigation[1].x - edges[3].x),
              Math.abs(navigation[1].right - edges[3].right),
            ),
          };
        });
        expect(row.alignment).toBeLessThanOrEqual(2);
        expect(row.symmetry).toBeLessThanOrEqual(1);
        expect(row.twoRows).toBe(true);
        expect(row.labelsFit).toBe(true);
        expect(row.gridEdges).toBeLessThanOrEqual(1);
      }

      const reading = page.locator(".reader-text-scroll");
      const expandedReadingHeight = (await reading.boundingBox())!.height;
      if (width === 1440) {
        const frame = reading.getByTestId("reading-text-transition");
        await expect
          .poll(async () => {
            const region = (await reading.boundingBox())!;
            const text = (await frame.boundingBox())!;
            return Math.abs(text.y + text.height / 2 - (region.y + region.height / 2));
          })
          .toBeLessThanOrEqual(3);
        const region = (await reading.boundingBox())!;
        const footer = (await page.getByTestId("reader-counter-stack").boundingBox())!;
        expect(region.y + region.height).toBeLessThanOrEqual(footer.y + 1);
      }
      const initialReadingBounds = (await reading.boundingBox())!;
      const initialCount = await counter.getAttribute("aria-label");
      const toggle = page.getByTestId("reader-tools-toggle");
      await expect(toggle.locator("svg")).not.toHaveClass(/rotate-180/);
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(tools).toBeHidden();
      await expect(toggle).toBeFocused();
      await expect.poll(async () => (await reading.boundingBox())!.height).toBeCloseTo(expandedReadingHeight, 0);
      expect((await reading.boundingBox())!.y).toBeCloseTo(initialReadingBounds.y, 0);
      const guidance = page.getByTestId("counter-guidance-reopen");
      if (await guidance.isVisible()) {
        const before = (await reading.boundingBox())!;
        await guidance.click();
        expect((await reading.boundingBox())!.height).toBeGreaterThanOrEqual(before.height);
        expect((await reading.boundingBox())!.y).toBeCloseTo(before.y, 0);
      }
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle.locator("svg")).toHaveClass(/rotate-180/);
      await expect(toggle).toHaveAccessibleName(ar ? "إظهار الأدوات" : "Show tools");
      await page.screenshot({ path: testInfo.outputPath(`footer-collapsed-${language}-${width}.png`) });
      await expect(counter).toHaveAttribute("aria-label", initialCount!);
      await page
        .getByTestId("counter-panel")
        .getByRole("button", { name: ar ? "التالي" : "Next", exact: true })
        .click();
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", "1");
      await expect(tools).toBeHidden();
      await page.getByRole("button", { name: ar ? "إظهار الأدوات" : "Show tools", exact: true }).click();
      await expect(tools).toBeVisible();
      await page.getByRole("button", { name: ar ? "خيارات القارئ" : "Reader options", exact: true }).click();
      await page.getByTestId("reader-focus-toggle").click();
      await expect(tools).toBeHidden();
      await expect(page.getByRole("button", { name: ar ? "إخفاء الأدوات" : "Hide tools", exact: true })).toBeHidden();
      await page.getByRole("button", { name: ar ? "إنهاء وضع التركيز" : "Exit reading focus", exact: true }).click();
      await expect(tools).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`footer-${language}-${width}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
      expect(scan.violations).toEqual([]);
    });
  }
}

for (const language of ["ar", "en"] as const) {
  test(`counter labels stay on one line and fill starts empty in ${language} @cross-browser`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
            profile: { isGuest: true },
          }),
        );
    }, language);
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/azkar/waking-up/1");
      const counter = page.getByTestId("counter-surface");
      await expect(counter).toBeVisible();
      for (const fontSize of ["100%", "200%"]) {
        await page.evaluate((fontSize) => {
          document.documentElement.style.fontSize = fontSize;
        }, fontSize);
        const dimensions = await counter.locator(".counter-action-label").evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return {
            lines: range.getClientRects().length,
            textWidth: range.getBoundingClientRect().width,
            available: element.parentElement!.clientWidth - 24,
          };
        });
        expect(dimensions.lines).toBe(1);
        expect(dimensions.textWidth, JSON.stringify({ width, fontSize, dimensions })).toBeLessThanOrEqual(
          dimensions.available + 1,
        );
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "100%";
      });
    }
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/azkar/morning/${index + 1}`);
    const counter = page.getByTestId("counter-surface");
    await expect(counter).toBeVisible();
    const fill = counter.locator(".counter-progress-fill");
    await expect(fill).toHaveCSS("--progress-ratio", "0");
    const emptyFill = (await fill.boundingBox())!;
    const emptyTrack = (await counter.locator(".counter-outline-progress").boundingBox())!;
    expect(
      Math.min(emptyFill.x + emptyFill.width, emptyTrack.x + emptyTrack.width) - Math.max(emptyFill.x, emptyTrack.x),
    ).toBeLessThanOrEqual(1);
    expect(await counter.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.background = "var(--card)";
        document.body.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      }),
    );
    await page.screenshot({ path: `output/playwright/counter-progress/empty-${language}.png` });
    await counter.click();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
    await expect
      .poll(() =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).partialZikrCounts["m-hm-91"]),
      )
      .toBe(1);
    // Exercise resumed progress without spending most of WebKit's test window
    // waiting for fifty separate browser input round trips.
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      state.partialZikrCounts["m-hm-91"] = 49;
      localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
    });
    await page.reload();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /49 \/ 100$/ : /٤٩ \/ ١٠٠$/);
    await counter.click();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /50 \/ 100$/ : /٥٠ \/ ١٠٠$/);
    await expect(fill).toHaveCSS("--progress-ratio", "0.5");
    // The CSS value updates before the painted transform on some WebKit frames.
    // Keep the same geometry and edge requirements, sampled in one frame.
    await expect(async () => {
      const geometry = await counter.evaluate((element) => {
        const half = element.querySelector(".counter-progress-fill")!.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return {
          visibleStart: Math.max(half.left, box.left + 1),
          visibleEnd: Math.min(half.right, box.right - 1),
          left: box.left,
          right: box.right,
          width: box.width,
        };
      });
      expect((geometry.visibleEnd - geometry.visibleStart) / (geometry.width - 2)).toBeCloseTo(0.5, 2);
      if (language === "ar") expect(geometry.visibleEnd).toBeCloseTo(geometry.right - 1, 0);
      else expect(geometry.visibleStart).toBeCloseTo(geometry.left + 1, 0);
    }).toPass({ timeout: 15000 });
    await page.screenshot({ path: `output/playwright/counter-progress/half-${language}.png` });
    await page.reload();
    await expect(counter).toHaveAttribute("aria-label", language === "en" ? /50 \/ 100$/ : /٥٠ \/ ١٠٠$/);
    await expect(fill).toHaveCSS("--progress-ratio", "0.5");
    // Restored DOM state can precede WebKit's rendered geometry. Sample both
    // rectangles in one frame and wait for the same half-fill requirement.
    await expect
      .poll(() =>
        counter.evaluate((element) => {
          const restoredFill = element.querySelector(".counter-progress-fill")!.getBoundingClientRect();
          const restoredBox = element.getBoundingClientRect();
          const restoredWidth =
            Math.min(restoredFill.right, restoredBox.right - 1) - Math.max(restoredFill.left, restoredBox.left + 1);
          return restoredWidth / (restoredBox.width - 2);
        }),
      )
      .toBeCloseTo(0.5, 2);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(async () => {
      const tally = await counter.locator("p").evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const parent = element.parentElement!;
        const style = getComputedStyle(parent);
        return {
          width: range.getBoundingClientRect().width,
          available: parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        };
      });
      expect(tally.width, JSON.stringify(tally)).toBeLessThanOrEqual(tally.available + 1);
    }).toPass({ timeout: 15000 });
    // Exercise the wider platform fallback too, rather than relying on the
    // developer machine's narrower Consolas/SFMono metrics.
    await counter.locator("p").evaluate((element) => {
      element.style.fontFamily = "monospace";
    });
    const fallbackTally = await counter.locator("p").evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const parent = element.parentElement!;
      const style = getComputedStyle(parent);
      return {
        width: range.getBoundingClientRect().width,
        available: parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      };
    });
    expect(fallbackTally.width).toBeLessThanOrEqual(fallbackTally.available + 1);
  });
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 820, 1440]) {
    test(`compact devotional footer in ${language} at ${width}px @cross-browser`, async ({ page }) => {
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
            profile: { isGuest: true },
          }),
        );
      }, language);
      const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
      await page.goto(`/#/azkar/morning/${index + 1}`);
      const actions = page.getByTestId("reader-support-actions");
      const counter = page.getByTestId("counter-surface");
      const hint = page.getByTestId("counter-tap-hint");
      await page.setViewportSize({ width, height: 900 });
      await expect(actions).toBeVisible();
      await expect(actions.getByRole("button")).toHaveCount(3);
      await expect(hint).toBeVisible();
      await expect(hint.locator("svg:visible")).toHaveCount(1);
      await expect(
        hint.getByRole("button", { name: language === "ar" ? "إخفاء إرشادات العد" : "Hide counting guidance" }),
      ).toHaveAttribute("aria-expanded", "true");
      await expect(async () => {
        const hintBox = (await hint.boundingBox())!;
        const supportBox = (await actions.boundingBox())!;
        const panelBox = (await page.getByTestId("counter-panel").boundingBox())!;
        if (width < 768) expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(supportBox.y);
        else expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(hintBox.y);
        // The tool group uses the space beside the primary on wide canvases.
        const dockBox = (await page.getByTestId("reader-dock").boundingBox())!;
        expect(supportBox.x).toBeGreaterThanOrEqual(dockBox.x);
        expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(dockBox.x + dockBox.width + 1);
        const lines = await hint.locator("span[aria-hidden]").evaluate((element) => {
          const visible = Array.from(element.querySelectorAll("span")).find(
            (child) => getComputedStyle(child).display !== "none",
          )!;
          const range = document.createRange();
          range.selectNodeContents(visible);
          return range.getClientRects().length;
        });
        expect(lines).toBe(1);
        expect(await hint.evaluate((element) => element.closest('[data-testid="reader-dock"]') === null)).toBe(true);
        for (const button of await actions.getByRole("button").all()) {
          const box = await button.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          expect(box!.width).toBeGreaterThanOrEqual(44);
        }
        const box = await counter.boundingBox();
        expect(box).not.toBeNull();
        expect(Math.round(box!.height)).toBe(48);
        const surfaceRadius = await counter.evaluate((element) => getComputedStyle(element).borderRadius);
        const padding = [];
        for (const button of await actions.getByRole("button").all()) {
          const style = await button.evaluate((element) => ({
            radius: getComputedStyle(element).borderRadius,
            left: getComputedStyle(element).paddingLeft,
            right: getComputedStyle(element).paddingRight,
          }));
          expect(style.radius).toBe(surfaceRadius);
          expect(style.left).toBe(style.right);
          padding.push(style.left);
        }
        expect(new Set(padding).size).toBe(1);
        if (width < 768) {
          const navigation = page.getByTestId("counter-panel").locator("button:not([data-counter-variant])");
          const navigationWidths = [];
          for (const [position, button] of (await navigation.all()).entries()) {
            const navigationBox = (await button.boundingBox())!;
            navigationWidths.push(Math.round(navigationBox.width));
            expect(Math.round(navigationBox.height)).toBe(Math.round(box!.height));
            expect(Math.abs(navigationBox.y - box!.y)).toBeLessThanOrEqual(1);
            expect(await button.evaluate((element) => getComputedStyle(element).borderRadius)).toBe(surfaceRadius);
            if (width >= 360) {
              const iconBox = (await button.locator("svg").boundingBox())!;
              const labelBox = (await button.locator("span").boundingBox())!;
              const outerLeft = language === "ar" ? position === 1 : position === 0;
              if (outerLeft) {
                expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(labelBox.x);
              } else {
                expect(iconBox.x).toBeGreaterThanOrEqual(labelBox.x + labelBox.width);
              }
            }
          }
          expect(new Set(navigationWidths).size).toBe(1);
          const supportBox = (await actions.boundingBox())!;
          expect(box!.y).toBeGreaterThanOrEqual(supportBox.y + supportBox.height);
        } else {
          for (const button of await page.getByTestId("reader-side-navigation").getByRole("button").all()) {
            const geometry = await button.evaluate((element) => {
              const style = getComputedStyle(element);
              return {
                left: style.paddingLeft,
                right: style.paddingRight,
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height,
              };
            });
            expect(geometry.left).toBe("20px");
            expect(geometry.right).toBe("20px");
            expect(geometry.width).toBeCloseTo(112, 0);
            expect(geometry.height).toBeCloseTo(48, 0);
          }
        }
      }).toPass({ timeout: 15000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `output/playwright/footer-redesign/reader-${language}-${width}.png` });
      if (width === 1440) {
        await hint.click();
        await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
        await page.getByTestId("reader-share-dock-button").click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(counter).toHaveAttribute("aria-label", language === "en" ? /1 \/ 100$/ : /١ \/ ١٠٠$/);
        await page.keyboard.press("Escape");
        await expect(page.getByTestId("reader-share-dock-button")).toBeFocused();
        const scan = await new AxeBuilder({ page })
          .include('[data-testid="reader-dock"]')
          .include('[data-testid="counter-tap-hint"]')
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
        for (const [route, testId] of [
          ["counter", "custom-counter-surface"],
          ["friday/salawat", "salawat-counter"],
        ]) {
          await page.goto(`/#/${route}`);
          const surface = page.getByTestId(testId);
          await expect(surface).toBeVisible();
          await expect(page.getByTestId("counter-tap-hint")).toBeVisible();
          const hintBox = (await page.getByTestId("counter-tap-hint").boundingBox())!;
          const dockBox = (await page.getByTestId("reader-dock").boundingBox())!;
          expect(dockBox.y + dockBox.height).toBeLessThanOrEqual(hintBox.y);
          expect(Math.round((await surface.boundingBox())!.height)).toBe(48);
          await page.screenshot({ path: `output/playwright/footer-redesign/${testId}-${language}.png` });
        }
      }
    });
  }
}

for (const themeMode of ["light", "dark", "midnight"] as const) {
  test(`devotional footer hierarchy remains readable in ${themeMode}`, async ({ page }) => {
    await page.addInitScript((themeMode) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", themeMode, reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { isGuest: true },
        }),
      );
    }, themeMode);
    await page.setViewportSize({ width: 390, height: 844 });
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
    await page.goto(`/#/azkar/morning/${index + 1}`);
    const counter = page.getByTestId("counter-surface");
    await expect(counter).toBeVisible();
    await counter.click();
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="reader-dock"]')
      .include('[data-testid="counter-tap-hint"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: `output/playwright/footer-redesign/reader-${themeMode}-ar-390.png` });
    const box = (await counter.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    const pressedScan = await new AxeBuilder({ page })
      .include('[data-testid="counter-surface"]')
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    await page.mouse.up();
    expect(pressedScan.violations).toEqual([]);
  });
}

test("Reader footer preserves reachable controls with enlarged Arabic text", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "light", reduceMotion: true, textSize: "large" },
        profile: { isGuest: true },
      }),
    );
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#/azkar/waking-up/1");
  await expect(page.getByTestId("counter-surface")).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  for (const button of await page.getByTestId("reader-dock").getByRole("button").all()) {
    if (!(await button.isVisible())) continue;
    await button.scrollIntoViewIfNeeded();
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    // Check text boxes rather than decorative pseudo-elements: the ready ring
    // deliberately scales beyond the button while its opacity falls to zero.
    for (const label of await button.locator("span").all()) {
      const dimensions = await label.evaluate((element) => ({
        text: element.textContent,
        scroll: element.scrollWidth,
        client: element.clientWidth,
      }));
      if (dimensions.client > 0) {
        expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.client + 1);
      }
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "output/playwright/footer-redesign/reader-light-ar-enlarged.png" });
});
