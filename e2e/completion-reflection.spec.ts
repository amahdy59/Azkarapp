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
        { width: 834, height: 1112, scale: 1 },
        { width: 1440, height: 1000, scale: 1 },
        { width: 320, height: 700, scale: 2 },
      ]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.evaluate((scale) => {
          document.documentElement.style.fontSize = `${scale * 100}%`;
        }, viewport.scale);
        await expect.poll(() => screen.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
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
      await page.getByRole("button", { name: t(language, "completion.moreBenefits"), exact: true }).click();
      await expect(page.getByTestId("benefits-scroll-region")).toBeVisible();
      await page.goBack();
      await expect(page.getByTestId("completion-reflection")).toHaveAttribute("data-evidence-id", evidence.id);
    });
  }
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
