import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

const manifest = JSON.parse(readFileSync("src/app/content/homeReminderManifest.json", "utf8")) as { url: string };
const bytes = readFileSync("src/app/content/home-reminder-readings.bin");

/** Exercise real checksum/decompression without depending on live R2 or a
 * particular preview port's CORS grant. Outage cases override this route. */
export async function fixtureReminderCatalogue(page: Page) {
  await page.route(manifest.url, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: bytes,
    }),
  );
}
