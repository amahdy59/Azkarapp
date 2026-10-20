import { useEffect, useId, useRef, type ComponentType, type PointerEvent as ReactPointerEvent } from "react";
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
  const keyboardIntent = useRef(false);
  const pointerPosition = useRef<{ x: number; y: number } | undefined>(undefined);
  useEffect(() => {
    const trackPointer = (event: PointerEvent) => {
      const previous = pointerPosition.current;
      if (event.pointerType !== "mouse" || (previous && (previous.x !== event.clientX || previous.y !== event.clientY)))
        keyboardIntent.current = false;
      pointerPosition.current = { x: event.clientX, y: event.clientY };
    };
    const usePointer = () => {
      keyboardIntent.current = false;
    };
    document.addEventListener("pointermove", trackPointer, true);
    document.addEventListener("pointerdown", usePointer, true);
    return () => {
      document.removeEventListener("pointermove", trackPointer, true);
      document.removeEventListener("pointerdown", usePointer, true);
    };
  }, []);
  const useKeyboard = () => {
    keyboardIntent.current = true;
  };
  const preserveKeyboardFocus = (event: ReactPointerEvent) => {
    // WebKit emits stationary pointer events when a menu scrolls/repositions
    // beneath the cursor. Only actual pointer movement may take keyboard focus.
    if (keyboardIntent.current) event.preventDefault();
  };
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
          onKeyDownCapture={useKeyboard}
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
          onKeyDownCapture={useKeyboard}
          onPointerMoveCapture={preserveKeyboardFocus}
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
              onPointerLeave={preserveKeyboardFocus}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
