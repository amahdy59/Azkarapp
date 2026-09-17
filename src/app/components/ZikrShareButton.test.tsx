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

    // Touch-target contract (docs/DESIGN_SYSTEM.md): at least 44 CSS px, and
    // expressed as a *minimum* rather than a fixed height so a long or wrapped
    // Arabic label (or 200% text scaling) grows the button instead of clipping.
    const classes = button.className.split(/\s+/);
    const minHeight = classes.find((cls) => /^min-h-\d+$/.test(cls));
    expect(minHeight).toBeDefined();
    expect(Number(minHeight!.replace("min-h-", "")) * 4).toBeGreaterThanOrEqual(44);
    expect(classes.some((cls) => /^h-\d+$/.test(cls))).toBe(false);
  });
});
