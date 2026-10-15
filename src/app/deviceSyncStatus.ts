import { useSyncExternalStore } from "react";

export type DeviceSyncStatus = "idle" | "syncing" | "saved" | "error";
export const DEVICE_SYNC_RETRY_EVENT = "azkar-device-sync-retry";
export function retryDeviceSync() {
  window.dispatchEvent(new Event(DEVICE_SYNC_RETRY_EVENT));
}
let status: DeviceSyncStatus = "idle";
const listeners = new Set<() => void>();
export function publishDeviceSyncStatus(next: DeviceSyncStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useDeviceSyncStatus() {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => "idle" as const,
  );
}
