import sys
with open('e2e/accessibility.spec.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = '});\n\nfor (const viewport of ['
replacement = '''});

test("friday mode, saved zikr, and custom counters have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await enterEnglishGuestMode(page);
  
  // Friday mode
  await page.goto("/#/?view=friday");
  await expect(page.getByRole("heading", { name: /Friday Sunnahs/i })).toBeVisible();
  await expectNoWcagViolations(page);
  
  // Saved zikr
  await page.goto("/#/?view=saved");
  await expect(page.getByRole("heading", { name: "Saved Collections" })).toBeVisible();
  await expectNoWcagViolations(page);
  
  // Custom counters
  await page.goto("/#/?view=counters");
  await expect(page.getByRole("heading", { name: "Custom Counter" })).toBeVisible();
  await expectNoWcagViolations(page);
});

test("dialogs and sheets have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.goto("/#/?view=counters");
  
  // Open reset dialog
  await page.getByRole("button", { name: /Reset/i }).first().click();
  const confirmBtn = page.getByRole("button", { name: /Reset/i }).last();
  await expect(confirmBtn).toBeVisible();
  
  await expectNoWcagViolations(page);
});

test("themes maintain WCAG compliance (high contrast, forced colors)", async ({ page }) => {
  await enterEnglishGuestMode(page);
  
  // Forced colors & high contrast
  await page.emulateMedia({ colorScheme: "dark", contrast: "more", forcedColors: "active" });
  await expectNoWcagViolations(page);
  
  // Light mode & high contrast
  await page.emulateMedia({ colorScheme: "light", contrast: "more" });
  await expectNoWcagViolations(page);
});

for (const viewport of ['''

new_content = content.replace(target, replacement)
with open('e2e/accessibility.spec.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
