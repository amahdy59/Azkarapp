import { expect, test, type Locator } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

const passages = [
  { category: "morning", route: "morning", id: "m-hm-75", last: 255 },
  { category: "morning", route: "morning", id: "m-hm-76a", last: 4 },
  { category: "morning", route: "morning", id: "m-hm-76b", last: 5 },
  { category: "morning", route: "morning", id: "m-hm-76c", last: 6 },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-101", last: 286 },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-109a", last: 6 },
  { category: "waking_up", route: "waking-up", id: "wu-hm-4", last: 200 },
] as const;

async function geometry(text: Locator) {
  return text.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const scroll = element.closest(".reader-text-scroll")!;
    const words = [...element.querySelectorAll("[data-quran-word]")].map((word) => {
      const rect = word.getBoundingClientRect();
      const css = getComputedStyle(word);
      return [
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        css.fontFamily,
        css.fontSize,
        css.fontWeight,
        css.lineHeight,
        css.letterSpacing,
      ];
    });
    return { height: box.height, scrollTop: scroll.scrollTop, words };
  });
}

for (const fallback of [false, true])
  for (const passage of passages)
    for (const widths of [
      [320, 390],
      [820, 1440],
    ]) {
      test(`word help preserves every word box and final ayah: ${passage.id}/${fallback ? "fallback" : "QCF"}/${widths.join("-")} @cross-browser`, async ({
        page,
      }, info) => {
        await page.addInitScript(() => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem("azkarapp.counter-guidance.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language: "ar",
                themeMode: "midnight",
                reduceMotion: true,
                routineModes: { morning: "complete", before_sleep: "complete" },
              },
              profile: { isGuest: true },
            }),
          );
        });
        await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
        if (fallback) await page.route("**/fonts/qcf-v2/**", (route) => route.abort());
        const zikrs = getAzkarForMode(passage.category, "complete");
        const index = zikrs.findIndex((zikr) => zikr.id === passage.id);
        await page.goto(`/#/azkar/${passage.route}/${index + 1}`);
        const text = page.getByTestId("zikr-text");
        await expect(text).toBeVisible();
        if (!fallback) await expect(text.locator("[data-quran-glyph]").first()).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const toggle = page.getByRole("switch", { name: "كلمات غريبة", exact: true });
        for (const width of widths) {
          await page.setViewportSize({ width, height: 780 });
          await expect.poll(() => text.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
          await text.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
          );
          const before = await geometry(text);
          for (let cycle = 0; cycle < 2; cycle++) {
            await toggle.click();
            await expect(page.getByTestId("quran-word-help").first()).toBeAttached();
            expect(await geometry(text)).toEqual(before);
            await toggle.click();
            await expect(page.getByTestId("quran-word-help")).toHaveCount(0);
            expect(await geometry(text)).toEqual(before);
          }
        }
        await page.setViewportSize({ width: 390, height: 780 });
        const scroll = page.locator(".reader-text-scroll:visible");
        await scroll.evaluate((el) => {
          el.scrollTop = 0;
        });
        await text.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        const normal = await geometry(text);
        const normalSize = await text.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
        await page.locator("html").evaluate((el) => {
          el.style.fontSize = "32px";
        });
        await expect
          .poll(() => text.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)))
          .toBe(normalSize * 2);
        await text.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        await expect.poll(() => text.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        await scroll.evaluate((el) => {
          el.scrollTop = el.scrollHeight / 2;
        });
        await text.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        const enlarged = await geometry(text);
        await toggle.click();
        expect(await geometry(text)).toEqual(enlarged);
        await scroll.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        await text.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        const last = text.locator(`[data-quran-ayah="${passage.last}"]`);
        await expect(last).toBeVisible();
        const ending = await last.boundingBox();
        const region = await scroll.boundingBox();
        expect(ending!.y + ending!.height).toBeLessThanOrEqual(region!.y + region!.height);
        const semantic = await text.evaluate((el) => {
          const copy = el.cloneNode(true) as HTMLElement;
          copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
          return copy.textContent;
        });
        expect(semantic).toBe(zikrs[index]!.arabicText);
        if (passage.id === "wu-hm-4" && !fallback) {
          expect(await text.locator("[data-quran-ayah]").count()).toBe(11);
          await expect(text.locator('[data-quran-ayah="200"] > span')).toHaveCSS("font-family", "qcf-v2-page-76");
        }
        await page.locator("html").evaluate((el) => {
          el.style.fontSize = "";
        });
        await expect
          .poll(() => text.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)))
          .toBe(normalSize);
        await scroll.evaluate((el) => {
          el.scrollTop = 0;
        });
        await text.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        await expect.poll(() => geometry(text)).toEqual(normal);
        if (!fallback && widths[0] === 820)
          await page.screenshot({ path: info.outputPath(`quran-help-${passage.id}.png`) });
      });
    }
