import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test.describe.configure({ mode: "serial" });
let server: ChildProcess;
let origin: string;
test.beforeAll(async ({ browserName }, testInfo) => {
  test.setTimeout(180_000);
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = (probe.address() as AddressInfo).port;
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  const directory = path.join(testInfo.project.outputDir, `learning-production-${browserName}-${process.pid}`);
  server = spawn(process.execPath, ["scripts/serve-learning-production-tests.mjs", directory, String(port)], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  await new Promise<void>((resolve, reject) => {
    const read = (chunk: Buffer) => {
      output += chunk.toString();
      if (output.includes("LEARNING_PRODUCTION_READY")) resolve();
    };
    server.stdout!.on("data", read);
    server.stderr!.on("data", (chunk) => {
      output += chunk.toString();
    });
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Production fixture exited ${code}: ${output.slice(-5000)}`)));
  });
  origin = `http://127.0.0.1:${port}`;
});
test.afterAll(() => server?.kill("SIGTERM"));
test.beforeEach(async ({ page }) => {
  await page.route(/\/__browser-test-api(?:\/|\?|$)/, (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", themeMode: "light", darkMode: false } }),
    );
  });
});

test("ordinary production exposes three Arabic books with PDF downloads and honest source notices", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "azkar.learning.v1",
      JSON.stringify({
        "dalil-al-mutamir": { contentLanguage: "en", position: { unitId: "p-6", offset: 0.3 }, bookmarks: ["p-6"] },
        "dalil-al-mutamir:en": { position: { unitId: "p-9", offset: 0.5 }, bookmarks: ["p-9"] },
      }),
    ),
  );
  await page.goto(`${origin}/#/learn`);
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Download PDF", exact: true })).toHaveCount(3);
  await expect(page.getByText(/Source verification is pending/)).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "دليل المعتمر", exact: true })).toBeVisible();
  await expect(page.getByText(/covers 16 source pages/)).toBeVisible();
  await expect(page.getByRole("radio", { name: "English", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Continue reading", exact: true }).click();
  await expect(page).toHaveURL(/\/p-6$/);
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
  await page.goto(`${origin}/#/settings/downloads`);
  await page
    .locator("summary")
    .filter({ hasText: /^Books$/ })
    .click();
  await expect(page.getByTestId("learning-downloads").getByRole("region")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "The Umrah Guide", exact: true })).toHaveCount(0);
});

test("Home continues the latest Arabic book while preserving the unavailable English draft's records", async ({
  page,
}) => {
  const records = {
    "dalil-al-mutamir": {
      position: { unitId: "p-6", offset: 0.3 },
      bookmarks: ["p-6"],
      contentLanguage: "en",
      lastReadAt: 10,
    },
    "dalil-al-mutamir:en": { position: { unitId: "p-9", offset: 0.5 }, bookmarks: ["p-9"], lastReadAt: 30 },
    "al-mukhtar": { position: { unitId: "p-32", offset: 0.4 }, bookmarks: ["p-32"], lastReadAt: 40 },
  };
  await page.addInitScript((records) => {
    localStorage.setItem("azkar.learning.v1", JSON.stringify(records));
  }, records);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/__learning-assets__/")) requests.push(request.url());
  });
  await page.goto(`${origin}/#/home`);
  const section = page.getByTestId("home-learning");
  await expect(section).toContainText("المختار");
  await expect(section).not.toContainText("The Umrah Guide");
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!))).toEqual(records);
  await section.getByRole("button", { name: "Continue reading", exact: true }).click();
  await expect(page).toHaveURL(/learn\/al-mukhtar\/p-32$/);
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!));
  expect(saved["dalil-al-mutamir:en"]).toEqual(records["dalil-al-mutamir:en"]);
  expect(saved["al-mukhtar"].bookmarks).toEqual(records["al-mukhtar"].bookmarks);
  expect(saved["dalil-al-mutamir"]).toEqual(records["dalil-al-mutamir"]);
});

test("all Arabic direct links load their publication and preserve bookmarks", async ({ page }) => {
  const records = {
    "al-mukhtar": { position: { unitId: "p-32", offset: 0.45 }, bookmarks: ["p-32"] },
    "al-wird-an-nabawi": { position: { unitId: "p-18", offset: 0.6 }, bookmarks: ["p-18"] },
  };
  await page.addInitScript((value) => localStorage.setItem("azkar.learning.v1", JSON.stringify(value)), records);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/__learning-assets__/")) requests.push(request.url());
  });
  for (const id of ["al-mukhtar", "al-wird-an-nabawi"]) {
    await page.goto(`${origin}/#/learn/${id}/p-32`);
    await expect(page.getByTestId("learning-content")).toBeVisible();
    await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!));
    expect(saved[id].bookmarks).toEqual(records[id as keyof typeof records].bookmarks);
  }
  expect(requests.length).toBeGreaterThanOrEqual(2);
});

test("an unavailable English link recovers to the same book's saved Arabic position without touching English records", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "azkar.learning.v1",
      JSON.stringify({
        "dalil-al-mutamir": { contentLanguage: "en", position: { unitId: "p-6", offset: 0.3 }, bookmarks: ["p-6"] },
        "dalil-al-mutamir:en": { position: { unitId: "p-9", offset: 0.5 }, bookmarks: ["p-9"] },
      }),
    ),
  );
  await page.goto(`${origin}/#/learn/dalil-al-mutamir/p-9?lang=en`);
  await expect(page.getByTestId("learning-content")).toHaveAttribute("lang", "ar");
  await expect(page).toHaveURL(/\/p-6$/);
  await expect(page.getByText(/requested edition is unavailable/)).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!)["dalil-al-mutamir:en"]),
  ).toEqual({ position: { unitId: "p-9", offset: 0.5 }, bookmarks: ["p-9"] });
});

test("a previously saved Arabic edition remains offline-capable and removable without losing records", async ({
  page,
}) => {
  const catalogue = JSON.parse(await readFile("src/app/learning/catalogue.json", "utf8"));
  const resource = catalogue.find(
    (item: { id: string; language: string }) => item.id === "al-mukhtar" && item.language === "ar",
  );
  const bytes = [...(await readFile(path.join("docs/learning/assets", resource.pack.path)))];
  const records = { "al-mukhtar": { position: { unitId: "p-32", offset: 0.45 }, bookmarks: ["p-32"] } };
  await page.goto(`${origin}/#/settings/downloads`);
  await page.evaluate(
    async ({ asset, bytes, records }) => {
      localStorage.setItem("azkar.learning.v1", JSON.stringify(records));
      const cache = await caches.open("azkar-learning-v1");
      await cache.put(
        `${location.origin}/__learning-assets__/${asset.path}`,
        new Response(new Uint8Array(bytes), {
          headers: { "Content-Type": asset.mime, "X-Learning-Resource": "al-mukhtar" },
        }),
      );
    },
    { asset: resource.pack, bytes, records },
  );
  await page.reload();
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(resource.pack.path)) requests.push(request.url());
  });
  await page
    .locator("summary")
    .filter({ hasText: /^Books$/ })
    .click();
  const saved = page
    .getByTestId("learning-downloads")
    .getByRole("region", { name: "المختار من صحيح الأدعية والأذكار", exact: true });
  await expect(saved.getByText("Available offline", { exact: true })).toBeVisible();
  await saved.getByRole("button", { name: "Remove saved book", exact: true }).click();
  await expect(saved.getByText("Available offline", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.learning.v1")!))).toEqual(records);
  expect(requests).toEqual([]);
});

test("all three book cards download their exact PDF bytes and reflow at enlarged phone size", async ({ page }) => {
  const catalogue = JSON.parse(await readFile("src/app/learning/catalogue.json", "utf8"));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${origin}/#/learn`);
  await page.locator("html").evaluate((node) => {
    node.style.fontSize = "200%";
  });
  for (const resource of catalogue.filter((item: { language: string }) => item.language === "ar")) {
    const card = page.getByRole("article").filter({ has: page.locator(`#title-${resource.id}`) });
    const event = page.waitForEvent("download");
    await card.getByRole("button", { name: "Download PDF", exact: true }).click();
    const download = await event;
    expect(download.suggestedFilename()).toBe(`${resource.id}-light.pdf`);
    const bytes = await readFile((await download.path())!);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBe(resource.pdfs.light.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(resource.pdfs.light.sha256);
    await expect(card.getByRole("status").filter({ hasText: "PDF sent" })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
