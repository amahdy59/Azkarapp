import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const scenarios = [
  { name: "light Glass over solid", theme: "light", app: "solid", home: "glass", glass: true, cross: true },
  { name: "midnight Glass", theme: "midnight", app: "glass", home: "glass", glass: true, cross: true },
  { name: "dark Glass", theme: "dark", app: "glass", home: "glass", glass: true },
  { name: "light solid", theme: "light", app: "solid", home: "solid", glass: false, cross: true },
  { name: "midnight solid", theme: "midnight", app: "solid", home: "solid", glass: false },
  { name: "dark solid", theme: "dark", app: "solid", home: "solid", glass: false },
  { name: "solid Home over App Glass", theme: "light", app: "glass", home: "solid", glass: false, cross: true },
  {
    name: "explicit Glass reduced transparency",
    theme: "light",
    app: "solid",
    home: "glass",
    glass: true,
    reduceTransparency: true,
  },
  {
    name: "system reduced transparency",
    theme: "light",
    app: "system",
    home: "system",
    glass: false,
    reduceTransparency: true,
  },
  { name: "high contrast", theme: "light", app: "glass", home: "glass", glass: true, highContrast: true },
  { name: "narrow enlarged Glass", theme: "light", app: "solid", home: "glass", glass: true, width: 320, scale: 2 },
  { name: "unavailable photo", theme: "light", app: "solid", home: "glass", glass: false, photoFailure: true },
] as const;

async function paint(locator: Locator) {
  return locator.evaluate((element) => {
    const css = getComputedStyle(element);
    return {
      color: css.color,
      background: css.backgroundColor,
      filter: css.backdropFilter,
      image: css.backgroundImage,
    };
  });
}

/** Exact opaque button pairing catches the reported white-on-cream label. */
async function contrast(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const rgb = (value: string) => value.match(/[\d.]+/gu)!.map(Number);
    const fg = rgb(style.color),
      bg = rgb(style.backgroundColor);
    if ((fg[3] ?? 1) !== 1 || (bg[3] ?? 1) !== 1) return 0;
    const luminance = (color: number[]) =>
      color.slice(0, 3).reduce((sum, channel, i) => {
        const v = channel / 255;
        return sum + [0.2126, 0.7152, 0.0722][i]! * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      }, 0);
    const a = luminance(fg),
      b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

for (const language of ["ar", "en"] as const) {
  for (const scenario of scenarios) {
    test(`Home material pairing ${scenario.name} ${language}${"cross" in scenario && scenario.cross ? " @cross-browser" : ""}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: "width" in scenario ? scenario.width : 1440, height: 1000 });
      await page.clock.setFixedTime(new Date("2026-11-27T14:00:00+02:00"));
      await page.route("**/__browser-test-api/v1/visitors", (route) => route.fulfill({ json: { active: 1 } }));
      if ("photoFailure" in scenario) await page.route("**/assets/backgrounds/**", (route) => route.abort());
      await page.addInitScript(
        ({ language, scenario }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: scenario.theme,
                appMaterial: scenario.app,
                homeMaterial: scenario.home,
                reduceMotion: true,
                reduceTransparency: "reduceTransparency" in scenario && scenario.reduceTransparency,
                highContrast: "highContrast" in scenario && scenario.highContrast,
              },
              profile: { isGuest: true },
            }),
          );
        },
        { language, scenario },
      );
      await page.goto("/#/home");
      if ("scale" in scenario)
        await page.addStyleTag({ content: `html { font-size: ${scenario.scale * 100}% !important; }` });
      const books = page.getByTestId("home-learning");
      const explore = books.getByRole("button").first();
      const share = page.getByTestId("home-app-sharing").getByRole("button");
      await expect(books).toBeVisible();
      if ("photoFailure" in scenario) await expect(page.getByTestId("time-of-day-scene-window")).toHaveCount(0);
      await share.scrollIntoViewIfNeeded();
      await expect(share).toBeVisible();
      const card = await paint(share),
        readingCard = await paint(books);
      const more = page.getByTestId("home-more");
      expect((await paint(more)).background).toBe(readingCard.background);
      expect((await paint(more)).color).toBe(readingCard.color);
      expect(card.color).toBe(readingCard.color);
      if (scenario.glass) {
        expect(card.background).toBe(readingCard.background);
        await expect(share).toHaveClass(/hero-glass/u);
        await expect(books).toHaveClass(/hero-glass/u);
        expect(card.color).toBe("rgb(255, 255, 255)");
        expect(card.filter).toBe(readingCard.filter);
        await explore.scrollIntoViewIfNeeded();
        expect(await contrast(explore)).toBeGreaterThanOrEqual(4.5);
      } else {
        await expect(share).not.toHaveClass(/hero-glass/u);
        await expect(books).not.toHaveClass(/hero-glass/u);
        if (scenario.theme === "light") expect(card.color).toBe("rgb(23, 23, 23)");
        await explore.scrollIntoViewIfNeeded();
        expect(await contrast(explore)).toBeGreaterThanOrEqual(4.5);
      }
      // Exercise actual keyboard/pointer states on the formerly unreadable action.
      await explore.focus();
      await expect(explore).toBeFocused();
      expect(await explore.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
      await explore.hover();
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="home-learning"]')
            .withTags(["wcag2a", "wcag2aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.mouse.move(0, 0);
      await explore.evaluate((element: HTMLElement) => element.blur());
      await share.scrollIntoViewIfNeeded();
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="home-app-sharing"]')
            .withTags(["wcag2a", "wcag2aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await expect(page.getByTestId("home-app-qr")).toHaveAttribute("src", /^data:image\/png;base64,/u);
      await mkdir("output/playwright/home-material-colors", { recursive: true });
      await page.screenshot({
        path: `output/playwright/home-material-colors/${info.project.name}-${language}-${scenario.name.replaceAll(" ", "-")}.png`,
      });
    });
  }
}
