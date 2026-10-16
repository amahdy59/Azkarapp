import { expect, test } from "@playwright/test";

test("browser fixtures keep visitor heartbeats on their local test origin", async ({ page, baseURL }) => {
  const productionRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("azkarapp-api.amahdy59.workers.dev")) productionRequests.push(request.url());
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en" }, profile: { isGuest: true } }),
    );
  });
  await page.route("**/__browser-test-api/v1/visitors", (route) => route.fulfill({ json: { active: 7 } }));
  const heartbeat = page.waitForRequest((request) => request.url().endsWith("/__browser-test-api/v1/visitors"));
  await page.goto("/#/home");
  const request = await heartbeat;
  expect(new URL(request.url()).origin).toBe(new URL(baseURL!).origin);
  await expect(page.getByTestId("home-visitor-footer")).toContainText("Visitors now: 7");
  expect(productionRequests).toEqual([]);
});
