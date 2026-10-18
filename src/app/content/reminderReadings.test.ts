import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash, webcrypto } from "node:crypto";
import { Blob as NodeBlob } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";
import readings from "./homeReminderReadings.json";
import fallbacks from "./homeReminderFallbacks.json";
import manifest from "./homeReminderManifest.json";
import primary from "../../../docs/agent/evidence/home-reminder-primary-sources-2026-10-18.json";
import legacy from "../../../docs/agent/evidence/home-reminder-fallback-sources-2026-10-18.json";
import audit from "../../../docs/agent/evidence/home-reminder-fallback-review-2026-10-18.json";
import { ALL_AZKAR } from "./azkar";
import { createReminderReadingCatalogue, reminderSourceIdentity, type ReminderReadingRecord } from "./reminderReadings";
import type { DailyEvidence } from "../dailyEvidence";
import { RELEVANT_NOW_LIBRARY } from "./relevantNowLibrary";
import { AUTHENTICATED_REMINDER_LIBRARY } from "./authenticatedReminders";
import { RELEVANT_NOW_VERSES } from "./relevantNowVerses";

const data = { readings, fallbacks };
const catalogue = createReminderReadingCatalogue(data);
const sources: Record<string, { url: string; arabicWithChain: string }> = { ...primary, ...legacy };
const evidence: DailyEvidence = {
  hadith: "Reviewed excerpt",
  hadithInArabic: false,
  benefit: "Original benefit",
  authenticity: "Sahih",
  excerpt: true,
};

describe("complete local Home readings", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("covers all 71 curated sources and all 185 original fallback identities explicitly", () => {
    expect(Object.keys(readings).filter((k) => !k.startsWith("L:"))).toHaveLength(71);
    expect(Object.keys(fallbacks)).toHaveLength(185);
    expect(Object.keys(fallbacks).sort()).toEqual(Object.keys(audit.entries).sort());
    for (const [id, mapping] of Object.entries(fallbacks)) {
      const zikr = ALL_AZKAR.find((item) => item.id === id);
      expect(zikr, id).toBeDefined();
      expect(zikr!.sourceReference).toContain(audit.entries[id as keyof typeof audit.entries].originalReference);
      const record = readings[mapping.reading as keyof typeof readings] as ReminderReadingRecord;
      expect(record.arabic, id).toBeTruthy();
      expect(record.english, id).toBeTruthy();
      expect(record.meaningArabic, id).toBeTruthy();
      expect(record.meaningEnglish, id).toBeTruthy();
      expect(record.sourceUrl, id).toMatch(/^https:\/\/(sunnah.com|dorar.net)\//);
    }
  });

  it("keeps application commentary and methodological cautions out of brief meanings", () => {
    for (const record of Object.values(readings)) {
      expect(record.meaningArabic).not.toMatch(/التطبيق|حساب مادي|تردد الراوي|ليس قولًا منسوبًا|دون إضافة عدد/);
      expect(record.meaningEnglish).not.toMatch(
        /\bthe app\b|financial formula|scholarly view|unstated repetition|following al-Albani.s grading|retaining the narrator/,
      );
    }
  });

  it("retains exact Arabic quotation boundaries from each individually checked source", () => {
    for (const [key, row] of Object.entries(readings)) {
      const record = row as ReminderReadingRecord;
      if (!record.arabic) continue;
      const source = sources[record.evidenceId!];
      expect(source, key).toBeDefined();
      expect(source.arabicWithChain.slice(record.sourceStart, record.sourceEnd), key).toBe(record.arabic);
      expect(record.arabic, key).not.toMatch(/…|\.\.\.|بمعناه|الحديث$/);
      expect(record.english, key).not.toMatch(/…|\.\.\./);
    }
  });

  it("uses the reviewed ID mapping before ambiguous legacy references and never mistakes Hisn numbering for Muslim", () => {
    expect(reminderSourceIdentity({ ...evidence, sourceReferenceEnglish: "Hisn al-Muslim 75." })).toBeUndefined();
    expect(
      reminderSourceIdentity({ ...evidence, sourceReferenceEnglish: "Muslim 1/494; Hisn al-Muslim 20." }),
    ).toBeUndefined();
    expect(reminderSourceIdentity({ ...evidence, sourceUrl: "https://sunnah.com/muslim%3A55a" })).toBe("muslim:55a");
    const result = catalogue.withReminderReading(
      { ...evidence, zikrId: "msq-hm-23", sourceReferenceEnglish: "Bukhari 1163." },
      "en",
    );
    expect(result.sourceUrl).toBe("https://sunnah.com/bukhari:444");
    expect(result.hadith).toContain("before he sits");
  });

  it("replaces disputed/weak Home claims without carrying their benefit or canonical target into the replacement", () => {
    const result = catalogue.withReminderReading({ ...evidence, zikrId: "misc-ref-11", takeaway: "Old promise" }, "en");
    expect(result.sourceUrl).toBe("https://sunnah.com/bukhari:6405");
    expect(result.hadith).not.toMatch(/million|market/);
    expect(result.benefit).toBe(result.meaning);
    expect(result.zikrId).toBeUndefined();
    expect(result.takeaway).toBeUndefined();
    expect(result.excerpt).toBe(false);
    expect(Object.values(fallbacks).filter((row) => row.replacement)).toHaveLength(20);
  });

  it("separates companion reports, translations, meanings and editorial guidance", () => {
    const thunder = catalogue.withReminderReading({ ...evidence, zikrId: "ne-ref-4" }, "ar");
    expect(thunder.companionReport).toBe(true);
    expect(thunder.reportedAction).toBe(false);
    expect(thunder.authenticity).toContain("الألباني");
    const quran = catalogue.withReminderReading(
      {
        ...evidence,
        evidenceId: "Q01",
        isQuran: true,
        hadith: "آية",
        translation: "Reviewed translation",
        takeaway: "Editorial guidance",
      },
      "en",
    );
    expect(quran.hadith).toBe("آية");
    expect(quran.translation).toBe("Reviewed translation");
    expect(quran.takeaway).toBe("Editorial guidance");
    expect(quran.meaning).toBe(readings.Q01.meaningEnglish);
  });

  it("keeps every entry bilingual and source-linked, including after offline unpacking", () => {
    const bytes = readFileSync("src/app/content/home-reminder-readings.bin");
    const packed = JSON.parse(gunzipSync(bytes).toString("utf8"));
    expect(packed.readings).toEqual(data.readings);
    expect(packed.fallbacks).toEqual(data.fallbacks);
    const metadata = [...RELEVANT_NOW_LIBRARY, ...AUTHENTICATED_REMINDER_LIBRARY].map(
      ({ arabic: _arabic, english: _english, ...item }) => item,
    );
    expect(packed.library).toEqual(metadata);
    expect(packed.verses).toEqual(RELEVANT_NOW_VERSES);
    expect(bytes.length).toBeLessThan(100_000);
    expect(manifest.bytes).toBe(bytes.length);
    expect(manifest.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(manifest.url).toContain(`/home-reminder-readings-${manifest.sha256}.bin`);
    for (const id of Object.keys(fallbacks)) {
      for (const language of ["ar", "en"] as const) {
        const result = catalogue.withReminderReading({ ...evidence, zikrId: id }, language);
        expect(result.hadithInArabic, id).toBe(language === "ar");
        expect(result.meaningSourceUrl, id).toMatch(/^https:\/\//);
        expect(result.excerpt, id).toBe(false);
        expect(result.authenticity, id).not.toMatch(/Da[’']if|ضعيف/);
      }
    }
  });

  it("leaves unknown evidence untouched", () => {
    expect(catalogue.withReminderReading(evidence, "en")).toBe(evidence);
    expect(catalogue.withReminderReading({ ...evidence, evidenceId: "unknown" }, "ar").hadith).toBe(evidence.hadith);
  });
});

describe("verified R2 catalogue loading", () => {
  afterEach(() => vi.unstubAllGlobals());

  async function freshLoader() {
    vi.resetModules();
    vi.stubGlobal("crypto", webcrypto);
    vi.stubGlobal("Blob", NodeBlob);
    return (await import("./reminderReadings")).loadReminderReadings;
  }

  it("verifies pinned bytes before decoding, restores the schedule and reuses the verified result", async () => {
    const load = await freshLoader();
    const fetcher = vi.fn().mockResolvedValue(new Response(readFileSync("src/app/content/home-reminder-readings.bin")));
    vi.stubGlobal("fetch", fetcher);
    const result = await load();
    expect(result.library).toHaveLength(71);
    expect(result.verses).toHaveLength(18);
    expect(result.withReminderReading({ ...evidence, evidenceId: "H16" }, "ar").hadith).toBe(readings.H16.arabic);
    expect(await load()).toBe(result);
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(manifest.url, { credentials: "omit" });
  });

  it.each(["network", "truncated", "corrupted"])("rejects a %s package and allows a clean retry", async (failure) => {
    const load = await freshLoader();
    const bytes = readFileSync("src/app/content/home-reminder-readings.bin");
    const damaged = Buffer.from(bytes);
    damaged[50] ^= 1;
    const bad =
      failure === "network"
        ? new Response(null, { status: 503 })
        : new Response(failure === "truncated" ? bytes.subarray(0, 50) : damaged);
    const fetcher = vi.fn().mockResolvedValueOnce(bad).mockResolvedValueOnce(new Response(bytes));
    vi.stubGlobal("fetch", fetcher);
    await expect(load()).rejects.toThrow(
      failure === "network" ? "unavailable" : failure === "truncated" ? "size mismatch" : "checksum mismatch",
    );
    expect((await load()).library).toHaveLength(71);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("loads verified offline bytes without a network request", async () => {
    const load = await freshLoader();
    const match = vi.fn().mockResolvedValue(new Response(readFileSync("src/app/content/home-reminder-readings.bin")));
    const open = vi.fn().mockResolvedValue({ match });
    vi.stubGlobal("caches", { open });
    const fetcher = vi.fn().mockRejectedValue(new Error("Offline"));
    vi.stubGlobal("fetch", fetcher);
    expect((await load()).library).toHaveLength(71);
    expect(open).toHaveBeenCalledWith("azkar-home-reminders-v1");
    expect(match).toHaveBeenCalledWith(manifest.url);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("evicts damaged offline bytes and stores only a verified replacement", async () => {
    const load = await freshLoader();
    const cache = {
      match: vi.fn().mockResolvedValue(new Response("damaged")),
      delete: vi.fn().mockResolvedValue(true),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue(cache) });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(readFileSync("src/app/content/home-reminder-readings.bin"))),
    );
    expect((await load()).library).toHaveLength(71);
    expect(cache.delete).toHaveBeenCalledWith(manifest.url);
    expect(cache.put).toHaveBeenCalledExactlyOnceWith(manifest.url, expect.any(Response));
    expect(Buffer.from(await cache.put.mock.calls[0][1].arrayBuffer())).toEqual(
      readFileSync("src/app/content/home-reminder-readings.bin"),
    );
  });

  it.each(["open", "put"])("keeps online reading available when cache %s is denied", async (operation) => {
    const load = await freshLoader();
    const cache = { match: vi.fn().mockResolvedValue(undefined), put: vi.fn().mockRejectedValue(new Error("Quota")) };
    vi.stubGlobal("caches", {
      open: operation === "open" ? vi.fn().mockRejectedValue(new Error("Denied")) : vi.fn().mockResolvedValue(cache),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(readFileSync("src/app/content/home-reminder-readings.bin"))),
    );
    expect((await load()).library).toHaveLength(71);
  });
});
