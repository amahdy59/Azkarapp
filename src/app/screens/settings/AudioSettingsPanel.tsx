import { useEffect, useState } from "react";
import type { AudioController } from "../../audio/AudioProvider";
import { loadAudioPreferences, saveAudioPreferences } from "../../audio/audioPreferences";
import { getAudioVoices } from "../../audio/audioVoices";
import { Download, Headphones } from "../../components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import {
  RowChevron,
  SettingsRowItem,
  SettingsSection,
  SettingsToggleRow,
  SubHeader,
  useSettingsReturnFocus,
} from "./SettingsPrimitives";

const PLAYBACK_RATES = [0.75, 1, 1.25] as const;

export function AudioSettingsPanel({
  language,
  controller,
  onBack,
  onOpenDownloads,
  focusOnMount = false,
  direction = language === "ar" ? "rtl" : "ltr",
}: {
  language: AppLanguage;
  controller: AudioController | null;
  onBack: () => void;
  onOpenDownloads?: () => void;
  focusOnMount?: boolean;
  direction?: "ltr" | "rtl";
}) {
  const panelRef = useSettingsReturnFocus(focusOnMount ? "settings-sub-downloads" : undefined);
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
    <div ref={panelRef} className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.audioDownloads")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        {onOpenDownloads && (
          <SettingsSection className="mt-3">
            <SettingsRowItem
              icon={<Download size={20} className="text-primary" />}
              label={t(language, "downloads.title")}
              right={<RowChevron />}
              onPress={onOpenDownloads}
              testId="settings-sub-downloads"
              hasDivider={false}
            />
          </SettingsSection>
        )}
        <div className="mx-4 mt-3 rounded-2xl border border-border/40 bg-card p-4">
          <p id="preferred-audio-voice-label" className="text-sm font-semibold text-foreground">
            {t(language, "settings.preferredReciter")}
          </p>
          <Select
            value={voices.some((voice) => voice.id === preferences.duaVoiceId) ? preferences.duaVoiceId : voices[0]?.id}
            onValueChange={saveVoice}
            dir={direction}
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
                <SelectItem key={voice.id} value={voice.id} disabled={voice.disabled}>
                  {language === "ar" ? voice.nameArabic : voice.nameEnglish}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <h2 className="mt-4 border-t border-border/40 pt-4 text-sm font-semibold">
            {t(language, "settings.playbackSpeed")}
          </h2>
          <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label={t(language, "settings.playbackSpeed")}>
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

          <div className="mt-4 overflow-hidden border-t border-border/40">
            <SettingsToggleRow
              iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
              icon={<Headphones size={20} className="text-primary" />}
              label={t(language, "settings.continueAudioNavigation")}

              checked={preferences.continueOnNavigation}
              onChange={() => saveContinue(!preferences.continueOnNavigation)}
              hasDivider={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
