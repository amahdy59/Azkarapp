import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormattedBenefit, parseBenefitText } from "./FormattedBenefit";

describe("FormattedBenefit Component", () => {
  it("parses title and bullet items correctly", () => {
    const rawText =
      "الاستعاذة من البخل والجبن وأرذل العمر\n• أرذل العمر: الشيخوخة الشديدة.\n• فتنة الدنيا: ما يختبر الدين.";
    const parsed = parseBenefitText(rawText);

    expect(parsed.title).toBe("الاستعاذة من البخل والجبن وأرذل العمر");
    expect(parsed.bullets).toHaveLength(2);
    expect(parsed.bullets[0]!.term).toBe("أرذل العمر");
    expect(parsed.bullets[0]!.definition).toBe("الشيخوخة الشديدة.");
    expect(parsed.bullets[1]!.term).toBe("فتنة الدنيا");
    expect(parsed.bullets[1]!.definition).toBe("ما يختبر الدين.");
  });

  it("renders structured benefit text cleanly in the DOM", () => {
    const rawText = "طلب العون على العبادة\n• حسن عبادتك: أداء العبادة بإخلاص ومتابعة وإتقان.";

    render(<FormattedBenefit text={rawText} isArabic={true} direction="rtl" />);

    expect(screen.getByText("طلب العون على العبادة")).toBeInTheDocument();
    expect(screen.getByText("حسن عبادتك:")).toBeInTheDocument();
    expect(screen.getByText("أداء العبادة بإخلاص ومتابعة وإتقان.")).toBeInTheDocument();
  });
});
