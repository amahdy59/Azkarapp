import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getAzkarForPrayer } from "../content/azkar";
import { AzkarListLayout } from "./AzkarListLayout";

describe("after-prayer learning groups", () => {
  it.each(["ar", "en"] as const)(
    "groups related entries with independent actions and complete-group progress in %s",
    (language) => {
      const azkar = getAzkarForPrayer("dhuhr", "core");
      const onRead = vi.fn();
      const props = {
        azkar,
        catId: "after_prayer" as const,
        isMainRoutine: true,
        routineMode: "core" as const,
        language,
        renderZikrCard: ({ z, index }: { z: (typeof azkar)[number]; index: number }, completed: boolean) => (
          <button onClick={() => onRead(index)} aria-pressed={completed}>
            {z.id}
          </button>
        ),
      };
      const { container, rerender } = render(<AzkarListLayout {...props} completed={new Set(["ap-ref-1"])} />);
      expect(
        screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent?.split(" · ")[0]),
      ).toEqual(language === "ar" ? ["١", "٢", "٣", "٤", "٥"] : ["1", "2", "3", "4", "5"]);
      const opening = container.querySelector('[data-ritual-group="prayer_opening"]')!;
      expect(
        within(opening as HTMLElement)
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual(["ap-ref-1", "ap-ref-2"]);
      expect(opening.closest("section")).toHaveTextContent(language === "ar" ? "٠/١" : "0/1");
      fireEvent.click(within(opening as HTMLElement).getByRole("button", { name: "ap-ref-2" }));
      expect(onRead).toHaveBeenCalledWith(1);
      rerender(<AzkarListLayout {...props} completed={new Set(["ap-ref-1", "ap-ref-2"])} />);
      expect(opening.closest("section")).toHaveTextContent(language === "ar" ? "١/١" : "1/1");
      const tasbih = container.querySelector('[data-ritual-group="prayer_tasbih"]')!;
      expect(within(tasbih as HTMLElement).getAllByRole("button")).toHaveLength(4);
      expect(within(tasbih as HTMLElement).getByRole("button", { name: "ap-tasbeeh-tawhid" })).toBeInTheDocument();
      expect(screen.queryByText(language === "ar" ? "تسبيح فاطمة" : "Tasbih Fatimah")).not.toBeInTheDocument();
    },
  );
});
