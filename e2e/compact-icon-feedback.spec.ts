import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

for (const language of ["ar", "en"] as const) {
  test(`Home sheet icon feedback matches its type and stays cancellable in ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: false, themeMode: "light" }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/home");
    const opener = page.getByTestId("home-header-routine-summary-mobile");
    await expect(opener).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await opener.click();
    const sheet = page.getByTestId("todays-path-sheet");
    const close = sheet.getByTestId("modal-close-button");
    await close.hover();
    await page.mouse.down();
    await expect
      .poll(() =>
        close.evaluate((node) => {
          const value = getComputedStyle(node).transform;
          return value === "none" ? 1 : new DOMMatrixReadOnly(value).a;
        }),
      )
      .toBeCloseTo(0.92, 2);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expect(sheet).toBeVisible();
    await close.focus();
    await page.keyboard.down(" ");
    await expect(close).toHaveAttribute("data-key-pressed");
    await expect
      .poll(() =>
        close.evaluate((node) => {
          const value = getComputedStyle(node).transform;
          return value === "none" ? 1 : new DOMMatrixReadOnly(value).a;
        }),
      )
      .toBeCloseTo(0.92, 2);
    await page.keyboard.up(" ");
    await expect(sheet).toBeHidden();
    await expect(opener).toBeFocused();
    await opener.click();
    for (const reduced of ["app", "os"] as const) {
      await page.evaluate(
        (reduced) => document.documentElement.classList.toggle("reduce-motion", reduced === "app"),
        reduced,
      );
      await page.emulateMedia({ reducedMotion: reduced === "os" ? "reduce" : "no-preference" });
      await close.focus();
      await page.keyboard.down(" ");
      await expect(close).toHaveCSS("transform", "none");
      await expect(close).toHaveCSS("opacity", "0.88");
      await close.evaluate((node) => node.blur());
      await page.keyboard.up(" ");
      await expect(close).not.toHaveAttribute("data-key-pressed");
      await expect(sheet).toBeVisible();
    }
    await close.click();
    await expect(sheet).toBeHidden();
    await expect(opener).toBeFocused();
  });
}
