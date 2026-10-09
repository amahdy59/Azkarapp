import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReaderReferenceSheet } from "./ReaderReferenceSheet";
import { ALL_AZKAR } from "../content/azkar";
import { FRIDAY_KAHF } from "../content/fridayKahf";

describe("Reader source-only references", () => {
  it("shows both Al-Kahf narrations with their separate references and named Friday-light grading", () => {
    render(
      <ReaderReferenceSheet
        open
        zikr={FRIDAY_KAHF[0]!}
        language="en"
        direction="ltr"
        onClose={() => {}}
        onAnnouncement={() => {}}
      />,
    );
    expect(screen.getByTestId("reference-hadith")).toHaveTextContent("protected from the Dajjal");
    expect(screen.getByTestId("reference-hadith")).toHaveTextContent("following Friday");
    expect(screen.getByTestId("reference-source")).toHaveTextContent("Sahih Muslim 809");
    expect(screen.getByTestId("reference-source")).toHaveTextContent("Mishkat al-Masabih 2175 — Hasan (Al-Albani)");
  });
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
