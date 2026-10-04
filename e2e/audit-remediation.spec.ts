import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const themeMode of ["light", "midnight", "dark"] as const) {
  test(`@cross-browser ${themeMode} menu keyboard focus uses a quiet readable surface`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((themeMode) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "en", themeMode, reduceMotion: false, hapticFeedback: false },
          profile: { isGuest: true },
        }),
      );
    }, themeMode);
    await page.goto("/#/counter");
    const trigger = page.getByRole("button", { name: "More options" });
    await trigger.click();
    await page.keyboard.press("ArrowDown");
    const focused = page.locator(
      '[role="menuitem"]:focus, [role="menuitemcheckbox"]:focus, [role="menuitemradio"]:focus',
    );
    await expect(focused).toHaveCount(1);
    const colors = await focused.evaluate((element) => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--muted)";
      probe.style.color = "var(--foreground)";
      element.append(probe);
      const expected = getComputedStyle(probe);
      const actual = getComputedStyle(element);
      const result = {
        actual: [actual.backgroundColor, actual.color],
        expected: [expected.backgroundColor, expected.color],
      };
      probe.remove();
      return result;
    });
    expect(colors.actual).toEqual(colors.expected);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`menu-${themeMode}.png`) });
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

test("@cross-browser in-app reduced motion covers celebration pseudo-elements with OS motion enabled", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/counter");
  await expect(page.getByRole("heading", { name: "Masbaha", exact: true })).toBeVisible();
  const durations = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "celebration-pop celebration-glow nav-active-cue";
    document.body.append(probe);
    const result = [getComputedStyle(probe).animationDuration, getComputedStyle(probe, "::before").animationDuration];
    probe.remove();
    return result.map((duration) => Number.parseFloat(duration));
  });
  for (const duration of durations) expect(duration).toBeLessThanOrEqual(0.1);
});
