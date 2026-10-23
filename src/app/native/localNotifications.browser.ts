/** Compile-time browser adapter for the Android-only Local Notifications plugin. */
export const LocalNotifications = {
  async schedule() {
    throw new Error("Native notifications are unavailable in the browser.");
  },
};
