import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppShareSheet from "./AppShareSheet";
import * as sharing from "../share/appSharing";
import { PLAY_STORE_QR, PLAY_STORE_URL } from "../share/appShareLinks";

const file = new File(["png"], "qr.png", { type: "image/png" });
const renderSheet = () => render(<AppShareSheet language="en" direction="ltr" onClose={() => undefined} />);
const shareButton = () => screen.getByRole("button", { name: "Share app", exact: true });
beforeEach(() => {
  vi.spyOn(sharing, "prepareAppQrFile").mockReturnValue(file);
  vi.spyOn(sharing, "canShareApplication").mockReturnValue(true);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("simple application sharing sheet", () => {
  it("shows one QR, one Share action and a quiet Copy action without a picker or normal URL field", async () => {
    const share = vi.spyOn(sharing, "shareApplication").mockResolvedValue("shared");
    renderSheet();
    await waitFor(() => expect(shareButton()).toBeEnabled());
    expect(screen.getByRole("img")).toHaveAttribute("src", PLAY_STORE_QR);
    expect(screen.getByRole("link")).toHaveAttribute("href", PLAY_STORE_URL);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3); // Close, Share, Copy.
    fireEvent.click(shareButton());
    await waitFor(() => expect(share).toHaveBeenCalledWith("Share app", file));
  });
  it("copies the one public link and reveals manual selection only if copying fails", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Copy failed. Copy this link manually.");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveFocus();
    fireEvent.focus(input);
    expect(input.selectionEnd! - input.selectionStart!).toBe(PLAY_STORE_URL.length);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await screen.findByText("Copied to clipboard.")).toBeInTheDocument();
    expect(writeText).toHaveBeenLastCalledWith(PLAY_STORE_URL);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
  it("serializes sharing and keeps cancellation quiet", async () => {
    let resolve!: (value: "cancelled") => void;
    const share = vi.spyOn(sharing, "shareApplication").mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    renderSheet();
    await waitFor(() => expect(shareButton()).toBeEnabled());
    fireEvent.click(shareButton());
    fireEvent.click(shareButton());
    expect(share).toHaveBeenCalledTimes(1);
    resolve("cancelled");
    expect(await screen.findByText("Sharing cancelled.")).toBeInTheDocument();
  });
  it("falls back to the same link action after PNG preparation failure", async () => {
    vi.mocked(sharing.prepareAppQrFile).mockImplementation(() => {
      throw new Error("file unavailable");
    });
    const share = vi.spyOn(sharing, "shareApplication").mockResolvedValue("shared");
    renderSheet();
    await waitFor(() => expect(shareButton()).toBeEnabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(shareButton());
    await waitFor(() => expect(share).toHaveBeenCalledWith("Share app", null));
  });
  it("offers one Copy action where system sharing is unavailable", () => {
    vi.mocked(sharing.canShareApplication).mockReturnValue(false);
    renderSheet();
    expect(screen.queryByRole("button", { name: "Share app", exact: true })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copy link" })).toHaveLength(1);
    expect(sharing.prepareAppQrFile).not.toHaveBeenCalled();
  });
  it("shows a recoverable error when sharing is rejected", async () => {
    vi.spyOn(sharing, "shareApplication").mockRejectedValue(new Error("denied"));
    renderSheet();
    await waitFor(() => expect(shareButton()).toBeEnabled());
    fireEvent.click(shareButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Sharing failed. Try Copy link.");
    expect(screen.getByRole("button", { name: "Copy link" })).toBeEnabled();
  });
});
