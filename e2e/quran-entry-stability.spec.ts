import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FONT_CACHE_NAME, MUSHAF_CACHE_NAME } from "../src/app/content/qcfMushaf";

type EntryFrame = { zikr: string | null; glyphs: number; pages: string[]; loading: boolean };
type EntryWindow = Window & { entryFrames: EntryFrame[]; entryObserver: MutationObserver };

async function recordEntry(page: Page) {
  await page.evaluate(() => {
    const view = window as EntryWindow;
    view.entryObserver?.disconnect();
    view.entryFrames = [];
    view.entryObserver = new MutationObserver(() => {
      const reader = document.querySelector<HTMLElement>('[data-testid="reader-screen"]');
      const canvases = [...document.querySelectorAll<HTMLElement>(".mushaf-page-canvas")];
      if (!reader && !canvases.length && !document.querySelector('[data-testid="mushaf-loading"]')) return;
      const frame = {
        zikr: reader?.dataset.zikrId ?? null,
        glyphs: reader?.querySelectorAll("[data-quran-glyph]").length ?? 0,
        pages: canvases.map((node) => `${node.dataset.mushafPage}:${node.dataset.mushafRendering}`),
        loading: Boolean(document.querySelector('[data-testid="mushaf-loading"]')),
      };
      if (JSON.stringify(view.entryFrames.at(-1)) !== JSON.stringify(frame)) view.entryFrames.push(frame);
    });
    view.entryObserver.observe(document.getElementById("root")!, { childList: true, subtree: true });
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem("azkarapp.counter-guidance.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true, routineModes: { morning: "complete" } },
        profile: { isGuest: true },
        mushafLayout: "spread",
      }),
    );
  });
});

test("late fonts cannot replace visible fallback during a reading visit @cross-browser", async ({ page }, info) => {
  for (const pageNumber of [42, 604]) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**/p${pageNumber}.woff2`, async (route) => {
      await gate;
      await route.continue();
    });
    const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-76a") + 1;
    const route = pageNumber === 42 ? "/#/quran/42" : `/#/azkar/morning/${position}`;
    try {
      await page.goto(route);
      const text = pageNumber === 42 ? page.locator('[data-mushaf-page="42"]') : page.getByTestId("zikr-text");
      if (pageNumber === 42) await expect(text).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
      else {
        await expect(text.getByRole("status")).toBeVisible();
        await expect(text.getByRole("status")).toHaveCount(0);
        await expect(text).not.toBeEmpty();
        await expect(text.locator("[data-quran-glyph]")).toHaveCount(0);
      }
      const initial = await text.boundingBox();
      release();
      await expect
        .poll(() => page.evaluate((number) => document.fonts.check(`24px "qcf-v2-page-${number}"`), pageNumber))
        .toBe(true);
      if (pageNumber === 42) await expect(text).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
      else await expect(text.locator("[data-quran-glyph]")).toHaveCount(0);
      expect(await text.boundingBox()).toEqual(initial);
      await page.screenshot({ path: info.outputPath(`stable-fallback-${pageNumber}.png`) });
      await page.goto("/#/");
      await page.goto(route);
      if (pageNumber === 42)
        await expect(page.locator('[data-mushaf-page="42"]')).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
      else await expect(page.getByTestId("zikr-text").locator("[data-quran-glyph]").first()).toBeVisible();
    } finally {
      release();
    }
  }
});

test("warm Mushaf spread returns with both ready faces from its first commit, including offline @cross-browser", async ({
  page,
}, info) => {
  await page.goto("/#/quran/75");
  const canvases = page.locator('.mushaf-page-canvas[data-mushaf-rendering="qcf-v2"]');
  await expect(canvases).toHaveCount(2);
  for (const offline of [false, true]) {
    await page.evaluate(() => {
      location.hash = "#/";
    });
    await expect(page.locator(".mushaf-page-canvas")).toHaveCount(0);
    await recordEntry(page);
    await page.context().setOffline(offline);
    await page.evaluate(() => {
      location.hash = "#/quran/75";
    });
    await expect(canvases).toHaveCount(2);
    const frames = await page.evaluate(() => (window as EntryWindow).entryFrames);
    expect(frames.length).toBeGreaterThan(0);
    expect(
      frames.every(
        (frame) => !frame.loading && frame.pages.length === 2 && frame.pages.every((mode) => mode.endsWith(":qcf-v2")),
      ),
    ).toBe(true);
    await info.attach(`spread-entry-${offline ? "offline" : "online"}`, {
      body: JSON.stringify(frames),
      contentType: "application/json",
    });
    await page.context().setOffline(false);
  }
  await page.screenshot({ path: info.outputPath("warm-spread-entry.png"), scale: "css" });
});

test("warm Quran zikr never replaces its ready lettering with fallback on return @cross-browser", async ({
  page,
}, info) => {
  const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-76a") + 1;
  expect(position).toBeGreaterThan(0);
  const route = `#/azkar/morning/${position}`;
  await page.goto(`/${route}`);
  const glyphs = page.getByTestId("zikr-text").locator("[data-quran-glyph]");
  await expect(glyphs.first()).toBeVisible();
  await page.evaluate(() => {
    location.hash = "#/";
  });
  await expect(page.getByTestId("reader-screen")).toHaveCount(0);
  await recordEntry(page);
  await page.context().setOffline(true);
  await page.evaluate((route) => {
    location.hash = route;
  }, route);
  await expect(glyphs.first()).toBeVisible();
  const frames = await page.evaluate(() =>
    (window as EntryWindow).entryFrames.filter((frame) => frame.zikr === "m-hm-76a"),
  );
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.every((frame) => frame.glyphs > 0)).toBe(true);
  await info.attach("zikr-entry", { body: JSON.stringify(frames), contentType: "application/json" });
  await page.screenshot({ path: info.outputPath("warm-quran-zikr-entry.png"), scale: "css" });
});

test("Mushaf reuses saved page data and fonts after a document reload @cross-browser", async ({ page }) => {
  await page.goto("/#/quran/75");
  const ready = page.locator('.mushaf-page-canvas[data-mushaf-rendering="qcf-v2"]');
  await expect(ready).toHaveCount(2);
  const pages = await ready.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-mushaf-page")!));
  await expect
    .poll(() =>
      page.evaluate(
        async ({ pages, fontCache, pageCache }) => {
          const [fonts, data] = await Promise.all([caches.open(fontCache), caches.open(pageCache)]);
          const keys = await Promise.all([fonts.keys(), data.keys()]);
          return pages.every(
            (number) =>
              keys[0].some(({ url }) => new URL(url).pathname.endsWith(`/p${number}.woff2`)) &&
              keys[1].some(({ url }) => new URL(url).pathname.endsWith(`/${number}.json`)),
          );
        },
        { pages, fontCache: FONT_CACHE_NAME, pageCache: MUSHAF_CACHE_NAME },
      ),
    )
    .toBe(true);
  const blocked: string[] = [];
  await page.route(/\/(?:p\d+\.woff2|data\/mushaf\/\d+\.json)(?:\?|$)/, (route) => {
    blocked.push(route.request().url());
    return route.abort();
  });
  await page.reload();
  await expect(ready).toHaveCount(2);
  for (const number of pages) {
    expect(
      blocked.some(
        (url) =>
          new URL(url).pathname.endsWith(`/p${number}.woff2`) || new URL(url).pathname.endsWith(`/${number}.json`),
      ),
    ).toBe(false);
  }
});

test("category intent warms Quran lettering before its first reading visit @cross-browser", async ({ page }, info) => {
  await page.goto("/#/azkar/morning");
  await expect.poll(() => page.evaluate(() => document.fonts.check('24px "qcf-v2-page-604"'))).toBe(true);
  // check() is true for an unknown family too; require a decoded face explicitly.
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.fonts].some((font) => font.family === "qcf-v2-page-604" && font.status === "loaded"),
      ),
    )
    .toBe(true);
  await recordEntry(page);
  const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-76a") + 1;
  await page.evaluate((position) => {
    location.hash = `#/azkar/morning/${position}`;
  }, position);
  await expect(page.getByTestId("zikr-text").locator("[data-quran-glyph]").first()).toBeVisible();
  const frames = await page.evaluate(() =>
    (window as EntryWindow).entryFrames.filter((frame) => frame.zikr === "m-hm-76a"),
  );
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.every((frame) => frame.glyphs > 0)).toBe(true);
  await info.attach("category-intent-entry", { body: JSON.stringify(frames), contentType: "application/json" });
});

test("Quran zikr requests its font before slow local page data resolves and keeps fallback readable @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const dataGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let dataRequested = false;
  let fontRequested = false;
  await page.route("**/data/mushaf/604.json", async (route) => {
    dataRequested = true;
    await dataGate;
    await route.continue();
  });
  await page.route("**/fonts/qcf-v2/**/p604.woff2", (route) => {
    fontRequested = true;
    return route.abort();
  });
  const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-76a") + 1;
  try {
    await page.goto(`/#/azkar/morning/${position}`);
    await expect.poll(() => dataRequested).toBe(true);
    await expect.poll(() => fontRequested).toBe(true);
    const text = page.getByTestId("zikr-text");
    await expect(text).toBeVisible();
    await expect(text.getByRole("status")).toHaveText("Loading");
    await expect(text.locator("[data-quran-glyph]")).toHaveCount(0);
    release();
    await expect(text).toContainText("قُلْ");
    await expect(text.locator("[data-quran-glyph]")).toHaveCount(0);
    await info.attach("critical-path", {
      body: JSON.stringify({ fontStartedBeforePageData: fontRequested, readableFallback: true }),
      contentType: "application/json",
    });
    await page.screenshot({ path: info.outputPath("cold-quran-fallback.png"), scale: "css" });
  } finally {
    release();
  }
});
