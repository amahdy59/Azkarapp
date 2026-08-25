import { expect, test, type Page } from "@playwright/test";

/**
 * Word meanings step through the passage in place.
 *
 * The stepper is scoped to the mushaf page on screen, which is the passage the
 * reader is actually looking at — not the whole surah.
 */
async function openKahf(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();
}

test.describe("Quran word meanings", () => {
  test("steps from one word to the next without reopening the sheet", async ({ page }) => {
    await openKahf(page);

    await page.getByTestId("quran-word-help").first().click();
    await expect(page.getByTestId("quran-word-popover")).toBeVisible();
    await page.getByTestId("quran-word-popover-all").click();
    await expect(page.getByTestId("quran-word-meaning-sheet")).toBeVisible();

    const position = page.getByTestId("word-meaning-position");
    await expect(position).toContainText("١");
    await expect(page.getByTestId("word-meaning-previous")).toBeDisabled();

    const firstWord = await page.getByTestId("quran-word-meaning-entry").first().locator("p").first().textContent();

    await page.getByTestId("word-meaning-next").click();
    await expect(position).toContainText("٢");
    // The sheet stayed open and swapped its content rather than closing.
    await expect(page.getByTestId("quran-word-meaning-sheet")).toBeVisible();
    await expect(page.getByTestId("quran-word-meaning-entry").first().locator("p").first()).not.toHaveText(
      firstWord ?? "",
    );

    await page.getByTestId("word-meaning-previous").click();
    await expect(position).toContainText("١");
    await expect(page.getByTestId("word-meaning-previous")).toBeDisabled();
  });

  test("anchors the gloss under the tapped word and dismisses on Escape", async ({ page }) => {
    await openKahf(page);

    const word = page.getByTestId("quran-word-help").first();
    await word.click();

    const popover = page.getByTestId("quran-word-popover");
    await expect(popover).toBeVisible();

    /* The box cannot always centre on the word — on a phone it is wider than
       the space beside it and clamps to the viewport, which is correct. What
       must hold everywhere is that the caret still points at the word, so that
       is what is asserted; centring is only checked when there was room. */
    const geometry = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="quran-word-popover"]')!;
      const w = document.querySelector('[data-testid="quran-word-help"]')!.getBoundingClientRect();
      const p = el.getBoundingClientRect();
      const caretX = Number.parseFloat(getComputedStyle(el, "::before").left);
      return {
        gap: Math.round(p.top - w.bottom),
        caretTipX: p.left + caretX,
        wordCentreX: w.left + w.width / 2,
        // The box keeps a 0.75rem margin off the edge, so "clamped" means it
        // reached that margin — not that it touched the viewport border.
        clamped: p.left <= 14 || p.right >= window.innerWidth - 14,
        centreOffset: Math.round(p.left + p.width / 2 - (w.left + w.width / 2)),
        insideViewport: p.left >= 0 && p.right <= window.innerWidth && p.bottom <= window.innerHeight,
      };
    });

    expect(geometry.gap).toBeGreaterThanOrEqual(0);
    expect(geometry.gap).toBeLessThanOrEqual(16);
    expect(geometry.insideViewport).toBe(true);
    // Caret lands on the word it explains, clamped layout or not.
    expect(Math.abs(geometry.caretTipX - geometry.wordCentreX)).toBeLessThanOrEqual(16);
    if (!geometry.clamped) {
      expect(Math.abs(geometry.centreOffset)).toBeLessThanOrEqual(2);
    }

    // The tapped word marks itself so the anchor and the highlight agree.
    await expect(word).toHaveAttribute("data-word-active", "true");

    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();
  });

  test("stops at the last annotated word of the page", async ({ page }) => {
    await openKahf(page);

    const words = page.getByTestId("quran-word-help");
    const total = await words.count();
    await words.nth(total - 1).click();
    await expect(page.getByTestId("quran-word-popover")).toBeVisible();
    await page.getByTestId("quran-word-popover-all").click();

    await expect(page.getByTestId("word-meaning-next")).toBeDisabled();
    await expect(page.getByTestId("word-meaning-previous")).toBeEnabled();
  });
});
