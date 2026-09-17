import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OasisPreviewScreen } from "./OasisPreviewScreen";

describe("OasisPreviewScreen", () => {
  it("renders Arabic version with proper title and elements", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="ar" direction="rtl" onBack={onBack} />);

    expect(screen.getByRole("heading", { level: 1, name: "معمل الواحة الروحية" })).toBeInTheDocument();
    expect(screen.getByText("محاكي المستويات")).toBeInTheDocument();
    expect(screen.getByText("بياناتي الحقيقية")).toBeInTheDocument();
    expect(screen.getByText("إيقاع الواحة على مدار ٧ أيام")).toBeInTheDocument();
    expect(screen.getByText("دليل مستويات الواحة الروحية")).toBeInTheDocument();
  });

  it("renders English version with proper title", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="en" direction="ltr" onBack={onBack} />);

    expect(screen.getByRole("heading", { level: 1, name: "Spiritual Oasis Lab" })).toBeInTheDocument();
    expect(screen.getByText("Interactive Simulator")).toBeInTheDocument();
    expect(screen.getByText("7-Day Oasis Rhythm")).toBeInTheDocument();
    expect(screen.getByText("Spiritual Oasis Metaphor Guide")).toBeInTheDocument();
  });

  it("calls onBack when back button is pressed", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="ar" direction="rtl" onBack={onBack} />);

    const backBtn = screen.getByRole("button", { name: "العودة للرئيسية" });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("allows selecting level presets to update simulation state", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="ar" direction="rtl" onBack={onBack} />);

    // Click Level 5 (واحة مزدهرة) preset button
    const oasisPresetBtn = screen.getByRole("button", { name: /واحة مزدهرة/ });
    fireEvent.click(oasisPresetBtn);

    // Heading should reflect Level 5 (واحة مزدهرة)
    const headings = screen.getAllByText("واحة مزدهرة");
    expect(headings.length).toBeGreaterThan(0);

    // Click Level 1 (قطرة الندى) preset button
    const dropletPresetBtn = screen.getByRole("button", { name: /قطرة الندى/ });
    fireEvent.click(dropletPresetBtn);

    const dropletHeadings = screen.getAllByText("قطرة الندى");
    expect(dropletHeadings.length).toBeGreaterThan(0);
  });

  it("allows switching between Simulator and Real Data modes", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="en" direction="ltr" onBack={onBack} />);

    const realDataTab = screen.getByRole("tab", { name: "Real App Data" });
    fireEvent.click(realDataTab);
    expect(realDataTab).toHaveAttribute("aria-selected", "true");

    const simTab = screen.getByRole("tab", { name: "Interactive Simulator" });
    fireEvent.click(simTab);
    expect(simTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders embedded DailyCompanionsCard with interactive toggles", () => {
    const onBack = vi.fn();
    render(<OasisPreviewScreen language="ar" direction="rtl" onBack={onBack} />);

    expect(screen.getByTestId("daily-companions-card")).toBeInTheDocument();
    expect(screen.getByText("ورد القرآن الكريم")).toBeInTheDocument();
    expect(screen.getByText("صلوات المسجد في جماعة")).toBeInTheDocument();
  });
});
