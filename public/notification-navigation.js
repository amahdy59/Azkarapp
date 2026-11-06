/* global self, URL */
/* Local notification taps use only routes inside this worker's own app scope. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const value = event.notification.data?.url;
      if (typeof value !== "string") return;
      const scope = new URL(self.registration.scope);
      let target;
      try {
        target = new URL(value, scope);
      } catch {
        return;
      }
      if (target.origin !== scope.origin || target.pathname !== scope.pathname || target.search) return;
      if (
        !/^#\/(?:prayer\/(?:fajr|dhuhr|asr|maghrib|isha)|azkar\/[a-z0-9-]+|friday\/salawat|settings\/notifications)$/.test(
          target.hash,
        )
      )
        return;
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((client) => {
        const url = new URL(client.url);
        return url.origin === scope.origin && url.pathname === scope.pathname;
      });
      if (existing) {
        await existing.navigate(target.href);
        await existing.focus();
      } else await self.clients.openWindow(target.href);
    })(),
  );
});
