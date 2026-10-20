import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const language of ["ar", "en"] as const) {
  test(`audio control lock ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      class AudioMock extends EventTarget {
        src = "";
        currentTime = 0;
        duration = 120;
        volume = 1;
        muted = false;
        playbackRate = 1;
        paused = true;
        ended = false;
        constructor() {
          super();
          Object.assign(window, { lockAudio: this });
        }
        load() {
          this.dispatchEvent(new Event("loadedmetadata"));
          this.dispatchEvent(new Event("canplay"));
        }
        play() {
          this.paused = false;
          this.dispatchEvent(new Event("playing"));
          return Promise.resolve();
        }
        pause() {
          this.paused = true;
          this.dispatchEvent(new Event("pause"));
        }
        removeAttribute() {
          this.src = "";
        }
      }
      Object.defineProperty(window, "Audio", { value: AudioMock });
    }, language);
    await page.goto("/#/azkar/evening/1");
    await page.getByTestId("reader-audio-dock-button").click();
    await page.getByTestId("audio-compact-title").click();
    const trigger = page.getByTestId("audio-lock-controls");
    await trigger.click();
    const dialog = page.getByTestId("audio-control-lock");
    await expect(dialog).toBeVisible();
    await expect(page.locator(".audio-lock-shield")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator(".audio-lock-shield")).toHaveCSS("backdrop-filter", "none");
    const lockedSurface = await dialog.boundingBox();
    expect(lockedSurface!.height).toBeLessThan(110);
    expect(lockedSurface!.y).toBeLessThan(50);
    expect(lockedSurface!.y).toBeGreaterThanOrEqual(0);
    expect(lockedSurface!.x).toBeGreaterThanOrEqual(0);
    expect(lockedSurface!.x + lockedSurface!.width).toBeLessThanOrEqual(390);
    await expect(page.getByTestId("audio-player-zikr-text")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { lockAudio: { paused: boolean } }).lockAudio.paused)).toBe(
      false,
    );
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    const unlock = page.getByTestId("audio-unlock");
    await unlock.click();
    await expect(dialog).toBeVisible();
    expect((await new AxeBuilder({ page }).include('[data-testid="audio-control-lock"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: testInfo.outputPath(`audio-lock-${language}.png`) });
    await page.clock.install();
    await unlock.focus();
    await page.keyboard.down("Space");
    await page.clock.runFor(1000);
    await expect(dialog.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    await page.screenshot({ path: testInfo.outputPath(`audio-unlock-half-${language}.png`) });
    await page.keyboard.up("Space");
    await page.clock.runFor(1500);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("progressbar")).toHaveCount(0);
    const lockedUrl = page.url();
    await page.evaluate(() => {
      window.location.hash = "/settings";
    });
    await expect(page).toHaveURL(lockedUrl);
    await expect(dialog).toBeVisible();
    await page.keyboard.down("Space");
    await page.clock.runFor(2001);
    await page.keyboard.up("Space");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await trigger.click();
    const bounds = (await unlock.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.clock.runFor(2001);
    await page.mouse.up();
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { lockAudio: { paused: boolean } }).lockAudio.paused)).toBe(
      false,
    );
  });
}
test("explicit Home glass overrides desktop device preference while solid and high contrast remain available", async ({
  page,
}, testInfo) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (localStorage.getItem("azkarapp.state.v1")) return;
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true, themeMode: "midnight" },
        profile: { isGuest: true },
      }),
    );
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/#/home");
  const card = page.getByTestId("prayer-card-dhuhr");
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await page.goto("/#/settings/appearance");
  const homeAppearance = page.getByRole("radiogroup", { name: "Home appearance", exact: true });
  await homeAppearance.getByRole("radio", { name: "Glass", exact: true }).click();
  await page.goto("/#/home");
  await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
  await page.reload();
  await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
  await page.screenshot({ path: testInfo.outputPath("desktop-explicit-glass.png") });
  await page.evaluate(() => document.documentElement.classList.add("high-contrast"));
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await page.evaluate(() => document.documentElement.classList.remove("high-contrast"));
  await page.emulateMedia({ forcedColors: "active" });
  await expect(card).toHaveCSS("backdrop-filter", "none");
  await page.emulateMedia({ forcedColors: "none" });
  await expect(card).toHaveCSS("backdrop-filter", "blur(22px) saturate(1.35)");
  await page.goto("/#/settings/appearance");
  await homeAppearance.getByRole("radio", { name: "Opaque", exact: true }).click();
  await page.goto("/#/home");
  await expect(card).not.toHaveClass(/hero-glass/);
  await page.goto("/#/settings/appearance");
  await page
    .getByRole("radiogroup", { name: "App appearance", exact: true })
    .getByRole("radio", { name: "Opaque", exact: true })
    .click();
  await page.goto("/#/home");
  await expect(card).toHaveCSS("backdrop-filter", "none");
});
