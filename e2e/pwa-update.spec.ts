import { expect, test, type Page } from "@playwright/test";

const notes = {
  ar: ["التغيير الأول", "التغيير الثاني", "التغيير الثالث"],
  en: ["First change", "Second change", "Third change"],
};

async function openReturningGuest(page: Page, language: "ar" | "en") {
  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: selectedLanguage, themeMode: "midnight", reduceMotion: true },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  }, language);
  await page.goto("/");
  await expect(page.locator('#main-content[data-view="home"]')).toBeVisible();
}

for (const language of ["en", "ar"] as const) {
  test(`the update notice shows highlights in ${language}`, async ({ page }) => {
    await page.route("**/release-notes.json?update=*", (route) => route.fulfill({ json: notes }));
    await openReturningGuest(page, language);
    await page.evaluate(() => window.dispatchEvent(new Event("azkar-update-available")));

    const title = language === "ar" ? "يتوفر تحديث جديد" : "An update is ready";
    const notice = page.getByRole("complementary", { name: title });
    await expect(notice.getByRole("listitem")).toHaveText(notes[language]);
    await expect(notice).not.toContainText(
      language === "ar" ? "حدّث التطبيق لاستخدام أحدث التحسينات." : "Refresh to use the latest improvements.",
    );
  });
}
