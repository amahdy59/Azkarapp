import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "m.azkar.com",
  appName: "AzkarApp",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      // Reuse the launcher foreground mark for Android's status-bar glyph.
      // Capacitor resolves this name from android/app/src/main/res/drawable.
      smallIcon: "widget_mark",
      iconColor: "#F4E5C6",
    },
    LiveUpdate: {
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
      readyTimeout: 15_000,
    },
  },
};

export default config;
