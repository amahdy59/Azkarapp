export function isNativeAndroid() {
  return false;
}

export async function shareWithAndroid() {
  throw new Error("Native sharing is unavailable in the browser.");
}

export async function saveWithAndroid() {
  throw new Error("Native saving is unavailable in the browser.");
}
