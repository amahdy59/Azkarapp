import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const width of [320, 390, 1440]) {
  test(`English main meaning stays reachable and survives navigation/reload at ${width}px @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language: "en", reduceMotion: true, routineModes: { morning: "complete" } },
            profile: { isGuest: true },
          }),
        );
    });
    await page.goto("/#/azkar/morning/1");
    const toggle = page.getByTestId("reader-language-toggle");
    const region = page.locator(".reader-text-scroll");
    await expect(toggle).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const before = (await toggle.boundingBox())!;
    const counter = page.getByTestId("counter-surface");
    const count = await counter.getAttribute("aria-label");
    await toggle.press("Enter");
    await expect(page.getByTestId("reader-main-translation")).toBeVisible();
    await expect(toggle).toHaveAccessibleName("Show Arabic");
    await expect(counter).toHaveAttribute("aria-label", count!);
    const after = (await toggle.boundingBox())!;
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    expect(
      await region.evaluate((node) => node.contains(document.querySelector('[data-testid="reader-language-toggle"]'))),
    ).toBe(false);
    for (const top of [100, 1000, 80, 0]) {
      await region.evaluate((node, top) => {
        node.scrollTop = top;
      }, top);
      const bounds = (await toggle.boundingBox())!;
      expect(Math.abs(bounds.y - after.y)).toBeLessThanOrEqual(1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual((await region.boundingBox())!.y + 1);
      await expect(toggle).toBeInViewport();
    }
    await page.screenshot({ path: testInfo.outputPath(`english-toolbar-${width}.png`) });
    await expect
      .poll(() =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.readerMeaningOnly),
      )
      .toBe(true);
    await page.goto("/#/settings/reading");
    await expect(page.getByTestId("reader-footer-preview")).toBeVisible();
    await page.goto("/#/azkar/morning/1");
    await expect(page.getByTestId("reader-main-translation")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("reader-main-translation")).toBeVisible();
    await expect(toggle).toHaveAccessibleName("Show Arabic");
    await toggle.press("Space");
    await expect(page.getByTestId("zikr-text")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.readerMeaningOnly),
      )
      .toBe(false);
    await page.reload();
    await expect(toggle).toHaveAccessibleName("Show English meaning");
    await expect(page.getByTestId("reader-main-translation")).toHaveCount(0);
    // Enlarged reading keeps the action within bounds and separate from the text.
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(toggle).toBeInViewport();
    expect(await toggle.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect(await page.locator(".app-shell").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`english-toolbar-${width}-200.png`) });
  });
}

for (const language of ["ar", "en"] as const) {
  test(`Reading settings shows a live harmless footer preview in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/settings/reading");
    const preview = page.getByTestId("reader-footer-preview");
    await expect(preview).toHaveAttribute("aria-hidden", "true");
    const buttons = preview.locator("button");
    await expect(buttons).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    for (const choice of ["iconsOnly", "iconsWithLabels"] as const) {
      const radio = page.getByRole("radio", { name: t(language, `settings.${choice}`), exact: true });
      await radio.click();
      await expect(radio).toBeChecked();
      await preview.scrollIntoViewIfNeeded();
      for (const button of await buttons.all()) {
        await expect(button).toBeDisabled();
        if (choice === "iconsOnly") await expect(button.locator(".reader-tool-label")).toBeHidden();
        else await expect(button.locator(".reader-tool-label")).toBeVisible();
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(52);
        expect(box.height).toBeGreaterThanOrEqual(52);
      }
      await page.screenshot({ path: testInfo.outputPath(`footer-preview-${language}-${choice}.png`) });
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await preview.scrollIntoViewIfNeeded();
    expect(await preview.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: testInfo.outputPath(`footer-preview-${language}-200.png`) });
  });
}

test("shared feedback has appropriate press depth, clean cancellation and disabled recovery @cross-browser", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: false }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/azkar/morning/1");
  const share = page.getByTestId("reader-share-dock-button");
  await expect(share).toBeVisible();
  const transitions = await share.evaluate((node) => getComputedStyle(node).transitionProperty);
  expect(transitions).toContain("background-color");
  expect(transitions).toContain("border-color");
  const pressScale = () => share.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11);
  await share.focus();
  await page.keyboard.down(" ");
  await expect.poll(pressScale).toBeCloseTo(0.97, 2);
  await page.keyboard.press("Tab");
  await expect(share).not.toHaveAttribute("data-key-pressed");
  await page.keyboard.up(" ");
  await expect.poll(pressScale).toBeCloseTo(1, 3);
  await expect(share).toHaveCSS("opacity", "1");
  await page.evaluate(() => {
    document.documentElement.dataset.readerToolLabels = "false";
  });
  await share.focus();
  await page.keyboard.down(" ");
  await expect.poll(pressScale).toBeCloseTo(0.92, 2);
  await page.keyboard.press("Tab");
  await page.keyboard.up(" ");
  await expect.poll(pressScale).toBeCloseTo(1, 3);
  await share.evaluate((node) => node.setAttribute("aria-disabled", "true"));
  const box = (await share.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(share).toHaveCSS("transform", "none");
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await share.evaluate((node) => node.removeAttribute("aria-disabled"));
  await share.press("Enter");
  const modal = page.getByTestId("collection-share-modal");
  await expect(modal).toBeVisible();
  const summary = modal
    .locator("summary")
    .filter({ hasText: /Customize content/ })
    .first();
  await summary.focus();
  await page.keyboard.down(" ");
  await expect(summary).toHaveAttribute("data-key-pressed", "");
  await page.keyboard.up(" ");
  await expect(summary).not.toHaveAttribute("data-key-pressed");
  await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
});

for (const scenario of [
  { width: 844, height: 390, scale: 1 },
  { width: 320, height: 480, scale: 2 },
]) {
  test(`short Reader recovers every action at ${scenario.width}x${scenario.height} and ${scenario.scale}x text @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "en", reduceMotion: true, readerMeaningOnly: true },
          profile: { isGuest: true },
        }),
      );
    });
    await page.goto("/#/azkar/morning/1");
    const toggle = page.getByTestId("reader-language-toggle");
    const counter = page.getByTestId("counter-surface");
    await expect(toggle).toBeVisible();
    await page.evaluate((scale) => {
      document.documentElement.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    const bounds = (await counter.boundingBox())!;
    if (bounds.y + bounds.height > scenario.height) {
      if (testInfo.project.name === "mobile-webkit-smoke") {
        // Mobile WebKit exposes no wheel input. Native keyboard focus must
        // recover the same target without programmatically scrolling it.
        await counter.focus();
      } else {
        const progress = (await page.getByTestId("reader-session-chrome").boundingBox())!;
        await page.mouse.move(progress.x + progress.width / 2, progress.y + progress.height / 2);
        await page.mouse.wheel(0, 1500);
      }
    }
    await expect(counter).toBeInViewport({ ratio: 1 });
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await expect(toggle).toBeInViewport({ ratio: 1 });
    expect(await toggle.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`short-reader-${scenario.width}-${scenario.scale}.png`) });
  });
}
