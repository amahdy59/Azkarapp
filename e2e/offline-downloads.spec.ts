import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { playEnglishTranslation } from "./reader-options";

for (const scenario of [
  { language: "ar", width: 320, height: 568, theme: "dark", scale: 1 },
  { language: "en", width: 390, height: 844, theme: "light", scale: 1 },
  { language: "ar", width: 820, height: 1024, theme: "midnight", scale: 1 },
  { language: "en", width: 1440, height: 900, theme: "dark", scale: 1 },
  { language: "en", width: 390, height: 844, theme: "light", scale: 2 },
  { language: "ar", width: 844, height: 390, theme: "midnight", scale: 1 },
] as const) {
  test(`offline downloads remain reachable with audio: ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(scenario);
    await page.addInitScript(({ language, theme }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: theme, reduceMotion: true },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
      HTMLMediaElement.prototype.play = function () {
        Object.defineProperty(this, "duration", { configurable: true, value: 120 });
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      };
    }, scenario);
    await page.goto("/#/azkar/evening/1");
    if (scenario.language === "en") await playEnglishTranslation(page);
    else await page.getByTestId("reader-audio-dock-button").click();
    await page.evaluate(() => {
      window.location.hash = "/settings/downloads";
    });
    const scroll = page.getByTestId("downloads-scroll");
    await expect(scroll).toBeVisible();
    const viewport = scenario.width >= 900 ? page.locator(".settings-detail-pane") : scroll;
    if (scenario.scale === 2)
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
    const player = page.getByRole("region", { name: t(scenario.language, "audioPlayer.region"), exact: true });
    await expect(player).toHaveAttribute("data-variant", "compact");
    await expect(page.getByTestId("offline-resource-baqarah")).toContainText(
      scenario.language === "ar" ? "٢٧٣" : "273",
    );
    await expect(page.getByTestId("offline-resource-kahf")).toContainText(scenario.language === "ar" ? "٧٧" : "77");
    const refresh = scroll.getByRole("button", { name: t(scenario.language, "downloads.refresh"), exact: true });
    await scroll.locator("summary").click();
    await refresh.focus();
    await viewport.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect
      .poll(async () => {
        const control = (await refresh.boundingBox())!;
        const dock = (await player.boundingBox())!;
        return control.y + control.height - dock.y;
      })
      .toBeLessThanOrEqual(0);
    await refresh.focus();
    await expect(refresh).toBeFocused();
    const geometry = await scroll.evaluate((el) => ({
      overflow: el.scrollWidth - el.clientWidth,
      buttons: Array.from(el.querySelectorAll("button, summary"))
        .filter((el) => el.getClientRects().length)
        .map((el) => {
          const box = el.getBoundingClientRect();
          return { width: box.width, height: box.height };
        }),
    }));
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    for (const box of geometry.buttons) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: testInfo.outputPath("offline-downloads-with-player.png"), fullPage: true });
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(scan.violations).toEqual([]);
    await player.getByRole("button", { name: t(scenario.language, "audioPlayer.expand"), exact: true }).click();
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await player.getByRole("button", { name: t(scenario.language, "audioPlayer.collapse"), exact: true }).click();
    await expect(player).toHaveAttribute("data-variant", "compact");
    await refresh.focus();
    await viewport.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect
      .poll(async () => {
        const control = (await refresh.boundingBox())!;
        const dock = (await player.boundingBox())!;
        return control.y + control.height - dock.y;
      })
      .toBeLessThanOrEqual(0);
  });
}
