import { expect, test, type Page } from "@playwright/test";

async function openFirstMorningZikr(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });

  await page.getByRole("button", { name: "🇬🇧 English en", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue as Guest Your progress won't sync across devices", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Morning Azkar, 0 of 15 complete", exact: true }).click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

test("counter acknowledges completion for 500 ms and gives the next zikr a calm ready cue", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const firstZikr = await zikr.textContent();
  expect(firstZikr).toBeTruthy();
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toBeVisible();

  const startedAt = Date.now();
  await page.getByTestId("counter-surface").click();

  await expect(page.getByTestId("counter-completion-cue")).toBeVisible();
  await expect(page.getByText("Complete!", { exact: true })).toBeVisible();

  await page.waitForTimeout(350);
  await expect(zikr).toHaveText(firstZikr!);

  await expect(zikr).not.toHaveText(firstZikr!, { timeout: 1000 });
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(450);
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toBeVisible();
});
