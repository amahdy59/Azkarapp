import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The overlay surfaces added alongside the reader and prayer tracking.
 *
 * The existing accessibility sweep predates all three, so none of them were
 * audited. Overlays are where these problems hide: they trap focus, they sit
 * on their own stacking context, and their contrast comes from a tint over a
 * surface rather than from a token.
 */
async function seed(page: Page, hash: string) {
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
  await page.goto(hash);
}

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).include(selector).withTags(WCAG).analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`);
}

test("immersive Mushaf mode has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await seed(page, "/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  // A multi-page surah arrives in the Mushaf; nothing has to open it.
  await expect(page.getByTestId("mushaf-immersive")).toBeVisible();

  expect(await scan(page, '[data-testid="mushaf-immersive"]')).toEqual([]);
});

test("the interactive word-meaning card is named, reachable, and has no automatic WCAG A/AA violations", async ({
  page,
}) => {
  await seed(page, "/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  // The word-meaning card belongs to the reader, which this surah now opens
  // past. The control that steps back differs by width: the rail carries it on
  // a landscape screen, the header bar on a narrow one.
  const railBack = page.getByTestId("mushaf-rail-back");
  if ((await railBack.count()) > 0) await railBack.click();
  else await page.getByTestId("mushaf-immersive-close").click();
  await expect(page.getByTestId("mushaf-immersive")).toHaveCount(0);

  await page.getByTestId("quran-word-help").first().click();
  const card = page.getByTestId("quran-word-popover");
  await expect(card).toBeVisible();
  await expect(card).toHaveRole("dialog");
  await expect(card).toHaveAccessibleName(/المعنى/);

  const actionBox = await page.getByTestId("quran-word-popover-all").boundingBox();
  expect(actionBox?.height).toBeGreaterThanOrEqual(44);
  await expect(card).toContainText("الميسر في غريب القرآن");

  expect(await scan(page, '[data-testid="quran-word-popover"]')).toEqual([]);
});

test("the prayer virtue dialog has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await seed(page, "/#/home");
  await expect(page.getByTestId("prayer-tracker-cards")).toBeVisible();

  const prayer = await page
    .getByTestId("prayer-tracker-cards")
    .locator('article[data-prayer-state="past"], article[data-prayer-state="current"]')
    .first()
    .getAttribute("data-prayer");
  test.skip(!prayer, "no prayer has arrived yet, so none can be recorded");

  await page.locator(`#prayer-${prayer}-mosque`).check();
  await expect(page.getByTestId("prayer-virtue-modal")).toBeVisible();

  expect(await scan(page, '[data-testid="prayer-virtue-modal"]')).toEqual([]);
});
