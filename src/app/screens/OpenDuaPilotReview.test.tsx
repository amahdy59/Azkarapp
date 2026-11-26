import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenDuaPilotReview } from "./OpenDuaPilotReview";
import { OPEN_DUA_PILOT } from "../audio/openDuaPilot";

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
});
describe("OpenDua comparison review", () => {
  it("starts on the existing recording and explicitly switches to the local additional voice", async () => {
    const onPlay = vi.fn();
    const mounted = render(<OpenDuaPilotReview language="en" onPlay={onPlay} />);
    const current = screen.getByLabelText("Review recording player");
    expect(current.getAttribute("src")).toContain("sha256=");
    expect(screen.getByRole("radio", { name: "Current recording" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Muhammad Jumah · OpenDua" }));
    const additional = screen.getByLabelText("Review recording player");
    expect(additional.getAttribute("src")).toContain("OD-003.mp3");
    fireEvent.play(additional);
    expect(onPlay).toHaveBeenCalledOnce();
    fireEvent.error(additional);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
    mounted.unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it("saves named recording-specific findings, exports all samples, and restores notes", async () => {
    const user = userEvent.setup();
    const mounted = render(<OpenDuaPilotReview language="en" />);
    await user.click(screen.getByRole("combobox", { name: "Listening review result" }));
    expect(screen.getByRole("option", { name: "Listened and exact match confirmed" })).toHaveAttribute("data-disabled");
    await user.keyboard("{Escape}");
    fireEvent.change(screen.getByRole("textbox", { name: "Reviewer name" }), { target: { value: "Test reviewer" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Review notes" }), { target: { value: "Test note only." } });
    const exported = JSON.parse(
      decodeURIComponent(
        screen.getByRole("link", { name: "Export all review notes" }).getAttribute("href")!.split(",")[1]!,
      ),
    );
    expect(exported.candidates[0]).toMatchObject({
      reviewStatus: "pending",
      review: { reviewer: "Test reviewer", notes: "Test note only." },
    });
    expect(exported.candidates[1].review.reviewer).toBe("");
    mounted.unmount();
    render(<OpenDuaPilotReview language="en" />);
    expect(screen.getByRole("textbox", { name: "Review notes" })).toHaveValue("Test note only.");
    expect(
      JSON.parse(localStorage.getItem("azkar.opendua-pilot-review.v1")!)[OPEN_DUA_PILOT.candidates[0]!.sha256].decision,
    ).toBe("unreviewed");
  });
  it("uses RTL Arabic with the exact source transcript and reports storage failure without losing the export", () => {
    render(<OpenDuaPilotReview language="ar" />);
    expect(screen.getByRole("region").getAttribute("dir")).toBe("rtl");
    expect(screen.getByText(OPEN_DUA_PILOT.candidates[0]!.transcriptArabic)).toHaveAttribute("lang", "ar");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    fireEvent.change(screen.getByRole("textbox", { name: "ملاحظات المراجعة" }), {
      target: { value: "ملاحظة تجريبية" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("تعذّر حفظ");
    expect(
      decodeURIComponent(screen.getByRole("link", { name: "تصدير جميع ملاحظات المراجعة" }).getAttribute("href")!),
    ).toContain("ملاحظة تجريبية");
  });
});
