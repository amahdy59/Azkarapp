import { useEffect, useRef } from "react";

/**
 * Focuses the main content area or screen heading upon navigation,
 * sets the document title, and announces the screen name to screen readers.
 */
export function useScreenFocus(screenName?: string) {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (screenName) {
      document.title = `${screenName} - Azkar`;
    }

    // Only move focus on navigation, not on initial app load,
    // to avoid stealing focus if the user is already interacting.
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Attempt to find the main landmark or a suitable heading
    const focusTarget =
      document.querySelector("main") ||
      document.querySelector("h1") ||
      document.getElementById("main-content");

    if (focusTarget) {
      // Temporarily make the target focusable if it isn't naturally
      const prevTabIndex = focusTarget.getAttribute("tabindex");
      if (prevTabIndex === null) {
        focusTarget.setAttribute("tabindex", "-1");
      }
      
      (focusTarget as HTMLElement).focus({ preventScroll: true });
      
      // Clean up tabindex if we added it temporarily
      const handleBlur = () => {
        if (prevTabIndex === null) {
          focusTarget.removeAttribute("tabindex");
        }
        focusTarget.removeEventListener("blur", handleBlur);
      };
      focusTarget.addEventListener("blur", handleBlur);
    }
  }, [screenName]);
}
