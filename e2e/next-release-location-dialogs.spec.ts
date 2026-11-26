import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

async function assertProtectedDialog(page: Page, dialog: Locator) {
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-dropdown-surface", "");
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const background = getComputedStyle(element).backgroundColor;
        const ancestors: Element[] = [];
        for (let node: Element | null = element; node; node = node.parentElement) ancestors.push(node);
        const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return {
          bounded: box.width <= Math.min(innerWidth - 32, 28 * rootSize) + 1,
          inside: box.left >= 8 && box.right <= innerWidth - 8 && box.top >= 0 && box.bottom <= innerHeight + 1,
          // CSSOM serializes alpha-bearing colors with rgba() or a slash.
          // Avoid allocating a GPU canvas just to inspect an opaque CSS fill.
          opaque:
            /^(?:rgb|color)\([^/]+\)$/.test(background) &&
            ancestors.every((node) => Number(getComputedStyle(node).opacity) === 1),
          hit: element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + 20)),
          noOverflow: element.scrollWidth <= element.clientWidth + 1,
        };
      }),
    )
    .toEqual({ bounded: true, inside: true, opaque: true, hit: true, noOverflow: true });
  const close = dialog.getByTestId("modal-close-button");
  await expect(close).toBeInViewport({ ratio: 1 });
  const bounds = await close.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const language of ["ar", "en"] as const) {
  for (const scenario of [
    { width: 320, height: 700, scale: 2, material: "glass", fallback: "none" },
    { width: 390, height: 844, scale: 1, material: "solid", fallback: "none" },
    { width: 834, height: 1112, scale: 1, material: "glass", fallback: "none" },
    { width: 1440, height: 900, scale: 1, material: "solid", fallback: "high-contrast" },
    { width: 2560, height: 1440, scale: 1, material: "glass", fallback: "reduced-transparency" },
    { width: 1440, height: 900, scale: 1, material: "glass", fallback: "none" },
  ]) {
    for (const flow of ["home", "settings"] as const) {
      test(`next release ${flow} location dialog ${language} ${scenario.width} ${scenario.fallback} @cross-browser`, async ({
        page,
      }, info) => {
        await page.setViewportSize({ width: scenario.width, height: scenario.height });
        await fixtureReminderCatalogue(page);
        await page.addInitScript(
          ({ language, scenario }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            if (!localStorage.getItem("azkarapp.state.v1"))
              localStorage.setItem(
                "azkarapp.state.v1",
                JSON.stringify({
                  settings: {
                    language,
                    themeMode: scenario.material === "solid" ? "light" : "midnight",
                    appMaterial: scenario.material,
                    homeMaterial: scenario.material,
                    reduceMotion: true,
                    highContrast: scenario.fallback === "high-contrast",
                    reduceTransparency: scenario.fallback === "reduced-transparency",
                    location: {
                      cityName: "30.55°, 31.06°",
                      latitude: 30.55,
                      longitude: 31.06,
                      timeZone: "Africa/Cairo",
                      autoDetect: true,
                      calculationMethod: 5,
                      adjustments: { asr: 4 },
                    },
                  },
                  profile: { isGuest: true },
                }),
              );
            Object.defineProperty(navigator, "geolocation", {
              configurable: true,
              value: {
                getCurrentPosition: (success: PositionCallback) =>
                  success({
                    coords: { latitude: 30.55, longitude: 31.06, accuracy: 15 },
                    timestamp: Date.now(),
                  } as GeolocationPosition),
              },
            });
            document.addEventListener("DOMContentLoaded", () => {
              document.documentElement.style.fontSize = `${scenario.scale * 100}%`;
            });
          },
          { language, scenario },
        );
        await page.goto(flow === "home" ? "/#/home" : "/#/settings/location");
        const place = language === "ar" ? "بالقرب من القاهرة، مصر" : "Near Cairo, Egypt";
        await expect(page.getByTestId(flow === "home" ? "home-location-caption" : "prayer-location-name")).toHaveText(
          place,
        );
        const detect =
          flow === "home"
            ? page
                .getByTestId("home-location")
                .getByRole("button", { name: t(language, "qibla.useCurrentLocation"), exact: true })
            : page.getByRole("button", {
                name: t(language, "prayerLocation.useCurrentLocation"),
                exact: true,
              });
        await detect.click();
        const dialog = page.getByTestId(flow === "home" ? "home-location-result" : "prayer-location-notice");
        await expect(dialog).toContainText(place);
        await assertProtectedDialog(page, dialog);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${flow}-location.png`) });
        await page.keyboard.press("Escape");
        await expect(detect).toBeFocused();
        const saved = await page.evaluate(
          () => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location,
        );
        expect(saved).toMatchObject({
          latitude: 30.55,
          longitude: 31.06,
          calculationMethod: 5,
          adjustments: { asr: 4 },
          autoDetect: true,
        });
      });
    }
  }
}
