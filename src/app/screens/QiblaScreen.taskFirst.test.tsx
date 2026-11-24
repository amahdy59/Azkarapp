import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QiblaScreen } from "./QiblaScreen";

describe("QiblaScreen Task-First Experience", () => {
  it("renders a visual Kaaba direction and static fallback without requiring sensors in English", () => {
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "Cairo",
          calculationMethod: 5,
          autoDetect: false,
        }}
        reduceMotion={false}
        onBack={vi.fn()}
      />,
    );

    // Bearing & Cardinal
    expect(screen.getByText(/Qibla is 136° from north/i)).toBeInTheDocument();
    expect(screen.getByText(/South-east/i)).toBeInTheDocument();

    expect(screen.queryByText(/1,287 km to the Holy Kaaba/i)).not.toBeInTheDocument();

    expect(screen.getByRole("img", { name: /Visual direction to the Kaaba at 136 degrees/ })).toBeVisible();
    expect(screen.getByText("Static view — does not track your phone")).toBeVisible();
    expect(screen.getByRole("button", { name: "Enable live compass" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText(/1,287 km to the Holy Kaaba/i)).toBeVisible();
    expect(screen.getByText("Find north, then turn clockwise to the bearing above.")).toBeInTheDocument();
  });

  it("renders the visual direction with Arabic numerals and localization", () => {
    render(
      <QiblaScreen
        language="ar"
        direction="rtl"
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "القاهرة",
          calculationMethod: 5,
          autoDetect: false,
        }}
        reduceMotion={false}
        onBack={vi.fn()}
      />,
    );

    // Bearing & Cardinal in Arabic
    expect(screen.getByText(/اتجاه القبلة ١٣٦° من الشمال/)).toBeInTheDocument();
    expect(screen.getByText(/الجنوب الشرقي/)).toBeInTheDocument();

    expect(screen.queryByText(/١[,٬]?٢٨٧ كم إلى الكعبة المشرفة/)).not.toBeInTheDocument();

    expect(screen.getByRole("img", { name: /اتجاه مرئي إلى الكعبة بزاوية ١٣٦ درجة/ })).toBeVisible();
    expect(screen.getByText("رسم ثابت — لا يتتبع حركة الهاتف")).toBeVisible();
    expect(screen.getByRole("button", { name: "تشغيل البوصلة المباشرة" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "التفاصيل" }));
    expect(screen.getByText(/١[,٬]?٢٨٧ كم إلى الكعبة المشرفة/)).toBeVisible();
  });
});
