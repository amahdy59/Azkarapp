import { Capacitor } from "@capacitor/core";

export const isNativeAndroid = () => Capacitor.getPlatform() === "android";
