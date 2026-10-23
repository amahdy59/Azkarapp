import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { chooseWirdOption } from "./helpers/wird";

for (const language of ["ar", "en"] as const) {
  test.describe(language, () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-10-19T13:00:00+03:00"));
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, themeMode: "midnight" },
            profile: { isGuest: true },
            quranReadingPosition: { page: 42, surahNumber: 2, ayahNumber: 256, juzNumber: 3 },
            quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
            wirdHistory: { "2026-10-18": [40, 41] },
          }),
        );
      }, language);
      await page.goto("/#/quran-wird");
      await expect(page.getByRole("button", { name: t(language, "mushaf.editPlan"), exact: true })).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() =>
            Array.isArray(JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed?.after_prayer),
          ),
        )
        .toBe(true);
    });

    test(`compact wird plan fields reflow, expose choices and support keyboard in ${language} @cross-browser`, async ({
      page,
    }, testInfo) => {
      const edit = page.getByRole("button", { name: t(language, "mushaf.editPlan"), exact: true });
      await edit.click();
      const form = page.getByRole("form", { name: t(language, "mushaf.readingPlanLabel") });
      const plan = form.getByRole("combobox", { name: t(language, "mushaf.readingPlanLabel"), exact: true });
      await expect(plan).toBeFocused();
      await expect(form.getByRole("combobox")).toHaveCount(1);
      for (const width of [320, 390, 834, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await form.scrollIntoViewIfNeeded();
        const box = (await form.boundingBox())!;
        const control = (await plan.boundingBox())!;
        expect(Math.abs(control.width - box.width)).toBeLessThanOrEqual(1);
        expect(control.height).toBeGreaterThanOrEqual(48);
        expect(box.height).toBeLessThanOrEqual(390);
        expect(await form.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`wird-plan-${language}-${width}.png`) });
      }
      await plan.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("option")).toHaveCount(4);
      await expect(
        page.getByRole("option", { name: t(language, "mushaf.planPagesPerDay"), exact: true }),
      ).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(
        page.getByRole("option", { name: t(language, "mushaf.planRepeatChoice"), exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(plan).toHaveText(t(language, "mushaf.planRepeatChoice"));
      await expect(plan).toBeFocused();
      await expect(form.getByRole("spinbutton")).toHaveCount(0);
      await page.setViewportSize({ width: 320, height: 700 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const juz = form.getByRole("combobox", { name: new RegExp(`^${t(language, "mushaf.selectJuz")}`) });
      await juz.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`wird-plan-${language}-200-repeat.png`) });
      const geometry = await form.evaluate((node) => ({
        width: node.clientWidth,
        scroll: node.scrollWidth,
        overflowing: [...node.querySelectorAll<HTMLElement>("*")]
          .filter((element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
          .map((element) => ({
            tag: element.tagName,
            text: element.textContent?.slice(0, 60),
            className: element.className,
            width: element.clientWidth,
            scroll: element.scrollWidth,
          })),
      }));
      expect(geometry.scroll <= geometry.width + 1, JSON.stringify(geometry)).toBe(true);
      expect(await juz.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await chooseWirdOption(page, language, "plan", "scheduled");
      await chooseWirdOption(page, language, "schedule", "custom");
      expect(await form.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      for (const control of await form.locator("button, input").all()) {
        const bounds = (await control.boundingBox())!;
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(await control.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      }
      expect((await new AxeBuilder({ page }).include(".quran-wird-plan-form").analyze()).violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`wird-plan-${language}-200-custom.png`) });
      await form.getByRole("button", { name: t(language, "mushaf.cancelPlan"), exact: true }).click();
      await expect(form).toHaveCount(0);
      await expect(edit).toBeFocused();
      await edit.click();
      await expect(plan).toContainText(t(language, "mushaf.planPagesPerDay"));
    });

    test(`all six saved wird kinds survive the compact form and reload in ${language} @cross-browser`, async ({
      page,
    }) => {
      const before = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
      for (const kind of ["daily", "hijriMonth", "gregorianMonth", "custom", "repeating", "free"] as const) {
        await page.getByRole("button", { name: t(language, "mushaf.editPlan"), exact: true }).click();
        await chooseWirdOption(
          page,
          language,
          "plan",
          ["hijriMonth", "gregorianMonth", "custom"].includes(kind) ? "scheduled" : kind,
        );
        if (["hijriMonth", "gregorianMonth", "custom"].includes(kind))
          await chooseWirdOption(page, language, "schedule", kind);
        if (kind === "custom") {
          await page.getByLabel(t(language, "mushaf.fromPage"), { exact: true }).fill("10");
          await page.getByLabel(t(language, "mushaf.toPage"), { exact: true }).fill("100");
          await page.getByLabel(t(language, "mushaf.durationDays"), { exact: true }).fill("60");
        }
        if (kind === "repeating") {
          await chooseWirdOption(page, language, "section", "custom");
          await page.getByLabel(t(language, "mushaf.fromPage"), { exact: true }).fill("10");
          await page.getByLabel(t(language, "mushaf.toPage"), { exact: true }).fill("13");
        }
        const form = page.getByRole("form", { name: t(language, "mushaf.readingPlanLabel") });
        // Choosing fields never writes the active plan before submission.
        const oldKind = await page.evaluate(
          () => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).quranWirdPlan.kind,
        );
        if (kind === "custom") expect(oldKind).toBe("gregorianMonth");
        if (kind === "daily") {
          const pages = form.getByRole("spinbutton", { name: t(language, "mushaf.planPagesPerDay"), exact: true });
          await pages.fill("8");
          await pages.press("Enter");
        } else {
          await form.getByRole("button", { name: t(language, "mushaf.savePlan"), exact: true }).click();
        }
        await expect
          .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).quranWirdPlan.kind))
          .toBe(kind);
        await page.reload();
        await expect(page.getByRole("button", { name: t(language, "mushaf.editPlan"), exact: true })).toBeVisible();
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
        expect(stored.quranWirdPlan.kind).toBe(kind);
        if (kind === "daily") expect(stored.quranWirdPlan.dailyPages).toBe(8);
        expect(stored.wirdHistory).toEqual(before.wirdHistory);
        expect(stored.quranReadingPosition).toEqual(before.quranReadingPosition);
        if (kind === "custom")
          expect(stored.quranWirdPlan).toMatchObject({
            startPage: 10,
            targetPage: 100,
            durationDays: 60,
            dailyPages: 2,
          });
        if (kind === "repeating")
          expect(stored.quranWirdPlan).toMatchObject({ repeatStartPage: 10, repeatEndPage: 13, dailyPages: 4 });
        if (kind === "free") expect(stored.quranWirdPlan.dailyPages).toBe(0);
      }
    });
  });
}
