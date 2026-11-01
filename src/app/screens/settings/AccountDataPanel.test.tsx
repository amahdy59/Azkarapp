import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountDataPanel } from "./AccountDataPanel";

afterEach(() => vi.unstubAllGlobals());

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

    await act(async () => {
      fireEvent.change(input!, { target: { files: [file] } });
    });

    expect(onRestoreData).toHaveBeenCalledWith('{"format":"azkarapp-backup"}');
    expect(screen.getByRole("button", { name: "Choose backup file" })).toBeInTheDocument();
  });
});

it("separates failed local saving, unconfirmed account sync and unverified offline availability with backup recovery", async () => {
  const props = {
    language: "en" as const,
    isGuest: false,
    isSyncing: false,
    syncError: "",
    syncStatus: "up-to-date" as const,
    lastSuccessfulSyncAt: "invalid",
    localSaveStatus: "error" as const,
    sessionCount: 1,
    savedCount: 2,
    onActivateAccount: vi.fn(),
    onSignOut: vi.fn(),
    onExportData: vi.fn(),
    onRestoreData: vi.fn(),
    onResetPreferences: vi.fn(),
    onClearLocalData: vi.fn(),
    onDeleteAccount: vi.fn(),
    onBack: vi.fn(),
    onRetrySave: vi.fn(),
    onRetrySync: vi.fn(),
  };
  render(<AccountDataPanel {...props} />);
  expect(screen.getByTestId("data-safety-summary")).toHaveTextContent("The latest save failed");
  expect(screen.getByTestId("data-safety-summary")).toHaveTextContent("No successful account sync is confirmed yet");
  expect(await screen.findByText(/Offline installation could not be confirmed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Export a restorable backup" }));
  fireEvent.click(screen.getByRole("button", { name: "Save again" }));
  expect(props.onExportData).toHaveBeenCalledOnce();
  expect(props.onRetrySave).toHaveBeenCalledOnce();
});

it("confirms offline shell only with an active worker and its cached index", async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
  const getRegistration = vi.fn().mockResolvedValue({ active: {} });
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { getRegistration } });
  vi.stubGlobal("caches", {
    keys: async () => ["unrelated-cache", "workbox-precache-v2"],
    open: async () => ({ match: async () => new Response("cached app") }),
  });
  try {
    render(
      <AccountDataPanel
        language="en"
        isGuest
        isSyncing={false}
        syncError=""
        syncStatus="up-to-date"
        lastSuccessfulSyncAt=""
        localSaveStatus="saved"
        sessionCount={0}
        savedCount={0}
        onActivateAccount={vi.fn()}
        onSignOut={vi.fn()}
        onExportData={vi.fn()}
        onRestoreData={vi.fn()}
        onResetPreferences={vi.fn()}
        onClearLocalData={vi.fn()}
        onDeleteAccount={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(await screen.findByText("The app shell is installed for offline use.")).toBeInTheDocument();
    getRegistration.mockResolvedValue(undefined);
    fireEvent.focus(window);
    expect(await screen.findByText(/Offline installation could not be confirmed/)).toBeInTheDocument();
  } finally {
    if (original) Object.defineProperty(navigator, "serviceWorker", original);
    else Reflect.deleteProperty(navigator, "serviceWorker");
  }
});
