import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

test("bounded history and repeated reading preserve counts without accumulating reading nodes @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", routineMode: "complete", reduceMotion: true },
        routineMode: "complete",
        profile: { isGuest: true },
        sessions: Array.from({ length: 505 }, (_, index) => ({
          id: `history-${index}`,
          category: "morning",
          completedAt: new Date(2026, 0, 1, 0, index).toISOString(),
          completedCount: 1,
          totalCount: 1,
          durationSeconds: 1,
          isComplete: true,
        })),
      }),
    );
  });
  const index = getAzkarForMode("morning", "complete").findIndex((entry) => entry.repetitionCount === 100);
  await page.goto(`./#/azkar/morning/${index + 1}`);
  const counter = page.getByTestId("counter-surface");
  await expect(counter).toHaveAttribute("aria-label", /0 \/ 100$/);
  const samples = [];
  for (let cycle = 0; cycle < 20; cycle++) {
    await counter.click();
    await expect(counter).toHaveAttribute("aria-label", new RegExp(`${cycle + 1} / 100$`));
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Prev", exact: true }).click();
    await expect(counter).toHaveAttribute("aria-label", new RegExp(`${cycle + 1} / 100$`));
    await expect(page.getByTestId("reading-text-transition").locator(":scope > div")).toHaveCount(1);
    samples.push(
      await page.evaluate(() => ({
        nodes: document.querySelectorAll("*").length,
        heapBytes:
          (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null,
      })),
    );
  }
  await page.reload();
  await expect(counter).toHaveAttribute("aria-label", /20 \/ 100$/);
  const sessions = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).sessions);
  expect(sessions).toHaveLength(500);
  expect(sessions[0].id).toBe("history-504");
  expect(sessions.at(-1).id).toBe("history-5");
  await info.attach("reading-session-diagnostics", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });
});
