/** Shared paint/state recipes. Dimensions and alignment stay with each control. */
export const MENU_OPTION_STATE =
  "focus:bg-muted focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold";

export const CHOICE_SURFACE =
  "rounded-xl border border-border-control bg-card text-foreground transition-colors duration-fast hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10 focus-within:ring-[3px] focus-within:ring-ring";

export const NATIVE_RADIO = "size-5 shrink-0 accent-primary";
