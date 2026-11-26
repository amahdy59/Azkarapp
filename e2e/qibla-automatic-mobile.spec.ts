import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getMagneticDeclination } from "../src/app/content/geomagnetic";
import { t } from "../src/app/i18n";

async function enter(
  page: Page,
  language: "ar" | "en",
  permission: "none" | "prompt" | "denied" | "granted" = "none",
  scale = 1,
  material = "solid",
) {
  await page.clock.install({ time: new Date("2026-11-26T12:00:00Z") });
  await page.addInitScript(
    ({ language, permission, scale, material }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            reduceMotion: true,
            themeMode: material === "solid" ? "light" : "midnight",
            appMaterial: material,
            location: {
              latitude: 30.0444,
              longitude: 31.2357,
              cityName: "Cairo",
              timeZone: "Africa/Cairo",
              calculationMethod: 5,
              autoDetect: false,
            },
          },
          profile: { isGuest: true },
        }),
      );
      for (const name of ["deviceorientation", "deviceorientationabsolute"])
        window.addEventListener(
          name,
          (event) => {
            if (event.isTrusted) event.stopImmediatePropagation();
          },
          true,
        );
      const state = window as unknown as { compassPermissionCalls: number; sensorPermission: string };
      state.compassPermissionCalls = 0;
      state.sensorPermission = permission;
      class Orientation extends Event {}
      if (permission !== "none")
        Object.assign(Orientation, {
          requestPermission: async () => {
            state.compassPermissionCalls++;
            return state.sensorPermission === "denied" ? "denied" : "granted";
          },
        });
      Object.defineProperty(window, "DeviceOrientationEvent", { configurable: true, value: Orientation });
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.fontSize = `${scale * 100}%`;
      });
    },
    { language, permission, scale, material },
  );
  await page.goto("/#/qibla");
  await expect(page.locator(".qibla-dial")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function sample(page: Page, accuracy = 2, offset = 12) {
  const correction = getMagneticDeclination(30.0444, 31.2357, new Date("2026-11-26T00:00:00Z"))!;
  await page.evaluate(
    ({ accuracy, heading }) =>
      window.dispatchEvent(
        Object.assign(new Event("deviceorientation"), {
          webkitCompassHeading: heading,
          webkitCompassAccuracy: accuracy,
        }),
      ),
    { accuracy, heading: 136.14095496068893 - offset - correction },
  );
}

async function geometry(page: Page) {
  return page.locator(".qibla-main").evaluate((node) => {
    const surface = node.closest<HTMLElement>(".app-screen-surface")!;
    const frame = surface.getBoundingClientRect();
    const rect = (selector: string) => {
      const r = node.querySelector(selector)!.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return {
      location: rect('[data-testid="qibla-location"]'),
      dial: rect("figure"),
      direction: rect(".qibla-direction"),
      actions: rect(".qibla-actions"),
      overflow: surface.scrollWidth - surface.clientWidth,
      scroll: surface.scrollHeight - surface.clientHeight,
      fits: [...node.querySelectorAll("figure, button, .qibla-direction, .qibla-mode")].every((element) => {
        const r = element.getBoundingClientRect();
        return r.top >= frame.top && r.bottom <= frame.bottom + 1;
      }),
    };
  });
}

for (const language of ["ar", "en"] as const) {
  for (const viewport of [
    { width: 360, height: 640 },
    { width: 390, height: 844 },
  ]) {
    test(`automatic Qibla stable mobile ${language} ${viewport.width} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize(viewport);
      await enter(page, language, "none", 1, "glass");
      const original = await geometry(page);
      expect(original).toMatchObject({ overflow: 0, scroll: 0, fits: true });
      await expect(page.getByRole("button", { name: t(language, "qibla.startCompass") })).toHaveCount(0);
      await expect(page.getByRole("button", { name: t(language, "qibla.stopCompass") })).toHaveCount(0);
      await page.screenshot({ path: info.outputPath("waiting.png") });
      await sample(page);
      await expect(
        page.getByRole("heading", {
          name: t(language, "qibla.turnRight", { degrees: language === "ar" ? "١٢" : "12" }),
        }),
      ).toBeVisible();
      expect(await geometry(page)).toEqual(original);
      await expect(page.getByRole("button", { name: t(language, "qibla.allowCompass") })).toHaveCount(0);
      await page.screenshot({ path: info.outputPath("live-simulated.png") });
      // Feed a steady stream through the unchanged shortest-angle smoother.
      for (let index = 0; index < 12; index++) {
        await sample(page, 2, 0);
        await page.clock.runFor(50);
      }
      await page.clock.runFor(400);
      await expect(page.getByRole("heading", { name: t(language, "qibla.aligned") })).toBeVisible();
      expect(await geometry(page)).toEqual(original);
      await page.screenshot({ path: info.outputPath("aligned-simulated.png") });
      await sample(page, 40);
      await expect(page.getByText(t(language, "qibla.compassPoorShort"), { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: t(language, "qibla.aligned") })).toHaveCount(0);
      expect(await geometry(page)).toEqual(original);
      await page.screenshot({ path: info.outputPath("poor-simulated.png") });
      await sample(page);
      await page.clock.runFor(5100);
      await expect(page.getByRole("button", { name: t(language, "qibla.retryCompass"), exact: true })).toBeVisible();
      expect(await geometry(page)).toEqual(original);
      await page.screenshot({ path: info.outputPath("stale-simulated.png") });
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }

  test(`Qibla permission is gesture owned ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enter(page, language, "denied");
    const calls = () =>
      page.evaluate(() => (window as unknown as { compassPermissionCalls: number }).compassPermissionCalls);
    const original = await geometry(page);
    expect(await calls()).toBe(0);
    const allow = page.getByRole("button", { name: t(language, "qibla.allowCompass"), exact: true });
    await expect(allow).toBeVisible();
    await page.screenshot({ path: info.outputPath("permission-needed.png") });
    await allow.focus();
    await page.keyboard.press("Enter");
    expect(await calls()).toBe(1);
    await expect(page.getByText(t(language, "qibla.compassDeniedShort"), { exact: true })).toBeVisible();
    expect(await geometry(page)).toEqual(original);
    await page.screenshot({ path: info.outputPath("permission-denied.png") });
    await page.getByRole("button", { name: t(language, "qibla.details"), exact: true }).click();
    await expect(page.getByTestId("qibla-details")).toContainText(t(language, "qibla.compassDenied"));
    await page.screenshot({ path: info.outputPath("permission-recovery.png") });
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      (window as unknown as { sensorPermission: string }).sensorPermission = "granted";
    });
    await page.getByRole("button", { name: t(language, "qibla.retryCompass"), exact: true }).click();
    expect(await calls()).toBe(2);
    await sample(page);
    expect(await geometry(page)).toEqual(original);
    await expect(allow).toHaveCount(0);
  });

  test(`Qibla already permitted needs no action ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enter(page, language, "granted");
    await sample(page);
    await expect(page.getByRole("button", { name: t(language, "qibla.allowCompass"), exact: true })).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as unknown as { compassPermissionCalls: number }).compassPermissionCalls),
    ).toBe(0);
    await page.screenshot({ path: info.outputPath("already-permitted-simulated.png") });
  });

  test(`Qibla enlarged text retains all recovery ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await enter(page, language, "prompt", 2);
    const allow = page.getByRole("button", { name: t(language, "qibla.allowCompass"), exact: true });
    await allow.scrollIntoViewIfNeeded();
    await expect(allow).toBeInViewport();
    expect(await page.locator(".qibla-screen").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath("enlarged-recovery.png") });
    await page.getByRole("button", { name: t(language, "qibla.details"), exact: true }).click();
    const sheet = page.getByTestId("qibla-details");
    await expect(sheet).toBeVisible();
    await sheet.locator("summary").click();
    await expect(sheet.locator("details")).toHaveAttribute("open", "");
    await page.screenshot({ path: info.outputPath("enlarged-details.png") });
    await sheet.getByTestId("modal-close-button").click();
    await expect(page.getByRole("button", { name: t(language, "qibla.details"), exact: true })).toBeFocused();
  });
}
