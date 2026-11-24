import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import { COMPREHENSIVE_DUAS } from "./comprehensiveDuas";
import { FRIDAY_KAHF } from "./fridayKahf";
import { AUTHENTIC_AZKAR_COLLECTION } from "./authenticAzkar";
import { getLocalizedZikrBenefit, getLocalizedSourceReference } from "./localizedZikr";
import { APPROVED_AUDIO_ASSIGNMENTS } from "../audio/audioAssignments";
import review from "../../../docs/agent/evidence/dhikr-source-review-2026-11-24.json";

const corpus = [...ALL_AZKAR, ...COMPREHENSIVE_DUAS, ...FRIDAY_KAHF];
const byId = new Map(corpus.map((item) => [item.id, item]));

describe("source-specific dhikr evidence alignment", () => {
  it("binds the complete inventory to the reviewed effective bilingual content", () => {
    expect(corpus).toHaveLength(257);
    expect(review.entries.map((entry) => entry.id).sort()).toEqual(corpus.map((item) => item.id).sort());
    for (const row of review.entries) {
      const item = byId.get(row.id)!;
      const effective = Object.fromEntries(review.fields.map((key) => [key, item[key as keyof typeof item] ?? null]));
      effective.benefitArabic = getLocalizedZikrBenefit(item, "ar");
      effective.sourceReferenceArabic = getLocalizedSourceReference(item, "ar");
      expect(createHash("sha256").update(JSON.stringify(effective)).digest("hex"), row.id).toBe(row.sha256);
    }
    expect(review.masbaha.map((entry) => entry.id).sort()).toEqual(
      AUTHENTIC_AZKAR_COLLECTION.map((item) => item.id).sort(),
    );
  });

  it("keeps the hundredfold tahlil distinct from the tenfold post-prayer report", () => {
    for (const id of ["m-hm-93", "e-hm-92", "misc-ref-2"]) {
      const item = byId.get(id)!;
      expect(item.repetitionCount).toBe(100);
      expect(item.hadithText).toContain("مِائَةَ مَرَّةٍ");
      expect(item.hadithText).toMatch(/مِائَةُ حَسَنَةٍ/);
      expect(item.hadithText).toMatch(/مِائَةُ سَيِّئَةٍ/);
      expect(item.arabicText).not.toContain("يُحْيِي");
    }
    const ten = byId.get("ap-ref-7")!;
    expect(ten.repetitionCount).toBe(10);
    expect(ten.arabicText).toContain("يُحْيِي وَيُمِيتُ");
    expect(ten.hadithText).toContain("عُمَارَةَ");
    expect(ten.sourceReference).toContain("3534");
    expect(ten.hadithText).toContain("٣٤٧٤");
    expect(ten.hadithText).toContain("٣٥٣٤");
  });

  it("attaches the correct day/night dominion narration without borrowing Ibn Masud's dua", () => {
    for (const id of ["m-hm-89m", "e-hm-89e"]) {
      const item = byId.get(id)!;
      expect(item.hadithText).toContain("فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ");
      expect(item.hadithText).not.toContain("مَسْعُود");
      expect(item.hadithText).not.toContain("الْكَسَلِ");
      expect(item.sourceUrl).toBe("https://sunnah.com/abudawud:5084");
      expect(item.hadithText).toContain("إِذَا أَمْسَى");
    }
  });

  it("retains all reward conditions and does not invent repetition counts", () => {
    for (const id of ["m-hm-98", "e-hm-98"]) {
      expect(getLocalizedZikrBenefit(byId.get(id)!, "ar")).toContain("عشرًا حين يصبح وعشرًا حين يمسي");
    }
    expect(byId.get("home-hm-17")!.benefit).toContain("when eating");
    expect(byId.get("wu-hm-2")!.benefit).toContain("during the night");
    for (const id of ["ir-ref-3", "ir-ref-6", "misc-ref-12", "s-hm-104"]) {
      expect(byId.get(id)!.repetitionCount, id).toBe(1);
    }
    expect(byId.get("comprehensive-dua-42")!.repetitionCount).toBe(100);
    expect(byId.get("misc-ref-12")!.hadithText).not.toContain("ثَلَاثَ");
    expect(byId.get("fasting-affront-response")!.arabicText.match(/صَائِمٌ/g)).toHaveLength(1);
    expect(byId.get("fasting-affront-response")!.repetitionCount).toBe(2);
  });

  it("suspends changed-text recordings without rewriting approved recording identities", () => {
    for (const { id } of review.suspendedAudio) {
      expect(APPROVED_AUDIO_ASSIGNMENTS[id], id).toBeUndefined();
      expect(byId.get(id)!.audioAssetId, id).toBeUndefined();
    }
    expect(byId.get("m-hm-93")!.audioAssetId).toBe("ap-tasbeeh-tawhid");
    expect(byId.get("s-hm-104")!.audioAssetId).toBe("s-hm-104");
  });
});
