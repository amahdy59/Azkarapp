import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { loadReleaseNotes } = vi.hoisted(() => ({ loadReleaseNotes: vi.fn() }));

vi.mock("../../releaseNotes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../releaseNotes")>()),
  loadReleaseNotes,
}));

import { t } from "../../i18n";
import { WhatsNewPanel } from "./WhatsNewPanel";

const notes = {
  release: "2026-08-19",
  ar: ["تصفح المصحف", "بطاقة لكل صلاة", "اختيار القارئ"],
  en: ["Mushaf paging", "A card per prayer", "Choose a reciter"],
};

describe("WhatsNewPanel", () => {
  it("lists the deployed notes in the selected language", async () => {
    loadReleaseNotes.mockResolvedValue(notes);
    render(<WhatsNewPanel language="en" onBack={vi.fn()} />);

    await waitFor(() => expect(screen.getByText("Mushaf paging")).toBeInTheDocument());
    for (const note of notes.en) expect(screen.getByText(note)).toBeInTheDocument();
    expect(screen.queryByText(notes.ar[0])).not.toBeInTheDocument();
  });

  it("reads the Arabic notes when Azkar is in Arabic", async () => {
    loadReleaseNotes.mockResolvedValue(notes);
    render(<WhatsNewPanel language="ar" onBack={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(notes.ar[0])).toBeInTheDocument());
    expect(screen.queryByText(notes.en[0])).not.toBeInTheDocument();
  });

  it("explains itself instead of showing an empty list when the notes cannot be loaded", async () => {
    loadReleaseNotes.mockResolvedValue(null);
    render(<WhatsNewPanel language="en" onBack={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(t("en", "about.whatsNewUnavailable"))).toBeInTheDocument());
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
