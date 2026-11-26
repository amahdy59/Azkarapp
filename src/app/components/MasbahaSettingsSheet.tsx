import { useState, type ReactNode } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { AppLanguage, TextSizeOption } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { ChoiceRadioItem } from "./ChoiceRadioItem";
import { FormField } from "./FormField";
import { ToggleTrack } from "./SettingsRow";
import { parseMasbahaTarget } from "./masbahaControls";
import "./masbaha.css";

const GOAL_PRESETS = [10, 33, 100, 1000];
export interface MasbahaFeedback {
  sound: boolean;
  haptics: boolean;
}

/** The screen applies drafts together; dismissing this panel changes nothing. */
export function MasbahaSettingsSheet({
  target,
  language,
  direction,
  onApply,
  onClose,
  feedback,
  textSize,
  actions,
}: {
  target: number;
  language: AppLanguage;
  direction: "rtl" | "ltr";
  onApply: (target: number, feedback: MasbahaFeedback, textSize: TextSizeOption) => void;
  onClose: () => void;
  feedback: MasbahaFeedback & { vibrationAvailable: boolean };
  textSize: TextSizeOption;
  actions?: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
    testId?: string;
  }[];
}) {
  const [draftTarget, setDraftTarget] = useState(() => formatNumerals(target, language));
  const [touched, setTouched] = useState(false);
  const [draftFeedback, setDraftFeedback] = useState(feedback);
  const [draftTextSize, setDraftTextSize] = useState(textSize);
  const value = parseMasbahaTarget(draftTarget);
  return (
    <ResponsiveSheet
      open
      onClose={onClose}
      title={t(language, "counter.settings")}
      language={language}
      direction={direction}
      showCloseButton={false}
      testId="masbaha-settings-sheet"
      focusOnOpen
      drawerClassName="masbaha-sheet"
      dialogClassName="masbaha-sheet"
    >
      <SheetHeader
        title={t(language, "counter.settings")}
        onClose={onClose}
        language={language}
        direction={direction}
      />
      <form
        className="masbaha-sheet-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (value !== null) onApply(value, draftFeedback, draftTextSize);
        }}
      >
        <div className="masbaha-sheet-body space-y-5">
          <section className="space-y-3" aria-label={t(language, "counter.targetLabel")}>
            <RadioGroup.Root
              value={value !== null && GOAL_PRESETS.includes(value) ? String(value) : ""}
              onValueChange={(next) => {
                setDraftTarget(formatNumerals(Number(next), language));
                setTouched(true);
              }}
              dir={direction}
              className="masbaha-goal-choices"
              aria-label={t(language, "counter.targetPresets")}
            >
              {GOAL_PRESETS.map((preset) => (
                <ChoiceRadioItem value={String(preset)} key={preset}>
                  {formatNumerals(preset, language)}
                </ChoiceRadioItem>
              ))}
            </RadioGroup.Root>
            <FormField
              label={t(language, "counter.targetLabel")}
              type="text"
              inputMode="numeric"
              value={draftTarget}
              onChange={(event) => {
                setDraftTarget(event.target.value);
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              error={touched && value === null ? t(language, "counter.invalidTarget") : undefined}
            />
          </section>
          <section className="masbaha-feedback" aria-label={t(language, "counter.feedback")}>
            <button
              type="button"
              role="switch"
              aria-checked={draftFeedback.haptics}
              aria-label={t(language, "counter.vibration")}
              disabled={!feedback.vibrationAvailable}
              onClick={() => setDraftFeedback({ ...draftFeedback, haptics: !draftFeedback.haptics })}
              className="masbaha-switch-row"
            >
              <span>{t(language, "counter.vibrationShort")}</span>
              <ToggleTrack checked={draftFeedback.haptics} />
            </button>
            {!feedback.vibrationAvailable && (
              <p className="px-1 text-xs text-muted-foreground">{t(language, "counter.vibrationUnavailable")}</p>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={draftFeedback.sound}
              aria-label={t(language, "counter.sound")}
              onClick={() => setDraftFeedback({ ...draftFeedback, sound: !draftFeedback.sound })}
              className="masbaha-switch-row"
            >
              <span>{t(language, "counter.soundShort")}</span>
              <ToggleTrack checked={draftFeedback.sound} />
            </button>
          </section>
          <details className="masbaha-more">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "common.moreOptions")}
            </summary>
            <div className="space-y-4 pt-2">
              <RadioGroup.Root
                value={draftTextSize}
                onValueChange={(size) => setDraftTextSize(size as TextSizeOption)}
                dir={direction}
                aria-label={t(language, "settings.textSize")}
                className="masbaha-size-choices"
              >
                {(["small", "medium", "large"] as const).map((size) => (
                  <ChoiceRadioItem value={size} key={size}>
                    {t(
                      language,
                      size === "small"
                        ? "settings.textSmall"
                        : size === "large"
                          ? "settings.textLarge"
                          : "settings.medium",
                    )}
                  </ChoiceRadioItem>
                ))}
              </RadioGroup.Root>
              <div className="grid gap-2">
                {actions?.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant="ghost"
                    disabled={action.disabled}
                    onClick={action.onClick}
                    data-testid={action.testId}
                    className={`justify-start ${action.destructive ? "text-destructive" : ""}`}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </details>
        </div>
        <div className="masbaha-sheet-footer masbaha-draft-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" disabled={value === null}>
            {t(language, "counter.saveChanges")}
          </Button>
        </div>
      </form>
    </ResponsiveSheet>
  );
}
