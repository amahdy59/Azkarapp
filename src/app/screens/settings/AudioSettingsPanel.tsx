import { useEffect, useState } from "react";
import type { AudioController } from "../../audio/AudioProvider";
import { loadAudioPreferences, saveAudioPreferences } from "../../audio/audioPreferences";
import { getAudioVoices } from "../../audio/audioVoices";
import { Headphones } from "../../components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { SectionLabel, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

const PLAYBACK_RATES = [0.75, 1, 1.25] as const;

export function AudioSettingsPanel({
  language,
  controller,
  onBack,
}: {
  language: AppLanguage;
  controller: AudioController | null;
  onBack: () => void;
}) {
  const [preferences, setPreferences] = useState(() => controller?.preferences ?? loadAudioPreferences());
  const voices = getAudioVoices(language);

  useEffect(() => {
    if (controller) setPreferences(controller.preferences);
  }, [controller, controller?.preferences]);

  const saveRate = (rate: number) => {
    if (controller) controller.setPlaybackRate(rate);
    else saveAudioPreferences({ ...preferences, playbackRate: rate });
    setPreferences((current) => ({ ...current, playbackRate: rate }));
  };

  const saveVoice = (voiceId: string) => {
    if (controller) controller.setPreferredDuaVoice(voiceId);
    else saveAudioPreferences({ ...preferences, duaVoiceId: voiceId });
    setPreferences((current) => ({ ...current, duaVoiceId: voiceId }));
  };

  const saveContinue = (enabled: boolean) => {
    if (controller) controller.setContinueOnNavigation(enabled);
    else saveAudioPreferences({ ...preferences, continueOnNavigation: enabled });
    setPreferences((current) => ({ ...current, continueOnNavigation: enabled }));
  };

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.audioRecitations")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label={t(language, "settings.audioVoice")} />
        <div className="mx-4 mt-2 rounded-3xl border border-border/40 bg-card p-4 shadow-raised">
          <p id="preferred-audio-voice-label" className="text-sm font-semibold text-foreground">
            {t(language, "settings.preferredReciter")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(language, "settings.preferredReciterHint")}</p>
          <Select
            value={voices.some((voice) => voice.id === preferences.duaVoiceId) ? preferences.duaVoiceId : voices[0]?.id}
            onValueChange={saveVoice}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <SelectTrigger
              id="preferred-audio-voice"
              aria-labelledby="preferred-audio-voice-label"
              className="mt-3 font-bold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {language === "ar" ? voice.nameArabic : voice.nameEnglish}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SectionLabel label={t(language, "settings.playbackSpeed")} />
        <div
          className="mx-4 mt-2 grid grid-cols-3 gap-2"
          role="group"
          aria-label={t(language, "settings.playbackSpeed")}
        >
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              aria-pressed={preferences.playbackRate === rate}
              onClick={() => saveRate(rate)}
              className={`min-h-11 rounded-xl border px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                preferences.playbackRate === rate
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-control bg-card text-foreground"
              }`}
            >
              {rate}×
            </button>
          ))}
        </div>

        <SectionLabel label={t(language, "settings.audioBehavior")} />
        <div className="mx-4 mt-2 overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Headphones size={20} className="text-primary" />}
            label={t(language, "settings.continueAudioNavigation")}
            description={t(language, "settings.continueAudioNavigationHint")}
            checked={preferences.continueOnNavigation}
            onChange={() => saveContinue(!preferences.continueOnNavigation)}
            hasDivider={false}
          />
        </div>
      </div>
    </div>
  );
}
