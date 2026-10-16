import { AzkarHeroBackground } from "./AzkarHeroBackground";
import type { AzkarBackgroundKey } from "./azkar-backgrounds";

export function TimeOfDayBackground({
  categoryId = "morning",
  onFailure,
}: {
  categoryId?: string;
  onFailure?: () => void;
}) {
  let kind: AzkarBackgroundKey = "morning";

  if (categoryId === "evening") {
    kind = "evening";
  } else if (categoryId === "before_sleep") {
    kind = "sleep";
  } else if (categoryId === "after_prayer") {
    kind = "prayer";
  } else if (categoryId === "friday_morning") {
    kind = "friday_morning";
  } else if (categoryId.includes("friday")) {
    kind = "friday";
  }

  return (
    <div
      data-testid="time-of-day-scene-window"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-on-media-surface"
      aria-hidden="true"
    >
      <AzkarHeroBackground
        kind={kind}
        priority={true}
        onFailure={onFailure}
        className="w-full h-full absolute inset-0 transition-opacity duration-entrance ease-out"
      />
      <div className="home-photo-scrim" aria-hidden="true" />
    </div>
  );
}
