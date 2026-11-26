import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getMagneticDeclination } from "../src/app/content/geomagnetic";

async function openQibla(page: Page, language: "ar" | "en", settings: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ language, settings }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            appMaterial: "solid",
            reduceMotion: true,
            location: {
              latitude: 30.0444,
              longitude: 31.2357,
              cityName: language === "ar" ? "القاهرة" : "Cairo",
              calculationMethod: 5,
              timeZone: "Africa/Cairo",
              autoDetect: false,
              adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
            },
            ...settings,
          },
          profile: { isGuest: true },
        }),
      );
    },
    { language, settings },
  );
  await page.goto("/#/qibla");
  await expect(
    page.getByRole("heading", { name: language === "ar" ? "القبلة" : "Qibla", exact: true, level: 1 }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const language of ["ar", "en"] as const) {
  for (const theme of ["light", "midnight", "high-contrast", "forced-colors"]) {
    test(`@cross-browser Qibla instrument readability in ${language} ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      // A known permission-required state keeps the primary consent control
      // available for the forced-colors contrast check without sensor noise.
      await page.addInitScript(() => {
        Object.defineProperty(window, "DeviceOrientationEvent", {
          configurable: true,
          value: class extends Event {
            static async requestPermission() {
              return "granted";
            }
          },
        });
        for (const name of ["deviceorientation", "deviceorientationabsolute"])
          window.addEventListener(
            name,
            (event) => {
              if (event.isTrusted) event.stopImmediatePropagation();
            },
            true,
          );
      });
      if (theme === "forced-colors") await page.emulateMedia({ forcedColors: "active" });
      await openQibla(page, language, {
        themeMode: theme === "light" ? "light" : "midnight",
        highContrast: theme === "high-contrast",
      });
      await expect(page.locator("html")).toHaveClass(theme === "light" ? /theme-light/ : /theme-midnight/);
      if (theme === "high-contrast") await expect(page.locator("html")).toHaveClass(/high-contrast/);
      await expect(page.getByTestId("kaaba-target")).toBeVisible();
      const colors = await page.locator(".qibla-instrument").evaluate((node) => {
        const tick = node.querySelector('g[data-testid="compass-rose"] line')!;
        const kaaba = node.querySelector('[data-testid="kaaba-target"] path')!;
        return { tick: getComputedStyle(tick).stroke, kaaba: getComputedStyle(kaaba).stroke };
      });
      if (theme === "high-contrast" || theme === "forced-colors") expect(colors.kaaba).toBe(colors.tick);
      if (theme === "forced-colors") {
        const button = page.locator('.qibla-screen [data-slot="button"][data-variant="default"]');
        const contrast = await button.evaluate((node) => {
          const style = getComputedStyle(node);
          const system = document.createElement("span");
          system.style.color = "CanvasText";
          system.style.backgroundColor = "Canvas";
          node.append(system);
          const expected = getComputedStyle(system);
          const result = {
            color: style.color,
            background: style.backgroundColor,
            expectedColor: expected.color,
            expectedBackground: expected.backgroundColor,
          };
          system.remove();
          return result;
        });
        expect(contrast.color).toBe(contrast.expectedColor);
        expect(contrast.background).toBe(contrast.expectedBackground);
        expect(contrast.color).not.toBe(contrast.background);
      }
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(scan.violations).toEqual([]);
      await page.screenshot({
        path: `output/playwright/qibla-acceptance/${testInfo.project.name}-${language}-${theme}.png`,
      });
    });
  }

  test(`@cross-browser Qibla location notification overlays without moving the compass in ${language}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: PositionCallback) {
            success({
              coords: { latitude: 30.0444, longitude: 31.2357, accuracy: 1200, altitude: null },
              timestamp: Date.now(),
            } as GeolocationPosition);
          },
        },
      });
    });
    await openQibla(page, language, { appMaterial: "glass" });
    const dial = page.locator(".qibla-dial");
    const before = await dial.boundingBox();
    const location = page.getByTestId("qibla-location");
    await location.getByRole("button").click();
    const notice = page.getByTestId("qibla-location-notice");
    await expect(notice).toBeVisible();
    await expect(notice.getByTestId("qibla-location-warning")).toContainText(
      language === "ar" ? "الموقع تقريبي" : "Location is approximate",
    );
    expect(await dial.boundingBox()).toEqual(before);
    const geometry = await notice.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const close = node.querySelector<HTMLElement>('[data-testid="modal-close-button"]')!;
      const target = close.getBoundingClientRect();
      return {
        color: getComputedStyle(node).backgroundColor,
        focused: node.contains(document.activeElement),
        hit: close.contains(document.elementFromPoint(target.left + target.width / 2, target.top + target.height / 2)),
        inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
      };
    });
    expect(geometry).toEqual({ color: "rgb(15, 23, 42)", focused: true, hit: true, inViewport: true });
    await page.screenshot({
      path: `output/playwright/qibla-final/${testInfo.project.name}-${language}-location-notification.png`,
    });
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
    await notice.getByTestId("modal-close-button").click();
    await expect(notice).toBeHidden();
    await expect(location.getByRole("button")).toBeFocused();
    expect(await dial.boundingBox()).toEqual(before);
    await location.getByRole("button").click();
    await expect(notice).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(notice).toBeHidden();
    await expect(location.getByRole("button")).toBeFocused();
  });

  test(`@cross-browser Qibla essential view fits an ordinary phone in ${language}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openQibla(page, language);
    const dial = page.getByRole("img");
    const main = page.locator(".qibla-main");
    await expect(dial).toBeVisible();
    await expect(page.getByTestId("qibla-location")).toContainText(
      language === "ar" ? "يُستخدم الموقع المحفوظ" : "Using saved location",
    );
    await expect(page.getByText(/1,287 km|١٬?٢٨٧ كم|١,٢٨٧ كم/)).toHaveCount(0);
    const geometry = await main.evaluate((node) => {
      const surface = node.closest<HTMLElement>(".app-screen-surface")!;
      const frame = surface.getBoundingClientRect();
      const dial = node.querySelector("figure")!.getBoundingClientRect();
      const buttons = [...node.querySelectorAll("button")].map((button) => button.getBoundingClientRect());
      return {
        overflow: surface.scrollWidth - surface.clientWidth,
        scroll: surface.scrollHeight - surface.clientHeight,
        dialVisible: dial.top >= frame.top && dial.bottom <= frame.bottom,
        targets: buttons.every(
          (button) => button.height >= 43.5 && button.width >= 43.5 && button.bottom <= frame.bottom + 1,
        ),
      };
    });
    expect(geometry).toEqual({ overflow: 0, scroll: 0, dialVisible: true, targets: true });
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: `output/playwright/qibla-clarity/${testInfo.project.name}-${language}-phone.png` });
  });

  for (const scenario of [
    { width: 320, height: 720, enlarged: true, theme: "light", material: "glass", fallback: false },
    { width: 390, height: 844, enlarged: false, theme: "midnight", material: "glass", fallback: false },
    { width: 834, height: 1112, enlarged: false, theme: "dark", material: "solid", fallback: true },
    { width: 1440, height: 1000, enlarged: false, theme: "light", material: "glass", fallback: true },
  ]) {
    test(`@cross-browser Qibla details reflow, occlude and restore focus in ${language} at ${scenario.width}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(scenario);
      await openQibla(page, language, {
        themeMode: scenario.theme,
        appMaterial: scenario.material,
        highContrast: scenario.fallback,
        reduceTransparency: scenario.fallback,
      });
      if (scenario.enlarged)
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
      const details = page.getByRole("button", { name: language === "ar" ? "التفاصيل" : "Details", exact: true });
      await details.click();
      const sheet = page.getByTestId("qibla-details");
      await expect(sheet).toBeVisible();
      await expect(sheet).toContainText(language === "ar" ? "١,٢٨٧ كم" : "1,287 km");
      const geometry = await sheet.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const color = getComputedStyle(node).backgroundColor;
        const alpha = color.match(/\/\s*([\d.]+)(%)?\s*\)/);
        const legacy = color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const opacity = alpha
          ? Number(alpha[1]) / (alpha[2] ? 100 : 1)
          : legacy
            ? Number(legacy[1])
            : color === "transparent"
              ? 0
              : 1;
        const close = node.querySelector<HTMLElement>('[data-testid="modal-close-button"]')!;
        const closeBox = close.getBoundingClientRect();
        const hit = document.elementFromPoint(closeBox.left + closeBox.width / 2, closeBox.top + closeBox.height / 2);
        return {
          opacity,
          overflow: node.scrollWidth - node.clientWidth,
          inViewport: box.left >= -1 && box.right <= innerWidth + 1 && box.top >= -1 && box.bottom <= innerHeight + 1,
          closeReachable: closeBox.width >= 44 && closeBox.height >= 44 && close.contains(hit),
          focusedInside: node.contains(document.activeElement),
        };
      });
      expect(geometry).toEqual({
        opacity: 1,
        overflow: 0,
        inViewport: true,
        closeReachable: true,
        focusedInside: true,
      });
      await page.screenshot({
        path: `output/playwright/qibla-clarity/${testInfo.project.name}-${language}-${scenario.width}-details.png`,
      });
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(details).toBeFocused();
      if (scenario.enlarged) {
        await details.scrollIntoViewIfNeeded();
        await expect(details).toBeInViewport();
        await details.click();
        await sheet.locator("summary").click();
        await expect(sheet.locator("details")).toHaveAttribute("open", "");
        await sheet.getByTestId("modal-close-button").click();
        await expect(details).toBeFocused();
      }
    });
  }
}

test("@cross-browser Qibla refresh uses a fresh device fix without changing prayer settings or borrowing the saved city", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition(success: PositionCallback, _failure: PositionErrorCallback, options: PositionOptions) {
          if (options.maximumAge !== 0) throw new Error("Qibla must explicitly request a fresh fix");
          success({
            coords: { latitude: 24.4672, longitude: 39.6111, accuracy: 20, altitude: null },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
    });
  });
  await openQibla(page, "en");
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location);
  await page.getByRole("button", { name: "Use my location" }).click();
  await page.getByTestId("qibla-location-notice").getByTestId("modal-close-button").click();
  await expect(page.getByTestId("qibla-location")).toContainText("Near Madinah, Saudi Arabia");
  await expect(page.getByTestId("qibla-location")).not.toContainText("Cairo");
  await expect(page.getByRole("heading", { name: /Qibla is 176°/ })).toBeVisible();
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByTestId("qibla-details")).toContainText("Around 20 m");
  await expect(page.getByTestId("qibla-details")).toContainText("24.46720°, 39.61110°");
  await expect(page.getByTestId("qibla-details")).toContainText("saved prayer location and reminders are unchanged");
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location);
  expect(after).toEqual(before);
});

test("@cross-browser Qibla drops poor live readings and retains the static fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class extends Event {
        static async requestPermission() {
          return "granted";
        }
      },
    });
  });
  await openQibla(page, "en");
  const arrow = page.getByTestId("qibla-arrow");
  const staticRotation = await arrow.getAttribute("transform");
  await page.getByRole("button", { name: "Allow compass access" }).click();
  await expect(page.getByRole("button", { name: "Stop live compass" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Allow compass access" })).toHaveCount(0);
  await expect
    .poll(async () => {
      await page.evaluate(() =>
        window.dispatchEvent(
          Object.assign(new Event("deviceorientation"), { webkitCompassHeading: 100, webkitCompassAccuracy: 2 }),
        ),
      );
      return arrow.getAttribute("transform");
    })
    .not.toBe(staticRotation);
  await expect(arrow).not.toHaveAttribute("transform", staticRotation!);
  await expect(page.getByRole("status", { name: "Reported compass accuracy: ±2°", exact: true })).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      Object.assign(new Event("deviceorientation"), { webkitCompassHeading: 136, webkitCompassAccuracy: 40 }),
    ),
  );
  await expect(arrow).toHaveAttribute("transform", staticRotation!);
  await expect(page.getByText("Compass needs calibration")).toBeVisible();
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.getByText(/The heading is unreliable/)).toBeVisible();
  await expect(page.getByText("Static view — does not track your phone")).toBeVisible();
  await expect(page.getByRole("heading", { name: "You are facing the Qibla" })).toHaveCount(0);
});

for (const language of ["ar", "en"] as const) {
  test(`@cross-browser Qibla final recommendations and screenshot evidence in ${language}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install({ time: new Date("2026-11-24T11:30:00Z") });
    await page.addInitScript(() => {
      // Fixture owns sensor input. Ignore the desktop engine's real null-sensor events.
      for (const name of ["deviceorientation", "deviceorientationabsolute"]) {
        window.addEventListener(
          name,
          (event) => {
            if (event.isTrusted) event.stopImmediatePropagation();
          },
          true,
        );
      }
      Object.defineProperty(window, "DeviceOrientationEvent", {
        configurable: true,
        value: class extends Event {
          static async requestPermission() {
            return "granted";
          }
        },
      });
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: PositionCallback) {
            success({
              coords: { latitude: 30.0444, longitude: 31.2357, accuracy: 1200, altitude: null },
              timestamp: Date.now(),
            } as GeolocationPosition);
          },
        },
      });
    });
    await openQibla(page, language);
    const capture = async (state: string) =>
      page.screenshot({ path: `output/playwright/qibla-final/${testInfo.project.name}-${language}-${state}.png` });
    const location = page.getByTestId("qibla-location");
    await expect(location).toContainText(language === "ar" ? "يُستخدم الموقع المحفوظ" : "Using saved location");
    await expect(
      location.getByRole("button", { name: language === "ar" ? "موقعي الحالي" : "Use my location" }),
    ).toBeVisible();
    await capture("saved-location");
    await page
      .getByRole("button", { name: language === "ar" ? "السماح باستخدام البوصلة" : "Allow compass access" })
      .click();
    await expect(
      page.getByRole("button", { name: language === "ar" ? "إيقاف البوصلة المباشرة" : "Stop live compass" }),
    ).toHaveCount(0);
    await page.clock.runFor(5100);
    const retry = page.getByRole("button", {
      name: language === "ar" ? "إعادة محاولة البوصلة" : "Retry compass",
      exact: true,
    });
    await expect(retry).toBeVisible();
    await retry.click();
    const correction = getMagneticDeclination(30.0444, 31.2357, new Date("2026-11-24T00:00:00Z"))!;
    const sample = async (heading: number, accuracy = 2) => {
      await page.evaluate(
        ({ heading, accuracy }) =>
          window.dispatchEvent(
            Object.assign(new Event("deviceorientation"), {
              webkitCompassHeading: heading,
              webkitCompassAccuracy: accuracy,
            }),
          ),
        { heading, accuracy },
      );
    };
    await sample(136.14095496068893 - 12 - correction);
    await expect(page.getByTestId("device-forward")).toBeVisible();
    await expect(
      page.getByText(language === "ar" ? "أعلى الهاتف • ضعه أفقيًا" : "Top of phone • hold flat"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: language === "ar" ? "استدر ١٢° يمينًا" : "Turn 12° right" }),
    ).toBeVisible();
    await capture("live-turn-simulated");
    await page.clock.runFor(5100);
    await expect(
      page.getByRole("status", { name: language === "ar" ? /توقفت قراءات البوصلة/ : /The compass stopped updating/ }),
    ).toBeVisible();
    await capture("stale-retry-simulated");
    await retry.click();
    await sample(136.14095496068893 - correction);
    await page.clock.runFor(400);
    await expect(
      page.getByRole("heading", { name: language === "ar" ? "أنت متجه نحو القبلة" : "You are facing the Qibla" }),
    ).toBeVisible();
    await capture("aligned-simulated");
    await sample(136, 40);
    const calibration = page.getByRole("button", {
      name: language === "ar" ? "مساعدة في المعايرة" : "Calibration help",
      exact: true,
    });
    await expect(calibration).toBeVisible();
    await expect(
      page.getByRole("heading", { name: language === "ar" ? "أنت متجه نحو القبلة" : "You are facing the Qibla" }),
    ).toHaveCount(0);
    await capture("poor-calibration-simulated");
    await calibration.click();
    const sheet = page.getByTestId("qibla-details");
    await expect(sheet.locator("details")).toHaveAttribute("open", "");
    await capture("calibration-details");
    await sheet.getByTestId("modal-close-button").click();
    await expect(calibration).toBeFocused();
    await expect(
      page.getByRole("button", { name: language === "ar" ? "إيقاف البوصلة المباشرة" : "Stop live compass" }),
    ).toHaveCount(0);
    await location.getByRole("button").click();
    await expect(page.getByTestId("qibla-location-warning")).toContainText(
      language === "ar" ? "الموقع تقريبي" : "Location is approximate",
    );
    await expect(page.getByTestId("qibla-location-warning")).toContainText(language === "ar" ? "١٢٠٠" : "1200");
    await capture("approximate-location-simulated");
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(scan.violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 720 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const notice = page.getByTestId("qibla-location-notice");
    await expect(notice).toBeVisible();
    expect(await notice.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    await notice.getByTestId("modal-close-button").click();
    await expect(location.getByRole("button")).toBeFocused();
    expect(
      await page.locator(".app-screen-surface").evaluate((node) => node.scrollWidth - node.clientWidth),
    ).toBeLessThanOrEqual(1);
    const help = page.getByRole("button", { name: language === "ar" ? "التفاصيل" : "Details", exact: true });
    await help.scrollIntoViewIfNeeded();
    await expect(help).toBeInViewport();
    await help.click();
    await sheet.locator("summary").click();
    await expect(sheet.locator("details")).toHaveAttribute("open", "");
    await sheet.getByTestId("modal-close-button").click();
    await expect(help).toBeFocused();
  });
}
