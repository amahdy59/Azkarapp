import { useId, type ReactNode } from "react";
import { Check } from "./icons";
import { Button } from "./ui/button";

/** Illustrated choices retain their label, description and check in either direction. */
export function SharingArtworkChoice({
  icon,
  label,
  description,
  selected,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const descriptionId = useId();
  return (
    <Button
      type="button"
      variant="outline"
      className="sharing-artwork-choice"
      aria-label={label}
      aria-describedby={descriptionId}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sharing-choice-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="sharing-choice-copy">
        <span className="sharing-choice-title">{label}</span>
        <span id={descriptionId} className="sharing-choice-description">
          {description}
        </span>
      </span>
      <span className="sharing-choice-check" aria-hidden="true">
        {selected && <Check className="size-3" />}
      </span>
    </Button>
  );
}
