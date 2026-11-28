import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const scenario of [
  { width: 390, height: 844, scale: 1, language: "ar", theme: "dark" },
  { width: 320, height: 844, scale: 2, language: "ar", theme: "light" },
  { width: 834, height: 1112, scale: 1, language: "en", theme: "midnight" },
  { width: 1440, height: 900, scale: 1, language: "en", theme: "light" },
] as const) {
  test(`continuous Quran zoom has one header and returns at 100% ${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, info) => {
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
            reduceMotion: true,
            mushafLayout: "single",
          },
          profile: { isGuest: true },
        }),
      );
    }, scenario);
    await page.goto("/#/quran/42");
    const paper = page.locator(".mushaf-paper");
    await expect(paper.locator("[data-mushaf-rendering]").first()).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const original = await paper.locator("[data-mushaf-line-content]").allTextContents();
    const data = (await (await page.request.get("/data/mushaf/42.json")).json()) as {
      k: string;
      w: [number, number, number, string, string][];
    }[];
    const expected = data.flatMap((verse) => verse.w.map((word) => `${verse.k}:${word[0]}`));
    const trigger = page.getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true });
    await trigger.click();
    const region = page.getByTestId("quran-enlarged-reading");
    const header = page.getByTestId("quran-zoom-header");
    const text = region.getByTestId("quran-enlarged-text");
    await expect(region).toBeFocused();
    await expect(header).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".mushaf-control-band--top")).toHaveCount(0);
    await expect(page.getByTestId("enlarged-reading-toolbar")).toHaveCount(0);
    await expect(page.locator(".quran-portion-navigation")).toHaveCount(0);
    await expect(page.locator(".mushaf-control-band--bottom button")).toHaveCount(1);
    await expect(trigger).toHaveCount(0);
    await page.evaluate((scale) => {
      document.documentElement.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    expect(
      await text
        .locator("[data-zoom-word]")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-zoom-word"))),
    ).toEqual(expected);
    for (const control of await header.getByRole("button").all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(scenario.width + 1);
      const hittable = await control.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      });
      expect(hittable).toBe(true);
    }
    const area = (await paper.boundingBox())!;
    const frame = (await region.boundingBox())!;
    expect(frame.y).toBeGreaterThanOrEqual(area.y - 1);
    expect(frame.y + frame.height).toBeLessThanOrEqual(area.y + area.height + 1);
    const geometry = await region.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      const bounds = node.getBoundingClientRect();
      const words = [...node.querySelectorAll("[data-zoom-word]")];
      const last = words.at(-1)!.getBoundingClientRect();
      return {
        overflow: node.scrollWidth - node.clientWidth,
        scrolls: node.scrollHeight > node.clientHeight,
        lastReachable: last.bottom <= bounds.bottom && last.top >= bounds.top,
        ink: words.every((word) => {
          const box = word.getBoundingClientRect();
          return box.left >= bounds.left && box.right <= bounds.right;
        }),
      };
    });
    expect(geometry).toEqual({ overflow: 0, scrolls: true, lastReachable: true, ink: true });
    await region.evaluate((node) => {
      node.scrollTop = node.scrollHeight / 3;
    });
    const visibleWord = () =>
      region.evaluate((node) => {
        const top = node.getBoundingClientRect().top;
        return [...node.querySelectorAll("[data-zoom-word]")]
          .find((word) => word.getBoundingClientRect().bottom > top + 8)
          ?.getAttribute("data-zoom-word");
      });
    const anchor = await visibleWord();
    await header.getByRole("button", { name: t(scenario.language, "quranZoom.larger"), exact: true }).click();
    // Reflow may put earlier words on the same line; the anchored passage
    // must remain visible within the first line, rather than jumping away.
    await expect
      .poll(() =>
        region.evaluate((node, id) => {
          const word = [...node.querySelectorAll<HTMLElement>("[data-zoom-word]")].find(
            (word) => word.dataset.zoomWord === id,
          )!;
          const box = word.getBoundingClientRect(),
            frame = node.getBoundingClientRect();
          return (
            box.top >= frame.top - 1 &&
            box.bottom <= frame.top + parseFloat(getComputedStyle(word.parentElement!.parentElement!).lineHeight) + 16
          );
        }, anchor),
      )
      .toBe(true);
    await expect(page).toHaveURL(/quran\/42$/);
    expect((await new AxeBuilder({ page }).include(".mushaf-reader-viewer").analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath(`header-zoom-${scenario.width}.png`) });
    // Page view is the same reset as reducing to 100%.
    await header.getByRole("button", { name: t(scenario.language, "quranZoom.pageView") }).click();
    await expect(region).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await paper.locator("[data-mushaf-line-content]").allTextContents()).toEqual(original);
    await trigger.click();
    const smaller = header.getByRole("button", { name: t(scenario.language, "quranZoom.smaller"), exact: true });
    await smaller.click();
    await smaller.click();
    await expect(region).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(paper).toHaveAttribute("data-magnified", "false");
    expect(await paper.locator("[data-mushaf-line-content]").allTextContents()).toEqual(original);
  });
}

test("two fingers open enlarged Quran without turning the page @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  await page.goto("/#/quran/42");
  const paper = page.locator(".mushaf-paper");
  await expect(paper).toBeVisible();
  await paper.evaluate((node) => {
    const touch = (id: number, x: number) => ({ identifier: id, target: node, clientX: x, clientY: 250 });
    const send = (type: string, touches: object[]) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, "touches", { value: touches });
      Object.defineProperty(event, "changedTouches", { value: [touch(1, 90)] });
      node.dispatchEvent(event);
    };
    send("touchstart", [touch(1, 140), touch(2, 240)]);
    send("touchmove", [touch(1, 100), touch(2, 280)]);
    send("touchend", []);
    (node as HTMLElement).click();
  });
  await expect(page.getByTestId("quran-enlarged-reading")).toBeVisible();
  await expect(page).toHaveURL(/quran\/42$/);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("quran-enlarged-reading")).toBeHidden();
});
