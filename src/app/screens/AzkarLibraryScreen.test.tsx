import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CategoryId } from "../types";
import { AzkarLibraryScreen } from "./AzkarLibraryScreen";

describe("AzkarLibraryScreen comprehensive duas", () => {
  it("keeps the collection available from the Azkar Library every day", () => {
    const onCategory = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={onCategory}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const card = screen.getByRole("button", {
      name: "Comprehensive Duas, 0 of 47 complete",
    });
    fireEvent.click(card);

    expect(onCategory).toHaveBeenCalledWith("comprehensive_duas");
  });
});
