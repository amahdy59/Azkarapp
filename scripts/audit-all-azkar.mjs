import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { ALL_AZKAR } = loadTypeScriptModule("./src/app/content/azkar.ts");
const { COMPREHENSIVE_DUAS } = loadTypeScriptModule("./src/app/content/comprehensiveDuas.ts");
const { FRIDAY_KAHF } = loadTypeScriptModule("./src/app/content/fridayKahf.ts");
const { getLocalizedZikrBenefit, getLocalizedSourceReference } = loadTypeScriptModule(
  "./src/app/content/localizedZikr.ts",
);

console.log("=== AZKAR AUDIT REPORT ===");
const allItems = [...ALL_AZKAR, ...COMPREHENSIVE_DUAS, ...FRIDAY_KAHF];

console.log(`Total Zikr items: ${allItems.length}`);

let missingArabicBenefit = 0;
let missingSourceRef = 0;
let unformattedBenefitCount = 0;
const unformattedItems = [];

allItems.forEach((z) => {
  const arBenefit = getLocalizedZikrBenefit(z, "ar");
  const arSource = getLocalizedSourceReference(z, "ar");

  if (!arBenefit || arBenefit === z.benefit) {
    missingArabicBenefit++;
    console.log(`[Missing AR Benefit] ID: ${z.id} | Cat: ${z.category} | EN Benefit: "${z.benefit}"`);
  } else if (!arBenefit.includes("\n") && !arBenefit.includes("•") && arBenefit.length > 40) {
    unformattedBenefitCount++;
    unformattedItems.push({ id: z.id, category: z.category, arBenefit });
  }

  if (!arSource) {
    missingSourceRef++;
    console.log(`[Missing AR Source] ID: ${z.id} | Cat: ${z.category}`);
  }
});

console.log(`\nSummary:`);
console.log(`- Total items: ${allItems.length}`);
console.log(`- Missing Arabic Benefits: ${missingArabicBenefit}`);
console.log(`- Unformatted Arabic Benefits: ${unformattedBenefitCount}`);
console.log(`- Missing Arabic Sources: ${missingSourceRef}`);

if (unformattedItems.length > 0) {
  console.log("\nUnformatted Items List:");
  unformattedItems.forEach((item) => {
    console.log(`- ID: ${item.id} (${item.category}): "${item.arBenefit}"`);
  });
}
