import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { formatNumerals } from "../src/app/formatting";

for (const language of ["ar", "en"] as const) {
  test(`quiet Masbaha keeps large tallies, equal actions and deliberate touch counting ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: language === "ar" ? "light" : "midnight", reduceMotion: true },
          profile: { isGuest: true },
          masbahaState: { count: 99999, target: 100000, laps: 0, selectedZikrId: "auth_subhanallah_wabihamdihi" },
        }),
      );
    }, language);
    await page.goto("/#/counter");
    const counter = page.getByTestId("custom-counter-surface");
    await expect(counter.locator(".counter-number")).toHaveText(formatNumerals(99999, language));
    for (const [width, height, scale] of [
      [320, 568, 2],
      [390, 844, 1],
      [834, 1112, 1],
      [1440, 900, 2],
    ]) {
      await page.setViewportSize({ width, height });
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      const ink = await counter.locator(".masbaha-ring-value").evaluate((frame) => {
        const bounds = frame.getBoundingClientRect();
        return [...frame.querySelectorAll("bdi")].every((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const text = range.getBoundingClientRect();
          return (
            text.left >= bounds.left - 1 &&
            text.right <= bounds.right + 1 &&
            text.top >= bounds.top - 1 &&
            text.bottom <= bounds.bottom + 1
          );
        });
      });
      expect(ink).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const header = page.getByTestId("custom-counter-header-toolbar");
      const title = (await header.getByRole("heading").boundingBox())!;
      for (const button of await header.getByRole("button").all()) {
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        expect(
          box.y + box.height <= title.y + 1 || box.x + box.width <= title.x + 1 || box.x >= title.x + title.width - 1,
        ).toBe(true);
        expect(
          await button.evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            return node.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
          }),
        ).toBe(true);
      }
      const actions = page.getByTestId("masbaha-support-actions").getByRole("button");
      await expect(actions).toHaveCount(3);
      const boxes = await actions.evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { width: box.width, height: box.height };
        }),
      );
      expect(
        Math.max(...boxes.map((box) => box.width)) - Math.min(...boxes.map((box) => box.width)),
      ).toBeLessThanOrEqual(1);
      for (const box of boxes) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await counter.focus();
      await actions.last().focus();
      await expect(actions.last()).toBeInViewport();
      const action = (await actions.last().boundingBox())!;
      const reading = (await page.locator(".masbaha-reading").boundingBox())!;
      expect(action.y, `${language}/${width}/${scale}`).toBeGreaterThanOrEqual(reading.y - 1);
      expect(action.y + action.height, `${language}/${width}/${scale}`).toBeLessThanOrEqual(
        reading.y + reading.height + 1,
      );
      await page.screenshot({ path: info.outputPath(`quiet-${language}-${width}-${scale}x.png`) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "100%";
    });
    const before = await counter.getAttribute("aria-label");
    await page.getByTestId("reader-card").evaluate((node) => {
      const touch = (id: number, y: number) => ({ identifier: id, target: node, clientX: 130 + id * 40, clientY: y });
      const send = (type: string, touches: object[], changed = touches) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "touches", { value: touches });
        Object.defineProperty(event, "changedTouches", { value: changed });
        node.dispatchEvent(event);
      };
      send("touchstart", [touch(1, 250)]);
      send("touchmove", [touch(1, 330)]);
      send("touchend", [], [touch(1, 330)]);
      (node as HTMLElement).click();
      send("touchstart", [touch(1, 250), touch(2, 250)]);
      send("touchmove", [touch(1, 230), touch(2, 270)]);
      send("touchend", [], [touch(1, 230)]);
      (node as HTMLElement).click();
    });
    await expect(counter).toHaveAttribute("aria-label", before!);
    await counter.click();
    await expect(counter.locator(".counter-number")).toHaveText(formatNumerals(100000, language));
    await expect(page.getByTestId("masbaha-completion")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect((await new AxeBuilder({ page }).include(".masbaha-screen").analyze()).violations).toEqual([]);
  });
}
