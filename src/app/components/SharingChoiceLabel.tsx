import type { ReactNode } from "react";
import { Check } from "./icons";

/** Fixed physical-right selection slot; symmetric slots keep labels centered. */
export function SharingChoiceLabel({ selected, children }: { selected: boolean; children: ReactNode }) {
  return (
    <span className="grid w-full items-center" dir="ltr" style={{ gridTemplateColumns: "16px minmax(0,1fr) 16px" }}>
      <span aria-hidden="true" />
      <span dir="auto" className="min-w-0 w-full break-words text-center">
        {children}
      </span>
      <span aria-hidden="true" className="flex items-center justify-center">
        <Check aria-hidden="true" style={{ width: 16, height: 16, visibility: selected ? "visible" : "hidden" }} />
      </span>
    </span>
  );
}

export const SHARING_SELECTED_CLASS = "border-primary bg-muted text-foreground";
