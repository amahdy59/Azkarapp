import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccessibilityPanel } from "./AccessibilityPanel";

function renderPanel(overrides: Partial<Parameters<typeof AccessibilityPanel>[0]> = {}) {
  const props = {
    language: "en" as const,
    direction: "ltr" as const,
    textSize: "medium" as const,
    showTranslation: true,
    showTransliteration: true,
    highContrast: false,
    boldText: false,
    reduceMotion: false,
    reduceTransparency: false,
    hapticFeedback: true,
    forceRtl: false,
    colorBlindSupport: "none" as const,
    onTextSizeChange: vi.fn(),
    onShowTranslationChange: vi.fn(),
    onShowTransliterationChange: vi.fn(),
    onHighContrastChange: vi.fn(),
    onBoldTextChange: vi.fn(),
    onReduceMotionChange: vi.fn(),
    onReduceTransparencyChange: vi.fn(),
    onHapticFeedbackChange: vi.fn(),
    onForceRtlChange: vi.fn(),
    onColorBlindSupportChange: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
  render(<AccessibilityPanel {...props} />);
  return props;
}

describe("AccessibilityPanel", () => {
  it("exposes colour-blind support as one exclusive radio group, not four toggles", () => {
    renderPanel({ colorBlindSupport: "deuteranopia" });

    const group = screen.getByRole("radiogroup", { name: /Color-blind support/i });
    const options = within(group).getAllByRole("radio");

    // Four aria-pressed buttons announced as four unrelated on/off controls and
    // never conveyed that choosing one clears the others.
    expect(options).toHaveLength(4);
    expect(options.filter((option) => option.getAttribute("aria-checked") === "true")).toHaveLength(1);
    expect(screen.queryByRole("button", { pressed: true })).not.toBeInTheDocument();
  });

  it("reports the selected colour-blind option back to its owner", () => {
    const { onColorBlindSupportChange } = renderPanel();

    const group = screen.getByRole("radiogroup", { name: /Color-blind support/i });
    fireEvent.click(within(group).getAllByRole("radio")[1]!);

    expect(onColorBlindSupportChange).toHaveBeenCalledWith("deuteranopia");
  });

  it("no longer owns the calendar system setting", () => {
    renderPanel();

    // Moved to Settings → Preferences beside Language: it is a locale
    // preference, not an accessibility aid.
    expect(screen.queryByText(/Calendar System/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hijri/i)).not.toBeInTheDocument();
  });

  it("presents screen-reader support as help text rather than a control", () => {
    renderPanel();

    const note = screen.getByText(/Screen readers are supported/i);
    expect(note).toBeInTheDocument();
    // It used to render with the same row anatomy as the working toggles above
    // it, which gave it a control's affordance without a control's behaviour.
    expect(note.closest("button")).toBeNull();
  });

  it("offers reduce transparency beside the other legibility settings", () => {
    const props = renderPanel({ reduceTransparency: true });

    const toggle = screen.getByRole("switch", { name: /Reduce transparency/i });
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(props.onReduceTransparencyChange).toHaveBeenCalledWith(false);
  });
});
