import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://api.quran.com/**", (route) => route.abort());
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
        khatmahPage: 42,
        quranReadingPosition: { page: 42, surahNumber: 2, ayahNumber: 256, juzNumber: 3 },
        quranWirdPlan: { kind: "daily", dailyPages: 4 },
        wirdHistory: {},
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByRole("button", { name: /ورد القرآن/ }).click();
});

test("keeps progress in the Wird overview and turns one semantic page by swipe, key, or button", async ({ page }) => {
  const progress = page.getByRole("progressbar", { name: /أكملت ٠ من ٤/ });
  await expect(progress).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "هذا الأسبوع" }).getByRole("listitem").first()).toContainText("السبت");

  await page.getByRole("button", { name: "متابعة القراءة" }).click();
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "إظهار معاني الكلمات الصعبة" })).toBeVisible();
  await page.getByRole("button", { name: "إظهار معاني الكلمات الصعبة" }).click();
  await expect(page.getByRole("button", { name: /معنى كلمة/ })).toHaveCount(3);
  await expect(page.getByText(/ختمة المصحف:/)).toHaveCount(0);

  await expect(page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" })).toHaveCount(0, { timeout: 5000 });
  await page.getByRole("button", { name: "إظهار أدوات صفحة المصحف" }).click();
  await expect(page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "رجوع" }).focus();
  await expect(page.getByRole("button", { name: "رجوع" })).toBeFocused();
  await page.waitForTimeout(3800);
  await expect(page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" })).toBeVisible();

  const pageBox = await page.getByRole("article", { name: "صفحة ٤٢" }).boundingBox();
  expect(pageBox).not.toBeNull();
  if (!pageBox) return;
  await page.mouse.move(pageBox.x + pageBox.width * 0.8, pageBox.y + pageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(pageBox.x + pageBox.width * 0.2, pageBox.y + pageBox.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  await page.getByRole("article", { name: "صفحة ٤٢" }).getByRole("button", { name: "التالي" }).click();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();
});
