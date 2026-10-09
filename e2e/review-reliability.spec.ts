import { expect, test, type Page } from "@playwright/test";
import { getAzkarByCategory } from "../src/app/content/azkar";

const ikhlasPosition = getAzkarByCategory("morning").findIndex((zikr) => zikr.id === "m-hm-76a") + 1;

async function returningGuest(page: Page, language: "ar" | "en") {
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem("azkarapp.counter-guidance.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, reduceMotion: true, hapticFeedback: false, routineModes: { morning: "core" } },
        profile: { isGuest: true },
      }),
    );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1200]) {
    test(`hand guidance toggles once at a stationary pointer in ${language} at ${width}px @cross-browser`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await returningGuest(page, language);
      await page.goto(`/#/azkar/morning/${ikhlasPosition}?mode=complete`);
      const counter = page.getByTestId("counter-surface");
      await expect(counter).toBeVisible();
      await counter.click();
      const countName = await counter.getAttribute("aria-label");
      const hand = page.getByTestId("counter-guidance-reopen");
      await expect(hand).toHaveAttribute("aria-expanded", "false");
      const initial = (await hand.boundingBox())!;
      const x = initial.x + initial.width / 2;
      const y = initial.y + initial.height / 2;
      for (let click = 0; click < 8; click++) {
        await page.mouse.click(x, y);
        await expect(hand).toHaveAttribute("aria-expanded", String(click % 2 === 0));
        await expect(counter).toHaveAttribute("aria-label", countName!);
        const box = (await hand.boundingBox())!;
        expect(x).toBeGreaterThanOrEqual(box.x);
        expect(x).toBeLessThanOrEqual(box.x + box.width);
        expect(y).toBeGreaterThanOrEqual(box.y);
        expect(y).toBeLessThanOrEqual(box.y + box.height);
      }
      await hand.focus();
      await page.keyboard.press("Enter");
      await expect(hand).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Space");
      await expect(hand).toHaveAttribute("aria-expanded", "false");
      await expect(counter).toHaveAttribute("aria-label", countName!);
      await page.screenshot({ path: `output/playwright/review-reliability/guidance-${language}-${width}.png` });
    });
  }

  test(`global shortcuts preserve modal ownership and Reader history in ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await returningGuest(page, language);
    await page.goto("/#/azkar/morning/2?mode=complete");
    const reader = page.getByTestId("reader-screen");
    await expect(reader).toBeVisible();
    const readingUrl = page.url();
    for (const surface of [
      {
        trigger: page.getByRole("button", {
          name: language === "ar" ? "خيارات القارئ" : "Reader options",
          exact: true,
        }),
        role: "menu" as const,
      },
      { trigger: page.getByTestId("reader-benefit-dock-button"), role: "dialog" as const },
    ]) {
      await surface.trigger.click();
      const overlay = page.getByRole(surface.role);
      await expect(overlay).toBeVisible();
      for (const shortcut of ["Control+k", "Alt+1", "/"]) {
        await page.keyboard.press(shortcut);
        await expect(overlay).toBeVisible();
        await expect(page).toHaveURL(readingUrl);
      }
      await page.keyboard.press("Escape");
      await expect(overlay).not.toBeVisible();
      await expect(surface.trigger).toBeFocused();
    }
    await page.keyboard.press("Control+k");
    await expect(page).toHaveURL(/#\/search/);
    await page.getByRole("button", { name: language === "ar" ? "رجوع" : "Back", exact: true }).click();
    await expect(page).toHaveURL(readingUrl);
    await expect(reader).toBeVisible();
  });
}

test("search keeps the same inventory, edited query and saved routine preference @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await returningGuest(page, "en");
  await page.goto("/#/azkar");
  const input = page.getByRole("textbox");
  await input.fill("steadfast");
  await expect(page.getByTestId("matching-zikr-card")).toHaveCount(3);
  await input.press("Enter");
  await expect(page.getByTestId("search-result")).toHaveCount(3);
  const surah = page.getByRole("button", { name: "As-Sajdah, in Before Sleep Azkar" });
  await expect(surah.locator("p").first()).toHaveText("As-Sajdah");
  await expect(surah.locator("mark")).toHaveText("steadfast");

  await input.fill("mercy");
  await expect(page).toHaveURL(/#\/search\/mercy$/);
  const result = page.getByRole("button", { name: /O Ever-Living.*Morning Azkar/ });
  await result.click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expect(page).toHaveURL(/mode=complete/);
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.routineModes.morning),
    )
    .toBe("core");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(input).toHaveValue("mercy");
  await expect(page).toHaveURL(/#\/search\/mercy$/);
  await page.reload();
  await expect(input).toHaveValue("mercy");

  await input.fill("steadfast");
  await page.getByTestId("search-result").filter({ hasText: "guide me and make me correct" }).click();
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reader-category", "comprehensive_duas");
  await expect(page.getByRole("region", { name: "Zikr reading text" })).toContainText("اللَّهُمَّ اهْدِنِي");
});
