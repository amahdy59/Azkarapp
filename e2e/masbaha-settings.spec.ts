import { formatNumerals } from "../src/app/formatting";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { checkMasbahaSettings, openMasbahaSettings } from "./helpers/masbaha-settings";

for (const language of ["ar", "en"] as const) {
  test(`mobile Masbaha settings preserve counts and explicit choices ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, themeMode: "light" },
            profile: { isGuest: true },
            masbahaState: { count: 3, target: 100, laps: 0, selectedZikrId: "auth_subhanallah_wabihamdihi" },
          }),
        );
    }, language);
    await page.goto("/#/counter");
    const counter = page.getByTestId("custom-counter-surface");
    await expect(counter).toBeVisible();
    const before = await counter.getAttribute("aria-label");
    for (const [width, scale] of [
      [390, 1],
      [320, 2],
    ] as const) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
        node.setAttribute("data-app-material-resolved", scale === 2 ? "glass" : "solid");
      }, scale);
      await checkMasbahaSettings(page, language);
    }
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "100%";
      node.setAttribute("data-app-material-resolved", "solid");
    });
    let sheet = await openMasbahaSettings(page);
    await sheet.getByRole("radio", { name: formatNumerals(33, language), exact: true }).check();
    await sheet.getByRole("button", { name: t(language, "common.cancel"), exact: true }).click();
    await expect(counter).toHaveAttribute("aria-label", before!);
    sheet = await openMasbahaSettings(page);
    await sheet.getByRole("radio", { name: t(language, "counter.custom"), exact: true }).check();
    await sheet.getByRole("spinbutton").fill("55");
    await sheet.getByRole("button", { name: t(language, "counter.applySettings"), exact: true }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByTestId("masbaha-settings-summary")).toContainText(language === "ar" ? "٥٥" : "55");
    await page.reload();
    await expect(page.getByTestId("masbaha-settings-summary")).toContainText(language === "ar" ? "٥٥" : "55");
    await expect(counter.locator(".counter-number")).toHaveText(language === "ar" ? "٣" : "3");
    await page.screenshot({ path: info.outputPath("mobile-settings-summary.png") });
    await openMasbahaSettings(page);
    await page.screenshot({ path: info.outputPath("mobile-settings-sheet.png") });
    sheet = page.getByTestId("masbaha-settings-sheet");
    await sheet.locator("summary").click();
    await sheet
      .getByRole("group", { name: t(language, "counter.chooseDhikr"), exact: true })
      .getByRole("radio")
      .nth(1)
      .check();
    await sheet.getByRole("button", { name: t(language, "counter.applySettings"), exact: true }).click();
    await page.getByRole("button", { name: t(language, "counter.saveAndSwitch"), exact: true }).click();
    sheet = await openMasbahaSettings(page);
    await sheet.locator("summary").click();
    await sheet
      .getByRole("group", { name: t(language, "counter.chooseDhikr"), exact: true })
      .getByRole("radio")
      .first()
      .check();
    await sheet.getByRole("button", { name: t(language, "counter.applySettings"), exact: true }).click();
    await expect(counter.locator(".counter-number")).toHaveText(formatNumerals(3, language));
    await expect(page.getByTestId("masbaha-settings-summary")).toContainText(formatNumerals(55, language));
  });
}
