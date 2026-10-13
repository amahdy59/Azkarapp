import type { KeyboardEvent } from "react";

/** Immediate radio navigation avoids Radix's deferred-focus/key-release race. */
export function handleRadioNavigation(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const group = event.currentTarget.closest('[role="radiogroup"]');
  if (!group) return;
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.click();
    return;
  }
  const rtl = group.getAttribute("dir") === "rtl";
  const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
  const backward = event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
  if (!forward && !backward && event.key !== "Home" && event.key !== "End") return;
  const choices = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]')).filter(
    (item) => !item.disabled && item.getAttribute("aria-disabled") !== "true",
  );
  const index = choices.indexOf(event.currentTarget);
  if (index < 0) return;
  const next =
    choices[
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? choices.length - 1
          : (index + (forward ? 1 : -1) + choices.length) % choices.length
    ];
  // Radix defers roving focus. A quick keyup can clear its selection intent
  // before focus arrives; commit this navigation in the original key event.
  event.preventDefault();
  next?.focus();
  next?.click();
}
