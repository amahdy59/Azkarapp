import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ list: vi.fn(), prepare: vi.fn(), download: vi.fn() }));
vi.mock("../../audio/audioOfflineCache", () => ({
  getSavedAudioFiles: mocks.list,
  prepareSavedAudioFile: mocks.prepare,
}));
vi.mock("../../share/shareDispatcher", () => ({ downloadFile: mocks.download }));
import { AudioFileExports } from "./AudioFileExports";
import { DEFAULT_AUDIO_PREFERENCES } from "../../audio/audioPreferences";
const props = {
  zikrs: [],
  preferences: DEFAULT_AUDIO_PREFERENCES,
  language: "en" as const,
  disabled: false,
  revision: 1,
};
function open() {
  const summary = screen.getByText("Save audio files to device");
  const details = summary.closest("details")!;
  details.open = true;
  fireEvent(details, new Event("toggle"));
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.list.mockResolvedValue([
    {
      id: "one",
      titleEnglish: "First recording",
      titleArabic: "التسجيل الأول",
      voiceName: "Reader",
      byteSize: 1000,
      fileName: "one.mp3",
    },
  ]);
  mocks.prepare.mockResolvedValue(new File(["audio"], "one.mp3", { type: "audio/mpeg" }));
});
describe("device audio exports", () => {
  it("loads on demand and delegates exactly one verified file to the browser", async () => {
    render(<AudioFileExports {...props} />);
    expect(mocks.list).not.toHaveBeenCalled();
    open();
    const button = await screen.findByRole("button", { name: "Save audio file · First recording · Reader" });
    fireEvent.click(button);
    await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
    expect(mocks.prepare).toHaveBeenCalledWith([], DEFAULT_AUDIO_PREFERENCES, "one");
    expect(screen.getByRole("status")).toHaveTextContent("Sent to your browser for saving");
    expect(screen.queryByText("File saved successfully")).not.toBeInTheDocument();
  });
  it("explains how to save when no verified downloads exist", async () => {
    mocks.list.mockResolvedValue([]);
    render(<AudioFileExports {...props} />);
    open();
    expect(await screen.findByText(/Download this group’s audio first/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("does not trigger an export on verification failure", async () => {
    mocks.prepare.mockRejectedValue(new Error("changed bytes"));
    render(<AudioFileExports {...props} />);
    open();
    fireEvent.click(await screen.findByRole("button", { name: /^Save audio file/ }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not verify this file"));
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it("does not initiate a browser download after navigating away during preparation", async () => {
    let complete!: (file: File) => void;
    mocks.prepare.mockReturnValue(
      new Promise<File>((resolve) => {
        complete = resolve;
      }),
    );
    const view = render(<AudioFileExports {...props} />);
    open();
    fireEvent.click(await screen.findByRole("button", { name: /^Save audio file/ }));
    view.unmount();
    await act(async () => complete(new File(["audio"], "one.mp3")));
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
