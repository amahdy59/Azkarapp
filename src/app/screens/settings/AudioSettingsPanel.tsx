import { Button } from "../../components/ui/button";
import { useEffect, useRef, useState } from "react";
import type { AudioController } from "../../audio/AudioProvider";
import type { AudioPreferences } from "../../audio/audioTypes";
import { loadAudioPreferences, saveAudioPreferences } from "../../audio/audioPreferences";
import { getAudioVoices } from "../../audio/audioVoices";
import { Headphones } from "../../components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

const PLAYBACK_RATES = [0.75, 0.8, 1, 1.25, 1.5, 2] as const;

export function AudioSettingsPanel({
  language,
  controller,
  onBack,
  onPreferencesChange,
  direction = language === "ar" ? "rtl" : "ltr",
}: {
  language: AppLanguage;
  controller: AudioController | null;
  onBack: () => void;
  onPreferencesChange?: (value: AudioPreferences) => void;
  direction?: "ltr" | "rtl";
}) {
  const resumePending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [resumeStatus, setResumeStatus] = useState("");
  const [resuming, setResuming] = useState(false);
  const [preferences, setPreferences] = useState(() => controller?.preferences ?? loadAudioPreferences());
  const voices = getAudioVoices(language);

  useEffect(() => {
    if (controller) setPreferences(controller.preferences);
  }, [controller, controller?.preferences]);

  const saveRate = (rate: number) => {
    const next = { ...preferences, playbackRate: rate };
    if (controller) controller.setPlaybackRate(rate);
    else saveAudioPreferences(next);
    setPreferences(next);
    onPreferencesChange?.(next);
  };

  const saveVoice = (voiceId: string) => {
    const next = { ...preferences, duaVoiceId: voiceId };
    if (controller) controller.setPreferredDuaVoice(voiceId);
    else saveAudioPreferences(next);
    setPreferences(next);
    onPreferencesChange?.(next);
  };

  const saveContinue = (enabled: boolean) => {
    const next = { ...preferences, continueOnNavigation: enabled };
    if (controller) controller.setContinueOnNavigation(enabled);
    else saveAudioPreferences(next);
    setPreferences(next);
    onPreferencesChange?.(next);
  };

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.audioRecitations")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto pb-8">
        {controller?.canResumeListening && (
          <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{t(language, "listening.resumeHelp")}</p>
            <Button
              type="button"
              disabled={resuming}
              aria-busy={resuming}
              className="mt-2 w-full"
              onClick={async () => {
                if (resumePending.current) return;
                resumePending.current = true;
                setResuming(true);
                setResumeStatus("");
                try {
                  const restored = await controller.resumeListening?.();
                  if (mounted.current)
                    setResumeStatus(t(language, restored ? "listening.restored" : "listening.unavailable"));
                } catch {
                  if (mounted.current) setResumeStatus(t(language, "listening.unavailable"));
                } finally {
                  resumePending.current = false;
                  if (mounted.current) setResuming(false);
                }
              }}
            >
              {t(language, resuming ? "listening.restoring" : "listening.resume")}
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="mt-1 w-full"
              disabled={resuming}
              onClick={() => {
                setResumeStatus("");
                controller.dismissResume?.();
              }}
            >
              {t(language, "listening.forget")}
            </Button>
          </div>
        )}
        {resumeStatus && (
          <p role="status" className="mx-4 mt-3 text-sm">
            {resumeStatus}
          </p>
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
          {preferences.duaVoiceId === "opendua-muhammad-jumah" && (
            <p className="mt-2 text-sm text-muted-foreground" role="status">
              {t(language, "settings.additionalReciterCoverage")}
            </p>
          )}
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
