import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function enter(page: Page, language = "ar") {
  await page.route(/\/__browser-test-api(?:\/|\?|$)/, (route) => route.abort());
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", appMaterial: "glass", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
    HTMLMediaElement.prototype.play = function () {
      Object.defineProperty(this, "duration", { configurable: true, value: 120 });
      this.dispatchEvent(new Event("loadedmetadata"));
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    };
  }, language);
}

test("@cross-browser books use readable mobile defaults, full-width text and rem enlargement", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  await page.goto("/#/learn/al-mukhtar/p-60");
  const content = page.getByTestId("learning-content");
  await expect(content).toHaveCSS("font-size", "18px");
  await expect(content.locator(".learn-panel").first()).toHaveCSS("padding-left", "0px");
  const edges = async () =>
    page.evaluate(() => {
      const header = document.querySelector(".learn-reader-header")!,
        footer = document.querySelector(".learn-reader-footer")!;
      const h = getComputedStyle(header),
        f = getComputedStyle(footer);
      return {
        top: h.paddingTop,
        bottom: h.paddingBottom,
        footerTop: f.paddingTop,
        footerBottom: f.paddingBottom,
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
  expect(await edges()).toEqual({ top: "12px", bottom: "12px", footerTop: "12px", footerBottom: "12px", overflow: 0 });
  await page.screenshot({ path: testInfo.outputPath("mobile-book-default.png") });
  await page.locator("html").evaluate((node) => {
    node.style.fontSize = "32px";
  });
  await expect(content).toHaveCSS("font-size", "36px");
  expect((await edges()).overflow).toBe(0);
  const scroll = page.getByTestId("learning-reading-scroll");
  await scroll.focus();
  await page.keyboard.press("End");
  await expect
    .poll(() => scroll.evaluate((node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 2))
    .toBe(true);
  await expect(content.getByText(/جلسات الحج/)).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .include(".learning-reader")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

for (const language of ["ar", "en"]) {
  test(`@cross-browser expanded player has one centered axis and requested options: ${language}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await enter(page, language);
    await page.goto("/#/azkar/evening/1");
    await page.getByTestId("reader-audio-dock-button").click();
    const player = page.getByRole("region", { name: language === "ar" ? "مشغل الصوت" : "Audio player", exact: true });
    await player
      .getByRole("button", { name: language === "ar" ? "توسيع المشغل" : "Expand player", exact: true })
      .click();
    const sidebar = player.getByTestId("audio-options-sidebar");
    await expect(sidebar).toHaveCount(0);
    const geometry = await player.evaluate((root) => {
      const center = (node: Element) => {
        const box = node.getBoundingClientRect();
        return box.x + box.width / 2;
      };
      const layout = root.querySelector(".audio-expanded-layout")!,
        header = root.querySelector(".audio-expanded-header")!,
        reading = root.querySelector(".audio-expanded-reading")!,
        footer = root.querySelector(".audio-expanded-controls")!;
      const surface = root.getBoundingClientRect(),
        h = header.getBoundingClientRect(),
        f = footer.getBoundingClientRect();
      return {
        header: center(header) - center(root),
        reading: center(reading) - center(root),
        footer: center(footer) - center(root),
        top: h.top - surface.top,
        bottom: surface.bottom - f.bottom,
        padding: getComputedStyle(layout).paddingTop,
      };
    });
    expect(Math.abs(geometry.header)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.reading)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.footer)).toBeLessThanOrEqual(1);
    expect(geometry.top).toBe(20);
    expect(geometry.bottom).toBe(20);
    expect(geometry.padding).toBe("20px");
    await page.screenshot({ path: testInfo.outputPath(`centered-player-${language}.png`) });
    const trigger = player.getByRole("button", {
      name: language === "ar" ? "خيارات الصوت" : "Audio options",
      exact: true,
    });
    await trigger.click();
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveAttribute("id", (await trigger.getAttribute("aria-controls"))!);
    await expect(trigger).not.toHaveAttribute("aria-haspopup");
    const s = (await sidebar.boundingBox())!,
      r = (await player.locator(".audio-expanded-reading").boundingBox())!;
    expect(s.x + s.width <= r.x || r.x + r.width <= s.x).toBe(true);
    await sidebar.getByTestId("audio-reciter-select").click();
    const popup = page.getByRole("listbox");
    await expect(popup).toHaveAttribute("data-dropdown-surface", "");
    await page.keyboard.press("Escape");
    await expect(sidebar.getByTestId("audio-reciter-select")).toBeFocused();
    await page.setViewportSize({ width: 1024, height: 844 });
    await expect(sidebar).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(
      page.getByRole("dialog", { name: language === "ar" ? "خيارات الصوت" : "Audio options", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    // Changing the Reader's presentation tier remounts its existing compact
    // dock; playback remains owned by the same controller and recovery is explicit.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(player.getByTestId("reader-audio-expand")).toBeFocused();
    await player.getByTestId("reader-audio-expand").click();
    expect(
      (
        await new AxeBuilder({ page })
          .include(".audio-player-surface")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("@cross-browser ordinary page families share balanced header edge spacing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  for (const hash of ["#/home", "#/azkar", "#/progress", "#/settings", "#/quran-wird"]) {
    await page.goto(`/${hash}`);
    const header = page
      .locator('[data-testid="home-utility-header"], [data-testid="shared-screen-header"], .library-stationary-header')
      .filter({ visible: true })
      .first();
    await expect(header).toHaveCSS("padding-top", "20px");
    await expect(header).toHaveCSS("padding-bottom", "20px");
  }
});
