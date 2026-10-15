import { useEffect, useState } from "react";
import { CLOUDFLARE_DEVICE_EVENT, CLOUDFLARE_DEVICE_SECRET_KEY, hasCloudflareDevice } from "../../lib/cloudflareSync";

/** Storage can be denied even when the browser exposes localStorage. */
export function useDeviceLinkStatus() {
  const [linked, setLinked] = useState(hasCloudflareDevice);
  useEffect(() => {
    const refresh = () => setLinked(hasCloudflareDevice());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === CLOUDFLARE_DEVICE_SECRET_KEY) refresh();
    };
    window.addEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return linked;
}
