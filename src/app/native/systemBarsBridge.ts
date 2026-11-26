import { registerPlugin } from "@capacitor/core";

interface SystemBarsPlugin {
  setBackground(options: { color: string }): Promise<void>;
}

const NativeSystemBars = registerPlugin<SystemBarsPlugin>("AzkarSystemBars");

export function setSystemBarBackground(color: string): Promise<void> {
  return NativeSystemBars.setBackground({ color });
}
