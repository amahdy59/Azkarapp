import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { listeningCases, openListeningPage } from "./helpers/quran-listening";

test.use({ serviceWorkers: "block" });

for (const scenario of [
  { width: 390, height: 844, language: "ar", theme: "light", material: "solid", scale: 1 },
  { width: 320, height: 844, language: "en", theme: "midnight", material: "glass", scale: 2 },
  { width: 834, height: 1112, language: "ar", theme: "dark", material: "solid", scale: 1 },
  { width: 1440, height: 900, language: "en", theme: "light", material: "glass", scale: 1 },
] as const) {
  test(`inline Quran tools and compact protected meaning ${scenario.width} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((scenario) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: scenario.language,
            themeMode: scenario.theme,
            mushafTheme: scenario.theme,
            appMaterial: scenario.material,
            reduceMotion: true,
            mushafLayout: "single",
          },
          profile: { isGuest: true },
        }),
      );
    }, scenario);
    await page.goto("/#/quran/42");
    const paper = page.locator(".mushaf-paper");
    await expect(paper.locator('[data-mushaf-rendering="qcf-v2"]')).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const original = await paper.locator("[data-mushaf-line-content]").allTextContents();
    const normalFont = await paper
      .locator("[data-mushaf-line-content]")
      .first()
      .evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(original).toHaveLength(15);
    const zoom = page.getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true });
    if (scenario.width === 390 || scenario.width === 320) {
      await expect(page.getByTestId("mushaf-corner-bottom-left").getByRole("button")).toHaveCount(1);
      await expect(page.getByTestId("mushaf-focus-toggle")).toHaveCount(0);
      const row = await page.locator(".mushaf-control-band--bottom").evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        const css = getComputedStyle(node);
        const buttons = [...node.querySelectorAll("button")].map((button) => button.getBoundingClientRect());
        const contentHeight = bounds.height - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
        return {
          oneRow: Math.abs(contentHeight - Math.max(...buttons.map((box) => box.height))) <= 1,
          aligned: buttons.every(
            (box) => Math.abs(box.y + box.height / 2 - (buttons[0].y + buttons[0].height / 2)) <= 1,
          ),
        };
      });
      expect(row).toEqual({ oneRow: true, aligned: true });
    }
    await page.screenshot({ path: info.outputPath("normal-reading.png") });
    await zoom.click();
    const enlarged = page.getByTestId("quran-enlarged-reading");
    await expect(enlarged.getByTestId("quran-enlarged-text")).toHaveAttribute("data-layout-ready", "true");
    await expect(enlarged).toBeFocused();
    await expect(paper.locator('[aria-hidden="true"][inert]')).toHaveCount(1);
    expect(
      await enlarged.getByTestId("quran-enlarged-text").evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
    ).toBeGreaterThan(normalFont * 1.4);
    await page.screenshot({ path: info.outputPath("inline-enlargement.png") });
    const initialScroll = await enlarged.evaluate((node) => node.scrollTop);
    await page.keyboard.press("PageDown");
    await expect.poll(() => enlarged.evaluate((node) => node.scrollTop)).toBeGreaterThan(initialScroll);
    await expect(page).toHaveURL(/quran\/42$/);
    await page.keyboard.press("Escape");
    await expect(enlarged).toHaveCount(0);
    await expect(zoom).toBeFocused();
    expect(await paper.locator("[data-mushaf-line-content]").allTextContents()).toEqual(original);
    await page.getByTestId("mushaf-difficult-words-switch").click();
    const word = paper.locator('[role="button"][aria-pressed]').first();
    await expect(word).toBeVisible();
    await word.click();
    const gloss = page.getByTestId("quran-word-popover");
    await expect(gloss).toBeVisible();
    const geometry = await gloss.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      const close = node.querySelector(".quran-word-popover-close")!.getBoundingClientRect();
      const hit = document.elementFromPoint(close.x + close.width / 2, close.y + close.height / 2);
      return {
        inside: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
        opaque: /^(?:rgb|color)\([^/]+\)$/.test(css.backgroundColor) && Number(css.opacity) === 1,
        noOverflow: node.scrollWidth <= node.clientWidth + 1,
        height: box.height,
        closeHit: node.querySelector(".quran-word-popover-close")!.contains(hit),
        target: close.width >= 44 && close.height >= 44,
      };
    });
    expect(geometry).toMatchObject({ inside: true, opaque: true, noOverflow: true, closeHit: true, target: true });
    if (scenario.scale === 1) expect(geometry.height).toBeLessThanOrEqual(160);
    expect((await new AxeBuilder({ page }).include('[data-testid="quran-word-popover"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: info.outputPath("compact-meaning.png") });
    await gloss.getByRole("button", { name: t(scenario.language, "reader.closeWordMeaning") }).click();
    await expect(word).toBeFocused();
    await page.locator("html").evaluate((node, scale) => {
      node.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    await word.click();
    await expect(gloss).toBeVisible();
    expect(
      await gloss.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight;
      }),
    ).toBe(true);
    if (scenario.scale > 1) {
      const rowClear = await page.locator(".mushaf-control-band--bottom").evaluate((node) => {
        const buttons = [...node.querySelectorAll("button")]
          .map((button) => button.getBoundingClientRect())
          .sort((a, b) => a.left - b.left);
        return {
          clear: buttons.every((box, index) => index === 0 || buttons[index - 1].right <= box.left + 1),
          boxes: buttons.map((box) => ({ left: box.left, right: box.right, width: box.width })),
        };
      });
      expect(rowClear.clear, JSON.stringify(rowClear.boxes)).toBe(true);
      await expect
        .poll(() =>
          gloss.evaluate((node) => {
            const close = node.querySelector(".quran-word-popover-close")!;
            const box = close.getBoundingClientRect();
            return (
              node.scrollWidth <= node.clientWidth + 1 &&
              close.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
            );
          }),
        )
        .toBe(true);
      await page.screenshot({ path: info.outputPath("compact-meaning-scaled.png") });
    }
    await page.keyboard.press("Escape");
    await expect(gloss).toHaveCount(0);
    await expect(page).toHaveURL(/quran\/42$/);
  });
}

for (const scenario of [
  { width: 390, height: 844, language: "ar" },
  { width: 1440, height: 900, language: "en" },
] as const) {
  test(`expanded audio controls fit without ordinary scrolling ${scenario.width} @cross-browser`, async ({
    page,
  }, info) => {
    await openListeningPage(page, listeningCases[0], scenario.language);
    await page.setViewportSize(scenario);
    await page.goto("/#/quran/1");
    await expect(page.locator('[data-mushaf-page="1"]').first()).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const normalGeometry = await page
      .locator("[data-mushaf-line-content]")
      .first()
      .evaluate((node) => ({ font: getComputedStyle(node).fontSize, box: node.getBoundingClientRect().toJSON() }));
    const direct = page.getByTestId("mushaf-rail-listen");
    if (await direct.isVisible()) await direct.click();
    else {
      await page.getByTestId("mushaf-more-actions").click();
      await page.getByTestId("mushaf-quick-audio").click();
    }
    const player = page.getByRole("region", { name: t(scenario.language, "audioPlayer.region"), exact: true });
    await expect(player).toHaveAttribute("data-variant", "compact");
    await player.getByRole("button", { name: t(scenario.language, "audioPlayer.expand"), exact: true }).click();
    await expect(player).toHaveAttribute("data-variant", "expanded");
    await expect(player.getByTestId("audio-options-sidebar")).toHaveCount(0);
    const reading = player.locator(".audio-expanded-reading");
    const audioLine = player.locator("[data-mushaf-line-content]").first();
    await expect(audioLine).toBeVisible();
    const audioGeometry = await audioLine.evaluate((node) => ({
      font: getComputedStyle(node).fontSize,
      box: node.getBoundingClientRect().toJSON(),
      canvas: node.closest("[data-mushaf-page]")?.getBoundingClientRect().toJSON(),
    }));
    expect(parseFloat(audioGeometry.font)).toBeGreaterThanOrEqual(parseFloat(normalGeometry.font) * 0.95);
    const rootBounds = (await player.boundingBox())!;
    const readingBounds = (await reading.boundingBox())!;
    expect(
      Math.abs(readingBounds.x + readingBounds.width / 2 - (rootBounds.x + rootBounds.width / 2)),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("expanded-audio.png") });
    const before = await reading.boundingBox();
    await player.getByRole("button", { name: t(scenario.language, "audioPlayer.options"), exact: true }).click();
    const options = page.getByRole("dialog", { name: t(scenario.language, "audioPlayer.options"), exact: true });
    await expect(options).toBeVisible();
    expect(await reading.boundingBox()).toEqual(before);
    expect(
      await options.locator(".audio-options-scroll").evaluate((node) => node.scrollHeight - node.clientHeight),
    ).toBeLessThanOrEqual(1);
    expect(
      await player.locator(".audio-expanded-layout").evaluate((node) => node.scrollHeight - node.clientHeight),
    ).toBeLessThanOrEqual(1);
    for (const control of await options
      .getByRole("button")
      .or(options.getByRole("combobox"))
      .or(options.locator("summary"))
      .all()) {
      const box = await control.boundingBox();
      if (!box) continue;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.outputPath("expanded-audio-options.png") });
    expect((await new AxeBuilder({ page }).include(".floating-audio-player--expanded").analyze()).violations).toEqual(
      [],
    );
    const reciter = options.getByTestId("audio-reciter-select");
    await reciter.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(reciter).toBeFocused();
    await expect(options).toBeVisible();
    await page.keyboard.press("Escape");
    await page.screenshot({ path: info.outputPath("expanded-audio.png") });
  });
}
