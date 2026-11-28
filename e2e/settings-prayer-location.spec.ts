import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { CALCULATION_METHODS } from "../src/app/content/prayerCalculation";
import { t } from "../src/app/i18n";
import type { AppLanguage } from "../src/app/types";

async function openSettings(
  page: Page,
  language: AppLanguage,
  width = 390,
  height = 844,
  scale = 1,
  fallback = "glass",
) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({
    reducedMotion: "no-preference",
    forcedColors: fallback === "forced-colors" ? "active" : "none",
  });
  await page.addInitScript(
    ({ language, scale, fallback }) => {
      if (!localStorage.getItem("azkarapp.onboarding-complete.v1")) {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: fallback === "solid" || fallback === "light-glass" ? "light" : "midnight",
              reduceMotion: false,
              appMaterial: fallback === "solid" ? "solid" : "glass",
              highContrast: fallback === "high-contrast",
              reduceTransparency: fallback === "reduced-transparency",
              location: {
                cityName: "Makkah",
                latitude: 21.4225,
                longitude: 39.8262,
                timeZone: "Asia/Riyadh",
                autoDetect: false,
                calculationMethod: 4,
                adjustments: { fajr: 3 },
              },
            },
            profile: { isGuest: true },
          }),
        );
      }
      if (scale === 2)
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.fontSize = "200%";
        });
    },
    { language, scale, fallback },
  );
  if (fallback === "no-filter")
    await page.route("**/assets/*.css", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: (await response.text()).replace(
          /@supports\s*\(\s*backdrop-filter\s*:\s*blur\(1px\)\s*\)/g,
          "@supports (unknown-frost: unsupported)",
        ),
      });
    });
  await page.goto("/#/settings/location");
  await expect(page.locator("#calculation-method-select")).toBeVisible();
}

async function protect(surface: Locator, page: Page) {
  await expect(surface).toHaveAttribute("data-dropdown-surface");
  await expect
    .poll(() =>
      surface.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.x >= 0 &&
          r.y >= 0 &&
          r.right <= innerWidth + 1 &&
          r.bottom <= innerHeight + 1
        );
      }),
    )
    .toBe(true);
  const protection = await surface.evaluate((e) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    context.fillStyle = getComputedStyle(e).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const r = e.getBoundingClientRect();
    const opacities = [];
    for (let node: Element | null = e; node; node = node.parentElement)
      opacities.push(Number(getComputedStyle(node).opacity));
    return {
      alpha: context.getImageData(0, 0, 1, 1).data[3],
      opaqueAncestors: opacities.every((value) => value === 1),
      topmost: [0.2, 0.5, 0.8].every((y) =>
        e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height * y)),
      ),
      noOverflow: e.scrollWidth <= e.clientWidth + 1,
    };
  });
  expect(protection).toEqual({ alpha: 255, opaqueAncestors: true, topmost: true, noOverflow: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const language of ["ar", "en"] as const) {
  for (const viewport of [
    { width: 390, height: 844, scale: 1, fallback: "glass" },
    { width: 320, height: 700, scale: 2, fallback: "glass" },
    { width: 768, height: 1024, scale: 1, fallback: "solid" },
    { width: 1440, height: 900, scale: 1, fallback: "glass" },
  ]) {
    test(`prayer settings labels and opaque pickers ${language}/${viewport.width}/${viewport.scale} @cross-browser`, async ({
      page,
    }, info) => {
      await openSettings(page, language, viewport.width, viewport.height, viewport.scale, viewport.fallback);
      await expect(page.getByTestId("prayer-location-name")).toHaveText(
        language === "ar" ? "مكة المكرمة، السعودية" : "Makkah, Saudi Arabia",
      );
      const locationSummary = await page
        .getByTestId("prayer-location-name")
        .evaluate((e) => e.closest("section")!.textContent);
      expect(locationSummary?.match(language === "ar" ? /السعودية/g : /Saudi Arabia/g)).toHaveLength(1);
      await expect(page.getByTestId("prayer-more-settings")).toContainText("UTC+03:00");
      await expect(page.getByTestId("daylight-saving-status")).toBeHidden();
      const trigger = page.locator("#calculation-method-select");
      await trigger.scrollIntoViewIfNeeded();
      const valueBounds = await trigger.evaluate((e) => {
        const value = e.querySelector("span")!;
        const range = document.createRange();
        range.selectNodeContents(value);
        const text = range.getBoundingClientRect(),
          box = e.getBoundingClientRect();
        return text.left >= box.left && text.right <= box.right && text.top >= box.top && text.bottom <= box.bottom;
      });
      expect(valueBounds, "complete short value must fit the trigger").toBe(true);
      await page.getByTestId("prayer-location-name").click();
      await page.screenshot({ path: info.outputPath("page.png") });
      await trigger.click();
      const popup =
        viewport.width < 600 ? page.getByTestId("prayer-method-sheet") : page.locator('[data-slot="select-content"]');
      await protect(popup, page);
      const choices = popup.getByRole(viewport.width < 600 ? "radio" : "option");
      await expect(choices).toHaveCount(5);
      for (const choice of await choices.all()) {
        await choice.scrollIntoViewIfNeeded();
        expect(await choice.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
        expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await page.screenshot({ path: info.outputPath("method-picker.png") });
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
      const cityTrigger = page.getByRole("button", { name: t(language, "prayerLocation.chooseAnotherCity") });
      await cityTrigger.click();
      const cities = page.getByTestId("prayer-city-sheet");
      await protect(cities, page);
      const search = cities.getByRole("searchbox");
      const searchTop = (await search.boundingBox())!.y;
      await cities.getByRole("button", { name: /London|لندن/ }).scrollIntoViewIfNeeded();
      expect(Math.abs((await search.boundingBox())!.y - searchTop)).toBeLessThanOrEqual(1);
      await search.fill("zzzzzz");
      await expect(cities.getByRole("status")).toHaveText(t(language, "prayerLocation.noCitiesFound"));
      await search.fill(language === "ar" ? "لندن" : "London");
      await expect(cities.getByRole("button", { name: /London|لندن/ })).toBeVisible();
      await page.screenshot({ path: info.outputPath("city-picker.png") });
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(scan.violations).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(cityTrigger).toBeFocused();
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 320]) {
    test(`prayer choices need no manual entry and preserve saved data ${language}/${width} @cross-browser`, async ({
      page,
    }, info) => {
      await openSettings(page, language, width, width === 320 ? 700 : 844, width === 320 ? 2 : 1);
      const savedLocation = () =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location);
      await expect
        .poll(savedLocation)
        .toMatchObject({ adjustments: { fajr: 3, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } });
      const original = await savedLocation();
      const more = page.getByTestId("prayer-more-settings");
      await expect(more).not.toHaveAttribute("open");
      await expect(page.locator("input:not([type=hidden])")).toHaveCount(0);
      await more.locator("summary").click();
      await expect(page.getByRole("textbox")).toHaveCount(0);
      await expect(page.getByRole("spinbutton")).toHaveCount(0);
      const zone = page.getByRole("combobox", { name: t(language, "prayerLocation.timeZone"), exact: true });
      await zone.click();
      const popup = page.locator('[data-slot="select-content"]');
      await protect(popup, page);
      await page.getByRole("option", { name: /London.*United Kingdom|لندن.*المملكة المتحدة/ }).click();
      await expect(zone).toBeFocused();
      await expect.poll(savedLocation).toMatchObject({ ...original, timeZone: "Europe/London" });
      const later = page.getByRole("button", {
        name: t(language, "prayerLocation.later", { prayer: t(language, "notifications.fajr") }),
        exact: true,
      });
      await later.scrollIntoViewIfNeeded();
      const bounds = (await later.boundingBox())!;
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeLessThanOrEqual(45);
      const rows = page.locator(".prayer-adjustment-row");
      for (const row of await rows.all()) {
        expect(await row.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
      }
      await later.focus();
      await page.keyboard.press("Enter");
      await expect.poll(savedLocation).toMatchObject({ adjustments: { fajr: 4 } });
      await page.screenshot({ path: info.outputPath("more-settings.png") });
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(scan.violations).toEqual([]);
      await page.getByRole("button", { name: t(language, "prayerLocation.resetAdjustments"), exact: true }).click();
      const expected = {
        ...original,
        timeZone: "Europe/London",
        adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      };
      await expect.poll(savedLocation).toEqual(expected);
      await page.reload();
      expect(await savedLocation()).toEqual(expected);
      await expect(more).not.toHaveAttribute("open");
      await page.getByRole("button", { name: t(language, "prayerLocation.chooseAnotherCity") }).click();
      const cities = page.getByTestId("prayer-city-sheet");
      await expect(cities.getByRole("searchbox")).toHaveValue("");
      const sydney = cities.getByRole("button", { name: /Sydney.*Australia|سيدني.*أستراليا/ });
      await sydney.scrollIntoViewIfNeeded();
      await sydney.click();
      await expect.poll(savedLocation).toMatchObject({
        cityName: "Sydney",
        timeZone: "Australia/Sydney",
        adjustments: expected.adjustments,
        calculationMethod: original.calculationMethod,
      });
    });
  }
}

for (const fallback of ["high-contrast", "reduced-transparency", "no-filter", "forced-colors", "light-glass"]) {
  test(`prayer picker accessibility fallback ${fallback} @cross-browser`, async ({ page }) => {
    await openSettings(page, "ar", 320, 700, 2, fallback);
    await page.locator("#calculation-method-select").click();
    await protect(page.getByTestId("prayer-method-sheet"), page);
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="prayer-method-sheet"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.getByRole("radio", { name: CALCULATION_METHODS[5]!.nameArabic, exact: true }).click();
    await expect(page.locator("#calculation-method-select")).toHaveText(t("ar", "prayerLocation.methodShort5"));
    await expect(page.locator("#calculation-method-select")).toBeFocused();
  });
}

test("all prayer methods apply offline, survive reload and preserve location/adjustments @cross-browser", async ({
  page,
}) => {
  await openSettings(page, "en");
  await page.context().setOffline(true);
  for (const method of Object.values(CALCULATION_METHODS)) {
    await page.locator("#calculation-method-select").click();
    await page.getByRole("radio", { name: method.nameEnglish, exact: true }).click();
    await expect(page.locator("#calculation-method-select")).toHaveText(
      t("en", `prayerLocation.methodShort${method.id}`),
    );
    await expect(page.locator("#calculation-method-select")).toBeFocused();
  }
  await page.context().setOffline(false);
  await page.reload();
  await expect(page.locator("#calculation-method-select")).toHaveText(t("en", "prayerLocation.methodShort5"));
  await page.getByRole("button", { name: "Choose another city" }).click();
  await page.getByRole("searchbox").fill("London");
  await page.getByRole("button", { name: /London.*United Kingdom/ }).click();
  await expect(page.getByTestId("prayer-location-name")).toHaveText("London, United Kingdom");
  await page.reload();
  await expect(page.getByTestId("prayer-location-name")).toHaveText("London, United Kingdom");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location);
  expect(saved).toMatchObject({
    cityName: "London",
    timeZone: "Europe/London",
    calculationMethod: 5,
    adjustments: { fajr: 3 },
  });
  await page.locator("#calculation-method-select").click();
  const checked = page.getByRole("radio", { checked: true });
  await checked.focus();
  await page.keyboard.press("Home");
  await expect(page.locator("#calculation-method-select")).toHaveText(t("en", "prayerLocation.methodShort1"));
  await expect(page.locator("#calculation-method-select")).toBeFocused();
});

test("wide keyboard choices and resizing an open phone picker retain focus and selection @cross-browser", async ({
  page,
}) => {
  await openSettings(page, "en");
  const trigger = page.locator("#calculation-method-select");
  await trigger.click();
  await page.setViewportSize({ width: 768, height: 1024 });
  const dialog = page.getByTestId("prayer-method-sheet");
  await expect(dialog).toBeVisible();
  await protect(dialog, page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("option", { selected: true }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("option", { name: CALCULATION_METHODS[1]!.nameEnglish, exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText(t("en", "prayerLocation.methodShort1"));
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("prayer-method-sheet")).toBeHidden();
});

test("location denial shows recovery without shifting settings and returns focus @cross-browser", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
          error({ code: 1 } as GeolocationPositionError),
      },
    }),
  );
  await openSettings(page, "en");
  const trigger = page.getByRole("button", { name: "Use my current location" });
  const before = await page.locator("#calculation-method-select").boundingBox();
  await trigger.click();
  const notice = page.getByTestId("prayer-location-notice");
  await expect(notice).toContainText("Location access is blocked");
  await protect(notice, page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  expect(await page.locator("#calculation-method-select").boundingBox()).toEqual(before);
  await expect(page.getByTestId("prayer-location-name")).toHaveText("Makkah, Saudi Arabia");
});
