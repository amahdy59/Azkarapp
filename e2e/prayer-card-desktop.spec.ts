import { openPrayerDialog } from "./helpers/home-overview";
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
    for (const prayer of ["asr", "dhuhr", "fajr", "maghrib", "isha"] as const) {
      test(`desktop prayer card keeps every source visible ${language} ${material} ${prayer} @cross-browser`, async ({
        page,
      }, info) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await openHome(page, language, material);
        const time = getEstimatedPrayerTimes(new Date("2026-11-24T12:00:00+02:00"))[prayer];
        const instant = new Date(`2026-11-24T${time}:00+02:00`);
        instant.setMinutes(instant.getMinutes() + 5);
        await page.clock.setFixedTime(instant);
        await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
        const trigger = page.getByTestId(`prayer-card-${prayer}`).locator("button");
        await expect(trigger).toBeEnabled();
        await openPrayerDialog(page, prayer);
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
        expect(spacing.gap).toBeCloseTo(24, 0);
        expect(spacing.main).toBeCloseTo(spacing.reading, 0);
        if (prayer !== "fajr") {
          const header = await card.evaluate((node) => {
            const checklist = node.querySelector(".prayer-actions-checklist")!;
            const group = checklist.getBoundingClientRect();
            const label = node.querySelector(".prayer-actions-list label")!.getBoundingClientRect();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            const color = (element: Element) => {
              context.clearRect(0, 0, 1, 1);
              context.fillStyle = getComputedStyle(element).backgroundColor;
              context.fillRect(0, 0, 1, 1);
              const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
              return { alpha, lightness: (r! + g! + b!) / 3 };
            };
            const surface = color(checklist);
            const panel = color(node.closest(".prayer-tracking-dialog")!);
            const close = document
              .querySelector('.prayer-tracking-header [data-testid="modal-close-button"]')!
              .getBoundingClientRect();
            const titleRange = document.createRange();
            titleRange.selectNodeContents(node.querySelector(".prayer-evidence-desktop-title")!);
            const virtueInk = titleRange.getBoundingClientRect();
            const input = node.querySelector("input")!.getBoundingClientRect();
            const date = node.querySelector(".prayer-actions-context")!.getBoundingClientRect();
            return {
              gap: group.top - node.getBoundingClientRect().top,
              surface,
              panel,
              rowHeight: label.height,
              closeWidth: close.width,
              closeHeight: close.height,
              overlap:
                close.left < input.right &&
                close.right > input.left &&
                close.top < input.bottom &&
                close.bottom > input.top,
              virtueOverlap:
                close.left < virtueInk.right &&
                close.right > virtueInk.left &&
                close.top < virtueInk.bottom &&
                close.bottom > virtueInk.top,
              headingEdge:
                node.getAttribute("dir") === "rtl"
                  ? node.getBoundingClientRect().right - 24
                  : node.getBoundingClientRect().left + 24,
              groupEdge: node.getAttribute("dir") === "rtl" ? group.right : group.left,
              labelEdge: node.getAttribute("dir") === "rtl" ? label.right : label.left,
              dateEdge: node.getAttribute("dir") === "rtl" ? date.right : date.left,
            };
          });
          expect(header.gap).toBeCloseTo(24, 0);
          expect(header.surface.alpha).toBe(255);
          expect(header.panel.alpha).toBe(255);
          if (material === "glass") expect(header.surface.lightness).toBeGreaterThan(header.panel.lightness);
          expect(header.rowHeight).toBeGreaterThanOrEqual(48);
          expect(header.closeWidth).toBeGreaterThanOrEqual(44);
          expect(header.closeHeight).toBeGreaterThanOrEqual(44);
          expect(header.overlap).toBe(false);
          expect(header.virtueOverlap).toBe(false);
          expect(header.groupEdge).toBeCloseTo(header.headingEdge, 0);
          expect(header.dateEdge).toBeCloseTo(header.labelEdge, 0);
        }
        await expect(card.getByTestId("prayer-record-date")).toHaveAttribute("datetime", "2026-11-24");
        await expect(card.getByTestId("prayer-record-date")).toBeVisible();
        await expect(page.getByRole("dialog")).toHaveCount(1);
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
        expect(
          (await new AxeBuilder({ page }).include('[data-testid="prayer-actions-card"]').analyze()).violations,
        ).toEqual([]);
      });
    }
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
      await expect(card.getByTestId("prayer-inline-info")).toBeHidden();
      const date = card.getByTestId("prayer-record-date");
      await expect(date).toBeVisible();
      await expect(card.getByTestId("prayer-actions-more-info")).toHaveCount(0);
      const guidance = card.locator(".prayer-dialog-guidance").last();
      await guidance.locator("summary").click();
      await expect(guidance.getByTestId("prayer-inline-info")).toContainText(
        getPrayerInfoData("asr", language, "2026-11-24").sunnahItems[0]!.rankLabel,
      );
      await guidance.locator("summary").click();
      await expect(date).toBeVisible();
      const overflow = await card.evaluate((node) =>
        [...node.querySelectorAll("*")]
          .filter(
            (el) =>
              el.getClientRects().length > 0 &&
              !el.closest(".sr-only") &&
              el.scrollWidth > el.clientWidth + 1 &&
              getComputedStyle(el).display !== "inline",
          )
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
    await card.locator(".prayer-dialog-guidance").last().locator("summary").click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.getByRole("dialog")).toHaveCount(1);
    expect(await page.getByTestId("home-prayer-moment").evaluate((node) => node.contains(document.activeElement))).toBe(
      true,
    );
    await page.setViewportSize({ width: 390, height: 1000 });
    await expect(card.getByTestId("prayer-actions-more-info")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(card.getByTestId("prayer-record-date")).toBeVisible();
    expect(await card.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  });
}
