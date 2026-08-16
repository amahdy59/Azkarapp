import { AzkarHeroBackground } from "./AzkarHeroBackground";
import type { AzkarBackgroundKey } from "./azkar-backgrounds";

export function TimeOfDayBackground({ categoryId = "morning" }: { categoryId?: string }) {
  let kind: AzkarBackgroundKey = "morning";

  if (categoryId === "evening") {
    kind = "evening";
  } else if (categoryId === "before_sleep") {
    kind = "sleep";
  } else if (categoryId === "after_prayer") {
    kind = "prayer";
  } else if (categoryId.includes("friday")) {
    kind = "friday";
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <AzkarHeroBackground
        kind={kind}
        priority={true}
        className="w-full h-full absolute inset-0 transition-opacity duration-entrance ease-out"
      />
    </div>
  );
}
