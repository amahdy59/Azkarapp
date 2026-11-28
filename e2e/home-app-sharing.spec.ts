import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { t } from "../src/app/i18n";
import publicQr from "../src/assets/app-sharing/google-play.json" with { type: "json" };

const playStore = "https://play.google.com/store/apps/details?id=m.azkar.com";
const qrSize = Buffer.from(publicQr.image.split(",")[1]!, "base64").byteLength;
type Capture = {
  shares: {
    text?: string;
    url?: string;
    files: { name: string; type: string; size: number; signature: number[] | null }[];
  }[];
  copies: string[];
  errors: string[];
};

async function start(page: Page, language: "ar" | "en", themeMode = "light", material = "solid", fallback = "none") {
  const readOfflineFiles = page.context().browser()?.browserType().name() !== "webkit";
  await page.route("**/__browser-test-api/v1/visitors", (route) => route.fulfill({ json: { active: 1 } }));
  await page.addInitScript(
    ({ language, themeMode, material, fallback, readOfflineFiles }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode,
            appMaterial: material,
            homeMaterial: material,
            reduceMotion: true,
            highContrast: fallback === "high-contrast",
            reduceTransparency: fallback === "reduced-transparency",
          },
          profile: { isGuest: true },
        }),
      );
      const appSharingCapture: Capture = { shares: [], copies: [], errors: [] };
      Object.assign(window, { appSharingCapture });
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data: ShareData) => {
          try {
            appSharingCapture.shares.push({
              text: data.text,
              url: data.url,
              files: await Promise.all(
                (data.files ?? []).map(async (file) => ({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  // WebKit offline emulation rejects even a four-byte memory
                  // File via arrayBuffer/FileReader. Keep the chooser mock
                  // opaque there; online tests still inspect real PNG bytes.
                  signature:
                    navigator.onLine || readOfflineFiles
                      ? Array.from(new Uint8Array(await file.arrayBuffer()).slice(0, 8))
                      : null,
                })),
              ),
            });
          } catch (error) {
            appSharingCapture.errors.push(String(error));
            throw error;
          }
        },
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            appSharingCapture.copies.push(text);
          },
        },
      });
    },
    { language, themeMode, material, fallback, readOfflineFiles },
  );
  await page.goto("/#/home");
}

async function open(page: Page, language: "ar" | "en") {
  const trigger = page
    .getByTestId("home-app-sharing")
    .getByRole("button", { name: t(language, "appSharing.title"), exact: true });
  await trigger.click();
  const sheet = page.getByTestId("app-share-sheet");
  await expect(sheet.getByRole("button", { name: t(language, "appSharing.title"), exact: true })).toBeEnabled();
  return { trigger, sheet };
}
const captures = (page: Page) =>
  page.evaluate(() => (window as unknown as { appSharingCapture: Capture }).appSharingCapture);
const noOverflow = async (surface: Locator) =>
  expect(await surface.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);

for (const language of ["ar", "en"] as const) {
  test(`simple app sharing payloads and quiet copy in ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await start(page, language, "midnight", "glass");
    await expect(page.getByTestId("home-app-qr")).toBeHidden();
    const { sheet, trigger } = await open(page, language);
    await expect(sheet.getByRole("button")).toHaveCount(3);
    await expect(sheet.getByRole("radio")).toHaveCount(0);
    await expect(sheet.getByRole("textbox")).toHaveCount(0);
    await expect(sheet.getByRole("link")).toHaveAttribute("href", playStore);
    await expect(sheet.getByRole("img")).toHaveAttribute("src", publicQr.image);
    await sheet.getByRole("button", { name: t(language, "appSharing.title"), exact: true }).click();
    await expect.poll(async () => (await captures(page)).shares[0]?.text).toBe(playStore);
    expect((await captures(page)).shares[0]!.files[0]).toMatchObject({
      name: "wa-zaker-qr.png",
      type: "image/png",
      signature: [137, 80, 78, 71, 13, 10, 26, 10],
    });
    await sheet.getByRole("button", { name: t(language, "appSharing.copyLink"), exact: true }).click();
    await expect.poll(async () => (await captures(page)).copies).toEqual([playStore]);
    await mkdir("output/playwright/app-sharing-simple", { recursive: true });
    await page.screenshot({ path: `output/playwright/app-sharing-simple/${info.project.name}-${language}-phone.png` });
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
  for (const layout of [
    { width: 320, height: 700, scale: 2, theme: "light", material: "glass", fallback: "none" },
    { width: 390, height: 844, scale: 1, theme: "midnight", material: "glass", fallback: "none" },
    { width: 834, height: 1112, scale: 1, theme: "dark", material: "solid", fallback: "none" },
    { width: 900, height: 1000, scale: 2, theme: "light", material: "solid", fallback: "none" },
    { width: 1440, height: 1000, scale: 1, theme: "light", material: "glass", fallback: "none" },
    { width: 834, height: 1112, scale: 1, theme: "light", material: "glass", fallback: "none" },
    { width: 1440, height: 1000, scale: 1, theme: "light", material: "solid", fallback: "high-contrast" },
    { width: 390, height: 844, scale: 1, theme: "midnight", material: "glass", fallback: "reduced-transparency" },
  ]) {
    test(`simple app sharing fits ${layout.width}px ${layout.theme} ${layout.material} ${layout.fallback}, ${layout.scale * 100}% text, ${language} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: layout.width, height: layout.height });
      await start(page, language, layout.theme, layout.material, layout.fallback);
      if (layout.scale === 2) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      const card = page.getByTestId("home-app-sharing");
      await card.scrollIntoViewIfNeeded();
      if (layout.width >= 900) {
        const qr = page.getByTestId("home-app-qr");
        await expect(qr).toBeVisible();
        const code = (await qr.boundingBox())!;
        const copy = (await card.locator(".home-app-share-copy").boundingBox())!;
        const action = (await card.getByRole("button").boundingBox())!;
        const actionPaint = await card.getByRole("button").evaluate((element) => ({
          glass: element.classList.contains("hero-glass"),
          background: getComputedStyle(element).backgroundColor,
          color: getComputedStyle(element).color,
        }));
        if (actionPaint.glass) {
          const homePaint = await page.getByTestId("home-learning").evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            color: getComputedStyle(element).color,
          }));
          expect(actionPaint.background).toBe(homePaint.background);
          expect(actionPaint.color).toBe(homePaint.color);
        } else expect(/^(?:rgb|color)\([^/]+\)$/.test(actionPaint.background)).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-testid="home-app-sharing"]')
              .withTags(["wcag2a", "wcag2aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        if (language === "ar") {
          expect(code.x + code.width + 16).toBeLessThanOrEqual(copy.x);
          expect(action.x + action.width - copy.x - copy.width).toBeGreaterThanOrEqual(24);
          expect(code.x - action.x).toBeGreaterThanOrEqual(24);
        } else {
          expect(copy.x + copy.width + 16).toBeLessThanOrEqual(code.x);
          expect(copy.x - action.x).toBeGreaterThanOrEqual(24);
          expect(action.x + action.width - code.x - code.width).toBeGreaterThanOrEqual(24);
        }
      } else await expect(page.getByTestId("home-app-qr")).toBeHidden();
      await noOverflow(card);
      await mkdir("output/playwright/app-sharing-simple", { recursive: true });
      const name = `${info.project.name}-${language}-${layout.width}-${layout.theme}-${layout.fallback}`;
      await page.screenshot({ path: `output/playwright/app-sharing-simple/${name}-home.png` });
      const { sheet, trigger } = await open(page, language);
      if (layout.width >= 900) {
        const code = (await sheet.getByRole("img").boundingBox())!;
        const share = (await sheet
          .getByRole("button", { name: t(language, "appSharing.title"), exact: true })
          .boundingBox())!;
        if (language === "ar") expect(share.x + share.width + 16).toBeLessThanOrEqual(code.x);
        else expect(code.x + code.width + 16).toBeLessThanOrEqual(share.x);
      }
      await expect(sheet).toHaveAttribute("data-dropdown-surface", "");
      expect(
        await sheet.evaluate((element) => /^(?:rgb|color)\([^/]+\)$/.test(getComputedStyle(element).backgroundColor)),
      ).toBe(true);
      await noOverflow(sheet);
      const bounds = await sheet.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(layout.width + 1);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(layout.height + 1);
      for (const button of await sheet.getByRole("button").all()) {
        const size = await button.boundingBox();
        expect(size!.height).toBeGreaterThanOrEqual(44);
        expect(size!.width).toBeGreaterThanOrEqual(44);
      }
      const qr = sheet.getByRole("img");
      await qr.scrollIntoViewIfNeeded();
      await expect(qr).toBeInViewport({ ratio: 1 });
      const copy = sheet.getByRole("button", { name: t(language, "appSharing.copyLink"), exact: true });
      await copy.scrollIntoViewIfNeeded();
      await expect(copy).toBeInViewport({ ratio: 1 });
      expect(
        await copy.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        }),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="app-share-sheet"]')
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({ path: `output/playwright/app-sharing-simple/${name}-sheet.png` });
      await sheet.getByRole("link").focus();
      for (let count = 0; count < 7; count += 1) {
        await page.keyboard.press("Tab");
        expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(sheet).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }
}

test("simple sharing retains manual copy recovery at 320px and 200% text @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await start(page, "en");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
    document.documentElement.style.fontSize = "200%";
  });
  await page.getByTestId("home-app-sharing").getByRole("button").click();
  const sheet = page.getByTestId("app-share-sheet");
  await expect(sheet.getByRole("button")).toHaveCount(2); // Close and one Copy action.
  await expect(sheet.getByRole("textbox")).toHaveCount(0);
  await sheet.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(sheet.getByRole("alert")).toContainText(t("en", "appSharing.copyError"));
  const link = sheet.getByRole("textbox");
  await link.focus();
  await expect(link).toBeInViewport({ ratio: 1 });
  expect(await link.evaluate((element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!)).toBe(
    playStore.length,
  );
  await noOverflow(sheet);
});

test("simple sharing preserves focus across responsive changes @cross-browser", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await start(page, "en");
  await page.getByTestId("home-app-sharing").scrollIntoViewIfNeeded();
  await mkdir("output/playwright/app-sharing-simple", { recursive: true });
  await page.screenshot({ path: `output/playwright/app-sharing-simple/${info.project.name}-desktop-home.png` });
  const { sheet, trigger } = await open(page, "en");
  for (const width of [834, 390, 320, 1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(sheet).toHaveAttribute("data-overlay-surface", width < 600 ? "sheet" : "modal");
    await expect(sheet.getByRole("link")).toHaveAttribute("href", playStore);
    await noOverflow(sheet);
  }
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("simple sharing reopens and shares its bundled QR offline without reloading @cross-browser", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, "en");
  const online = await open(page, "en");
  await page.keyboard.press("Escape");
  await expect(online.sheet).toHaveCount(0);
  await context.setOffline(true);
  try {
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);
    const { sheet } = await open(page, "en");
    await expect
      .poll(() =>
        sheet.getByRole("img").evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
      )
      .toBe(true);
    await sheet.getByRole("button", { name: "Share app", exact: true }).click();
    await expect
      .poll(async () => {
        const capture = await captures(page);
        return capture.shares.length + capture.errors.length;
      })
      .toBe(1);
    expect((await captures(page)).errors).toEqual([]);
    expect((await captures(page)).shares[0]?.text).toBe(playStore);
    const file = (await captures(page)).shares[0]!.files[0]!;
    expect(file).toMatchObject({ name: "wa-zaker-qr.png", type: "image/png" });
    expect(file.size).toBe(qrSize);
    if (page.context().browser()?.browserType().name() === "webkit") expect(file.signature).toBeNull();
    else expect(file.signature).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    await sheet.getByRole("button", { name: "Copy link", exact: true }).click();
    await expect.poll(async () => (await captures(page)).copies).toEqual([playStore]);
  } finally {
    await context.setOffline(false);
  }
});

// Playwright's documented service-worker test support and the repository's
// installed-shell offline convention are Chromium-only. Other engines retain
// the complete in-document offline sharing assertion above.
test("simple sharing survives an installed-shell offline reload", async ({ page, context }) => {
  await start(page, "en");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload();
    const { sheet } = await open(page, "en");
    await expect
      .poll(() =>
        sheet.getByRole("img").evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
      )
      .toBe(true);
    await expect(sheet.getByRole("link")).toHaveAttribute("href", playStore);
  } finally {
    await context.setOffline(false);
  }
});
