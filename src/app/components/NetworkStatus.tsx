import { useEffect, useState } from "react";

/** Announces connectivity changes while allowing locally stored reading and counting to continue. */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="network-status" role="status" aria-live="polite">
      You’re offline. Reading and progress continue locally; account sync will resume when connected.
    </div>
  );
}
