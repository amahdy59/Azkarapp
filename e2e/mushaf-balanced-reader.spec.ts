import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const scenario of [
  { language: "ar", width: 390, height: 844, enlarged: false, owner: "wird", focusMode: true },
  { language: "ar", width: 390, height: 844, enlarged: false, owner: "wird" },
  { language: "en", width: 320, height: 800, enlarged: true, owner: "wird" },
  { language: "ar", width: 1440, height: 1000, enlarged: false, owner: "wird" },
  { language: "en", width: 1920, height: 1080, enlarged: false, owner: "surah" },
] as const) {
  test(`balanced Mushaf page, theme status and index ${scenario.owner}-${scenario.language}-${scenario.width}-${"focusMode" in scenario ? "focus" : "normal"} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario);
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            mushafTheme: "midnight",
            appMaterial: "glass",
            reduceMotion: true,
          },
          profile: { isGuest: true },
          khatmahPage: 7,
        }),
      );
    }, scenario.language);
    await page.goto(scenario.owner === "wird" ? "/#/quran/7" : "/#/azkar/friday-kahf/1");
    if (scenario.owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    if ("focusMode" in scenario) {
      await page.getByTestId("mushaf-more-actions").click();
      await page.getByTestId("mushaf-focus-enter").click();
      await expect(page.getByTestId("mushaf-focus-exit")).toBeVisible();
    }
    const reader = page.locator(".mushaf-reader-viewer");
    const canvas = reader.locator("[data-mushaf-page]").first();
    await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(15);
    if (scenario.owner === "surah") await expect(reader.locator("[data-mushaf-page]")).toHaveCount(2);
    await expect(canvas.locator("[data-mushaf-line-content]").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const words = await canvas.locator("[data-mushaf-column]").textContent();
    if (scenario.width >= 1024) {
      await expect.poll(() => canvas.evaluate((n) => n.getBoundingClientRect().width)).toBeLessThanOrEqual(576);
      const geometry = await reader.locator(".mushaf-paper").evaluate((paper) => {
        const r = paper.getBoundingClientRect(),
          c = paper.querySelector("[data-mushaf-page]")!.getBoundingClientRect();
        return { center: Math.abs((c.top + c.bottom - r.top - r.bottom) / 2), height: c.height, width: c.width };
      });
      expect(geometry.center).toBeLessThanOrEqual(2);
      expect(geometry.height).toBeLessThanOrEqual(864);
    }
    if (scenario.width < 1024 && !("focusMode" in scenario)) {
      const back = reader.getByTestId("mushaf-corner-top-right").getByRole("button");
      expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const shape = await back.locator("span").first().boundingBox();
      if (shape) expect(shape.width).toBeGreaterThan(shape.height);
    }
    await page.screenshot({ path: info.outputPath("reading.png"), scale: "css" });
    // Keep the existing theme notification visible while measuring its actual paint.
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const paper = reader.locator(".mushaf-paper");
    const r = (await paper.boundingBox())!;
    await paper.dispatchEvent("pointerdown", {
      pointerId: 51,
      button: 0,
      clientX: r.x + r.width / 2,
      clientY: r.y + r.height / 2 + 70,
    });
    await paper.dispatchEvent("pointermove", {
      pointerId: 51,
      clientX: r.x + r.width / 2,
      clientY: r.y + r.height / 2 - 70,
    });
    await paper.dispatchEvent("pointerup", {
      pointerId: 51,
      clientX: r.x + r.width / 2,
      clientY: r.y + r.height / 2 - 70,
    });
    await page.clock.runFor(100);
    const notice = page.getByTestId("mushaf-theme-hud");
    await expect(notice).toHaveAttribute("data-notice-theme", "dark");
    await expect(notice).toHaveCSS(
      "background-color",
      await reader.evaluate((n) => getComputedStyle(n).backgroundColor),
    );
    const separation = await notice.evaluate((node) => {
      const r = node.getBoundingClientRect();
      return [...document.querySelectorAll("[data-mushaf-column]")].every((n) => {
        const c = n.getBoundingClientRect();
        return r.bottom <= c.top || r.top >= c.bottom || r.right <= c.left || r.left >= c.right;
      });
    });
    expect(separation).toBe(true);
    expect(await canvas.locator("[data-mushaf-column]").textContent()).toBe(words);
    await page.screenshot({ path: info.outputPath("theme-status.png"), scale: "css" });
    await page.clock.runFor(3000);
    await expect(notice).toHaveCount(0);
    for (const theme of ["light", "midnight"] as const) {
      const box = (await paper.boundingBox())!;
      const gesture = {
        pointerId: 52,
        button: 0,
        clientX: box.x + box.width / 2,
        clientY: box.y + box.height / 2 + 70,
      };
      await paper.dispatchEvent("pointerdown", gesture);
      await paper.dispatchEvent("pointermove", { ...gesture, clientY: gesture.clientY - 140 });
      await paper.dispatchEvent("pointerup", { ...gesture, clientY: gesture.clientY - 140 });
      await page.clock.runFor(100);
      await expect(notice).toHaveAttribute("data-notice-theme", theme);
      await expect(notice).toHaveCSS(
        "background-color",
        await reader.evaluate((n) => getComputedStyle(n).backgroundColor),
      );
      await expect(notice).toHaveCSS("color", await reader.evaluate((n) => getComputedStyle(n).color));
      await page.screenshot({ path: info.outputPath(`theme-${theme}.png`), scale: "css" });
      await page.clock.runFor(3000);
      await expect(notice).toHaveCount(0);
    }
    await page.clock.resume();
    if ("focusMode" in scenario) await page.getByTestId("mushaf-focus-exit").click();
    const index = page.getByTestId("mushaf-index-modal").or(page.getByTestId("mushaf-index-inline"));
    const opener = reader
      .getByTestId("mushaf-rail-index")
      .or(reader.getByTestId("mushaf-top-center-index"))
      .or(reader.getByTestId("mushaf-furniture-surah-btn"))
      .first();
    await opener.click();
    await expect(index).toBeVisible();
    const grid = index.locator(".mushaf-index-surahs");
    await expect.poll(() => grid.evaluate((n) => getComputedStyle(n).gridTemplateColumns.split(" ").length)).toBe(2);
    const bounds = (await index.boundingBox())!;
    if (scenario.width >= 600) expect(bounds.height).toBeLessThan(scenario.height * 0.8);
    const cards = grid.locator("button");
    const first = (await cards.nth(0).boundingBox())!,
      second = (await cards.nth(1).boundingBox())!;
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
    expect(scenario.language === "ar" ? first.x > second.x : first.x < second.x).toBe(true);
    await expect(index.locator(".mushaf-index-tabs")).toHaveCSS("border-radius", "999px");
    if (scenario.enlarged) await page.locator("html").evaluate((n) => (n.style.fontSize = "200%"));
    expect(await index.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("index.png"), scale: "css" });
    const search = index.getByRole("searchbox");
    await search.fill("114");
    await expect(cards).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(index).toBeHidden();
    await expect(opener).toBeFocused();
    expect((await new AxeBuilder({ page }).include(".mushaf-reader-viewer").analyze()).violations).toEqual([]);
  });
}
