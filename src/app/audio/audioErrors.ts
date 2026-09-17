import type { AudioPlaybackError } from "./audioTypes";

export function mapPlayError(error: unknown): AudioPlaybackError {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "NotAllowedError")
    return { code: "playback-blocked", message: "Playback was blocked. Press Play again." };
  if (name === "NotSupportedError")
    return { code: "unsupported-format", message: "This audio format is not supported." };
  return { code: "unknown", message: "Audio could not be played." };
}

export function mapMediaError(media: HTMLMediaElement): AudioPlaybackError {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { code: "offline-not-cached", message: "You appear to be offline and this audio has not been downloaded." };
  }
  switch (media.error?.code) {
    case 2:
      return { code: "network", message: "Audio could not be loaded.", mediaErrorCode: media.error.code };
    case 3:
      return { code: "decode", message: "This recording could not be decoded.", mediaErrorCode: media.error.code };
    case 4:
      return {
        code: "unsupported-format",
        message: "This recording is currently unavailable.",
        mediaErrorCode: media.error.code,
      };
    case 1:
      return { code: "unknown", message: "Audio loading was interrupted.", mediaErrorCode: media.error.code };
    default:
      return { code: "unknown", message: "Audio could not be loaded.", mediaErrorCode: media.error?.code };
  }
}
