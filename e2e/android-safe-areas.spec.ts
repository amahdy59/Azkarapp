import { expect, test, type Locator, type Page } from "@playwright/test";

type Insets = { top: number; right: number; bottom: number; left: number };
const gesture = { top: 32, right: 0, bottom: 24, left: 0 };
const buttons = { top: 48, right: 12, bottom: 48, left: 18 };
const zero = { top: 0, right: 0, bottom: 0, left: 0 };

async function seed(page: Page, language: "ar" | "en") {
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", appMaterial: "glass", reduceMotion: true, hapticFeedback: false },
        profile: { isGuest: true },
      }),
    );
  }, language);
}

/** Simulate Capacitor's actual CSS handoff, without rewriting app styles or
 * fabricating Android icons. Native delivery still requires device acceptance. */
async function supply(page: Page, insets: Insets) {
  await page.evaluate((insets) => {
    for (const [edge, value] of Object.entries(insets)) {
      document.documentElement.style.setProperty(`--safe-area-inset-${edge}`, `${value}px`);
    }
    document.querySelector(".app-shell")!.setAttribute("data-native-android", "true");
  }, insets);
  await expect(page.locator(".app-shell")).toHaveCSS("padding-top", `${insets.top}px`);
}

async function expectInside(page: Page, locator: Locator, insets: Insets) {
  await expect
    .poll(async () => {
      const rect = await locator.boundingBox();
      const viewport = page.viewportSize()!;
      return (
        !!rect &&
        rect.y >= insets.top - 1 &&
        rect.x >= insets.left - 1 &&
        rect.x + rect.width <= viewport.width - insets.right + 1 &&
        rect.y + rect.height <= viewport.height - insets.bottom + 1
      );
    })
    .toBe(true);
}

async function expectShell(page: Page, insets: Insets) {
  await expect(page.locator(".app-shell")).toHaveCSS("padding-left", `${insets.left}px`);
  await expect(page.locator(".app-shell")).toHaveCSS("padding-right", `${insets.right}px`);
  expect((await page.locator(".app-main").boundingBox())!.y).toBeCloseTo(insets.top, 0);
  const links = page.locator(".bottom-nav a:visible");
  for (const link of await links.all()) {
    await expectInside(page, link, insets);
    const box = (await link.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(
      await link.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

for (const language of ["ar", "en"] as const) {
  test(`wide Mushaf index and word explanations respect asymmetric insets ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 834, height: 640 });
    await seed(page, language);
    await page.goto("/#/quran/42");
    const paper = page.locator(".mushaf-paper");
    await expect(paper).toBeVisible();
    await supply(page, buttons);
    const opener = page.locator('[data-testid="mushaf-top-center-index"], [data-testid="mushaf-rail-index"]').first();
    await opener.click();
    const index = page.getByTestId("mushaf-index-modal");
    await expect(index).toBeVisible();
    await expectInside(page, index, buttons);
    await page.keyboard.press("Escape");
    await expect(index).toBeHidden();
    await expect(opener).toBeFocused();
    await page.getByTestId("mushaf-difficult-words-switch").click();
    const word = paper.locator('[role="button"][aria-pressed]').first();
    await word.click();
    const gloss = page.getByTestId("quran-word-popover");
    await expect(gloss).toBeVisible();
    await expectInside(page, gloss, buttons);
    await page.screenshot({ path: info.outputPath(`word-gloss-${language}-simulated-insets.png`), scale: "css" });
    await page.keyboard.press("Escape");
    await expect(gloss).toBeHidden();
    await expect(word).toBeFocused();
  });

  test(`native inset changes protect ordinary screens and recover to zero ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 872 });
    await seed(page, language);
    for (const route of [
      { path: "/home", marker: "home-utility-header" },
      { path: "/azkar/morning/1", marker: "reader-screen" },
      { path: "/settings", marker: "settings-screen" },
    ]) {
      await page.goto("/#" + route.path);
      await expect(page.getByTestId(route.marker)).toBeVisible();
      if (route.marker === "reader-screen") await expect(page.locator(".bottom-nav")).toHaveCount(0);
      else await expect(page.locator(".bottom-nav")).toBeVisible();
      for (const insets of [gesture, buttons, zero]) {
        await supply(page, insets);
        await expectShell(page, insets);
        if (route.marker === "reader-screen") {
          const footer = page.locator(".screen-chrome-footer").last();
          await expect(footer).toHaveCSS("padding-bottom", `${Math.max(12, insets.bottom)}px`);
          for (const action of await footer.locator("button:visible").all()) await expectInside(page, action, insets);
        }
      }
      await supply(page, buttons);
      await page.screenshot({
        path: info.outputPath(`${route.marker}-${language}-simulated-insets.png`),
        scale: "css",
      });
    }
    // Older WebViews can already be inset by Capacitor's native container.
    // Its explicit CSS zeros must not add the system spacing a second time.
    await page.setViewportSize({ width: 390, height: 816 });
    await supply(page, zero);
    await expectShell(page, zero);
    // Ordinary browser fallback restores without leaving a native inset.
    await page.locator("html").evaluate((node) => {
      for (const edge of ["top", "right", "bottom", "left"]) node.style.removeProperty(`--safe-area-inset-${edge}`);
    });
    await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "0px");
  });

  test(`reader menu and immersive bars follow live safe bounds ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 872 });
    await seed(page, language);
    await page.goto("/#/azkar/morning/1");
    const opener = page.getByTestId("reader-settings-button");
    await expect(opener).toBeVisible();
    await supply(page, buttons);
    await opener.click();
    const menu = page.getByTestId("reader-appearance-menu");
    await expect(menu).toBeVisible();
    await expectInside(page, menu, buttons);
    await supply(page, { ...buttons, top: 64, bottom: 64 });
    await expectInside(page, menu, { ...buttons, top: 64, bottom: 64 });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
    await page.goto("/#/quran/1");
    const top = page.locator(".mushaf-control-band--top");
    const bottom = page.locator(".mushaf-control-band--bottom");
    await expect(top).toBeVisible();
    await supply(page, buttons);
    expect((await top.boundingBox())!.y).toBeCloseTo(buttons.top, 0);
    await expect(top).toHaveCSS("padding-block-start", "12px");
    await expect(bottom).toHaveCSS("padding-block-end", `${buttons.bottom}px`);
    for (const action of await top.locator("button:visible").all()) await expectInside(page, action, buttons);
    for (const action of await bottom.locator("button:visible").all()) await expectInside(page, action, buttons);
    await page.screenshot({ path: info.outputPath(`mushaf-${language}-simulated-insets.png`), scale: "css" });
  });

  test(`enlarged phone and landscape retain inset-safe navigation and dialogs ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 872 });
    await seed(page, language);
    await page.goto("/#/home");
    await expect(page.getByTestId("home-utility-header")).toBeVisible();
    await supply(page, gesture);
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await expectShell(page, gesture);
    // A real Home dialog exercises its portalled safe-area surface and focus recovery.
    const opener = page.getByTestId("home-header-routine-summary-mobile");
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const surface = dialog.locator("xpath=.");
    const box = (await surface.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(gesture.top - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(872 + 1);
    const close = dialog.getByTestId("modal-close-button");
    await close.scrollIntoViewIfNeeded();
    await expectInside(page, close, gesture);
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "";
    });
    await page.setViewportSize({ width: 740, height: 390 });
    const landscape = { top: 0, right: 36, bottom: 24, left: 0 };
    await supply(page, landscape);
    await expectShell(page, landscape);
    await page.screenshot({ path: info.outputPath(`landscape-${language}-simulated-insets.png`), scale: "css" });
  });
}
