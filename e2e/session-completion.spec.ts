import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`first final count opens the completion summary in ${language} @cross-browser`, async ({ page }) => {
    const items = getAzkarForMode("home", "complete");
    await page.addInitScript(
      ({ language, completed }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, hapticFeedback: false },
            profile: { isGuest: true },
            completed: { home: completed },
          }),
        );
      },
      { language, completed: items.slice(0, -1).map((item) => item.id) },
    );
    await page.goto(`/#/azkar/home/${items.length}`);
    await page.getByTestId("counter-surface").click();
    await expect(
      page.getByRole("heading", { name: language === "ar" ? "ما شاء الله!" : "Masha’Allah!" }),
    ).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}"));
    expect(saved.completed.home).toHaveLength(items.length);
    expect(saved.sessions.filter((session: { category: string }) => session.category === "home")).toHaveLength(1);
  });
}
