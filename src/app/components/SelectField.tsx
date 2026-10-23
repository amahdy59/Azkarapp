import { useId } from "react";
import { FIELD_LABEL_CLASS } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import "./select-field.css";

/** Labelled single selection; the owning screen supplies all state and options. */
export function SelectField<Value extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  direction,
}: {
  label: string;
  hint?: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  direction: "ltr" | "rtl";
}) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-1.5">
      <label id={`${id}-label`} htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      <Select
        value={value}
        dir={direction}
        onValueChange={(next) => {
          const option = options.find((item) => item.value === next);
          if (option) onChange(option.value);
        }}
      >
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="select-field-trigger"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
