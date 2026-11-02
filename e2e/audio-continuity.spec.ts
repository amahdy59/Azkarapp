import { t } from "../src/app/i18n";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { installStableLayoutAudio } from "./helpers/stable-layout-audio";

for (const scenario of [
  { language: "ar", width: 390, height: 844, theme: "light", material: "solid", enlarged: false },
  { language: "en", width: 320, height: 800, theme: "midnight", material: "glass", enlarged: true },
  { language: "ar", width: 1440, height: 900, theme: "dark", material: "glass", enlarged: false },
  { language: "en", width: 768, height: 1024, theme: "light", material: "glass", enlarged: false, fallback: true },
] as const) {
  test(`listening controls, queue and saved position ${scenario.language}-${scenario.width} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(scenario);
    await installStableLayoutAudio(page);
    await page.addInitScript((scenario) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language: scenario.language,
              themeMode: scenario.theme,
              appMaterial: scenario.material,
              reduceMotion: true,
              reduceTransparency: "fallback" in scenario && scenario.fallback,
            },
            profile: { isGuest: true },
          }),
        );
    }, scenario);
    await page.goto("/#/azkar/evening/1");
    await expect(page.locator("html")).toHaveClass(new RegExp(`theme-${scenario.theme}`));
    await page.getByTestId("reader-audio-dock-button").click();
    const ar = scenario.language === "ar";
    await page.getByRole("button", { name: ar ? "توسيع المشغل" : "Expand player", exact: true }).click();
    if (scenario.enlarged)
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
    const toggle = page.getByRole("switch", { name: ar ? "المتابعة التلقائية" : "Auto-continue", exact: true });
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    const expectContainedThumb = async () => {
      const geometry = await toggle.locator(".settings-toggle-track").evaluate((track) => {
        const outer = track.getBoundingClientRect(),
          thumb = track.querySelector(".settings-toggle-thumb")!.getBoundingClientRect();
        return {
          fits:
            thumb.left >= outer.left &&
            thumb.right <= outer.right &&
            thumb.top >= outer.top &&
            thumb.bottom <= outer.bottom,
        };
      });
      expect(geometry.fits).toBe(true);
    };
    await expectContainedThumb();

    await toggle.scrollIntoViewIfNeeded();
    const hit = await toggle.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
    });
    expect(hit).toBe(true);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expectContainedThumb();
    const paused = page.getByRole("button", { name: t(scenario.language, "audioPlayer.pause"), exact: true });
    await paused.click();
    await expect(
      page.getByRole("button", { name: t(scenario.language, "audioPlayer.play"), exact: true }),
    ).toBeVisible();
    const bounds = await toggle.boundingBox();
    const lock = await page.locator(".audio-lock-trigger").boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(
      bounds!.x + bounds!.width <= lock!.x + 1 ||
        lock!.x + lock!.width <= bounds!.x + 1 ||
        bounds!.y + bounds!.height <= lock!.y + 1 ||
        lock!.y + lock!.height <= bounds!.y + 1,
      JSON.stringify({ toggle: bounds, lock }),
    ).toBe(true);
    const queueTrigger = page.getByRole("button", { name: new RegExp(ar ? "قائمة الاستماع" : "Listening queue") });
    await queueTrigger.click();
    const queue = page.getByTestId("audio-queue-sheet");
    await expect(queue).toHaveCSS("background-color", /^rgb\(/);
    await expect(queue.locator('[aria-current="true"]')).toBeInViewport({ ratio: 1 });
    const scan = await new AxeBuilder({ page })
      .include('[data-testid="audio-queue-sheet"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("queue.png") });
    await queue
      .getByRole("button")
      .filter({ hasText: ar ? /٢/ : /^2/ })
      .first()
      .click();
    await expect(queue).toBeHidden();
    await expect(queueTrigger).toBeFocused();
    await expect(
      page.getByRole("button", { name: t(scenario.language, "audioPlayer.play"), exact: true }),
    ).toBeVisible();
    await queueTrigger.click();
    await expect(queue.locator('[aria-current="true"]')).toContainText(ar ? "٢" : "2");
    await page.keyboard.press("Escape");
    await expect(queue).toBeHidden();
    await expect(queueTrigger).toBeFocused();
    await page.getByRole("button", { name: ar ? "خيارات الصوت" : "Audio options", exact: true }).click();
    const sleep = page.getByRole("combobox", { name: ar ? "مؤقت النوم" : "Sleep timer", exact: true });
    await sleep.click();
    await page.getByRole("option", { name: ar ? "بعد ١٥ دقيقة" : "After 15 minutes", exact: true }).click();
    await expect(sleep).toContainText(ar ? "يتوقف مؤقتًا عند" : "Pauses at");
    await page.keyboard.press("Escape");
    await page.screenshot({ path: testInfo.outputPath("footer.png") });
    // A real controller checkpoint, from a manually moved media clock.
    const seek = page.getByRole("slider", { name: ar ? "تقديم أو تأخير الصوت" : "Seek audio" });
    await seek.focus();
    await page.keyboard.press("ArrowUp");
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await expect
      .poll(() =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.listening-bookmark.v1") ?? "null")?.seconds),
      )
      .toBeGreaterThan(0);
    const checkpoint = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.listening-bookmark.v1")!));
    await page.goto("/#/settings/audio");
    await page.reload();
    const resume = page.getByRole("button", {
      name: ar ? "استئناف آخر جلسة استماع" : "Resume last listening session",
      exact: true,
    });
    await expect(resume).toBeVisible();
    await resume.click();
    await expect(
      page.getByRole("status").filter({ hasText: ar ? "تمت استعادة" : "Listening position restored" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByRole("slider", { name: ar ? "تقديم أو تأخير الصوت" : "Seek audio" })
          .inputValue()
          .then((value) => Number(value)),
      )
      .toBeCloseTo(checkpoint.seconds, 0);
    await expect(
      page.getByRole("button", { name: t(scenario.language, "audioPlayer.play"), exact: true }),
    ).toBeVisible();
  });
}
