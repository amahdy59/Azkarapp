import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoreScreen } from "./MoreScreen";

describe("MoreScreen", () => {
  it("keeps secondary tools and settings in one accessible destination", () => {
    const onOpenQibla = vi.fn();
    const onOpenMasbaha = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <MoreScreen
        language="en"
        direction="ltr"
        onOpenQibla={onOpenQibla}
        onOpenMasbaha={onOpenMasbaha}
        onOpenSettings={onOpenSettings}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Qibla/ }));
    fireEvent.click(screen.getByRole("button", { name: /Masbaha/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Settings/ }));
    expect(onOpenQibla).toHaveBeenCalledOnce();
    expect(onOpenMasbaha).toHaveBeenCalledOnce();
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });
});
