import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MushafTranslationControls } from "./MushafTranslationControls";

describe("MushafTranslationControls", () => {
  it.each(["ar", "en"] as const)("offers native keyboard selection and explicit exit in %s", async (language) => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onExit = vi.fn();
    render(<MushafTranslationControls language={language} pane="arabic" onSelect={onSelect} onExit={onExit} />);
    const arabic = screen.getByRole("radio", { name: "العربية", exact: true });
    const english = screen.getByRole("radio", { name: "English", exact: true });
    expect(arabic).toBeChecked();
    expect(english).not.toBeChecked();
    expect(arabic.nextElementSibling).toHaveAttribute("lang", "ar");
    expect(english.nextElementSibling).toHaveAttribute("lang", "en");
    await user.tab();
    expect(arabic).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenCalledWith("english");
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onExit).toHaveBeenCalledOnce();
  });
});
