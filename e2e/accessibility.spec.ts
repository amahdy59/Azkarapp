import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function enterEnglishGuestMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();
}

async function expectNoWcagViolations(page: import("@playwright/test").Page) {
  await page.waitForTimeout(200);
  // axe-core v4 cannot resolve CSS custom-property chains through Tailwind v4's
  // @theme inline indirection, so its color-contrast rule produces false positives
  // (it reports ~1:1 contrast for elements whose actual getComputedStyle-computed
  // contrast is well above 4.5:1). We disable the axe rule and run a separate
  // getComputedStyle-based contrast check that uses the browser's real cascade.
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();
  expect(results.violations).toEqual([]);

  // Verify actual contrast ratios using the browser's computed color values.
  const contrastViolations = await page.evaluate(() => {
    const MIN_NORMAL = 4.5;
    const MIN_LARGE = 3.0;
    function parseRgba(s: string): [number, number, number, number] {
      const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      return m ? [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1] : [0, 0, 0, 1];
    }
    function blend(fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] {
      const a = fg[3];
      return [
        Math.round(fg[0] * a + bg[0] * (1 - a)),
        Math.round(fg[1] * a + bg[1] * (1 - a)),
        Math.round(fg[2] * a + bg[2] * (1 - a)),
      ];
    }
    function lum(r: number, g: number, b: number) {
      return [r, g, b]
        .map((c) => {
          const s = c / 255;
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        })
        .reduce((a, v, i) => a + [0.2126, 0.7152, 0.0722][i] * v, 0);
    }
    function cr(fg: [number, number, number], bg: [number, number, number]) {
      const [l1, l2] = [lum(...fg), lum(...bg)];
      return ((l1 > l2 ? l1 : l2) + 0.05) / ((l1 > l2 ? l2 : l1) + 0.05);
    }
    function opaqueBg(el: Element): [number, number, number] {
      let n: Element | null = el;
      while (n) {
        const [r, g, b, a] = parseRgba(getComputedStyle(n).backgroundColor);
        if (a > 0) return blend([r, g, b, a], [0, 0, 0]);
        n = n.parentElement;
      }
      return [255, 255, 255];
    }
    const fails: string[] = [];
    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>("p:not(:empty), h1, h2, h3, h4, button, a[href]"),
    )) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const cs = getComputedStyle(el);
      const fgRaw = parseRgba(cs.color);
      const opacity = +cs.opacity;
      const fg = blend([fgRaw[0], fgRaw[1], fgRaw[2], fgRaw[3] * opacity], opaqueBg(el.parentElement ?? el));
      const bg = opaqueBg(el);
      const ratio = cr(fg, bg);
      const fs = parseFloat(cs.fontSize);
      const fw = parseInt(cs.fontWeight, 10);
      const isLarge = fs >= 18.67 || (fs >= 14 && fw >= 700);
      if (ratio < (isLarge ? MIN_LARGE : MIN_NORMAL)) {
        const label = el.getAttribute("aria-label") || el.textContent?.trim().substring(0, 40) || el.tagName;
        fails.push(`"${label}" ratio=${ratio.toFixed(2)} fg=rgb(${fg}) bg=rgb(${bg})`);
      }
    }
    return fails;
  });
  expect(contrastViolations, `Color contrast violations:\n${contrastViolations.join("\n")}`).toEqual([]);
}

async function expectVisibleInteractiveTargetsAtLeast44px(page: import("@playwright/test").Page, screenName: string) {
  const undersized = await page
    .locator(
      'button:visible, a[href]:visible, input:visible, select:visible, [role="button"]:visible, [role="tab"]:visible, [role="radio"]:visible, [role="switch"]:visible',
    )
    .evaluateAll((nodes) => {
      const uniqueNodes = [...new Set(nodes)] as HTMLElement[];
      return uniqueNodes.flatMap((node) => {
        const ownBounds = node.getBoundingClientRect();
        const associatedLabel =
          node instanceof HTMLInputElement || node instanceof HTMLSelectElement
            ? node.labels?.item(0)?.getBoundingClientRect()
            : null;
        const targetBounds =
          associatedLabel && associatedLabel.width >= ownBounds.width && associatedLabel.height >= ownBounds.height
            ? associatedLabel
            : ownBounds;

        if (targetBounds.width >= 44 && targetBounds.height >= 44) return [];

        return [
          {
            label:
              node.getAttribute("aria-label") ||
              node.getAttribute("title") ||
              node.textContent?.replace(/\s+/g, " ").trim() ||
              node.tagName,
            tag: node.tagName,
            width: Math.round(targetBounds.width),
            height: Math.round(targetBounds.height),
          },
        ];
      });
    });

  expect(undersized, `${screenName} has interactive targets below the 44px product standard`).toEqual([]);
}

test("initial flow has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#main-content")).toBeVisible();
  // Wait for the splash screen to finish by looking for the Language screen content
  await expect(page.getByRole("heading", { name: "Choose Your Language" })).toBeVisible({ timeout: 5000 });
  await expectNoWcagViolations(page);
});

test("skip link moves keyboard focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("marketing landing page has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.getByRole("heading", { name: "Build a lasting azkar habit." })).toBeVisible();
  await expectNoWcagViolations(page);
});

test("home and settings flows have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await expectNoWcagViolations(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Preferences" })).toBeVisible();
  await expectNoWcagViolations(page);

  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accessibility", exact: true })).toBeVisible();
  await expectNoWcagViolations(page);
});

test("visible settings controls meet the 44px minimum touch target", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();

  const undersized = await page
    .locator("button:visible, a:visible, input:visible, select:visible")
    .evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width >= 44 && rect.height >= 44) {
          return [];
        }
        return [
          {
            label: node.getAttribute("aria-label") || node.textContent?.trim() || node.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        ];
      }),
    );

  expect(undersized).toEqual([]);
});

test("visible core-flow controls meet the 44px product touch-target standard", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Home");

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Azkar Library");

  await page.getByRole("button", { name: /Morning Azkar, \d+ of \d+ complete/ }).click();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Category");

  await page.getByRole("button", { name: "Start Session", exact: true }).click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Reader");

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  await expect(page.getByTestId("reference-sheet")).toBeVisible();
  await expectVisibleInteractiveTargetsAtLeast44px(page, "Benefit sheet");
});
