import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ZikrShareButton } from "./ZikrShareButton";

describe("ZikrShareButton", () => {
  it("uses caller-provided accessible labels without hardcoded UI copy", () => {
    render(
      <ZikrShareButton
        card={{ language: "ar", arabicText: "سُبْحَانَ اللَّهِ" }}
        labels={{
          action: "مشاركة الذكر",
          generating: "جارٍ إعداد البطاقة",
          openingShareSheet: "جارٍ فتح المشاركة",
          shared: "تمت المشاركة",
          copying: "جارٍ نسخ البطاقة",
          copied: "تم نسخ البطاقة",
          downloading: "جارٍ تنزيل البطاقة",
          downloaded: "تم تنزيل البطاقة",
          cancelled: "أُلغيت المشاركة",
          error: "تعذرت مشاركة البطاقة",
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "مشاركة الذكر" });
    expect(button).toHaveAttribute("aria-describedby");
    expect(button).toHaveClass("min-h-11");
  });
});
