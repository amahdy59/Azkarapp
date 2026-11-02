import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const mode of ["default", "app", "os"] as const) {
  test(`shared card arrival and focus respect ${mode} motion @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
    await page.addInitScript((reduceMotion) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "en", themeMode: "midnight", appMaterial: "glass", reduceMotion },
          profile: { isGuest: true },
        }),
      );
    }, mode === "app");
    await page.goto("/#/progress");
    const card = page.getByTestId("progress-metric-prayers");
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("animation-name", "fade-in");
    const duration = await card.evaluate((node) => parseFloat(getComputedStyle(node).animationDuration));
    if (mode === "default") expect(duration).toBe(0.26);
    else expect(duration).toBeLessThanOrEqual(0.001);
    const action = card.getByRole("button");
    await action.focus();
    await expect(action).toBeFocused();
    expect(await action.evaluate((node) => getComputedStyle(node, "::after").outlineStyle)).toBe("solid");
    // Ordinary disclosure state must not replay the mounted cards' arrival.
    await card.evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.ready)));
    const arrivals = await card.evaluate((node) => node.getAnimations().map((animation) => animation.startTime));
    await page.getByTestId("progress-filters-toggle").click();
    await expect(page.getByTestId("progress-filter-sheet")).toBeVisible();
    expect(await card.evaluate((node) => node.getAnimations().map((animation) => animation.startTime))).toEqual(
      arrivals,
    );
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("progress-filters-toggle")).toBeFocused();
    await page.goto("/#/settings");
    await expect(page.locator(".surface-card-finish").first()).toHaveCSS("border-top-left-radius", "28px");
    await page.screenshot({ path: info.outputPath(`shared-motion-${mode}.png`), scale: "css" });
  });
}

for (const appearance of [
  { language: "ar", width: 390, material: "solid", theme: "light" },
  { language: "en", width: 320, material: "solid", theme: "light", enlarged: true },
  { language: "ar", width: 834, material: "glass", theme: "midnight" },
  { language: "en", width: 1440, material: "solid", theme: "dark" },
  { language: "ar", width: 320, material: "glass", theme: "light", contrast: true, enlarged: true },
  { language: "en", width: 390, material: "glass", theme: "dark", opaque: true },
  { language: "en", width: 390, material: "solid", theme: "light", forced: true },
] as const) {
  const settings = {
    language: appearance.language,
    appMaterial: appearance.material,
    themeMode: appearance.theme,
    reduceMotion: true,
    highContrast: "contrast" in appearance,
    reduceTransparency: "opaque" in appearance,
  };
  const enlarged = "enlarged" in appearance;
  test(`shared finishes and stationary filters ${appearance.language}-${appearance.width}-${appearance.theme}-${settings.highContrast ? "contrast" : settings.reduceTransparency ? "opaque" : "forced" in appearance ? "forced" : appearance.material} @cross-browser`, async ({
    page,
    browserName,
  }, info) => {
    await page.setViewportSize({ width: appearance.width, height: 844 });
    // Exercise the ordinary finish even when Windows requests an opaque UI.
    if (browserName === "chromium") {
      const session = await page.context().newCDPSession(page);
      await session.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
      });
    }
    if ("forced" in appearance) await page.emulateMedia({ forcedColors: "active" });
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings, profile: { isGuest: true }, wirdHistory: { "2026-10-20": [1, 2] } }),
      );
    }, settings);
    await page.goto("/#/progress");
    if (enlarged) await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    const card = page.getByTestId("progress-metric-prayers");
    const opener = page.getByTestId("progress-filters-toggle");
    await page.evaluate(() => document.fonts.ready);
    await expect(opener).toHaveCount(1);
    await expect(page.getByRole("combobox", { name: /Date range|نطاق التاريخ/ })).toHaveCount(0);
    await expect(card).toHaveAttribute("data-material-card");
    expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect(
      await card.evaluate((node) => parseFloat(getComputedStyle(node).borderTopLeftRadius)),
    ).toBeGreaterThanOrEqual(enlarged ? 56 : 28);
    const anatomy = await card.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const icon = node.querySelector(".progress-practice-icon")!.getBoundingClientRect();
      const label = node.querySelector(".progress-metric-label")!.getBoundingClientRect();
      const quantity = node.querySelector(".progress-metric-quantity")!.getBoundingClientRect();
      const focus = node.querySelector("button")!;
      const compact = getComputedStyle(focus).flexDirection === "row";
      return {
        aligned: compact
          ? Math.abs(icon.y + icon.height / 2 - label.y - label.height / 2) <= 1 &&
            (icon.right <= label.left || label.right <= icon.left)
          : Math.abs(icon.x + icon.width / 2 - bounds.x - bounds.width / 2) <= 1,
        quantityBelow: quantity.y >= icon.bottom,
        focusRadius:
          getComputedStyle(focus, "::after").borderTopLeftRadius === getComputedStyle(node).borderTopLeftRadius,
      };
    });
    expect(anatomy).toEqual({ aligned: true, quantityBelow: true, focusRadius: true });
    expect(
      await page
        .locator(".progress-metric-card .progress-practice-icon svg")
        .evaluateAll((icons) =>
          icons.every(
            (icon) =>
              icon.getAttribute("viewBox") === "0 0 24 24" &&
              icon.getAttribute("stroke-width") === "2" &&
              icon.getAttribute("stroke-linecap") === "round" &&
              icon.getAttribute("stroke-linejoin") === "round" &&
              icon.getAttribute("fill") === "none" &&
              icon.getAttribute("aria-hidden") === "true",
          ),
        ),
    ).toBe(true);
    const osOpaque = await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches);
    const still = settings.highContrast || settings.reduceTransparency || osOpaque || "forced" in appearance;
    await expect(opener).toHaveCSS("background-image", still ? "none" : /linear-gradient/);
    const before = (await card.boundingBox())!;
    await opener.click();
    const sheet = page.getByTestId("progress-filter-sheet");
    await expect(sheet).toHaveRole("dialog");
    await expect(sheet).toHaveCSS("background-color", /^rgb\(/);
    const during = (await card.boundingBox())!;
    expect(Math.abs(during.y - before.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(during.height - before.height)).toBeLessThanOrEqual(1);
    const picker = sheet.getByRole("combobox");
    await picker.click();
    const menu = page.getByRole("listbox");
    await expect(menu).toHaveAttribute("data-dropdown-surface");
    await expect(menu).toHaveCSS("background-color", /^rgb\(/);
    await expect
      .poll(() =>
        menu.evaluate((node) => {
          const bounds = node.getBoundingClientRect();
          return node.contains(
            document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + Math.min(20, bounds.height / 2)),
          );
        }),
      )
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(picker).toBeFocused();
    await page.screenshot({ path: info.outputPath("progress-filter.png"), scale: "css" });
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="progress-filter-sheet"]').analyze()).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    expect(Math.abs((await card.boundingBox())!.y - before.y)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("progress-cards.png"), scale: "css" });
    await page.goto("/#/azkar");
    const library = page.getByTestId("library-filter-disclosure");
    const trigger = library.locator(".responsive-filter-trigger");
    if (appearance.width < 600) {
      const bounds = (await page.getByTestId("category-card-morning").boundingBox())!;
      await trigger.click();
      const filters = page.getByTestId("library-filter-disclosure-sheet");
      await expect(filters).toHaveRole("dialog");
      await expect(filters).toHaveCSS("background-color", /^rgb\(/);
      expect(
        Math.abs((await page.getByTestId("category-card-morning").boundingBox())!.y - bounds.y),
      ).toBeLessThanOrEqual(1);
      await filters.getByRole("textbox").fill(appearance.language === "ar" ? "النوم" : "sleep");
      const results = filters.getByRole("button", { name: t(appearance.language, "library.showResults"), exact: true });
      await results.scrollIntoViewIfNeeded();
      await expect(results).toBeInViewport({ ratio: 0.99 });
      expect(await filters.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: info.outputPath("library-filter.png"), scale: "css" });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="library-filter-disclosure-sheet"]').analyze())
          .violations,
      ).toEqual([]);
      await results.click();
      await expect(trigger).toBeFocused();
      await expect(trigger).toContainText(appearance.language === "ar" ? "النوم" : "sleep");
      await trigger.click();
      await expect(filters.getByRole("textbox")).toHaveValue(appearance.language === "ar" ? "النوم" : "sleep");
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    } else {
      await expect(library.getByRole("textbox")).toBeVisible();
      await expect(trigger).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
