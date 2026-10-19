import { Check, ChevronLeft, ChevronRight } from "./icons";
import { Button } from "./ui/button";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import "./sharing-steps.css";

export type SharingStep = "content" | "design" | "share";

/** Physical icons avoid inherited RTL mirroring outside the dialog's language. */
export function SharingArrow({ language, action }: { language: AppLanguage; action: "previous" | "next" }) {
  const pointsRight = (action === "next") === (language === "en");
  const Icon = pointsRight ? ChevronRight : ChevronLeft;
  return <Icon aria-hidden="true" />;
}
interface SharingStepsProps {
  steps: readonly SharingStep[];
  step: SharingStep;
  onChange: (step: SharingStep) => void;
  language: AppLanguage;
  disabled?: boolean;
}

/** Ordinary navigation, not tabs: every step is editable without losing choices. */
export function SharingSteps({ steps, step, onChange, language, disabled }: SharingStepsProps) {
  const current = steps.indexOf(step);
  return (
    <nav aria-label={t(language, "shareStudio.steps")} className="sharing-steps">
      <ol>
        {steps.map((value, index) => (
          <li key={value}>
            <button
              type="button"
              aria-current={step === value ? "step" : undefined}
              aria-label={`${t(language, `shareStudio.step${value}`)}, ${t(language, "shareStudio.stepCount", {
                current: formatNumerals(index + 1, language),
                total: formatNumerals(steps.length, language),
              })}`}
              disabled={disabled}
              onClick={() => onChange(value)}
            >
              <span className="sharing-step-number" aria-hidden="true">
                {index < current ? <Check className="size-4" /> : formatNumerals(index + 1, language)}
              </span>
              <span>{t(language, `shareStudio.step${value}`)}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SharingStepNavigation({ steps, step, onChange, language, disabled }: SharingStepsProps) {
  const index = steps.indexOf(step);
  return (
    <div className="sharing-step-navigation">
      <Button
        variant="outline"
        aria-label={t(language, "shareStudio.previousStep")}
        disabled={disabled || index === 0}
        onClick={() => onChange(steps[index - 1]!)}
      >
        <SharingArrow language={language} action="previous" />
        {t(language, "common.previous")}
      </Button>
      {index < steps.length - 1 && (
        <Button
          aria-label={t(language, "shareStudio.nextStep")}
          disabled={disabled}
          onClick={() => onChange(steps[index + 1]!)}
        >
          {t(language, "common.next")}
          <SharingArrow language={language} action="next" />
        </Button>
      )}
    </div>
  );
}
