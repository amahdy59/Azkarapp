import { expect, test, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";

async function seed(page: Page, language: "ar" | "en") {
  await page.clock.setFixedTime(new Date("2026-10-20T08:00:00+03:00"));
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          routineModes: { morning: "complete", evening: "complete", before_sleep: "complete" },
          language,
          themeMode: "light",
          reduceMotion: true,
          paperTexture: true,
        },
        profile: { isGuest: true },
      }),
    );
  }, language);
}

test("fresh defaults select Arabic night paper, middle font and icon reading tools @cross-browser", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("azkarapp.onboarding-complete.v1", "true"));
  await page.goto("/#/settings/reading");
  await expect(page.getByTestId("reading-zikr-font-clear")).toHaveAttribute("data-state", "checked");
  await expect(page.getByRole("radio", { name: "أيقونات فقط", exact: true })).toHaveAttribute("data-state", "checked");
  await expect(page.locator("html")).toHaveClass(/theme-midnight/);
  await expect(page.locator("html")).toHaveAttribute("data-paper-texture", "on");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

for (const scenario of [
  { language: "ar", width: 1440, scale: 1 },
  { language: "en", width: 834, scale: 2 },
  { language: "ar", width: 320, scale: 2 },
] as const) {
  test(`row corners, complete pills and option highlights ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
    page,
  }, info) => {
    await seed(page, scenario.language);
    await page.setViewportSize({ width: scenario.width, height: 1000 });
    await page.goto("/#/settings/reading");
    const translation = page.getByRole("switch", {
      name: t(scenario.language, "settings.showTranslation"),
      exact: true,
    });
    await expect(translation).toBeVisible();
    await page.locator("html").evaluate((node, scale) => {
      node.style.fontSize = `${scale * 100}%`;
    }, scenario.scale);
    const geometry = await translation.evaluate((node) => {
      const s = getComputedStyle(node),
        parent = getComputedStyle(node.parentElement!.parentElement!);
      return { own: s.borderTopRightRadius, parent: parent.borderTopRightRadius, bottom: s.borderBottomRightRadius };
    });
    expect(parseFloat(geometry.own)).toBeGreaterThan(0);
    expect(geometry.own).toBe(geometry.parent);
    expect(parseFloat(geometry.bottom)).toBe(0);
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      await translation.hover();
      await expect(translation).not.toHaveCSS("box-shadow", "none");
      await page.screenshot({ path: info.outputPath("reading-row-highlight.png") });
    }

    await page.goto("/#/home");
    const pill = page.getByTestId("home-routine-card").getByRole("radiogroup");
    await expect(pill).toBeVisible();
    for (const option of await pill.getByRole("radio").all()) {
      expect(await option.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      expect(await option.evaluate((node) => getComputedStyle(node).whiteSpace)).toBe("nowrap");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);

    await page.goto("/#/progress/month");
    const selector = page.getByTestId("progress-heatmap").getByRole("combobox");
    await expect(selector).toBeVisible();
    await selector.click();
    if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
      for (const option of await page.getByRole("option").all()) {
        await option.hover();
        await expect(option).toHaveCSS("outline-width", "1px");
        await expect(option).toHaveCSS("outline-offset", "-1px");
      }
    }
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option").and(page.locator("[data-highlighted]"))).toHaveCSS("outline-style", "solid");
    await page.screenshot({ path: info.outputPath("dropdown-option-highlight.png") });
    await page.keyboard.press("Escape");
    await expect(selector).toBeFocused();
  });
}

test("Masbaha owns navigation and separates controls, progress and keyboard help @cross-browser", async ({
  page,
}, info) => {
  await seed(page, "ar");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/#/settings");
  await expect(
    page.getByRole("heading", { name: t("ar", "settings.personalizationSection"), exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: t("ar", "settings.dailyPracticeSection"), exact: true }),
  ).toBeVisible();
  await page.getByTestId("nav-masbaha").click();
  await expect(page.getByTestId("counter-zikr-filter")).toBeVisible();
  await expect(page.getByTestId("nav-masbaha")).toHaveAttribute("aria-current", "page");
  await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
  for (const width of [1024, 834]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByTestId("nav-masbaha")).toBeVisible();
    await expect(page.getByTestId("nav-masbaha")).toHaveAttribute("aria-current", "page");
    await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByTestId("nav-masbaha")).toHaveAttribute("aria-current", "page");
  const progress = await page.getByRole("progressbar").boundingBox();
  const controls = await page.getByTestId("masbaha-controls").boundingBox();
  expect(controls!.y - progress!.y - progress!.height).toBeGreaterThanOrEqual(12);
  const footer = page.locator("footer");
  await expect(footer.getByRole("button", { name: t("ar", "reader.keyboardShortcuts"), exact: true })).toHaveCount(0);
  for (const label of await footer.locator(".reader-tool-label").all()) await expect(label).toBeHidden();
  const more = page.getByRole("button", { name: t("ar", "common.moreOptions"), exact: true });
  await more.click();
  await page.getByRole("menuitem", { name: t("ar", "reader.keyboardShortcuts"), exact: true }).click();
  await expect(page.getByTestId("counter-keyboard-help")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
  await page.screenshot({ path: info.outputPath("masbaha-controls.png") });
});

for (const language of ["ar", "en"] as const) {
  test(`About source rows reflow and stay hittable at 200% in ${language} @cross-browser`, async ({ page }, info) => {
    await seed(page, language);
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto("/#/settings/about");
    const first = page.getByRole("button", { name: /Hisnul Muslim/ });
    await expect(first).toBeVisible();
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await page.evaluate(() => document.fonts.ready);
    const rows = first.locator("../..").locator(".settings-row-item > button");
    await expect(rows).toHaveCount(3);
    for (const row of await rows.all()) {
      await row.scrollIntoViewIfNeeded();
      const geometry = await row.evaluate((node) => {
        const r = node.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const text = [...node.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
        const next = node.parentElement?.nextElementSibling?.querySelector("button");
        return {
          separated: !next || next.getBoundingClientRect().top >= r.bottom - 1,
          contains: text.every((t) => t.top >= r.top && t.bottom <= r.bottom),
          hit: Boolean(hit && node.contains(hit)),
        };
      });
      expect(geometry.contains).toBe(true);
      expect(geometry.hit).toBe(true);
      expect(geometry.separated).toBe(true);
    }
    await page.screenshot({ path: info.outputPath("about-rows-200.png") });
  });
}
