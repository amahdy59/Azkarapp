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

async function geometry(page: Page) {
  return page.locator('[data-density="summary"]').evaluateAll((cards) =>
    cards.map((card) => {
      const time = card.querySelector<HTMLElement>('[id^="prayer-summary-time-"]')!;
      const digits = time.querySelector<HTMLElement>("[data-prayer-time-digits]")!;
      const icon = card.querySelector("[data-prayer-icon]")!.getBoundingClientRect();
      const name = card.querySelector("h3")!.getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      // Inline text boxes include font ascenders outside the line box. The
      // enlarged-text fallback owns a wrapping block line, not a flex item.
      const ink =
        getComputedStyle(time).display === "block" ? time.getBoundingClientRect() : digits.getBoundingClientRect();
      const footer = card.querySelector("[data-prayer-footer]")!.getBoundingClientRect();
      const intersects = (a: DOMRect, b: DOMRect) =>
        Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      return {
        width: bounds.width,
        height: bounds.height,
        baseFont: parseFloat(getComputedStyle(time).fontSize),
        digitFont: parseFloat(getComputedStyle(digits).fontSize),
        fits: time.scrollWidth <= time.clientWidth + 1 && ink.left >= bounds.left && ink.right <= bounds.right,
        overlaps: intersects(ink, icon) || intersects(ink, name) || intersects(ink, footer),
      };
    }),
  );
}

for (const language of ["ar", "en"] as const) {
  test(`Now pill has a still gloss and flat accessibility fallbacks ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    await openHome(page, language);
    const pill = page.locator('[data-prayer-state="current"] .home-prayer-status-pill');
    const assertPaletteMatch = async () => {
      const palette = await pill.evaluate((node) => {
        const style = getComputedStyle(node);
        return { background: style.backgroundColor, foreground: style.color };
      });
      // The CTA transitions color during theme changes; wait for it to reach
      // the pill's static token endpoint instead of sampling mid-transition.
      const cta = page.getByTestId("home-primary-cta");
      await expect(cta).toHaveCSS("background-color", palette.background);
      await expect(cta).toHaveCSS("color", palette.foreground);
    };
    await expect(pill).toBeVisible();
    await expect(pill).toHaveCSS("background-image", /linear-gradient/);
    await assertPaletteMatch();
    await expect(pill).toHaveCSS("animation-name", "none");
    const original = await pill.boundingBox();
    await page.screenshot({ path: info.outputPath(`now-gloss-${language}.png`), scale: "css" });
    const originalClasses = await page.locator("html").getAttribute("class");
    for (const theme of ["dark", "light", "midnight", "oled"]) {
      await page.evaluate((theme) => {
        document.documentElement.classList.remove(
          "dark",
          "light-mode",
          "theme-dark",
          "theme-light",
          "theme-midnight",
          "theme-oled",
        );
        document.documentElement.classList.add(`theme-${theme}`);
      }, theme);
      await assertPaletteMatch();
    }
    await page.locator("html").evaluate((node, classes) => node.setAttribute("class", classes!), originalClasses);
    for (const preference of ["high-contrast", "reduce-transparency"]) {
      await page.evaluate((preference) => document.documentElement.classList.add(preference), preference);
      // The gloss is composited over opaque gold, including reduced
      // transparency. High contrast removes decorative lighting entirely.
      await expect(pill).toHaveCSS("background-image", preference === "high-contrast" ? "none" : /linear-gradient/);
      await assertPaletteMatch();
      if (preference === "high-contrast") await expect(pill).toHaveCSS("box-shadow", "none");
      const flat = (await pill.boundingBox())!;
      expect(flat.width).toBeCloseTo(original!.width, 1);
      expect(flat.height).toBeCloseTo(original!.height, 1);
      await page.evaluate((preference) => document.documentElement.classList.remove(preference), preference);
    }
    await expect(pill).toHaveCSS("background-image", /linear-gradient/);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(pill).toHaveCSS("background-image", "none");
    await expect(pill).toHaveCSS("box-shadow", "none");
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`larger expanded times preserve both card footprints ${language} ${width} @cross-browser`, async ({
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
      await expect
        .poll(async () =>
          (await geometry(page)).every(
            (card) =>
              Math.abs(card.digitFont / card.baseFont - 1.4) < 0.01 &&
              Math.abs(card.height - (width === 1440 ? 126.55 : 118)) < 0.5,
          ),
        )
        .toBe(true);
      const expanded = await geometry(page);
      for (const card of expanded) {
        expect(card.digitFont / card.baseFont, JSON.stringify({ width, expanded })).toBeCloseTo(1.4, 1);
        // Captured before this change at the same viewport, fonts and date.
        expect(card.height).toBeCloseTo(width === 1440 ? 126.55 : 118, 0);
        expect(card.fits).toBe(true);
        expect(card.overlaps, JSON.stringify({ width, card })).toBe(false);
      }
      await page.screenshot({ path: info.outputPath(`expanded-${language}-${width}.png`), scale: "css" });
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 150;
      });
      await expect(sticky).toHaveCSS("--home-prayer-expansion", "0");
      // WebKit can expose the shell endpoint before its inherited layout has
      // painted. Sample the actual card endpoint as well as the glyph endpoint.
      await expect
        .poll(async () =>
          (await geometry(page)).every(
            (card) =>
              Math.abs(card.digitFont - card.baseFont) < 0.01 &&
              Math.abs(card.height - (width === 1440 ? 86.55 : 74.69)) < 0.5,
          ),
        )
        .toBe(true);
      const collapsed = await geometry(page);
      for (const [index, card] of collapsed.entries()) {
        expect(card.digitFont).toBeCloseTo(card.baseFont, 1);
        expect(card.width).toBeCloseTo(expanded[index].width, 1);
        expect(card.height).toBeCloseTo(width === 1440 ? 86.55 : 74.69, 0);
        expect(card.fits).toBe(true);
        expect(card.overlaps).toBe(false);
      }
      await page.screenshot({ path: info.outputPath(`collapsed-${language}-${width}.png`), scale: "css" });
      if (width === 320) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "32px";
        });
        for (const top of [0, 150]) {
          await sticky.locator("..").evaluate((node, top) => {
            node.scrollTop = top;
          }, top);
          await expect(sticky).toHaveCSS("--home-prayer-expansion", top ? "0" : "1");
          await expect
            .poll(async () =>
              (await geometry(page)).every(
                (card) => card.baseFont >= 32 && Math.abs(card.digitFont - card.baseFont) < 0.01,
              ),
            )
            .toBe(true);
          for (const card of await geometry(page)) {
            expect(card.digitFont).toBeGreaterThanOrEqual(32);
            expect(card.fits).toBe(true);
            expect(card.overlaps).toBe(false);
          }
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
        await expect
          .poll(async () => (await geometry(page)).map((card) => Number((card.digitFont / card.baseFont).toFixed(2))), {
            message: `${language} ${width}px ${top ? "collapsed" : "expanded"}`,
          })
          .toEqual(Array(5).fill(top ? 1 : 1.4));
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
    await expect(share.locator("svg")).toHaveCSS("scale", "1.08");
    await expect(share.locator("svg")).toHaveCSS("translate", "0px -2px");
    const footprint = (await share.boundingBox())!;
    expect(Number(footprint.width.toFixed(3))).toBeGreaterThanOrEqual(44);
    expect(Number(footprint.height.toFixed(3))).toBeGreaterThanOrEqual(44);
    for (const target of [
      page.getByTestId("home-quick-share"),
      page.getByTestId("wird-category-card").first(),
      page.getByTestId("situational-shortcuts").getByRole("link").first(),
    ]) {
      await target.focus();
      await expect(target.locator(".control-cue").first()).toHaveCSS("scale", "1.08");
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
