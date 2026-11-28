import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { t } from "../src/app/i18n";

const hadith = JSON.parse(readFileSync("src/app/content/benefitsHadithReadings.json", "utf8"))["h-two-phrases"] as {
  ar: string;
  en: string;
};
const quranRecord = readFileSync("src/app/content/zikrBenefits.ts", "utf8").match(
  /quran\(\s*"quran-13-28",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/u,
)!;
const quranEvidence = {
  id: "quran-13-28",
  kind: "quran",
  text: { ar: quranRecord[2]!, en: quranRecord[3]! },
  sourceUrl: quranRecord[4]!,
};
const hadithEvidence = { id: "h-two-phrases", kind: "hadith", text: hadith, sourceUrl: "https://dorar.net/h/4DZspCuR" };

async function openCompletion(page: Page, settings: Record<string, unknown>, second = 0) {
  await page.clock.setFixedTime(new Date(`2026-11-25T10:00:0${second}Z`));
  await page.addInitScript((settings) => {
    if (localStorage.getItem("azkarapp.state.v1")) return;
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings, profile: { isGuest: true } }));
  }, settings);
  await page.goto("/#/completion");
  await expect(page.getByTestId("completion-reflection-text")).not.toContainText(/Loading|جارٍ التحميل/u);
  await expect(page.getByTestId("completion-actions")).toBeVisible();
}

for (const language of ["ar", "en"] as const) {
  for (const themeMode of ["midnight", "light", "dark"] as const) {
    test(`symmetrical completion ${language} ${themeMode} @cross-browser`, async ({ page }, info) => {
      await openCompletion(
        page,
        {
          language,
          themeMode,
          appMaterial: themeMode === "midnight" ? "glass" : "solid",
          reduceMotion: true,
          hapticFeedback: false,
        },
        themeMode === "light" ? 1 : 0,
      );
      const screen = page.getByTestId("completion-screen");
      const card = page.getByTestId("completion-reflection");
      const greeting = page.getByTestId("completion-greeting");
      await expect(greeting).toContainText(t(language, "completion.blessing"));
      await expect(greeting).toContainText(t(language, "completion.acceptance"));
      await expect(page.getByTestId("completion-count")).toHaveCount(0);
      await expect(screen.getByRole("heading", { level: 1 })).toHaveText(
        t(language, "completion.completed", { category: language === "ar" ? "أذكار الصباح" : "Morning Azkar" }),
      );
      const evidence = themeMode === "light" ? quranEvidence : hadithEvidence;
      await expect(card).toHaveAttribute("data-evidence-id", evidence.id);
      const expectedText = evidence.kind === "quran" || language === "ar" ? evidence.text.ar : evidence.text.en;
      // QCF glyphs are decorative; compare the complete semantic quotation,
      // including its preserved Unicode text, rather than private-use glyphs.
      await expect
        .poll(() =>
          page.getByTestId("completion-reflection-text").evaluate((node) => {
            const semantic = node.cloneNode(true) as HTMLElement;
            semantic.querySelectorAll('[aria-hidden="true"]').forEach((glyph) => glyph.remove());
            return semantic.textContent?.replace(/\s+/gu, " ").trim();
          }),
        )
        .toBe(expectedText.replace(/\s+/gu, " ").trim());
      await expect(page.getByTestId("completion-reflection-source")).toHaveAttribute("href", evidence.sourceUrl);
      await expect(page.getByTestId("completion-session-details")).toBeHidden();
      // A high z-index or a passing axe scan cannot establish an opaque ground.
      for (const surface of [screen, card]) {
        const alpha = await surface.evaluate((node) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context = canvas.getContext("2d")!;
          context.fillStyle = getComputedStyle(node).backgroundColor;
          context.fillRect(0, 0, 1, 1);
          return context.getImageData(0, 0, 1, 1).data[3];
        });
        expect(alpha).toBe(255);
      }

      for (const viewport of [
        { width: 390, height: 844, scale: 1 },
        { width: 320, height: 700, scale: 1 },
        { width: 834, height: 1112, scale: 1 },
        { width: 1440, height: 1000, scale: 1 },
        { width: 320, height: 700, scale: 2 },
      ]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.evaluate((scale) => {
          document.documentElement.style.fontSize = `${scale * 100}%`;
        }, viewport.scale);
        if (viewport.width >= 900) await expect(page.getByTestId("completion-desktop-dialog")).toBeVisible();
        else await expect(page.getByTestId("completion-desktop-dialog")).toBeHidden();
        await expect(page.getByTestId("completion-reflection-text").locator('[aria-busy="true"]')).toHaveCount(0);
        await expect.poll(() => screen.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        if (viewport.scale === 1) {
          const density = await screen.evaluate((node) => {
            const reading = node.querySelector<HTMLElement>('[data-testid="completion-reflection-reading"]')!;
            const quotation = reading.firstElementChild!.getBoundingClientRect();
            const style = getComputedStyle(node);
            return {
              emptyReadingSpace: reading.clientHeight - quotation.height,
              top: parseFloat(style.paddingTop),
              bottom: parseFloat(style.paddingBottom),
            };
          });
          expect(density.emptyReadingSpace).toBeLessThanOrEqual(1);
          if (viewport.width < 900) expect(density.top).toBeGreaterThanOrEqual(32);
          expect(density.bottom).toBeGreaterThanOrEqual(24);
          const spacing = await screen.evaluate((node) => {
            const check =
              node.querySelector(".completion-check") ??
              node.closest('[data-testid="completion-desktop-dialog"]')!.querySelector(".completion-check")!;
            const circle = check.getBoundingClientRect();
            return {
              layout: getComputedStyle(node.querySelector(".completion-layout")!).rowGap,
              actions: getComputedStyle(node.querySelector('[data-testid="completion-actions"]')!).rowGap,
              secondary: getComputedStyle(node.querySelector(".completion-secondary-actions")!).columnGap,
              checkWidth: circle.width,
              checkHeight: circle.height,
              glyph: check.querySelector("svg")!.getBoundingClientRect().width,
            };
          });
          expect(spacing).toEqual({
            layout: "16px",
            actions: "12px",
            secondary: "8px",
            checkWidth: 56,
            checkHeight: 56,
            glyph: 28,
          });
          if (language === "ar") {
            const greetingLines = await greeting
              .locator("span")
              .evaluateAll((spans) => spans.map((node) => node.getBoundingClientRect().y));
            expect(Math.max(...greetingLines) - Math.min(...greetingLines)).toBeLessThanOrEqual(1);
          }
          const breathingRoom = await screen.evaluate((node) => {
            const greeting = node.querySelector('[data-testid="completion-greeting"]')!.getBoundingClientRect();
            const check =
              node.querySelector(".completion-check") ??
              node.closest('[data-testid="completion-desktop-dialog"]')!.querySelector(".completion-check")!;
            return greeting.top - check.getBoundingClientRect().bottom;
          });
          expect(breathingRoom).toBeGreaterThanOrEqual(24);
          // No scrollIntoView may rescue a hidden ordinary-screen action.
          expect(await screen.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
          const frame = (await screen.boundingBox())!;
          for (const control of await screen.locator("button, a").all()) {
            const rect = (await control.boundingBox())!;
            expect(rect.y).toBeGreaterThanOrEqual(frame.y);
            expect(rect.y + rect.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
          }
        } else {
          expect(await screen.evaluate((node) => node.scrollHeight)).toBeGreaterThan(
            await screen.evaluate((node) => node.clientHeight),
          );
        }
        const symmetry = await card.evaluate((node) => {
          const parent = node.parentElement!.getBoundingClientRect();
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node.firstElementChild!);
          return {
            left: rect.left - parent.left,
            right: parent.right - rect.right,
            start: style.paddingInlineStart,
            end: style.paddingInlineEnd,
          };
        });
        expect(Math.abs(symmetry.left - symmetry.right)).toBeLessThanOrEqual(1);
        expect(symmetry.start).toBe(symmetry.end);
        for (const control of await screen.locator("button, a, summary").all()) {
          await control.scrollIntoViewIfNeeded();
          const box = await control.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          expect(box!.width).toBeGreaterThanOrEqual(44);
          const hit = await control.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
          });
          expect(hit).toBe(true);
        }
        await screen.evaluate((node) => {
          node.scrollTop = 0;
        });
        await expect(page.getByTestId("completion-reflection-text")).not.toContainText(/Loading|جارٍ التحميل/u);
        await page.screenshot({
          path: info.outputPath(`completion-${language}-${themeMode}-${viewport.width}-${viewport.scale}x.png`),
          scale: "css",
        });
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="completion-screen"]').analyze()).violations,
      ).toEqual([]);
      await page.getByText(t(language, "completion.sessionDetails"), { exact: true }).click();
      await expect(page.getByTestId("completion-session-details")).toBeVisible();
      const details = page.getByRole("dialog", { name: t(language, "completion.sessionDetails"), exact: true });
      await expect(details).toHaveAttribute("data-dropdown-surface", "");
      await page.keyboard.press("Escape");
      await expect(details).toBeHidden();
      await expect(
        page.getByRole("button", { name: t(language, "completion.sessionDetails"), exact: true }),
      ).toBeFocused();
      await page.getByRole("button", { name: t(language, "completion.moreBenefits"), exact: true }).click();
      await expect(page.getByTestId("benefits-scroll-region")).toBeVisible();
      await page.goBack();
      await expect(page.getByTestId("completion-reflection")).toHaveAttribute("data-evidence-id", evidence.id);
    });
  }
}

for (const language of ["ar", "en"] as const) {
  test(`desktop completion is a closable protected modal ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openCompletion(page, {
      language,
      themeMode: "midnight",
      appMaterial: "glass",
      reduceMotion: true,
      hapticFeedback: false,
    });
    const dialog = page.getByTestId("completion-desktop-dialog");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("data-dropdown-surface", "");
    const close = dialog.getByRole("button", { name: t(language, "common.close"), exact: true });
    await expect(close).toBeVisible();
    const before = await dialog.boundingBox();
    expect(before!.width).toBeLessThan(1440);
    expect(before!.height).toBeLessThan(1000);
    await expect(dialog.getByTestId("completion-screen")).toHaveJSProperty("scrollTop", 0);
    const card = page.getByTestId("completion-reflection");
    const evidence = await card.getAttribute("data-evidence-id");
    const detailsButton = dialog.getByRole("button", { name: t(language, "completion.sessionDetails"), exact: true });
    await detailsButton.click();
    const details = page.getByRole("dialog", { name: t(language, "completion.sessionDetails"), exact: true });
    await expect(details).toBeVisible();
    await expect(details.getByRole("button", { name: t(language, "common.close"), exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();
    await expect(detailsButton).toBeFocused();
    await expect(dialog).toBeVisible();
    await expect(card).toHaveAttribute("data-evidence-id", evidence!);
    expect(await dialog.boundingBox()).toEqual(before);
    const share = dialog.getByRole("button", {
      name: language === "ar" ? "مشاركة أذكار الصباح" : "Share Morning Azkar",
      exact: true,
    });
    await share.click();
    const studio = page.getByTestId("collection-share-modal");
    await expect(studio).toBeVisible();
    const studioClose = studio.getByRole("button", { name: t(language, "common.close"), exact: true });
    await studioClose.focus();
    await page.keyboard.press("Escape");
    await expect(studio).toBeHidden();
    await expect(share).toBeFocused();
    await expect(dialog).toBeVisible();
    expect(await dialog.boundingBox()).toEqual(before);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="completion-desktop-dialog"]').analyze()).violations,
    ).toEqual([]);
    await share.evaluate((node) => {
      (node as HTMLElement).blur();
    });
    await page.screenshot({ path: info.outputPath(`completion-${language}-desktop-modal.png`), scale: "css" });
    for (const control of await dialog.getByRole("button").all()) {
      const rect = (await control.boundingBox())!;
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
      expect(
        await control.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        }),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 900, height: 480 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    for (const control of await dialog.locator("button, a").all()) {
      await control.scrollIntoViewIfNeeded();
      expect(
        await control.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        }),
      ).toBe(true);
    }
    const toolbar = (await page.getByTestId("completion-dialog-toolbar").boundingBox())!;
    const scrollingContent = (await page.getByTestId("completion-screen").boundingBox())!;
    expect(scrollingContent.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height - 1);
    await expect(close).toBeVisible();
    await page.screenshot({ path: info.outputPath(`completion-${language}-desktop-short-enlarged.png`), scale: "css" });
    if (language === "en") await page.keyboard.press("Escape");
    else await close.click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#\/home/u);
  });
}

test("completion keeps its card and actions fixed while long evidence scrolls @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 360, height: 650 });
  await openCompletion(page, {
    language: "ar",
    themeMode: "midnight",
    appMaterial: "glass",
    reduceMotion: true,
    hapticFeedback: false,
    routineModes: { morning: "core" },
  });
  // Deliver insets after the root exists, as the Android host does. An init
  // script can run before documentElement and silently fail to supply them.
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--safe-area-inset-top", "28px");
    document.documentElement.style.setProperty("--safe-area-inset-bottom", "20px");
    document.querySelector(".app-shell")!.setAttribute("data-native-android", "true");
  });
  const screen = page.getByTestId("completion-screen");
  await expect(screen).toHaveCSS("padding-bottom", "24px");
  await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "28px");
  expect(await screen.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
  const card = page.getByTestId("completion-reflection");
  const reading = page.getByTestId("completion-reflection-reading");
  const before = await card.boundingBox();
  await reading.focus();
  await page.keyboard.press("End");
  expect(await screen.evaluate((node) => node.scrollTop)).toBe(0);
  await expect.poll(() => reading.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  expect(await card.boundingBox()).toEqual(before);
  for (const control of await screen.locator("button, a").all()) {
    const rect = (await control.boundingBox())!;
    expect(rect.y).toBeGreaterThanOrEqual(28);
    expect(rect.y + rect.height).toBeLessThanOrEqual(630);
    expect(
      await control.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }),
    ).toBe(true);
  }
  await reading.evaluate((node) => {
    node.scrollTop = 0;
  });
  await reading.evaluate((node) => {
    (node as HTMLElement).blur();
  });
  await page.screenshot({ path: info.outputPath("completion-ar-phone-insets-top.png"), scale: "css" });
  await reading.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await page.screenshot({ path: info.outputPath("completion-ar-phone-insets-text-end.png"), scale: "css" });
  const detailsButton = page.getByRole("button", { name: t("ar", "completion.sessionDetails"), exact: true });
  await detailsButton.click();
  await page.screenshot({ path: info.outputPath("completion-ar-details-dialog.png"), scale: "css" });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: t("ar", "common.close"), exact: true })
    .click();
  await expect(detailsButton).toBeFocused();
  expect(await card.boundingBox()).toEqual(before);
});

for (const language of ["ar", "en"] as const) {
  test(`abbreviated completion keeps Continue and Home visible ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCompletion(page, {
      language,
      themeMode: "light",
      appMaterial: "solid",
      reduceMotion: true,
      hapticFeedback: false,
      routineModes: { morning: "core" },
    });
    const screen = page.getByTestId("completion-screen");
    const continuation = page.getByRole("button", { name: language === "ar" ? /^تابع / : /Continue with/ });
    await expect(continuation).toHaveAttribute("data-variant", "default");
    await expect(page.getByRole("button", { name: t(language, "completion.returnHome"), exact: true })).toHaveAttribute(
      "data-variant",
      "outline",
    );
    expect(await screen.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
    for (const action of await page.getByTestId("completion-actions").getByRole("button").all()) {
      const rect = (await action.boundingBox())!;
      expect(rect.y + rect.height).toBeLessThanOrEqual(844);
    }
    await page.screenshot({ path: info.outputPath(`completion-${language}-core-phone.png`), scale: "css" });
    await continuation.click();
    await expect(page.getByTestId("reader-screen")).toBeVisible();
  });
}

for (const mode of ["default", "app", "os"] as const) {
  test(`completion finite feedback and still alternative ${mode} @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
    await openCompletion(page, {
      language: "ar",
      reduceMotion: mode === "app",
      hapticFeedback: false,
      reduceTransparency: true,
      highContrast: true,
    });
    const icon = page.locator(".completion-check");
    const animation = await icon.evaluate((node) => ({
      name: getComputedStyle(node).animationName,
      iterations: getComputedStyle(node).animationIterationCount,
    }));
    if (mode === "default") {
      expect(animation.name).toBe("completion-check-arrive");
      expect(animation.iterations).toBe("1");
    } else {
      expect(animation.name).toBe("none");
    }
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.setViewportSize({ width: 568, height: 320 });
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.getByTestId("completion-reflection-source")).toBeVisible();
    await page.getByRole("button", { name: "الرئيسية", exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByTestId("completion-screen")).toBeVisible();
  });
}

for (const language of ["ar", "en"] as const) {
  test(`completion keeps optional streak in details without moving actions ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      const dailyCompletions = Array.from({ length: 19 }, (_, index) => ({
        dayKey: new Date(Date.UTC(2026, 10, 25 - index)).toISOString().slice(0, 10),
        category: "morning",
        completionLevel: "complete",
        timeZone: "Africa/Cairo",
      }));
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            quietProgressEnabled: true,
            themeMode: "midnight",
            appMaterial: "glass",
            reduceMotion: true,
            hapticFeedback: false,
          },
          profile: { isGuest: true },
          dailyCompletions,
        }),
      );
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    }, language);
    await openCompletion(page, {});
    await expect(page.getByTestId("completion-count")).toHaveCount(0);
    await expect(page.getByTestId("completion-streak")).toBeHidden();
    const screen = page.getByTestId("completion-screen");
    expect(await screen.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
    for (const action of await page.getByTestId("completion-actions").getByRole("button").all()) {
      const rect = (await action.boundingBox())!;
      expect(rect.y + rect.height).toBeLessThanOrEqual(844);
    }
    await page.screenshot({ path: info.outputPath(`completion-${language}-phone-streak-fixture.png`), scale: "css" });
    const cardBefore = await page.getByTestId("completion-reflection").boundingBox();
    const details = page.getByRole("button", { name: t(language, "completion.sessionDetails"), exact: true });
    await details.click();
    await expect(page.getByTestId("completion-streak")).toContainText(language === "ar" ? "١٩" : "19");
    await page.screenshot({ path: info.outputPath(`completion-${language}-details-streak.png`), scale: "css" });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: t(language, "common.close"), exact: true })
      .click();
    await expect(details).toBeFocused();
    expect(await page.getByTestId("completion-reflection").boundingBox()).toEqual(cardBefore);
  });
}
