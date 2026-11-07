import { expect, test } from "@playwright/test";
import { DEFAULT_APP_STATE } from "../src/app/state";
import { reminderOccurrences } from "../src/app/reminderOccurrences";

for (const language of ["ar", "en"] as const) {
  test(`Asr delivers its dated evidence once and opens Asr in ${language} @cross-browser`, async ({ page }, info) => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.settings.language = language;
    state.settings.reduceMotion = true;
    state.settings.reminders.prayer = { enabled: true, leadMinutes: 15, prayers: ["asr"] };
    const event = reminderOccurrences(
      state.settings.reminders,
      [],
      state.settings.location,
      4,
      new Date("2026-11-05T00:00:00Z"),
    ).find((event) => event.kind === "prayer")!;
    await page.clock.install({ time: new Date(event.at + 1000) });
    await page.addInitScript((state) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
      const captures: { title: string; options: NotificationOptions; onclick?: () => void }[] = [];
      Object.assign(window, { notificationCaptures: captures });
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: class {
          static permission = "granted";
          title: string;
          options: NotificationOptions;
          constructor(title: string, options: NotificationOptions) {
            this.title = title;
            this.options = options;
            captures.push(this);
          }
          close() {}
        },
      });
      Object.defineProperty(navigator.serviceWorker, "getRegistration", {
        configurable: true,
        value: async () => undefined,
      });
    }, state);
    await page.goto("/#/settings/notifications");
    const captures = () =>
      page.evaluate(
        () =>
          (window as unknown as { notificationCaptures: { title: string; options: NotificationOptions }[] })
            .notificationCaptures,
      );
    await expect.poll(async () => (await captures()).length).toBe(1);
    expect((await captures())[0]).toMatchObject({
      title: expect.stringContaining(language === "ar" ? "العصر" : "Asr"),
      options: { body: expect.stringMatching(/555|574/), data: { url: expect.stringContaining("#/prayer/asr") } },
    });
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("focus"));
    });
    await page.clock.runFor(500);
    expect(await captures()).toHaveLength(1);
    await info.attach("delivered-notification", {
      body: JSON.stringify(await captures(), null, 2),
      contentType: "application/json",
    });
    await page.evaluate(() => {
      const captures = (window as unknown as { notificationCaptures: { onclick: () => void }[] }).notificationCaptures;
      captures[0].onclick();
    });
    await expect(page).toHaveURL(/#\/prayer\/asr$/);
    await expect(page.getByTestId("prayer-moment-screen")).toHaveAttribute("data-prayer", "asr");
    await expect(page.getByTestId("prayer-open-adhkar")).toBeVisible();
    await page.screenshot({ path: info.outputPath(`asr-destination-${language}.png`) });
    await page.reload();
    await expect(page.getByTestId("prayer-moment-screen")).toHaveAttribute("data-prayer", "asr");
    await page.clock.runFor(500);
    expect(await captures()).toHaveLength(0);
  });
}
