import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import history from "../../releaseHistory.data.json";
import { describe, expect, it, vi } from "vitest";

const { loadReleaseNotes } = vi.hoisted(() => ({ loadReleaseNotes: vi.fn() }));

vi.mock("../../releaseNotes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../releaseNotes")>()),
  loadReleaseNotes,
}));
vi.mock("../../releaseHistory", () => ({ latestBundledRelease: history[0], loadReleaseHistory: async () => history }));

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

  it("keeps the bundled latest and earlier notes available offline", async () => {
    loadReleaseNotes.mockResolvedValue(null);
    render(<WhatsNewPanel language="en" onBack={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(t("en", "about.releaseNotesOffline"))).toBeInTheDocument());
    expect(
      within(
        screen.getByRole("region", { name: t("en", "about.releaseVersion", { release: history[0]!.release }) }),
      ).getByText(history[0]!.en[0]!),
    ).toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll("details")).toHaveLength(19));
    fireEvent.click(screen.getByRole("button", { name: t("en", "about.moreReleases") }));
    expect(document.querySelectorAll("details")).toHaveLength(39);
  });
});
