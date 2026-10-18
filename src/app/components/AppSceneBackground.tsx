import { useCallback, useState } from "react";
import { useNow } from "../hooks/useNow";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { getHomeBackgroundCategory } from "../homeTime";
import type { LocationSettings } from "../types";
import { TimeOfDayBackground } from "./TimeOfDayBackground";

/** One stationary, cached Home scene shared by Glass layouts and navigation. */
export function AppSceneBackground({
  location,
  material,
  reduceTransparency,
  navigationOnly = false,
}: {
  location: LocationSettings;
  material: "system" | "glass";
  reduceTransparency: boolean;
  navigationOnly?: boolean;
}) {
  const now = useNow();
  const category = getHomeBackgroundCategory(now, location);
  const [failedCategory, setFailedCategory] = useState<string | null>(null);
  const fail = useCallback(() => setFailedCategory(category), [category]);
  const forcedColors = useMediaQuery("(forced-colors: active)");
  const systemReduced = useMediaQuery("(prefers-reduced-transparency: reduce)");
  if (forcedColors || (material === "system" && (reduceTransparency || systemReduced))) return null;
  const failed = failedCategory === category;
  return (
    <div className="app-scene" data-testid="app-scene" aria-hidden="true" data-failed={failed || undefined}>
      {!failed && (
        <TimeOfDayBackground
          categoryId={category}
          onFailure={fail}
          testId={navigationOnly ? "navigation-scene-window" : "time-of-day-scene-window"}
        />
      )}
    </div>
  );
}
