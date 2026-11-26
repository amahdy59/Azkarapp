import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const scenario of [
  { width: 390, height: 844, scale: 1, language: "ar", theme: "dark" },
  { width: 320, height: 844, scale: 2, language: "ar", theme: "light" },
  { width: 834, height: 1112, scale: 1, language: "en", theme: "midnight" },
  { width: 1440, height: 900, scale: 1, language: "en", theme: "light" },
] as const) {
  test(`enlarged Quran fits portions and returns to the unchanged Mushaf ${scenario.width}/${scenario.scale} @cross-browser`, async ({
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
    const trigger = page.getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true });
    await trigger.click();
    const modal = page.getByTestId("quran-enlarged-reading");
    const text = modal.getByTestId("quran-enlarged-text");
    await expect(text).toBeVisible();
    if (scenario.width < 600) {
      const frame = (await modal.boundingBox())!;
      expect(frame.x).toBeCloseTo(0, 0);
      expect(frame.y).toBeCloseTo(0, 0);
      expect(frame.width).toBeCloseTo(scenario.width, 0);
      expect(frame.height).toBeCloseTo(scenario.height, 0);
    }
    await page.evaluate((scale) => {
      document.documentElement.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    await modal.getByRole("button", { name: t(scenario.language, "quranZoom.larger") }).click();
    await expect(text).toBeVisible();
    const close = (await modal.getByTestId("modal-close-button").boundingBox())!;
    expect(close.width).toBe(48);
    expect(close.height).toBe(48);
    for (const block of await modal.locator(".quran-enlarged-heading > *").all()) {
      const box = (await block.boundingBox())!;
      if (scenario.language === "ar") expect(box.x).toBeGreaterThanOrEqual(close.x + close.width + 4);
      else expect(box.x + box.width).toBeLessThanOrEqual(close.x - 4);
    }
    const contextHeight = (await modal.locator(".quran-portion-context").boundingBox())!.height;
    const expected = await modal
      .locator(".quran-enlarged-measure [data-zoom-word]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-zoom-word")));
    const seen: (string | null)[] = [];
    const next = modal.getByRole("button", { name: t(scenario.language, "common.next"), exact: true });
    for (let portion = 0; portion <= expected.length; portion += 1) {
      await expect(text).toBeVisible();
      expect((await modal.locator(".quran-portion-context").boundingBox())!.height).toBeCloseTo(contextHeight, 0);
      seen.push(
        ...(await text
          .locator("[data-zoom-word]")
          .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-zoom-word")))),
      );
      const bounds = await text.evaluate((node) => {
        const frame = node.parentElement!.getBoundingClientRect(),
          text = node.getBoundingClientRect();
        const boxes = [...node.querySelectorAll("[data-zoom-word]")].map((word) => word.getBoundingClientRect());
        return {
          overflow: node.scrollWidth - node.clientWidth,
          bottom: text.bottom - frame.bottom,
          ink: boxes.every(
            (box) =>
              box.left >= frame.left - 1 &&
              box.right <= frame.right + 1 &&
              box.bottom <= frame.bottom + 1 &&
              box.top >= frame.top - 1,
          ),
        };
      });
      expect(bounds, JSON.stringify(bounds)).toMatchObject({ ink: true });
      expect(bounds.overflow).toBeLessThanOrEqual(1);
      expect(bounds.bottom).toBeLessThanOrEqual(1);
      if (await next.isDisabled()) break;
      // Exercise pointer entry and native keyboard continuation. WebKit's
      // per-click stabilization otherwise dominates large-text word portions.
      if (portion === 0) await next.click();
      else await next.press("Enter");
    }
    expect(seen).toEqual(expected);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="quran-enlarged-reading"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`enlarged-${scenario.width}.png`) });
    await modal.getByRole("button", { name: t(scenario.language, "quranZoom.returnMushaf") }).click();
    await expect(modal).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await paper.locator("[data-mushaf-line-content]").allTextContents()).toEqual(original);
    await expect(paper).toHaveAttribute("data-magnified", "false");
    await expect(page).toHaveURL(/quran\/42$/);
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
