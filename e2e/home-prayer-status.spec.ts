import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { assertPrayerOverview } from "./helpers/home-overview";

for (const language of ["ar", "en"] as const) {
  for (const material of ["glass", "solid"] as const) {
    for (const width of [390, 360, 768, 1440, 320]) {
      test(`corner prayer statuses ${language} ${material} ${width}px @cross-browser`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: width === 320 ? 1000 : 900 });
        await fixtureReminderCatalogue(page);
        await page.clock.setFixedTime(new Date("2026-11-25T12:30:00+02:00"));
        await page.addInitScript(
          ({ language, material }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            if (localStorage.getItem("azkarapp.state.v1")) return;
            localStorage.setItem(
              "azkarapp.state.v1",
              JSON.stringify({
                settings: {
                  language,
                  themeMode: material === "glass" ? "midnight" : "light",
                  appMaterial: material,
                  homeMaterial: material,
                  reduceMotion: true,
                },
                profile: { isGuest: true },
                prayerTracking: [
                  { dayKey: "2026-11-25", prayer: "fajr", mosque: false, location: "home", adhkar: false },
                ],
              }),
            );
          },
          { language, material },
        );
        await page.goto("/#/home");
        await expect(page.getByTestId("home-prayer-disclosure")).toBeVisible();
        if (width === 320)
          await page.locator("html").evaluate((node) => {
            node.style.fontSize = "200%";
          });
        await page.evaluate(() => document.fonts.ready);
        await assertPrayerOverview(page);
        if (width === 390 || width === 360) {
          const lines = await page
            .getByTestId("home-all-prayers-row")
            .locator("h3")
            .evaluateAll((nodes) =>
              nodes.map((node) => {
                const range = document.createRange();
                range.selectNodeContents(node);
                return [...range.getClientRects()].filter((rect) => rect.width > 0).length;
              }),
            );
          expect(lines).toEqual([1, 1, 1, 1, 1]);
          const times = await page
            .getByTestId("home-all-prayers-row")
            .locator("[data-prayer-time]")
            .evaluateAll((nodes) =>
              nodes.map((node) => ({
                height: node.getBoundingClientRect().height,
                lineHeight: parseFloat(getComputedStyle(node).lineHeight),
                font: parseFloat(getComputedStyle(node).fontSize),
                periodFont: parseFloat(getComputedStyle(node.querySelector(".home-prayer-period")!).fontSize),
              })),
            );
          for (const time of times) {
            expect(time.height).toBeLessThanOrEqual(time.lineHeight + 1);
            expect(time.periodFont / time.font).toBeCloseTo(0.75, 2);
          }
          expect((await page.getByTestId("home-all-prayers-row").boundingBox())!.height).toBeLessThanOrEqual(110);
        }

        const row = page.getByTestId("home-all-prayers-row");
        await expect(row.locator(".home-prayer-desktop-status")).toHaveCount(0);
        await expect(page.getByTestId("prayer-recorded-fajr")).toBeVisible();
        await expect(page.getByTestId("prayer-recorded-dhuhr")).toHaveCount(0);
        for (const prayer of ["fajr", "dhuhr", "asr"]) {
          const slot = page.getByTestId(`prayer-card-${prayer}`).locator(".home-prayer-status-badge");
          await expect(slot.locator("svg")).toHaveCount(1);
          await expect(slot).toHaveText("");
        }
        for (const prayer of ["maghrib", "isha"]) {
          const card = page.getByTestId(`prayer-card-${prayer}`);
          await expect(card.locator(".home-prayer-status-badge")).toHaveCount(0);
          await expect(card.locator("button")).toHaveAccessibleDescription(
            language === "ar" ? /لم يحن وقتها/ : /Not yet due/,
          );
          await expect(card).toHaveCSS("opacity", "1");
        }
        await expect(page.getByTestId("prayer-card-dhuhr")).toHaveAttribute("aria-current", "step");
        const next = page.getByTestId("prayer-card-asr");
        const nextInk = await next.locator("h3").evaluate((node) => getComputedStyle(node).color);
        if (width >= 768) expect(await next.evaluate((node) => getComputedStyle(node).borderTopColor)).toBe(nextInk);
        else expect(await next.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
        if (width < 768) await expect(page.getByTestId("prayer-tracker-cards")).toHaveAttribute("data-grouped", "true");
        else await expect(page.getByTestId("prayer-tracker-cards")).not.toHaveAttribute("data-grouped");
        expect(
          await page.getByTestId("prayer-card-dhuhr").evaluate((node) => getComputedStyle(node, "::before").height),
        ).toBe("3px");
        const direction = await page
          .locator(".home-prayer-next-icon")
          .evaluate((node) => getComputedStyle(node).transform);
        expect(direction).toBe(language === "ar" ? "matrix(-1, 0, 0, 1, 0, 0)" : "none");
        // Badges float above the card edge and cannot displace name/time ink.
        const badge = page.getByTestId("prayer-card-fajr").locator(".home-prayer-status-badge");
        expect(
          await badge.evaluate((node) => {
            const card = node.closest("article")!;
            const time = card.querySelector("[data-prayer-time]")!;
            const before = time.getBoundingClientRect();
            (node as HTMLElement).style.display = "none";
            const after = time.getBoundingClientRect();
            (node as HTMLElement).style.removeProperty("display");
            return (
              before.x === after.x &&
              before.y === after.y &&
              before.width === after.width &&
              before.height === after.height
            );
          }),
        ).toBe(true);
        if (width === 768 || width === 1440) {
          const card = page.getByTestId("prayer-card-fajr");
          await expect(card.locator("[data-prayer-time]")).toHaveCSS("font-size", width === 768 ? "28px" : "36px");
          await expect(card.locator("button")).toHaveCSS("min-height", "44px");
          expect((await card.boundingBox())!.height).toBeLessThanOrEqual(120);
        }

        const location = page.getByTestId("home-location");
        const dimensions = await location.evaluate((node) => {
          const buttons = [...node.querySelectorAll("button")];
          const bounds = node.closest(".home-prayer-location")!.getBoundingClientRect();
          const cards = document.querySelector('[data-testid="home-all-prayers-row"]')!.getBoundingClientRect();
          return {
            compact: bounds.width < cards.width,
            below: bounds.top >= cards.bottom,
            targets: buttons.map((button) => {
              const r = button.getBoundingClientRect();
              return { width: r.width, height: r.height, fits: button.scrollWidth <= button.clientWidth + 1 };
            }),
          };
        });
        expect(dimensions.below).toBe(true);
        if (width !== 320) expect(dimensions.compact).toBe(true);
        for (const target of dimensions.targets) {
          expect(target.width).toBeGreaterThanOrEqual(44);
          expect(target.height).toBeGreaterThanOrEqual(44);
          expect(target.fits).toBe(true);
        }
        expect(dimensions.targets[1].width).toBe(44);
        await expect(location.getByRole("button")).toHaveCount(2);
        await expect(location.getByRole("combobox")).toHaveCount(0);

        // Reading remains in place while recording status changes independently of timing.
        if (width === 390 && material === "solid") {
          const opener = page.getByTestId("prayer-card-dhuhr").locator("button");
          await opener.focus();
          await opener.press("Enter");
          const dialog = page.getByTestId("home-prayer-moment");
          await dialog.getByTestId("prayer-action-location").getByRole("checkbox").check();
          await page.keyboard.press("Escape");
          await expect(opener).toBeFocused();
          await expect(page.getByTestId("prayer-recorded-dhuhr")).toBeVisible();
          await expect(page.getByTestId("prayer-card-dhuhr")).toHaveAttribute("aria-current", "step");
          await page.reload();
          await expect(page.getByTestId("prayer-recorded-dhuhr")).toBeVisible();
        }
        // Capture the loaded Home, including after the persistence reload.
        await expect(page.getByTestId("home-reminder-status")).toHaveCount(0);
        await page.locator(".home-content-scroll").evaluate((node) => {
          node.scrollTop = 0;
        });
        await page.screenshot({
          path: `output/playwright/home-inline-status/${info.project.name}-${language}-${material}-${width}.png`,
        });
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-testid="home-prayer-strip"]')
              .include('[data-testid="home-prayer-interval"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      });
    }
  }
}
