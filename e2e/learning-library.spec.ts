import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { startOutageOrigin } from "./helpers/outage-origin";

test.beforeEach(async ({ page }) => {
  await page.route(/\/__browser-test-api(?:\/|\?|$)/, (route) => route.abort());
});

async function enter(page: Page, hash = "#/learn", language: "ar" | "en" = "en", origin = "") {
  await page.addInitScript(
    ({ language }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings: { language, appMaterial: "glass" } }));
    },
    { language },
  );
  await page.goto(`${origin}/${hash}`);
}

test("@cross-browser completed English book is selectable, searchable and keeps Arabic records independent", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("azkar.learning.v1"))
      localStorage.setItem(
        "azkar.learning.v1",
        JSON.stringify({ "dalil-al-mutamir": { position: { unitId: "p-6", offset: 0.3 }, bookmarks: ["p-6"] } }),
      );
  });
  await enter(page);
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "دليل المعتمر", exact: true }) });
  await card.getByRole("radio", { name: "English", exact: true }).focus();
  await page.keyboard.press("Space");
  const english = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "The Umrah Guide", exact: true }) });
  await expect(english.getByText(/16-page Umrah adaptation/)).toBeVisible();
  await expect(page.getByRole("radio", { name: "English", exact: true })).toHaveCount(1);
  await english.getByRole("button", { name: "Read book", exact: true }).click();
  await expect(page).toHaveURL(/\/p-4\?lang=en$/);
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Contents & search", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("searchbox").fill("anticlockwise");
  await dialog.getByRole("link").filter({ hasText: "Tawaf around the Ka'bah" }).click();
  await expect(page).toHaveURL(/\/p-8\?lang=en$/);
  await expect(page.getByTestId("learning-reading-scroll")).toBeFocused();
  await expect(page.locator('[data-diagram="tawaf"] svg')).toBeVisible();
  await expect(page.locator('.learn-quran [lang="ar"][dir="rtl"]').first()).toBeVisible();
  await expect(page.locator('.learn-quran [lang="en"][dir="ltr"]').first()).toBeVisible();
  await page.getByRole("button", { name: "Bookmark this section", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove this bookmark", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reading options", exact: true }).click();
  await page.getByRole("dialog").getByRole("radio", { name: "Arabic", exact: true }).check();
  await expect(page).toHaveURL(/\/p-6$/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Reading options", exact: true })).toBeFocused();
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("button", { name: "Remove this bookmark", exact: true })).toBeVisible();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!));
  expect(records["dalil-al-mutamir"].bookmarks).toEqual(["p-6"]);
  expect(records["dalil-al-mutamir:en"].bookmarks).toEqual(["p-8"]);
  await page.getByRole("button", { name: "Reading options", exact: true }).click();
  await page.getByRole("dialog").getByRole("radio", { name: "English", exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/p-8\?lang=en$/);
  await page.screenshot({ path: testInfo.outputPath("english-umrah-reader.png"), fullPage: true });
});

test("@cross-browser English reading reflows in Arabic UI and downloads matching PDF appearances on demand", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await enter(page, "#/learn/dalil-al-mutamir/p-9?lang=en", "ar");
  const content = page.getByTestId("learning-content");
  await expect(content).toHaveAttribute("lang", "en");
  await expect(content).toHaveAttribute("dir", "ltr");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await expect(page.locator('[data-diagram="sai"] [data-passage]')).toHaveCount(7);
  expect(
    await page
      .locator('[data-diagram="sai"] svg')
      .evaluate((svg) => ({ direction: getComputedStyle(svg).direction, transform: getComputedStyle(svg).transform })),
  ).toEqual({ direction: "ltr", transform: "none" });
  expect(await content.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
  ).toEqual([]);
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith(".pdf")) requests++;
  });
  await page.getByRole("button", { name: "خيارات القراءة", exact: true }).click();
  const dialog = page.getByRole("dialog");
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
  ).toEqual([]);
  expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("english-options-narrow.png"), fullPage: true });
  expect(requests).toBe(0);
  for (const [appearance, label] of [
    ["light", "فاتح · الأنسب للطباعة"],
    ["dark", "داكن"],
    ["navy", "كحلي"],
  ]) {
    await dialog.getByRole("radio", { name: label, exact: true }).check();
    const download = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "تنزيل PDF", exact: true }).click();
    expect((await download).suggestedFilename()).toBe(`dalil-al-mutamir-en-${appearance}.pdf`);
    await expect(dialog.getByRole("button", { name: "تنزيل PDF", exact: true })).toBeEnabled();
  }
  expect(requests).toBe(3);
});

test("@cross-browser English offline reopening and removal preserve the saved Arabic edition", async ({
  page,
  baseURL,
}, testInfo) => {
  const origin = await startOutageOrigin(baseURL!);
  try {
    await enter(page, "#/settings/downloads", "en", origin.url);
    const books = page.locator("details").filter({ has: page.locator("summary").filter({ hasText: /^Books$/ }) });
    await books.locator("summary").click();
    const arabic = books.getByRole("region", { name: "دليل المعتمر", exact: true });
    const english = books.getByRole("region", { name: "The Umrah Guide", exact: true });
    await arabic.getByRole("button", { name: "Save offline", exact: true }).click();
    await expect(arabic.getByText("Available offline", { exact: true })).toBeVisible();
    await english.getByRole("button", { name: "Save offline", exact: true }).click();
    await expect(english.getByText("Available offline", { exact: true })).toBeVisible();
    await page.goto(`${origin.url}/#/learn/dalil-al-mutamir/p-8?lang=en`);
    await expect(page.getByTestId("learning-content")).toBeVisible();
    await page.getByRole("button", { name: "Bookmark this section", exact: true }).click();
    await page.evaluate(async () => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await expect(page.getByTestId("learning-content")).toBeVisible();
    await origin.stop();
    await expect(fetch(origin.url)).rejects.toThrow();
    const reopened = await page.reload();
    expect(reopened?.status()).toBe(200);
    expect(reopened?.fromServiceWorker()).toBe(true);
    await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("button", { name: "Remove this bookmark", exact: true })).toBeVisible();
    await expect(page.locator('[data-diagram="tawaf"]')).toBeVisible();
    await page.goto(`${origin.url}/#/settings/downloads`);
    await books.locator("summary").click();
    await english.getByRole("button", { name: "Remove saved book", exact: true }).click();
    await expect(books.getByRole("button", { name: "Check saved files", exact: true })).toBeEnabled();
    await testInfo.attach("remaining-language-cache", {
      body: JSON.stringify(
        await page.evaluate(async () => {
          const cache = await caches.open("azkar-learning-v1");
          return Promise.all(
            (await cache.keys()).map(async (request) => ({
              url: request.url,
              owner: (await cache.match(request))?.headers.get("X-Learning-Resource"),
            })),
          );
        }),
        null,
        2,
      ),
      contentType: "application/json",
    });
    await expect(english.getByText("Available offline", { exact: true })).toHaveCount(0);
    await expect(arabic.getByText("Available offline", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("azkar.learning.v1")!)["dalil-al-mutamir:en"].bookmarks,
      ),
    ).toEqual(["p-8"]);
  } finally {
    await origin.stop();
  }
});

test("@cross-browser More and Home open one Learn catalogue and retain reader history", async ({ page }) => {
  await enter(page, "#/more");
  await page.getByRole("button", { name: /Learn Books and guidance/ }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await expect(page.getByRole("heading", { name: "Books", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read book", exact: true })).toHaveCount(3);
  await page.getByRole("button", { name: "Read book", exact: true }).first().click();
  await expect(page.getByTestId("learning-content")).toBeVisible();
  await expect(page).toHaveURL(/#\/learn\/al-mukhtar\/p-4$/);
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(page).toHaveURL(/\/p-5$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/learn$/);
  await expect(page.getByRole("heading", { name: "Books", exact: true })).toBeVisible();
  await page.getByTestId("nav-home").click();
  await page.getByTestId("home-learning").getByRole("button", { name: "All books", exact: true }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await page.getByRole("button", { name: "Continue reading", exact: true }).first().click();
  await expect(page).toHaveURL(/\/p-5$/);
});

test("@cross-browser Arabic search, bookmarks and protected contents work at narrow enlarged text", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await enter(page, "#/learn/al-mukhtar/p-32", "ar");
  await expect(page.getByTestId("learning-content")).toContainText("رَبَّنَا");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await page.getByRole("button", { name: "حفظ علامة لهذا المقطع", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "حُفظت العلامة المرجعية" })).toBeVisible();
  const trigger = page.getByRole("button", { name: "الفهرس والبحث", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAttribute("data-dropdown-surface", "");
  await dialog.getByRole("tab", { name: "العلامات المرجعية", exact: true }).click();
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await dialog.getByRole("tab", { name: "الفهرس والبحث", exact: true }).click();
  await dialog.getByRole("searchbox").fill("ربنا");
  await expect(dialog.getByRole("link").first()).toBeVisible();
  const geometry = await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const input = element.querySelector("input")!.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      bottom: box.bottom,
      width: window.innerWidth,
      height: window.innerHeight,
      searchInside: input.left >= box.left && input.right <= box.right,
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.width);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.height);
  expect(geometry.searchInside).toBe(true);
  expect(
    await dialog.evaluate((element) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      context.fillStyle = getComputedStyle(element).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data[3];
    }),
  ).toBe(255);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
  await expect(page.getByTestId("learning-content")).toHaveAttribute("dir", "rtl");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "خيارات القراءة", exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
  ).toEqual([]);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect((await dialog.getByTestId("sheet-header-title").boundingBox())!.width).toBeGreaterThan(160);
  await page.screenshot({ path: testInfo.outputPath("reader-options-narrow-enlarged.png"), fullPage: true });
  await page.keyboard.press("Escape");
  // Restore the app's normal text size before comparing the same layout across reload.
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "100%";
  });
  await page.evaluate(async () => document.fonts.ready);
  await page.getByTestId("learning-reading-scroll").evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) * 0.6;
  });
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!)["al-mukhtar"].position.offset),
    )
    .toBeCloseTo(0.6, 1);
  await page.reload();
  await expect(page.getByRole("button", { name: "إزالة علامة هذا المقطع", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByTestId("learning-reading-scroll")
        .evaluate((element) => element.scrollTop / (element.scrollHeight - element.clientHeight)),
    )
    .toBeCloseTo(0.6, 1);
});

test("saved books reopen offline, report eviction and retain bookmarks after removal", async ({ page, context }) => {
  await enter(page);
  const book = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "دليل المعتمر", exact: true }) });
  await book.getByRole("button", { name: "Save offline", exact: true }).click();
  await expect(book.getByText("Available offline", { exact: true })).toBeVisible();
  await book.getByRole("button", { name: "Read book", exact: true }).click();
  await expect(page.getByTestId("learning-content")).toBeVisible();
  await page.getByRole("button", { name: "Bookmark this section", exact: true }).click();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect(page.getByTestId("learning-content")).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId("learning-content")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove this bookmark", exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.goto("/#/settings/downloads");
  const books = page.locator("details").filter({ has: page.locator("summary").filter({ hasText: /^Books$/ }) });
  await books.locator("summary").click();
  const downloaded = books.getByRole("region", { name: "دليل المعتمر" });
  await downloaded.getByRole("button", { name: "Remove saved book" }).click();
  await expect(downloaded.getByText("Internet needed for first reading", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!)["dalil-al-mutamir"].bookmarks),
  ).toContain("p-4");
  await page.evaluate(async () => {
    await caches.delete("azkar-learning-v1");
  });
  await page.getByRole("button", { name: "Check saved files", exact: true }).click();
  await expect(books.getByText("Available offline", { exact: true })).toHaveCount(0);
});

test("book failure recovers and optional PDFs download only when requested", async ({ page }) => {
  let assetRequests = 0;
  await page.route("**/__learning-assets__/*.bin", async (route) => {
    assetRequests++;
    await route.abort();
  });
  await enter(page, "#/learn/al-mukhtar/p-32");
  await expect(page.getByText(/The book could not be opened/)).toBeVisible();
  expect(assetRequests).toBeGreaterThan(0);
  await page.unroute("**/__learning-assets__/*.bin");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByTestId("learning-content")).toBeVisible();
  let pdfRequests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith(".pdf")) pdfRequests++;
  });
  await page.getByRole("button", { name: "Reading options", exact: true }).click();
  await page.getByRole("dialog").getByRole("radio", { name: "Large", exact: true }).check();
  await expect(page.getByTestId("learning-content")).toHaveAttribute("data-text-size", "large");
  expect(pdfRequests).toBe(0);
  const download = page.waitForEvent("download");
  await page.getByRole("dialog").getByRole("button", { name: "Download PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("al-mukhtar-light.pdf");
  expect(pdfRequests).toBe(1);
  await page.reload();
  await expect(page.getByTestId("learning-content")).toHaveAttribute("data-text-size", "large");
});

test("Learn and publication layouts reflow across themes and reading widths", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await enter(page, "#/learn", "ar");
  await expect(page.getByRole("heading", { name: "الكتب", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("learn-desktop-arabic.png"), fullPage: true });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const card = page.getByRole("article").first();
  await card.scrollIntoViewIfNeeded();
  const headingBox = await page.getByTestId("shared-screen-header").boundingBox();
  const cardBox = await card.boundingBox();
  expect(headingBox!.y + headingBox!.height).toBeLessThanOrEqual(cardBox!.y + 1);
  expect((await card.getByRole("heading").boundingBox())!.width).toBeGreaterThan(100);
  expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("learn-narrow-enlarged.png"), fullPage: true });
  const cases = [
    {
      width: 1440,
      height: 1000,
      language: "ar",
      themeMode: "light",
      appMaterial: "solid",
      route: "dalil-al-mutamir/p-8",
      name: "umrah-desktop-light",
    },
    {
      width: 820,
      height: 1180,
      language: "ar",
      themeMode: "dark",
      appMaterial: "glass",
      route: "al-wird-an-nabawi/p-17",
      name: "wird-tablet-dark",
    },
    {
      width: 390,
      height: 844,
      language: "en",
      themeMode: "midnight",
      appMaterial: "glass",
      route: "dalil-al-mutamir/p-3",
      name: "umrah-phone-english",
    },
    {
      width: 320,
      height: 900,
      language: "ar",
      themeMode: "light",
      appMaterial: "solid",
      route: "al-mukhtar/p-32",
      name: "mukhtar-narrow-enlarged",
    },
    {
      width: 320,
      height: 900,
      language: "en",
      themeMode: "light",
      appMaterial: "glass",
      route: "al-mukhtar/p-32",
      name: "reader-contrast",
    },
  ];
  for (const example of cases) {
    await page.setViewportSize({ width: example.width, height: example.height });
    await page.evaluate((example) => {
      const data = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      Object.assign(data.settings, {
        language: example.language,
        themeMode: example.themeMode,
        appMaterial: example.appMaterial,
        reduceMotion: true,
        highContrast: example.name === "reader-contrast",
        reduceTransparency: example.name === "reader-contrast",
      });
      localStorage.setItem("azkarapp.state.v1", JSON.stringify(data));
    }, example);
    await page.goto(`/#/learn/${example.route}`);
    await page.reload();
    await expect(page.getByTestId("learning-content")).toBeVisible();
    if (example.name === "umrah-desktop-light") {
      const content = await page.getByTestId("learning-content").elementHandle();
      await page.getByRole("button", { name: /اللغة: العربية/ }).click();
      await expect(page.getByRole("button", { name: "Reading options", exact: true })).toBeVisible();
      expect(await content!.evaluate((element) => element.isConnected)).toBe(true);
      await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
    }
    if (example.width === 320)
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    await page.evaluate(async () => document.fonts.ready);
    expect(
      await page.locator(".learning-reader").evaluate((element) => {
        const context = document.createElement("canvas").getContext("2d")!;
        context.fillStyle = getComputedStyle(element).backgroundColor;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data[3];
      }),
    ).toBe(255);
    const geometry = await page.getByTestId("learning-reading-scroll").evaluate((element) => ({
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.clientHeight,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width + 1);
    expect(geometry.height).toBeGreaterThan(80);
    if (example.name === "umrah-phone-english") {
      await page
        .locator("#main-content")
        .evaluate((element) => element.style.setProperty("--floating-audio-clearance", "96px"));
      const footer = await page.locator(".learn-reader-footer").boundingBox();
      const main = await page.locator("#main-content").boundingBox();
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(main!.y + main!.height - 95);
      await page
        .locator("#main-content")
        .evaluate((element) => element.style.removeProperty("--floating-audio-clearance"));
    }
    if (example.width === 320) {
      const content = await page.getByTestId("learning-content").boundingBox();
      const viewport = await page.getByTestId("learning-reading-scroll").boundingBox();
      expect(content!.y).toBeLessThan(viewport!.y + viewport!.height - 80);
    }
    await page.screenshot({ path: testInfo.outputPath(`${example.name}.png`), fullPage: true });
    if (example.name === "umrah-phone-english") {
      const artwork = page.locator(".learn-stage-art");
      await expect(artwork).toHaveCount(6);
      await expect(page.locator(".learn-steps > li > a.learn-panel")).toHaveCount(6);
      const size = await artwork.first().boundingBox();
      expect(size!.width).toBeGreaterThanOrEqual(44);
      await artwork.first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath("umrah-stage-cards.png"), fullPage: true });
    }
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
  }
  await page.emulateMedia({ forcedColors: "active" });
  await page.screenshot({ path: testInfo.outputPath("reader-forced-colors.png"), fullPage: true });
  await page.emulateMedia({ forcedColors: "none" });
  await page.goto("/#/settings/downloads");
  await page
    .locator("summary")
    .filter({ hasText: /^Books$/ })
    .click();
  await expect(page.getByTestId("learning-downloads")).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const downloads = page.getByTestId("learning-downloads");
  await downloads.scrollIntoViewIfNeeded();
  expect(await downloads.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-testid="learning-downloads"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("books-downloads-narrow-enlarged.png"), fullPage: true });
});
