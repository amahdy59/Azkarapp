import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QrSyncPanel } from "./QrSyncPanel";
import { CLOUDFLARE_DEVICE_SECRET_KEY } from "../../../lib/cloudflareSync";

describe("QrSyncPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders initial unlinked state with This Device and Link Another Device cards", () => {
    render(<QrSyncPanel language="en" />);

    expect(screen.getByText("This device")).toBeInTheDocument();
    expect(screen.getByText("Not connected to other devices")).toBeInTheDocument();
    expect(screen.getByText("Link another device")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate code" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unlink this device" })).not.toBeInTheDocument();
  });

  it("renders linked state when device secret exists, with unlink confirmation", async () => {
    localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, "test-secret");

    render(<QrSyncPanel language="en" />);

    expect(screen.getByText("Connected and syncing")).toBeInTheDocument();
    const unlinkBtn = screen.getByRole("button", { name: "Unlink this device" });
    expect(unlinkBtn).toBeInTheDocument();

    // Clicking unlink shows confirmation prompt
    fireEvent.click(unlinkBtn);
    expect(screen.getByText(/Are you sure you want to unlink this device\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, unlink device" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    // Clicking Cancel returns to normal
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Unlink this device" })).toBeInTheDocument();
  });

  it("generates QR code and displays countdown timer", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/devices")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ secret: "new-secret" }),
        });
      }
      if (url.includes("/v1/pairings/qr")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ dataUrl: "data:image/png;base64,mockqr" }),
        });
      }
      if (url.includes("/v1/pairings")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: "test-token-123", expiresIn: 300 }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof fetch;

    render(<QrSyncPanel language="en" />);

    const generateBtn = screen.getByRole("button", { name: "Generate code" });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByAltText("Temporary sync QR code")).toBeInTheDocument();
      expect(screen.getByText(/Code expires in/i)).toBeInTheDocument();
    });
  });

  it("handles Arabic localization", () => {
    render(<QrSyncPanel language="ar" />);

    expect(screen.getByText("هذا الجهاز")).toBeInTheDocument();
    expect(screen.getByText("غير متصل بأجهزة أخرى")).toBeInTheDocument();
    expect(screen.getByText("ربط جهاز آخر")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إنشاء رمز" })).toBeInTheDocument();
  });

  it("allows an already revoked device to unlink locally and blocks duplicate actions", async () => {
    localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, "revoked-secret");
    let finish!: (response: Response) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
    render(<QrSyncPanel language="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Unlink this device" }));
    const confirm = screen.getByRole("button", { name: "Yes, unlink device" });
    fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generate code" })).toBeDisabled();
    finish(new Response(null, { status: 401 }));
    await waitFor(() => expect(localStorage.getItem(CLOUDFLARE_DEVICE_SECRET_KEY)).toBeNull());
    expect(screen.queryByRole("button", { name: "Unlink this device" })).not.toBeInTheDocument();
  });
});
