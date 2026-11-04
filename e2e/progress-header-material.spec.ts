import { expect, test, type Locator } from "@playwright/test";

for (const scenario of [
  { language: "ar", width: 390, height: 844, enlarged: false, material: "glass" },
  { language: "en", width: 320, height: 640, enlarged: true, material: "glass" },
  { language: "ar", width: 834, height: 600, enlarged: false, material: "solid" },
  { language: "en", width: 600, height: 640, enlarged: true, material: "glass" },
  { language: "en", width: 1440, height: 600, enlarged: false, material: "glass" },
] as const) {
  test(`Progress shares ordinary header material ${scenario.language}-${scenario.width}-${scenario.material} @cross-browser`, async ({
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
            appMaterial: scenario.material,
            themeMode: "midnight",
            reduceMotion: true,
          },
        }),
      );
    }, scenario);
    const paint = (target: Locator) =>
      target.evaluate((node) => {
        const s = getComputedStyle(node);
        return { color: s.backgroundColor, image: s.backgroundImage, frost: s.backdropFilter };
      });
    const typography = (target: Locator) =>
      target.evaluate((node) => {
        const s = getComputedStyle(node);
        return { font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight };
      });
    await page.goto("/#/quran-wird");
    const shared = page.getByTestId("shared-screen-header");
    await expect(shared).toBeVisible();
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    const referenceTop = await paint(shared);
    const referenceType = await typography(shared.locator("h1"));
    await page.screenshot({ path: info.outputPath("reference-quran-header-top.png") });
    await page.getByTestId("quran-wird-content").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect(shared).toHaveAttribute("data-scrolled", "true");
    const referenceScrolled = await paint(shared);
    await page.screenshot({ path: info.outputPath("reference-quran-header-scrolled.png") });
    await page.goto("/#/progress");
    await expect(shared).toBeVisible();
    if (scenario.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    const controls = page.getByTestId("progress-sticky-controls");
    await expect.poll(() => paint(controls)).toEqual(referenceTop);
    expect(await typography(shared.locator("h1"))).toEqual(referenceType);
    const titleFit = await shared.locator("h1").evaluate((node) => {
      const s = getComputedStyle(node);
      return {
        height: node.getBoundingClientRect().height,
        expected: Math.max(parseFloat(s.minBlockSize), parseFloat(s.lineHeight)),
      };
    });
    expect(titleFit.height).toBeLessThanOrEqual(titleFit.expected + 1);
    const titleTop = (await shared.locator("h1").boundingBox())!.y;
    const tools = controls.getByTestId("progress-filters-toggle");
    for (const label of await controls.locator(".section-tab-label").all()) {
      if (scenario.enlarged || scenario.width < 600) await expect(label).toBeHidden();
      else await expect(label).toBeVisible();
    }
    const matchingControls = await tools.evaluate((action) => {
      const tabs = action.closest(".section-view-actions")!.querySelector<HTMLElement>("[role=tablist]")!;
      const a = action.getBoundingClientRect(),
        group = tabs.getBoundingClientRect();
      const centers = [action, ...tabs.querySelectorAll("button")].map((button) => {
        const icon = button.querySelector("svg")!.getBoundingClientRect();
        return { y: icon.top + icon.height / 2, width: icon.width, height: icon.height };
      });
      const surface = (node: Element) => {
        const s = getComputedStyle(node);
        return { fill: s.backgroundColor, edge: s.borderColor, radius: s.borderRadius };
      };
      return {
        action: { width: a.width, height: a.height },
        top: Math.abs(a.top - group.top),
        bottom: Math.abs(a.bottom - group.bottom),
        centers,
        actionSurface: surface(action),
        tabsSurface: surface(tabs),
      };
    });
    expect(matchingControls.action.width).toBeCloseTo(matchingControls.action.height, 1);
    expect(matchingControls.action.height).toBeGreaterThanOrEqual(44);
    expect(matchingControls.top).toBeLessThanOrEqual(1);
    expect(matchingControls.bottom).toBeLessThanOrEqual(1);
    expect(matchingControls.actionSurface).toEqual(matchingControls.tabsSurface);
    for (const icon of matchingControls.centers) {
      expect(Math.abs(icon.y - matchingControls.centers[0]!.y)).toBeLessThanOrEqual(1);
      expect(icon.width).toBe(20);
      expect(icon.height).toBe(20);
    }
    await controls
      .locator(".section-view-actions")
      .screenshot({ path: info.outputPath("progress-controls-aligned.png") });
    await page.screenshot({ path: info.outputPath("progress-header-top.png") });
    await page.locator(".progress-screen").evaluate((node) => {
      node.scrollTop = 240;
    });
    await expect(controls).toHaveAttribute("data-scrolled", "true");
    await expect.poll(() => paint(controls)).toEqual(referenceScrolled);
    expect(Math.abs((await shared.locator("h1").boundingBox())!.y - titleTop)).toBeLessThanOrEqual(1);
    const gaps = await controls.evaluate((node) => {
      const frame = node.getBoundingClientRect();
      return [...node.querySelectorAll("button")]
        .filter((button) => button.getClientRects().length)
        .map((button) => {
          const box = button.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          return {
            fits: box.left >= frame.left - 1 && box.right <= frame.right + 1,
            hit: hit === button || button.contains(hit),
            width: box.width,
            height: box.height,
          };
        });
    });
    for (const target of gaps) {
      expect(target.fits).toBe(true);
      expect(target.hit).toBe(true);
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.outputPath("progress-header-scrolled.png") });
  });
}
