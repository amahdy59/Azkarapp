import { expect, test, type Locator, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";
import { clickReaderOption } from "./reader-options";
import { getAzkarForMode } from "../src/app/content/azkar";

const repeatedZikr = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.repetitionCount >= 4) + 1;

async function tabIntoReading(page: Page, region: Locator) {
  await region.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(region).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(region).toBeFocused();
  await expect(region).toHaveAttribute("data-reading-keyboard-focus", "");
}

for (const scenario of [
  { language: "ar", width: 390, themeMode: "light" },
  { language: "en", width: 1440, themeMode: "midnight" },
] as const) {
  for (const reading of [
    { route: `/azkar/morning/${repeatedZikr}`, counter: "counter-surface", collection: true },
    { route: "/counter", counter: "custom-counter-surface", collection: false },
    { route: "/friday/salawat", counter: "salawat-counter", collection: false },
  ]) {
    test(`reading boundary follows Tab, not counting or device controls ${reading.route}/${scenario.language} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: scenario.width, height: 1000 });
      await page.addInitScript((scenario) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { ...scenario, reduceMotion: true, hapticFeedback: false },
            profile: { isGuest: true },
          }),
        );
      }, scenario);
      await page.goto(`/#${reading.route}`);
      const region = page.locator(".reader-text-scroll:visible");
      const counter = page.getByTestId(reading.counter);
      await expect(region).toBeVisible();
      await expect(counter).toBeVisible();
      await region.focus();
      await expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
      const quietShadow = await region.evaluate((node) => getComputedStyle(node).boxShadow);
      await tabIntoReading(page, region);
      await expect(region).not.toHaveCSS("box-shadow", quietShadow);
      const countState = async () => ({
        label: await counter.getAttribute("aria-label"),
        index: await page.evaluate(
          () => document.querySelector('[data-testid="reader-screen"]')?.getAttribute("data-zikr-index") ?? null,
        ),
      });
      const before = await countState();
      await page.keyboard.press("Space");
      await expect.poll(countState).not.toEqual(before);
      await expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
      await expect(region).toHaveCSS("box-shadow", quietShadow);

      for (const key of ["AudioVolumeUp", "AudioVolumeDown", "AudioVolumeMute"]) {
        await tabIntoReading(page, region);
        // Browser simulation verifies our event handling; real OEM keys remain device acceptance.
        expect(
          await region.evaluate(
            (node, key) => node.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })),
            key,
          ),
        ).toBe(true);
        await expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
      }

      await page
        .getByRole("button", {
          name: t(scenario.language, reading.collection ? "reader.menu" : "common.moreOptions"),
          exact: true,
        })
        .click();
      if (reading.collection) {
        await clickReaderOption(page, t(scenario.language, "counter.muteSound"));
      } else {
        await page.getByRole("menuitem", { name: t(scenario.language, "counter.muteSound"), exact: true }).click();
      }
      await page.keyboard.press("Escape");
      await region.focus();
      await expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
      await page.screenshot({ path: info.outputPath("reading-without-incidental-boundary.png") });

      await page.emulateMedia({ forcedColors: "active" });
      await tabIntoReading(page, region);
      await expect(region).toHaveCSS("outline-style", "solid");
      await expect(region).toHaveCSS("outline-width", "2px");
      await page.keyboard.press("Space");
      await expect(region).toHaveCSS("outline-style", "none");
    });
  }
}
