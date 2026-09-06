import { expect, test } from "@playwright/test";

/**
 * The three pages a store review and a GDPR request both land on.
 *
 * Every visitor was served an unapproved draft for months: bracketed
 * placeholders where the controller, the contact address and the governing law
 * should be, under a banner announcing that the page was not finished. The
 * values are the owner's, so nothing here could be filled in without them —
 * which is exactly why a test now holds them, rather than a checklist item
 * nobody ticks.
 */
const PAGES = ["/privacy.html", "/terms.html", "/account-deletion.html"];

/** Any `[LIKE THIS]` run, which is the shape every placeholder took. */
const PLACEHOLDER = /\[[A-Z][A-Z —-]*\]/;

for (const path of PAGES) {
  test(`${path} is published rather than drafted`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.ok(), `${path} did not load`).toBe(true);
    const html = await response.text();

    expect(html, `${path} still carries a placeholder`).not.toMatch(PLACEHOLDER);
    expect(html.toLowerCase()).not.toContain("draft requiring owner approval");
    // A page that cannot be replied to is the one thing store policy rejects.
    expect(html, `${path} names no contact address`).toContain("amahdy59@yahoo.com");
  });
}

test("the policy and terms say who is responsible and under which law", async ({ request }) => {
  for (const path of ["/privacy.html", "/terms.html"]) {
    const html = await (await request.get(path)).text();
    expect(html, `${path} names no controller`).toContain("Ahmed Mahdy");
    expect(html, `${path} names no governing law`).toContain("Arab Republic of Egypt");
  }
});

test("deletion is reachable by someone who cannot sign in", async ({ request }) => {
  /* The route that did not exist: deletion inside the app needs an account you
     can still reach, so a locked-out user had no way to ask at all. */
  const html = await (await request.get("/account-deletion.html")).text();
  expect(html).toContain("If you cannot sign in");
  expect(html).toMatch(/mailto:amahdy59@yahoo\.com/);
});
