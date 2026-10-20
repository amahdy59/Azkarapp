import { useId, type ComponentType } from "react";
import type { AppLanguage } from "../types";
import { FIELD_LABEL_CLASS } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

/** Progress filters share the application's menu, focus and selection behavior. */
export function ProgressSelectField<Value extends string>({
  label,
  value,
  options,
  onChange,
  language,
  icon: Icon,
  className = "",
  triggerId,
  onCloseAutoFocus,
}: {
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  language: AppLanguage;
  icon: ComponentType<{ className?: string }>;
  className?: string;
  triggerId?: string;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const generatedId = useId();
  const id = triggerId ?? generatedId;
  return (
    <div className={`progress-select-field min-w-0 space-y-1 ${className}`}>
      <label id={`${id}-label`} htmlFor={id} className={`block ${FIELD_LABEL_CLASS}`}>
        {label}
      </label>
      <Select value={value} onValueChange={(next) => onChange(next as Value)} dir={language === "ar" ? "rtl" : "ltr"}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          className="progress-select-trigger"
          data-progress-value={value}
        >
          <span className="progress-select-leading" aria-hidden="true">
            <Icon className="size-4" />
          </span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          onCloseAutoFocus={onCloseAutoFocus}
          align="start"
          sideOffset={4}
          collisionPadding={12}
          className="progress-select-content"
          aria-labelledby={`${id}-label`}
          viewportProps={{
            // Enlarged labels can scroll even in a five-option menu. Give its
            // viewport direct keyboard access alongside Radix option navigation.
            tabIndex: 0,
            role: "group",
            "aria-labelledby": `${id}-label`,
            className:
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          }}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              textValue={option.label}
              data-progress-value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
