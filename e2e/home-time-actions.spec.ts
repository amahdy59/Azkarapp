import { assertPrayerOverview } from "./helpers/home-overview";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

test.use({ serviceWorkers: "block" });

async function openHome(page: Page, language: "ar" | "en") {
  await fixtureReminderCatalogue(page);
  await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", reduceMotion: false },
        profile: { isGuest: true },
      }),
    );
  }, language);
  await page.goto("/#/home");
  await expect(page.getByTestId("prayer-card-dhuhr")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const language of ["ar", "en"] as const) {
  test(`Interval summary has stable accessibility fallbacks ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    await openHome(page, language);
    const summary = page.getByTestId("home-prayer-interval");
    const shade = summary.locator(".home-prayer-interval-shade");
    await expect(shade).toHaveAttribute("aria-hidden", "true");
    await expect(shade).toHaveCSS("animation-name", "none");
    const footprint = (await summary.boundingBox())!;
    for (const preference of ["high-contrast", "reduce-transparency"]) {
      await page.locator("html").evaluate((node, preference) => node.classList.add(preference), preference);
      await expect(summary).toBeVisible();
      expect((await summary.boundingBox())!.height).toBeCloseTo(footprint.height, 0);
      await assertPrayerOverview(page);
      await page.locator("html").evaluate((node, preference) => node.classList.remove(preference), preference);
    }
    expect((await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations).toEqual(
      [],
    );
    await page.screenshot({ path: info.outputPath(`interval-${language}.png`), scale: "css" });
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`compact icon times retain geometry through scrolling ${language} ${width} @cross-browser`, async ({
      page,
    }, info) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 1000 });
      await openHome(page, language);
      const sticky = page.getByTestId("home-sticky-prayers");
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(sticky).toHaveCSS("--home-prayer-expansion", "1");
      const expanded = await assertPrayerOverview(page);
      // The owner retains the original large-time desktop cards; compact tiles have their own cap.
      expect(expanded.every((card) => card.height <= (width >= 1200 ? 160 : 140))).toBe(true);
      if (width >= 1200) {
        await expect(page.getByTestId("home-all-prayers-row").locator("[data-prayer-time]").first()).toHaveCSS(
          "font-size",
          "36px",
        );
      }
      await page.screenshot({ path: info.outputPath(`expanded-${language}-${width}.png`), scale: "css" });
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 150;
      });
      await expect(sticky).toHaveCSS("--home-prayer-expansion", "0");
      if (width < 768) {
        await expect(page.getByTestId("home-prayer-strip")).toHaveAttribute("inert", "");
        await expect(page.getByTestId("home-compact-prayer")).toBeInViewport();
        await page.screenshot({ path: info.outputPath(`collapsed-${language}-${width}.png`), scale: "css" });
        if (width === 320) {
          await page.locator("html").evaluate((node) => (node.style.fontSize = "32px"));
          await expect(page.getByTestId("home-compact-prayer").getByRole("button")).toBeInViewport();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        await sticky.locator("..").evaluate((node) => (node.scrollTop = 0));
        await expect(sticky).toHaveCSS("--home-prayer-expansion", "1");
      } else {
        const collapsed = await assertPrayerOverview(page);
        for (const [index, card] of collapsed.entries()) {
          expect(card.width).toBeCloseTo(expanded[index].width, 1);
          expect(card.height).toBeCloseTo(expanded[index].height, 1);
        }
        await page.screenshot({ path: info.outputPath(`collapsed-${language}-${width}.png`), scale: "css" });
      }

      if (width === 320) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "32px";
        });
        for (const top of [0]) {
          await sticky.locator("..").evaluate((node, top) => {
            node.scrollTop = top;
          }, top);
          await expect(sticky).toHaveCSS("--home-prayer-expansion", top ? "0" : "1");
          await assertPrayerOverview(page);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await page.screenshot({ path: info.outputPath(`large-text-${language}-${top}.png`), scale: "css" });
        }
      }
    });
  }

  test(`prayer time fitting survives live viewport changes ${language} @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 1000 });
    await openHome(page, language);
    const sticky = page.getByTestId("home-sticky-prayers");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const top of [0, 150]) {
        await sticky.locator("..").evaluate((node, top) => {
          node.scrollTop = top;
        }, top);
        await expect(sticky).toHaveCSS("--home-prayer-expansion", top ? "0" : "1");
        if (width < 768 && top) {
          await expect(page.getByTestId("home-compact-prayer")).toBeInViewport();
          await expect(page.getByTestId("home-prayer-strip")).toHaveAttribute("inert", "");
          continue;
        }
        await assertPrayerOverview(page);
      }
    }
  });

  test(`Home action feedback is finite, keyboard accessible and still-aware ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openHome(page, language);
    const evidence = page.getByTestId("home-daily-evidence");
    const share = page.getByTestId("daily-evidence-share");
    const refresh = page.getByTestId("daily-evidence-refresh");
    await expect(evidence).toBeVisible();
    await evidence.scrollIntoViewIfNeeded();
    await page.keyboard.press("Tab");
    await share.focus();
    await expect(share.locator("svg")).toHaveCSS("scale", "1.05");
    await expect(share.locator("svg")).toHaveCSS("translate", "0px -2px");
    const footprint = (await share.boundingBox())!;
    expect(Number(footprint.width.toFixed(3))).toBeGreaterThanOrEqual(44);
    expect(Number(footprint.height.toFixed(3))).toBeGreaterThanOrEqual(44);
    for (const [target, scale] of [
      [page.getByTestId("home-quick-share"), "1.05"],
      [page.getByTestId("wird-category-card").first(), "1.05"],
      [page.getByTestId("situational-shortcuts").getByRole("link").first(), "1.05"],
    ] as const) {
      await target.focus();
      await expect(target.locator(".control-cue").first()).toHaveCSS("scale", scale);
    }
    // Refresh is synchronous: the icon acknowledges actual activation once,
    // without adding a fake loading state or remounting the focused button.
    await refresh.focus();
    const previousId = await evidence.getAttribute("data-evidence-id");
    await refresh.press("Enter");
    await expect(evidence).not.toHaveAttribute("data-evidence-id", previousId!);
    await expect(refresh).toBeFocused();
    await expect(refresh.locator("svg")).toHaveCSS("animation-name", "home-refresh-confirm");
    await expect(refresh.locator("svg")).toHaveCSS("animation-iteration-count", "1");
    await expect.poll(() => refresh.locator("svg").evaluate((node) => node.getAnimations().length)).toBe(0);
    await page.screenshot({ path: info.outputPath(`actions-${language}.png`), scale: "css" });
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="home-daily-evidence"]').analyze()).violations,
    ).toEqual([]);
    for (const preference of ["app", "os"] as const) {
      if (preference === "app") await page.evaluate(() => document.documentElement.classList.add("reduce-motion"));
      else {
        await page.evaluate(() => document.documentElement.classList.remove("reduce-motion"));
        await page.emulateMedia({ reducedMotion: "reduce" });
      }
      await share.focus();
      await expect(share.locator("svg")).toHaveCSS("scale", "1");
      await expect(share.locator("svg")).toHaveCSS("translate", "0px");
      await refresh.press("Enter");
      await expect(refresh.locator("svg")).toHaveCSS("animation-name", "none");
      await expect(refresh).toBeFocused();
    }
    // Sharing's existing dialog retains focus recovery and an explicit state.
    await share.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(share).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(share).toBeFocused();
    await expect(share).toHaveAttribute("aria-expanded", "false");
  });
}
