import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CategoryId } from "../types";
import { AzkarLibraryScreen } from "./AzkarLibraryScreen";

describe("AzkarLibraryScreen comprehensive duas", () => {
  it("keeps the collection available from the Azkar Library every day", () => {
    const onComprehensiveDuas = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        onCategory={() => undefined}
        onComprehensiveDuas={onComprehensiveDuas}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const card = screen.getByRole("button", {
      name: "Comprehensive Duas. Available anytime • Also featured in Friday Mode",
    });
    fireEvent.click(card);

    expect(onComprehensiveDuas).toHaveBeenCalledOnce();
  });
});
