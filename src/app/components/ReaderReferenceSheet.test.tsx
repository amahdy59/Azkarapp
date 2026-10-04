import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReaderReferenceSheet } from "./ReaderReferenceSheet";
import { ALL_AZKAR } from "../content/azkar";

describe("Reader source-only references", () => {
  it("retains its citation when there is no supporting narration", () => {
    const zikr = ALL_AZKAR.find((item) => item.id === "in-prayer-introduction")!;
    expect(zikr.hadithText).toBeUndefined();
    render(
      <ReaderReferenceSheet
        open
        zikr={zikr}
        language="en"
        direction="ltr"
        onClose={() => {}}
        onAnnouncement={() => {}}
      />,
    );
    expect(screen.getByTestId("reference-source")).toHaveTextContent(zikr.sourceReference);
    expect(screen.getByTestId("reference-source")).toHaveAttribute("lang", "en");
    expect(screen.queryByTestId("reference-hadith")).not.toBeInTheDocument();
  });
});
