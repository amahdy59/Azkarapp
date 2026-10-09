import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`collection panel resizes, restores and uses a drawer in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./#/azkar/morning/2");
    const panel = page.getByTestId("reader-collection-navigator");
    const toggle = page.getByTestId("reader-sidebar-toggle");
    const handle = page.getByTestId("reader-sidebar-resizer");
    await expect(panel).toBeVisible();
    await expect(toggle).toBeHidden();
    await expect(handle).toHaveAttribute("aria-valuenow", "420");
    const before = await page.getByTestId("reader-screen").getAttribute("data-zikr-index");
    await handle.focus();
    await page.keyboard.press(language === "ar" ? "ArrowRight" : "ArrowLeft");
    await expect(handle).toHaveAttribute("aria-valuenow", "436");
    const expanded = panel
      .getByRole("button", { name: language === "ar" ? "عرض الذكر كاملاً" : "Expand dhikr", exact: true })
      .first();
    await expanded.click();
    await expect(
      panel.getByRole("button", { name: language === "ar" ? "طي الذكر" : "Collapse dhikr", exact: true }).first(),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", before!);
    await handle.focus();
    await page.keyboard.press("End");
    const maximum = Number(await handle.getAttribute("aria-valuemax"));
    await expect(handle).toHaveAttribute("aria-valuenow", String(maximum));
    const workspace = (await page.getByTestId("reader-workspace").boundingBox())!;
    const panelBox = (await panel.boundingBox())!;
    expect(workspace.width - panelBox.width - 12).toBeGreaterThanOrEqual(480);
    await page.setViewportSize({ width: 1200, height: 900 });
    await expect.poll(async () => Number(await handle.getAttribute("aria-valuemax"))).toBeLessThan(maximum);
    await expect(handle).toHaveAttribute("aria-valuenow", (await handle.getAttribute("aria-valuemax"))!);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(handle).toHaveAttribute("aria-valuenow", String(maximum));
    await handle.focus();
    await page.keyboard.press("Home");
    await expect(handle).toHaveAttribute("aria-valuenow", "380");
    const grip = (await handle.boundingBox())!;
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2 + (language === "ar" ? 64 : -64), grip.y + grip.height / 2);
    await page.mouse.up();
    await expect(handle).toHaveAttribute("aria-valuenow", "444");
    await page.getByTestId("reader-sidebar-close").click();
    await expect(panel).not.toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(toggle).toBeHidden();
    await expect(page.getByTestId("reader-sidebar-close")).toBeFocused();
    await expect(handle).toHaveAttribute("aria-valuenow", "444");
    await expect(
      panel.getByRole("button", { name: language === "ar" ? "طي الذكر" : "Collapse dhikr", exact: true }).first(),
    ).toHaveAttribute("aria-expanded", "true");
    await handle.dblclick();
    await expect(handle).toHaveAttribute("aria-valuenow", "420");
    await handle.focus();
    await page.keyboard.press("Enter");
    await expect(panel).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.screenshot({ path: testInfo.outputPath(`${language}-resizable-panel.png`) });
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="reader-collection-navigator"]')
      .include('[data-testid="reader-sidebar-resizer"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.setViewportSize({ width: 820, height: 900 });
    await expect(panel).not.toBeVisible();
    await toggle.click();
    const drawer = page.getByTestId("reader-collection-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId("reader-collection-navigator")).toBeVisible();
    await expect(handle).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await page.setViewportSize({ width: 390, height: 700 });
    await page
      .getByRole("button", { name: language === "ar" ? "خيارات القارئ" : "Reader options", exact: true })
      .click();
    await page
      .getByRole("menuitem", { name: language === "ar" ? "عرض القائمة الجانبية" : "Show sidebar", exact: true })
      .click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("data-side", language === "ar" ? "left" : "right");
    await page.screenshot({ path: testInfo.outputPath(`${language}-collection-drawer.png`) });
    await page.getByTestId("reader-sidebar-close").click();
    await expect(drawer).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: language === "ar" ? "خيارات القارئ" : "Reader options", exact: true }),
    ).toBeFocused();
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-index", before!);
  });
}
