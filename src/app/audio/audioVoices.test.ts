import { describe, expect, it } from "vitest";
import { getAudioVoices, getAudioVoiceName, isKnownAudioVoice } from "./audioVoices";

describe("audio voices", () => {
  it("orders Arabic names by the Arabic alphabet, not by code point", () => {
    const names = getAudioVoices("ar").map((voice) => voice.nameArabic);
    expect(names).toEqual(["عبد الله محمد", "محمد الشرع", "محمد معتز"]);
  });

  it("orders English names alphabetically", () => {
    const names = getAudioVoices("en").map((voice) => voice.nameEnglish);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
  });

  it("keeps ids stable and independent of the display language", () => {
    expect(
      getAudioVoices("ar")
        .map((v) => v.id)
        .sort(),
    ).toEqual(
      getAudioVoices("en")
        .map((v) => v.id)
        .sort(),
    );
    expect(isKnownAudioVoice("muhammad-moataz")).toBe(true);
    expect(isKnownAudioVoice("not-a-reciter")).toBe(false);
  });

  it("resolves a display name per language and reports unknown ids", () => {
    expect(getAudioVoiceName("muhammad-moataz", "ar")).toBe("محمد معتز");
    expect(getAudioVoiceName("muhammad-moataz", "en")).toBe("Muhammad Moataz");
    expect(getAudioVoiceName("not-a-reciter", "ar")).toBeUndefined();
  });
});
