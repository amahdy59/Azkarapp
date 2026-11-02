/** Shared paint/state recipes. Dimensions and alignment stay with each control. */
import "./pill-controls.css";
export const PILL_GROUP = "choice-pill p-1";
export const PILL_OPTION = "choice-pill-option";
export const NAVIGATION_FOCUS = "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";
export const MENU_OPTION_STATE =
  "focus:bg-muted focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold";

export const CHOICE_SURFACE =
  "rounded-xl border border-border-control bg-card text-foreground transition-colors duration-fast hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10 focus-within:ring-[3px] focus-within:ring-ring";

export const NATIVE_RADIO = "size-5 shrink-0 accent-primary";

export const PEER_TAB_SELECTED = "bg-primary/10 text-foreground shadow-xs ring-1 ring-inset ring-primary/50";
