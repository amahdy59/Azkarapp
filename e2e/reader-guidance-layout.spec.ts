import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`combined Reader guidance preserves text and focus in ${language} @cross-browser`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/azkar/morning/2");
    const hint = page.getByTestId("counter-tap-hint");
    const help = page.getByRole("button", {
      name: language === "ar" ? "اختصارات لوحة المفاتيح" : "Keyboard shortcuts",
      exact: true,
    });
    const next = page.getByRole("button", { name: language === "ar" ? "التالي" : "Next", exact: true });
    for (const width of [390, 820, 1200, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId("counter-surface")).toBeVisible();
      await expect(hint).toBeVisible();
      await expect(page.getByTestId("reader-keyboard-shortcuts")).toHaveCount(0);
      await expect(page.getByTestId("reader-side-navigation")).toHaveCount(0);
      if (width >= 768) {
        await expect(help).toBeVisible();
        await expect(hint).toContainText(language === "ar" ? "المسافة" : "Space");
        await help.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText("Space");
        await expect(dialog).toContainText("Esc");
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(help).toBeFocused();
        await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", "1");
      } else await expect(help).not.toBeVisible();
      const [text, counter, nav] = await Promise.all([
        page.getByRole("region", { name: language === "ar" ? "نص الذكر" : "Zikr reading text" }).boundingBox(),
        page.getByTestId("counter-surface").boundingBox(),
        next.boundingBox(),
      ]);
      expect(text).not.toBeNull();
      expect(counter).not.toBeNull();
      expect(nav).not.toBeNull();
      expect(Math.abs(counter!.y - nav!.y)).toBeLessThanOrEqual(1);
      expect(text!.y + text!.height).toBeLessThanOrEqual(counter!.y);
      if (width >= 1200) {
        const panel = page.getByTestId("reader-collection-navigator");
        await expect(panel).toBeVisible();
        const panelBox = (await panel.boundingBox())!;
        const toggle = page.getByTestId("reader-sidebar-toggle");
        const toolbar = page.getByTestId("reader-header-toolbar");
        await expect(toolbar.getByTestId("reader-sidebar-toggle")).toBeHidden();
        const menu = page.getByRole("button", {
          name: language === "ar" ? "خيارات القارئ" : "Reader options",
          exact: true,
        });
        const [toolbarBox, headingBox] = await Promise.all([
          toolbar.boundingBox(),
          page.getByRole("heading", { level: 1 }).boundingBox(),
        ]);
        expect(toolbarBox!.y + toolbarBox!.height).toBeLessThanOrEqual(headingBox!.y);
        expect(text!.width).toBeGreaterThanOrEqual(350);
        expect(language === "ar" ? panelBox.x + panelBox.width <= text!.x : text!.x + text!.width <= panelBox.x).toBe(
          true,
        );
        await page.getByTestId("reader-sidebar-close").click();
        await expect(panel).not.toBeVisible();
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        const [toggleBox, menuBox] = await Promise.all([toggle.boundingBox(), menu.boundingBox()]);
        expect(toggleBox!.width).toBeGreaterThanOrEqual(44);
        expect(
          Math.max(toggleBox!.x, menuBox!.x) - Math.min(toggleBox!.x + toggleBox!.width, menuBox!.x + menuBox!.width),
        ).toBeGreaterThanOrEqual(8);
        await toggle.click();
        await expect(panel).toBeVisible();
        await page.getByTestId("reader-sidebar-close").click();
        await expect(toggle).toBeFocused();
        await expect(panel).not.toBeVisible();
        await toggle.click();
        await expect(panel).toBeVisible();
      }
      await page.screenshot({ path: `output/playwright/reader-guidance/${language}-${width}.png` });
    }
    await page.setViewportSize({ width: 820, height: 700 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(next).toBeVisible();
    await expect(help).toBeVisible();
    await help.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(help).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 900 });
    const panel = page.getByTestId("reader-collection-navigator");
    await expect(panel).toBeVisible();
    const [heading, close] = await Promise.all([
      panel
        .getByRole("heading", { level: 2, name: (await panel.getAttribute("aria-label"))!, exact: true })
        .boundingBox(),
      page.getByTestId("reader-sidebar-close").boundingBox(),
    ]);
    expect(
      Math.max(heading!.x, close!.x) - Math.min(heading!.x + heading!.width, close!.x + close!.width),
    ).toBeGreaterThanOrEqual(8);
    await expect(page.getByTestId("reader-sidebar-toggle")).toBeHidden();
    await page.getByTestId("reader-sidebar-close").click();
    const [toggle, menu] = await Promise.all([
      page.getByTestId("reader-sidebar-toggle").boundingBox(),
      page
        .getByTestId("reader-hero-actions")
        .getByRole("button", {
          name: language === "ar" ? "خيارات القارئ" : "Reader options",
          exact: true,
        })
        .boundingBox(),
    ]);
    expect(
      Math.max(toggle!.x, menu!.x) - Math.min(toggle!.x + toggle!.width, menu!.x + menu!.width),
    ).toBeGreaterThanOrEqual(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(next.locator("span")).toBeHidden();
    expect((await next.boundingBox())!.height).toBeLessThanOrEqual(97);
    await page.screenshot({ path: `output/playwright/reader-guidance/${language}-1440-enlarged.png` });
  });
}
