import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QiblaScreen } from "./QiblaScreen";

describe("QiblaScreen Task-First Experience", () => {
  it("renders distance to Kaaba and 3-step alignment guidance without requiring sensors in English", () => {
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
    expect(screen.getByText(/South-east · 136°/i)).toBeInTheDocument();

    // Distance to Kaaba
    expect(screen.getByText(/1,287 km to the Holy Kaaba/i)).toBeInTheDocument();

    // 3-step alignment guidance
    expect(screen.getByText("Finding the direction")).toBeInTheDocument();
    expect(screen.getByText(/Find North \(0°\) using any standard compass app/i)).toBeInTheDocument();
    expect(screen.getByText(/Turn clockwise to 136° \(South-east\)/i)).toBeInTheDocument();
    expect(screen.getByText("Align your prayer mat in this direction.")).toBeInTheDocument();
  });

  it("renders distance to Kaaba and 3-step alignment guidance with Arabic numerals and localization", () => {
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
    expect(screen.getByText(/الجنوب الشرقي · ١٣٦°/)).toBeInTheDocument();

    // Distance in Arabic numerals
    expect(screen.getByText(/١[,٬]?٢٨٧ كم إلى الكعبة المشرفة/)).toBeInTheDocument();

    // Arabic steps
    expect(screen.getByText("خطوات تحديد الاتجاه")).toBeInTheDocument();
    expect(screen.getByText(/حدّد الشمال \(٠°\) باستخدام أي تطبيق بوصلة/)).toBeInTheDocument();
    expect(screen.getByText(/استدر مع عقارب الساعة إلى ١٣٦° \(الجنوب الشرقي\)/)).toBeInTheDocument();
    expect(screen.getByText("اضبط سجادة الصلاة في هذا الاتجاه.")).toBeInTheDocument();
  });
});
