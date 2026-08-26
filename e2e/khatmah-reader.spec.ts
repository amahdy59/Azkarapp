import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // The reader no longer talks to api.quran.com at all; blocking the remote
  // page font keeps the run deterministic on the shipped Unicode fallback.
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
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
  await page.getByRole("button", { name: /خطة القراءة/ }).click();
});

test("keeps progress in the Wird overview and turns one semantic page by swipe, key, or button", async ({ page }) => {
  const progress = page.getByRole("progressbar", { name: /أكملت ٠ من ٤/ });
  await expect(progress).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "هذا الأسبوع" }).getByRole("listitem").first()).toContainText("السبت");
  const arabicAlignments = await page
    .getByTestId("quran-wird-content")
    .locator("h2, p, label")
    .evaluateAll((elements) =>
      elements
        .filter((element) => /[\u0600-\u06ff]/.test(element.textContent ?? ""))
        .map((element) => getComputedStyle(element).textAlign),
    );
  expect(new Set(arabicAlignments)).toEqual(new Set(["right"]));

  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "متابعة القراءة" }).click();
  const mushafPage = page.getByRole("article", { name: "صفحة ٤٢" });
  const pageNavigation = page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" });
  await expect(mushafPage).toBeVisible();
  await expect(pageNavigation).toBeVisible();
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toHaveCount(0);
  const initialBox = await mushafPage.boundingBox();
  // The Mushaf is the whole screen: no card, no gutter, no letterbox.
  expect(initialBox?.x ?? 99).toBeLessThanOrEqual(1);
  expect(initialBox?.width ?? 0).toBeGreaterThanOrEqual(319);
  expect(initialBox?.height ?? 0).toBeGreaterThanOrEqual(690);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);

  // The mobile menu stays contextual: theme and page bookmark only. Layout is
  // desktop-only and the retired alternate text view cannot reappear here.
  const optionsButton = page.getByRole("button", { name: /الإعدادات/ });
  const savePlaceButton = page.getByRole("button", { name: "تعيين موضع المتابعة" });
  if (!(await savePlaceButton.isVisible())) {
    await mushafPage.click({ position: { x: 160, y: 350 } });
  }
  await expect(savePlaceButton).toBeVisible();
  await optionsButton.focus();
  await optionsButton.click();
  await expect(page.getByText("تخطيط الصفحة")).toHaveCount(0);
  await expect(page.getByText("قراءة مريحة")).toHaveCount(0);
  await page.keyboard.press("Escape");
  const lines = mushafPage.locator("[data-mushaf-line-content]");
  await expect(mushafPage.locator("[data-mushaf-rendering] > div > div")).toHaveCount(15);
  // No line may paint outside the slot it sits in — overlong lines are scaled
  // down to fit, never clipped at the page edge.
  const bleed = await lines.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const slot = element.parentElement?.getBoundingClientRect();
      const painted = element.getBoundingClientRect();
      return slot ? [painted.width - slot.width, painted.height - slot.height] : [];
    }),
  );
  expect(bleed.filter((delta) => delta > 1)).toEqual([]);
  const lineRectsBefore = await lines.evaluateAll((elements) =>
    elements.map((element, _index, allLines) => {
      const rect = element.getBoundingClientRect();
      return [rect.width, rect.y - allLines[0].getBoundingClientRect().y];
    }),
  );
  const difficultWords = page.getByRole("switch", { name: "معاني الكلمات" });
  await expect(difficultWords).toHaveAttribute("aria-checked", "false");
  await difficultWords.click();
  await expect(difficultWords).toHaveAttribute("aria-checked", "true");
  // Ghareeb glosses now cover all 114 surahs, not the eight the azkar reader
  // bundles, so this page carries well more than the three it used to.
  await expect(page.getByRole("button", { name: /معنى كلمة/ }).first()).toBeVisible();
  expect(await page.getByRole("button", { name: /معنى كلمة/ }).count()).toBeGreaterThanOrEqual(3);
  const lineRectsAfter = await lines.evaluateAll((elements) =>
    elements.map((element, _index, allLines) => {
      const rect = element.getBoundingClientRect();
      return [rect.width, rect.y - allLines[0].getBoundingClientRect().y];
    }),
  );
  expect(lineRectsAfter).toEqual(lineRectsBefore);

  // QCF draws private-use glyphs, so ayah actions must expose the canonical
  // Unicode text rather than relying on selection-copy from the paper.
  await page.getByRole("button", { name: "فتح إجراءات الآية ٢٥٥" }).click();
  const ayahSheet = page.getByTestId("ayah-interaction-sheet");
  await expect(ayahSheet).toBeVisible();
  await expect(ayahSheet).toContainText("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ");
  await expect(ayahSheet.getByRole("button", { name: "نسخ الآية" })).toBeEnabled();
  await ayahSheet.getByRole("button", { name: "حفظ الآية" }).click();
  await expect(ayahSheet.getByRole("status")).toHaveText("تم حفظ الآية.");
  await ayahSheet.getByRole("button", { name: "إغلاق" }).click();

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.getByText(/ختمة المصحف:/)).toHaveCount(0);

  // Controls remain visible while reading, so orientation and page actions are
  // never hidden behind a discovery tap.
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  const backButton = page.getByRole("button", { name: "رجوع" });
  await backButton.focus();
  await expect(backButton).toBeFocused();
  await page.waitForTimeout(5200);
  await expect(pageNavigation).toBeVisible();
  await expect(page.getByRole("switch", { name: "معاني الكلمات" })).toBeVisible();

  const pageBox = await page.getByRole("article", { name: "صفحة ٤٢" }).boundingBox();
  expect(pageBox).not.toBeNull();
  if (!pageBox) return;
  await page.mouse.move(pageBox.x + pageBox.width * 0.2, pageBox.y + pageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(pageBox.x + pageBox.width * 0.8, pageBox.y + pageBox.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();

  // Moving left goes back; the labelled controls keep the same semantics.
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  await page.getByRole("article", { name: "صفحة ٤٢" }).getByRole("button", { name: "التالي" }).click();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();
});

test("offers clear RTL reading choices and free reading without progress tracking", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "تعديل" }).click();

  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(4);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("radio", { name: /صفحات كل يوم/ })).toBeChecked();

  const optionState = await radios.evaluateAll((elements) =>
    elements.map((radio) => {
      const label = radio.closest("label");
      const text = label?.querySelector("span");
      const box = label?.getBoundingClientRect();
      const styles = label ? getComputedStyle(label) : null;
      return {
        direction: label ? getComputedStyle(label).direction : "",
        textAlign: text ? getComputedStyle(text).textAlign : "",
        minHeight: box?.height ?? 0,
        backgroundColor: styles?.backgroundColor ?? "",
        borderColor: styles?.borderColor ?? "",
      };
    }),
  );
  expect(
    optionState.every(
      ({ direction, textAlign, minHeight }) => direction === "rtl" && textAlign === "right" && minHeight >= 64,
    ),
  ).toBe(true);
  expect(optionState[0]?.backgroundColor).not.toBe(optionState[1]?.backgroundColor);
  expect(optionState[0]?.borderColor).not.toBe(optionState[1]?.borderColor);

  const accessibility = await new AxeBuilder({ page })
    .include('[data-testid="quran-wird-content"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.getByRole("radio", { name: /قراءة حرة/ }).check();
  await expect(page.getByText(/سيُحفظ موضعك/)).toBeVisible();
  await page.getByRole("button", { name: "حفظ الخطة" }).click();
  await expect(page.getByText("القراءة الحرة مفعّلة")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "هذا الأسبوع" })).toHaveCount(0);

  await page.getByRole("button", { name: "متابعة القراءة" }).click();
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("azkarapp.state.v1") ?? "{}"));
  expect(stored.quranReadingPosition?.page).toBe(43);
  expect(stored.wirdHistory).toEqual({});
});

test("keeps the curved Surah header and Bismillah consistent without changing the page grid", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "متابعة القراءة" }).click();

  const openSurah = async (name: RegExp, pageName: string) => {
    await page.getByRole("button", { name: "فهرس المصحف الشريف" }).click();
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("article", { name: pageName })).toBeVisible();
  };

  await openSurah(/٢ البقرة/, "صفحة ٢");
  const ordinaryBismillahSize = await page
    .getByTestId("mushaf-bismillah")
    .evaluate((element) => getComputedStyle(element).fontSize);
  const ornament = page.getByTestId("mushaf-surah-ornament");
  await expect(page.getByRole("heading", { level: 2, name: "سورة البقرة" })).toBeVisible();
  await expect(ornament).toHaveAttribute("aria-hidden", "true");
  await expect(ornament).toHaveAttribute("focusable", "false");

  await openSurah(/٤ النساء/, "صفحة ٧٧");
  const oneSlotBismillah = page.getByTestId("mushaf-bismillah");
  const oneSlotBismillahSize = await oneSlotBismillah.evaluate((element) => getComputedStyle(element).fontSize);
  expect(oneSlotBismillahSize).toBe(ordinaryBismillahSize);
  await expect(
    page.getByRole("article", { name: "صفحة ٧٧" }).locator("[data-mushaf-rendering] > div > div"),
  ).toHaveCount(15);

  const geometry = await page.evaluate(() => {
    const title = document.querySelector<HTMLElement>('[data-testid="mushaf-surah-title"]');
    const bismillah = document.querySelector<HTMLElement>('[data-testid="mushaf-bismillah"]');
    const firstVerse = document.querySelector<HTMLElement>("[data-mushaf-line]");
    if (!title || !bismillah || !firstVerse) return null;
    return {
      titleBottom: title.getBoundingClientRect().bottom,
      titleClips: title.scrollWidth > title.clientWidth,
      bismillahTop: bismillah.getBoundingClientRect().top,
      bismillahBottom: bismillah.getBoundingClientRect().bottom,
      firstVerseTop: firstVerse.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry?.titleClips).toBe(false);
  expect(geometry?.titleBottom ?? 1).toBeLessThanOrEqual(geometry?.bismillahTop ?? 0);
  expect(geometry?.bismillahBottom ?? 1).toBeLessThanOrEqual((geometry?.firstVerseTop ?? 0) + 1);
  expect(geometry?.overflow).toBe(0);

  await openSurah(/٩ التوبة/, "صفحة ١٨٧");
  await expect(page.getByRole("heading", { level: 2, name: "سورة التوبة" })).toBeVisible();
  await expect(page.getByTestId("mushaf-bismillah")).toHaveCount(0);
});
