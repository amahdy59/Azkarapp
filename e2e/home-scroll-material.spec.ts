import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("scrolled Home protects gaps with one continuous ground and preserves fallbacks", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", homeMaterial: "system", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  const sticky = page.getByTestId("home-sticky-prayers");
  await sticky.locator("..").evaluate((node) => {
    node.scrollTop = 150;
  });
  await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
  await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
  expect(
    await sticky.evaluate((node) =>
      Number(getComputedStyle(node).backgroundColor.match(/(?:,|\/)\s*([\d.]+)\s*\)$/)?.[1] ?? 1),
    ),
  ).toBeGreaterThanOrEqual(0.88);
  for (const card of await sticky.locator(".hero-glass.home-glass-surface").all())
    await expect(card).toHaveCSS("backdrop-filter", "none");
  const ground = await sticky.boundingBox();
  const header = await page.getByTestId("home-utility-header").boundingBox();
  expect(ground!.width).toBe(header!.width);
  expect(ground!.x).toBe(header!.x);
  await page.screenshot({ path: testInfo.outputPath("scrolled-protected-frost.png"), scale: "css" });
  expect((await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations).toEqual(
    [],
  );
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.querySelector(".home-photo-canvas")?.classList.add("home-force-glass"));
  await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
  for (const card of await sticky.locator(".hero-glass.home-glass-surface").all())
    await expect(card).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.documentElement.classList.add("high-contrast"));
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.documentElement.classList.remove("high-contrast"));
  await page.emulateMedia({ forcedColors: "active" });
  await expect(sticky).toHaveCSS("backdrop-filter", "none");
});
