import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { getPrayerInfoData } from "../src/app/content/prayerActions";
import { getEstimatedPrayerTimes } from "../src/app/content/prayerTimes";

test.use({ serviceWorkers: "block" });

async function openHome(page: Page, language: "ar" | "en", material = "glass") {
  await fixtureReminderCatalogue(page);
  await page.clock.setFixedTime(new Date("2026-11-24T22:30:00+02:00"));
  await page.addInitScript(
    ({ language, material }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: material === "solid" ? "light" : "midnight",
            appMaterial: material,
            homeMaterial: material,
            calendarType: "gregorian",
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    },
    { language, material },
  );
  await page.goto("/#/home");
  await expect(page.getByTestId("home-all-prayers-row")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const language of ["ar", "en"] as const) {
  for (const material of ["glass", "solid"]) {
    test(`desktop prayer card keeps every source visible ${language} ${material} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await openHome(page, language, material);
      for (const prayer of ["asr", "dhuhr", "fajr", "maghrib", "isha"] as const) {
        const time = getEstimatedPrayerTimes(new Date("2026-11-24T12:00:00+02:00"))[prayer];
        const instant = new Date(`2026-11-24T${time}:00+02:00`);
        instant.setMinutes(instant.getMinutes() + 5);
        await page.clock.setFixedTime(instant);
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
        const trigger = page.getByTestId(`prayer-card-${prayer}`).getByRole("button");
        await expect(trigger).toBeEnabled();
        if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
        const card = page.getByTestId("prayer-actions-card");
        await expect(card).toHaveAttribute("data-inline-information", "true");
        await expect(card.getByTestId("prayer-actions-more-info")).toHaveCount(0);
        await expect(card.locator(".prayer-evidence-toggle")).toBeHidden();
        await expect(card.getByTestId("prayer-virtue-source")).toBeVisible();
        const details = card.getByTestId("prayer-inline-info");
        await expect(details).toBeVisible();
        await expect(details.locator("summary, details, a, button")).toHaveCount(0);
        const data = getPrayerInfoData(prayer, language, "2026-11-24");
        for (const item of data.sunnahItems) {
          await expect(details).toContainText(item.description);
          await expect(details).toContainText(item.rankLabel);
          await expect(
            details.getByText(
              language === "ar" ? item.sunnah.evidence.referenceArabic : item.sunnah.evidence.referenceEnglish,
              { exact: true },
            ),
          ).toBeVisible();
        }
        if (data.rawatibVirtue) await expect(card.getByTestId("rawatib-virtue-banner")).toBeVisible();
        else await expect(card.getByTestId("rawatib-virtue-banner")).toHaveCount(0);
        const spacing = await card.evaluate((node) => {
          const main = node.querySelector(".prayer-actions-main")!.getBoundingClientRect();
          const reading = node.querySelector(".prayer-actions-reading")!;
          const virtue = reading.querySelector(".prayer-actions-evidence")!.getBoundingClientRect();
          const guidance = reading.querySelector(".prayer-sunnah-details")!.getBoundingClientRect();
          return { gap: guidance.top - virtue.bottom, main: main.top, reading: reading.getBoundingClientRect().top };
        });
        expect(spacing.gap).toBeCloseTo(12, 0);
        expect(spacing.main).toBeCloseTo(spacing.reading, 0);
        if (prayer !== "fajr") {
          const header = await card.evaluate((node) => {
            const heading = node.querySelector("h2")!.getBoundingClientRect();
            const label = node.querySelector(".prayer-actions-list label span[id]")!;
            const range = document.createRange();
            range.selectNodeContents(label);
            const ink = range.getBoundingClientRect();
            const close = node.querySelector(".home-prayer-detail-close")!.getBoundingClientRect();
            const input = node.querySelector("input")!.getBoundingClientRect();
            const date = node.querySelector(".prayer-actions-context")!.getBoundingClientRect();
            return {
              gap: ink.top - heading.bottom,
              closeWidth: close.width,
              closeHeight: close.height,
              overlap:
                close.left < input.right &&
                close.right > input.left &&
                close.top < input.bottom &&
                close.bottom > input.top,
              headingEdge: node.getAttribute("dir") === "rtl" ? heading.right : heading.left,
              dateEdge: node.getAttribute("dir") === "rtl" ? date.right : date.left,
            };
          });
          expect(header.gap).toBeGreaterThanOrEqual(12);
          expect(header.gap).toBeLessThanOrEqual(22);
          expect(header.closeWidth).toBeGreaterThanOrEqual(44);
          expect(header.closeHeight).toBeGreaterThanOrEqual(44);
          expect(header.overlap).toBe(false);
          expect(header.dateEdge).toBeCloseTo(header.headingEdge, 0);
        }
        await expect(card.getByTestId("prayer-record-date")).toHaveAttribute("datetime", "2026-11-24");
        await expect(card.getByTestId("prayer-record-date")).toBeVisible();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        const checkbox = card.getByRole("checkbox").first();
        await checkbox.focus();
        await checkbox.press("Space");
        await expect(checkbox).toBeChecked();
        await checkbox.press("Space");
        await expect(checkbox).not.toBeChecked();
        // Short and fullest guidance are the representative visual captures.
        // Preserve every prayer's assertions without serializing five expensive
        // WebKit element captures inside one ordinary test deadline.
        if (prayer === "asr" || prayer === "dhuhr") {
          await card.screenshot({
            path: `output/playwright/prayer-card-polish/${info.project.name}-${language}-${material}-${prayer}.png`,
          });
        }
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="prayer-actions-card"]').analyze()).violations,
      ).toEqual([]);
    });
  }

  test(`prayer card preserves compact recovery and enlarged text ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openHome(page, language);
    await page.getByTestId("prayer-card-asr").getByRole("button").click();
    const card = page.getByTestId("prayer-actions-card");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(card.getByTestId("prayer-inline-info")).toBeVisible();
    await expect(card.locator(".prayer-evidence-toggle")).toBeHidden();
    await expect(card.getByTestId("prayer-virtue-source")).toBeVisible();
    expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await card.screenshot({
      path: `output/playwright/prayer-card-polish/${info.project.name}-${language}-desktop-200.png`,
    });
    for (const width of [834, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(card.getByTestId("prayer-inline-info")).toHaveCount(0);
      const date = card.getByTestId("prayer-record-date");
      await expect(date).toBeVisible();
      const trigger = card.getByTestId("prayer-actions-more-info");
      await trigger.click();
      const dialog = page.getByTestId("prayer-actions-info-modal");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByTestId("prayer-info-points")).toContainText(
        getPrayerInfoData("asr", language, "2026-11-24").sunnahItems[0]!.rankLabel,
      );
      await expect(dialog.getByTestId("prayer-record-date")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await expect(date).toBeVisible();
      const overflow = await card.evaluate((node) =>
        [...node.querySelectorAll("*")]
          .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline")
          .map((el) => ({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.slice(0, 80),
            width: el.clientWidth,
            scroll: el.scrollWidth,
          })),
      );
      expect(overflow).toEqual([]);
      const disclosure = card.locator(".prayer-evidence-toggle");
      await disclosure.press("Enter");
      await expect(card.getByTestId("prayer-virtue-source")).toBeVisible();
      await disclosure.press("Space");
      await expect(card.getByTestId("prayer-virtue-source")).toBeHidden();
      if (width === 320) {
        await card.screenshot({
          path: `output/playwright/prayer-card-polish/${info.project.name}-${language}-${width}-200.png`,
        });
      }
    }
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="prayer-actions-card"]').analyze()).violations,
    ).toEqual([]);
    await card.getByTestId("prayer-actions-more-info").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card.getByTestId("prayer-open-adhkar")).toBeFocused();
    await page.setViewportSize({ width: 390, height: 1000 });
    await expect(card.getByTestId("prayer-actions-more-info")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(card.getByTestId("prayer-record-date")).toBeVisible();
    expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  });
}
