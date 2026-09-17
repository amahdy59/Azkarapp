import { expect, test, type Page } from "@playwright/test";

/**
 * Guards DEC-072. The Friday and Benefits illustrations moved from 1.7 MB PNGs
 * to AVIF-first `<picture>` elements with a WebP fallback and no PNG at all,
 * which halved the precache. A wrong path or a dropped format would show up as
 * a broken image rather than a test failure anywhere else, and `loading="lazy"`
 * means they only decode once scrolled into view — so this asserts the decode
 * explicitly rather than trusting that the element exists.
 */
async function openHome(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });
}

test("product illustrations decode from a modern format with no PNG fallback", async ({ page }) => {
  await openHome(page);

  const pictures = page.locator("picture");
  await expect(pictures.first()).toBeVisible();

  const images = page.locator("picture img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();

    // Poll: lazy images decode after they intersect, so a single read races the load.
    await expect(async () => {
      const state = await image.evaluate((element) => {
        const img = element as HTMLImageElement;
        return { complete: img.complete, naturalWidth: img.naturalWidth, currentSrc: img.currentSrc };
      });
      expect(state.complete).toBe(true);
      // naturalWidth 0 on a complete image is the signature of a broken source.
      expect(state.naturalWidth).toBeGreaterThan(0);
      expect(state.currentSrc).not.toMatch(/\.png(\?|$)/);
    }).toPass({ timeout: 15_000 });
  }
});

test("the retired PNG illustrations are no longer served", async ({ page }) => {
  await openHome(page);

  for (const name of ["mosque_prophet", "benefits_zikr"]) {
    // The preview server rewrites unknown paths to index.html for client-side
    // routing, so a removed asset answers 200 with HTML rather than 404. Assert
    // on what is actually served: no PNG bytes.
    const retired = await page.request.get(`/images/${name}.png`);
    expect(retired.headers()["content-type"] ?? "", `${name}.png should not be served as an image`).not.toContain(
      "image/",
    );

    for (const extension of ["avif", "webp"]) {
      const encoded = await page.request.get(`/images/${name}.${extension}`);
      expect(encoded.status(), `${name}.${extension} should be served`).toBe(200);
      expect(encoded.headers()["content-type"] ?? "").toContain(`image/${extension}`);
    }
  }
});
