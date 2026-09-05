import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Guards DEC-064 / F02, F03, F04 and closes the gap named in F32: these defects
 * are invisible to axe. When the Tailwind source scan stopped compiling the
 * primitives' utilities, the confirm dialog's roles, labels and contrast stayed
 * correct while it rendered at the shell's top-left at full width behind a
 * fully transparent scrim. Only geometry assertions catch that.
 */

async function openReturningGuest(page: Page) {
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

/**
 * Colors reach `getComputedStyle` in whichever space the engine chose —
 * `rgba(0, 0, 0, 0.5)`, `rgb(0 0 0 / 50%)` or `oklab(0 0 0 / 0.5)`. Read the
 * alpha channel out of any of them; a value the browser omits means opaque.
 */
async function backgroundAlpha(locator: Locator): Promise<number> {
  const color = await locator.evaluate((element) => getComputedStyle(element).backgroundColor);
  if (color === "transparent" || color === "") return 0;

  const slashAlpha = /\/\s*([\d.]+)(%?)\s*\)/.exec(color);
  if (slashAlpha) {
    const value = Number.parseFloat(slashAlpha[1]);
    return slashAlpha[2] === "%" ? value / 100 : value;
  }

  const legacyAlpha = /rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/.exec(color);
  return legacyAlpha ? Number.parseFloat(legacyAlpha[1]) : 1;
}

test("the destructive-action confirm dialog is centred behind a dimming scrim", async ({ page }) => {
  await openReturningGuest(page);

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /Account & data/ }).click();
  await page.getByRole("button", { name: "Erase local data", exact: true }).click();

  const dialog = page.locator('[data-slot="alert-dialog-content"]');
  const overlay = page.locator('[data-slot="alert-dialog-overlay"]');
  await expect(dialog).toBeVisible();

  const dialogBox = await dialog.boundingBox();
  const shellBox = await page.locator(".app-shell").boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(shellBox).not.toBeNull();
  if (!dialogBox || !shellBox) return;

  // Centred, not pinned to the portal container's top-left corner.
  const offsetX = dialogBox.x + dialogBox.width / 2 - (shellBox.x + shellBox.width / 2);
  const offsetY = dialogBox.y + dialogBox.height / 2 - (shellBox.y + shellBox.height / 2);
  expect(Math.abs(offsetX)).toBeLessThanOrEqual(2);
  expect(Math.abs(offsetY)).toBeLessThanOrEqual(2);

  // max-w-[calc(100%-2rem)] keeps a gutter rather than filling the shell edge to edge.
  expect(dialogBox.width).toBeLessThanOrEqual(shellBox.width - 32 + 1);

  // The scrim must actually dim; a transparent overlay reads as no scrim at all.
  expect(await backgroundAlpha(overlay)).toBeGreaterThan(0.1);

  // Leave without erasing anything.
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("menus stay inside a 320px viewport and keep their item geometry", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openReturningGuest(page);
  await page.goto("/#/counter");

  const trigger = page.getByRole("button", { name: "More options" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toBeVisible();

  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  if (!menuBox) return;

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;

  expect(menuBox.x).toBeGreaterThanOrEqual(0);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewport.width);

  // min-w-[8rem] and the available-height clamp both come from the primitive.
  expect(menuBox.width).toBeGreaterThanOrEqual(128);
  const maxHeight = await menu.evaluate((element) => getComputedStyle(element).maxHeight);
  expect(maxHeight).not.toBe("none");

  // rounded-sm and the ps-8 indicator gutter are primitive-only utilities.
  const firstItem = menu.getByRole("menuitem").first();
  const itemStyle = await firstItem.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: style.borderTopLeftRadius, paddingInlineStart: style.paddingInlineStart };
  });
  expect(Number.parseFloat(itemStyle.radius)).toBeGreaterThan(0);
  expect(Number.parseFloat(itemStyle.paddingInlineStart)).toBeGreaterThan(0);
});

test("radio menu items keep their logical-start indicator gutter in Arabic", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/#/counter");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.locator('[aria-haspopup="menu"]').last().click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toBeVisible();

  const item = menu.getByRole("menuitemradio").first();
  const geometry = await item.evaluate((element) => {
    const style = getComputedStyle(element);
    const indicator = element.querySelector("span");
    const itemRect = element.getBoundingClientRect();
    const indicatorRect = indicator?.getBoundingClientRect();
    return {
      paddingInlineStart: Number.parseFloat(style.paddingInlineStart),
      // In RTL the logical start edge is the right edge.
      indicatorInsetFromLogicalStart: indicatorRect ? itemRect.right - indicatorRect.right : null,
    };
  });

  expect(geometry.paddingInlineStart).toBeGreaterThanOrEqual(24);
  expect(geometry.indicatorInsetFromLogicalStart).not.toBeNull();
  expect(geometry.indicatorInsetFromLogicalStart ?? -1).toBeGreaterThanOrEqual(0);
  expect(geometry.indicatorInsetFromLogicalStart ?? 999).toBeLessThanOrEqual(16);
});

/* ── Phase 17 / DEC-068: one menu surface, one item anatomy, logical alignment ── */

async function openLibraryScopeMenu(page: Page, language: "ar" | "en") {
  await page.addInitScript((selected) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: selected, themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, language);
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("nav-azkar").click();
  await expect(page.getByTestId("library-section-filter")).toBeVisible();

  // Pin the specific control. `[aria-haspopup="menu"]`.first() resolved to a
  // different trigger on the mobile device profile, where the menu legitimately
  // aligns elsewhere — which failed in CI with a 1052px delta while passing
  // locally on the desktop profile.
  const trigger = page.getByTestId("library-section-filter");
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toBeVisible();
  return { trigger, menu };
}

/**
 * The library scope menu uses align="end". Radix resolves that against the
 * direction on the menu root, so the edge it pins to must MIRROR between
 * languages: the trigger's logical-end edge is its right in LTR and its left in
 * RTL. Measured at desktop width so collision shifting, which is legitimate and
 * viewport-dependent, cannot confound the result.
 */
test("menus align to the same logical edge in both reading directions", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  const ltr = await openLibraryScopeMenu(page, "en");
  const ltrMenu = await ltr.menu.boundingBox();
  const ltrTrigger = await ltr.trigger.boundingBox();
  expect(ltrMenu && ltrTrigger).toBeTruthy();
  if (!ltrMenu || !ltrTrigger) return;
  // LTR: logical end === physical right.
  expect(Math.abs(ltrMenu.x + ltrMenu.width - (ltrTrigger.x + ltrTrigger.width))).toBeLessThanOrEqual(2);

  const rtl = await openLibraryScopeMenu(page, "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const rtlMenu = await rtl.menu.boundingBox();
  const rtlTrigger = await rtl.trigger.boundingBox();
  expect(rtlMenu && rtlTrigger).toBeTruthy();
  if (!rtlMenu || !rtlTrigger) return;
  // RTL: logical end === physical left. If this fails the menu is not
  // mirroring, which is exactly the F09 defect.
  expect(Math.abs(rtlMenu.x - rtlTrigger.x)).toBeLessThanOrEqual(2);
});

test("every menu presents the same surface and 44px items", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { menu } = await openLibraryScopeMenu(page, "en");

  const surface = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      radius: style.borderTopLeftRadius,
      padding: style.padding,
      hasShadow: style.boxShadow !== "none",
      borderColor: style.borderTopColor,
    };
  });
  // --ds-radius-overlay is 1.5rem; menus are overlays, not cards.
  expect(surface.radius).toBe("24px");
  expect(surface.padding).toBe("6px");
  expect(surface.hasShadow).toBe(true);

  const items = menu.getByRole("menuitemradio");
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    // offsetHeight — the laid-out border box — rather than a measured rectangle.
    // The Pixel 7 profile emulates a 2.625 device scale factor, and both
    // boundingBox and getBoundingClientRect report the composited box, which
    // comes back as 43.99998474121094 for an item whose min-height is exactly
    // 44px: one part in 65,536 short, from the scale factor rather than from
    // anything the layout did. Which side of that it lands on moves when
    // unrelated type sizes shift the menu by a fraction of a pixel, so the
    // rectangle cannot decide a touch-target floor. offsetHeight is integral
    // and unscaled: the half-pixel it rounds away is far below the pixel a real
    // regression would cost.
    const height = await items.nth(index).evaluate((element) => (element as HTMLElement).offsetHeight);
    expect(height).toBeGreaterThanOrEqual(44);
  }
});
