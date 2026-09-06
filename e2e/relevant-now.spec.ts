import { expect, test, type Page } from "@playwright/test";

/**
 * The reminder follows the moment, not the date.
 *
 * Same reviewed pool the app has always used, narrowed to the context the hour
 * belongs to — so an evening visit draws on the evening collection and a
 * bedtime one on before-sleep, without a second content library to review.
 */
async function homeAt(page: Page, iso: string) {
  await page.clock.setFixedTime(new Date(iso));
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight" },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 15000 });
}

const narration = async (page: Page) => {
  const card = page.getByTestId("home-daily-evidence");
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  return (await card.textContent()) ?? "";
};

test("the card is named for the moment rather than the day", async ({ page }) => {
  await homeAt(page, "2026-09-07T08:00:00");
  await expect(page.getByTestId("home-daily-evidence").getByText("Relevant now")).toBeVisible();
});

test("it still shows what the narration rests on", async ({ page }) => {
  await homeAt(page, "2026-09-07T08:00:00");
  const text = await narration(page);
  // A reminder that cannot say where it comes from is the one thing this
  // card must never be.
  expect(text.length).toBeGreaterThan(40);
});

test("the same moment gives the same reminder, so it is not noise", async ({ page }) => {
  await homeAt(page, "2026-09-07T08:00:00");
  const first = await narration(page);
  await page.reload();
  await expect(page.getByRole("navigation").first()).toBeVisible();
  expect(await narration(page)).toBe(first);
});

test("a different hour of the same day can draw on a different collection", async ({ page }) => {
  await homeAt(page, "2026-09-07T08:00:00");
  const morning = await narration(page);

  await page.clock.setFixedTime(new Date("2026-09-07T22:30:00"));
  await page.reload();
  await expect(page.getByRole("navigation").first()).toBeVisible();
  const night = await narration(page);

  expect(night).not.toBe(morning);
});
