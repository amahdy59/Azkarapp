import { parseLocation } from "./routing";

export const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

export const loadHomeScreen = () => import("./screens/HomeScreen").then(({ HomeScreen }) => ({ default: HomeScreen }));

export function isHomeStartup(search: string, hash: string, onboardingComplete: boolean) {
  const route = parseLocation(search, hash);
  if (route && route.view !== "home") return false;
  const shortcut = new URLSearchParams(search).get("category");
  if (shortcut === "morning" || shortcut === "evening" || shortcut === "before_sleep") return false;
  return route?.view === "home" || onboardingComplete;
}
