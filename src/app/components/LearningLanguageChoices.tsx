import { useId } from "react";
import { learningT } from "../i18n/learning";
import type { AppLanguage } from "../types";
import type { LearningLanguage } from "../learning/types";

export function LearningLanguageChoices({
  language,
  value,
  choices,
  onChange,
}: {
  language: AppLanguage;
  value: LearningLanguage;
  choices: LearningLanguage[];
  onChange: (value: LearningLanguage) => void;
}) {
  const name = useId();
  if (choices.length < 2) return null;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold">{learningT(language, "bookLanguage")}</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <label className="learn-radio" key={choice}>
            <input
              type="radio"
              name={name}
              value={choice}
              checked={value === choice}
              onChange={() => onChange(choice)}
            />
            <span>{learningT(language, choice === "ar" ? "arabicLanguage" : "englishLanguage")}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
