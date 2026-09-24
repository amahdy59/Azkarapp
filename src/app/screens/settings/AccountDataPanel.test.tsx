import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountDataPanel } from "./AccountDataPanel";

describe("AccountDataPanel", () => {
  it("reads a selected JSON backup and hands its text to the restore boundary", async () => {
    const onRestoreData = vi.fn();
    const props = {
      language: "en" as const,
      isGuest: true,
      isSyncing: false,
      syncError: "",
      syncStatus: "up-to-date" as const,
      lastSuccessfulSyncAt: "",
      sessionCount: 0,
      savedCount: 0,
      onActivateAccount: vi.fn(),
      onSignOut: vi.fn(),
      onExportData: vi.fn(),
      onRestoreData,
      onResetPreferences: vi.fn(),
      onClearLocalData: vi.fn(),
      onDeleteAccount: vi.fn(),
      onBack: vi.fn(),
    };
    const { container } = render(<AccountDataPanel {...props} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    const file = new File(["{}"], "azkar-backup.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.resolve('{"format":"azkarapp-backup"}') });

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => expect(onRestoreData).toHaveBeenCalledWith('{"format":"azkarapp-backup"}'));
    expect(screen.getByRole("button", { name: "Choose backup file" })).toBeInTheDocument();
  });
});
