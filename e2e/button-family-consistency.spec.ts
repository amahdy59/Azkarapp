import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";
import { dashboardText } from "../src/app/i18n/progressDashboard";

for (const scenario of [
  { language: "ar", width: 390, height: 844, enlarged: false, material: "glass", theme: "midnight" },
  { language: "en", width: 320, height: 720, enlarged: true, material: "solid", theme: "light" },
  { language: "ar", width: 600, height: 800, enlarged: true, material: "glass", theme: "dark" },
  { language: "en", width: 1440, height: 900, enlarged: false, material: "solid", theme: "light" },
] as const) {
  test(`configuration pill family ${scenario.language}-${scenario.width}-${scenario.material} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((scenario) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: scenario.language,
            appMaterial: scenario.material,
            themeMode: scenario.theme,
            reduceMotion: true,
          },
        }),
      );
    }, scenario);
    const paint = (target: Locator) =>
      target.evaluate((node) => {
        const s = getComputedStyle(node);
        return { fill: s.backgroundColor, border: s.borderColor, width: s.borderWidth, radius: s.borderRadius };
      });
    const verifyAction = async (button: Locator) => {
      await button.scrollIntoViewIfNeeded();
      await expect(button).toHaveAttribute("data-variant", "pill");
      await expect(button).toHaveAttribute("data-size", "pill");
      const geometry = await button.evaluate((node) => {
        const r = node.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {
          width: r.width,
          height: r.height,
          contained: r.left >= -1 && r.right <= innerWidth + 1,
          hit: hit === node || node.contains(hit),
          overflow: node.scrollWidth - node.clientWidth,
        };
      });
      expect(geometry.width).toBeGreaterThanOrEqual(44);
      expect(geometry.height).toBeGreaterThanOrEqual(54);
      expect(geometry.contained).toBe(true);
      expect(geometry.hit).toBe(true);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      await button.focus();
      // Enter from the preceding control. Firefox keeps focus on the last
      // document button when Tab hands control to browser chrome.
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      const ring = await button.evaluate((node) => {
        const s = getComputedStyle(node);
        return { shadow: s.boxShadow, outline: s.outlineStyle };
      });
      expect(ring.shadow !== "none" || ring.outline !== "none").toBe(true);
    };
    await page.goto("/#/progress");
    const choose = page.getByTestId("progress-choose-metrics");
    await expect(choose).toBeVisible();
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    await verifyAction(choose);
    await page.mouse.move(0, 0);
    expect(await paint(choose)).toEqual(await paint(page.locator(".progress-view-tabs")));
    const icon = await choose.locator("svg").boundingBox();
    expect(icon!.width).toBe(scenario.enlarged ? 40 : 20);
    expect(icon!.height).toBe(scenario.enlarged ? 40 : 20);
    await page.screenshot({ path: info.outputPath("progress-pill-choose.png") });
    await page.keyboard.press("Enter");
    const dialog = page.getByTestId("progress-metric-dialog");
    await expect(dialog).toBeVisible();
    const apply = dialog.getByRole("button", { name: dashboardText(scenario.language, "apply"), exact: true });
    const cancel = dialog.getByRole("button", { name: dashboardText(scenario.language, "cancel"), exact: true });
    await expect(apply).toHaveAttribute("data-variant", "default");
    await expect(cancel).toHaveAttribute("data-variant", "pill");
    await expect(apply).toHaveAttribute("data-size", "pill");
    for (const checkbox of await dialog.getByRole("checkbox").all())
      if (await checkbox.isChecked()) await checkbox.uncheck();
    await expect(apply).toBeDisabled();
    await cancel.click();
    await expect(dialog).toBeHidden();
    await expect(choose).toHaveAttribute("aria-expanded", "false");
    await expect(choose).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(choose).toBeFocused();
    await page.emulateMedia({ forcedColors: "active" });
    await choose.focus();
    await expect(choose).toHaveCSS("border-top-style", "solid");
    await page.emulateMedia({ forcedColors: "none" });
    await page.goto("/#/quran-wird");
    const edit = page.getByTestId("wird-edit-plan");
    await expect(edit).toBeAttached();
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    await verifyAction(edit);
    const quranPaint = await paint(edit);
    await page.screenshot({ path: info.outputPath("quran-pill-edit.png") });
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect
      .poll(() => page.getByRole("dialog").evaluate((node) => node.contains(document.activeElement)))
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(edit).toBeFocused();
    await page.goto("/#/settings/notifications");
    const location = page.getByRole("button", { name: t(scenario.language, "readiness.changeLocation"), exact: true });
    await expect(location).toBeAttached();
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    await verifyAction(location);
    await page.mouse.move(0, 0);
    expect(await paint(location)).toEqual(quranPaint);
    await page.screenshot({ path: info.outputPath("settings-pill-location.png") });
  });
}

test("pill actions keep stationary ink and geometry with both motion preferences @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", appMaterial: "glass", themeMode: "midnight", reduceMotion: false },
      }),
    );
  });
  await page.goto("/#/progress");
  const action = page.getByTestId("progress-choose-metrics");
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  const ink = await action.evaluate((node) => getComputedStyle(node).color);
  await action.hover();
  await expect(action).toHaveCSS("filter", "none");
  await expect(action).toHaveCSS("opacity", "1");
  await expect(action).toHaveCSS("color", ink);
  expect(await action.boundingBox()).toEqual(box);
  await page.screenshot({ path: info.outputPath("pill-action-hover.png") });
  await page.locator("html").evaluate((node) => node.classList.add("reduce-motion"));
  await expect(action.locator("svg")).toHaveCSS("scale", "1");
  await page.locator("html").evaluate((node) => node.classList.remove("reduce-motion"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(action.locator("svg")).toHaveCSS("scale", "1");
  expect(await action.boundingBox()).toEqual(box);
});
