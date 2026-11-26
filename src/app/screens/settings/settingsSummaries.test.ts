import { describe, expect, it } from "vitest";
import { DEFAULT_AUDIO_PREFERENCES } from "../../audio/audioPreferences";
import { DEFAULT_APP_STATE } from "../../state";
import { getSettingsSummaries } from "./settingsSummaries";
import type { DownloadReadiness } from "../../downloads/downloadSession";

const reminders = DEFAULT_APP_STATE.settings.reminders;
const checked: DownloadReadiness = {
  status: "checked",
  readyGroups: 2,
  totalGroups: 3,
  usageBytes: 12_000_000,
  duaVoiceId: DEFAULT_AUDIO_PREFERENCES.duaVoiceId,
  quranReciterId: DEFAULT_AUDIO_PREFERENCES.quranReciterId,
};
describe("Settings summaries", () => {
  it("localizes saved audio, checked download groups, origin usage, reminders and the weekly goal", () => {
    expect(getSettingsSummaries("en", DEFAULT_AUDIO_PREFERENCES, checked, reminders, true, 4)).toEqual({
      audio: "Abdullah Muhammad · 1×",
      downloads: "Last check: 2/3 groups ready · ~12.0 MB app storage",
      reminders: "Reminders off",
      progress: "Weekly goal: 4 days",
    });
    expect(
      getSettingsSummaries("ar", { ...DEFAULT_AUDIO_PREFERENCES, playbackRate: 1.25 }, checked, reminders, true, 7),
    ).toEqual({
      audio: "عبد الله محمد · ١.٢٥×",
      downloads: "آخر تحقق: ٢/٣ مجموعات جاهزة · تخزين التطبيق: نحو ١٢.٠ م.ب",
      reminders: "التذكيرات متوقفة",
      progress: "الهدف الأسبوعي: ٧ أيام",
    });
  });
  it("never treats unchecked, active or different-voice downloads as verified readiness", () => {
    expect(
      getSettingsSummaries("en", DEFAULT_AUDIO_PREFERENCES, { status: "unchecked" }, reminders, false, 4),
    ).toMatchObject({
      downloads: "Open to check downloads",
      progress: "Progress saved on this device",
    });
    expect(
      getSettingsSummaries("en", DEFAULT_AUDIO_PREFERENCES, { status: "busy" }, reminders, true, 4).downloads,
    ).toBe("Download in progress");
    expect(
      getSettingsSummaries(
        "en",
        { ...DEFAULT_AUDIO_PREFERENCES, duaVoiceId: "english-george" },
        checked,
        reminders,
        true,
        4,
      ).downloads,
    ).toBe("Open to check downloads");
    expect(
      getSettingsSummaries(
        "en",
        { ...DEFAULT_AUDIO_PREFERENCES, quranReciterId: "another" },
        checked,
        reminders,
        true,
        4,
      ).downloads,
    ).toBe("Open to check downloads");
    expect(
      getSettingsSummaries("en", DEFAULT_AUDIO_PREFERENCES, { ...checked, usageBytes: undefined }, reminders, true, 4)
        .downloads,
    ).toBe("Last check: 2/3 groups ready");
  });
  it("describes configured reminder choices, including optional schedules and an empty prayer selection", () => {
    for (const selected of [
      { ...reminders, morning: { ...reminders.morning, enabled: true } },
      { ...reminders, fridaySalawat: { enabled: true } },
      { ...reminders, prayer: { ...reminders.prayer, enabled: true } },
    ])
      expect(getSettingsSummaries("en", DEFAULT_AUDIO_PREFERENCES, checked, selected, true, 4).reminders).toBe(
        "Reminders selected",
      );
    expect(
      getSettingsSummaries(
        "en",
        DEFAULT_AUDIO_PREFERENCES,
        checked,
        { ...reminders, prayer: { ...reminders.prayer, enabled: true, prayers: [] } },
        true,
        4,
      ).reminders,
    ).toBe("Reminders off");
  });
});
