import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.azkarapp.app",
  appName: "AzkarApp",
  webDir: "dist",
  plugins: {
    LiveUpdate: {
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
      readyTimeout: 15_000,
    },
  },
};

export default config;
