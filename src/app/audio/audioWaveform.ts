import { AUDIO_WAVEFORM_PACK } from "./audioWaveformPack";
import type { ResolvedAudioSegment } from "./audioTypes";

/** The checksum binds peaks to exact approved bytes, even after an asset replacement. */
const decoded = new Map<string, readonly number[]>();
export function getAudioWaveform(segment: ResolvedAudioSegment | null): readonly number[] | null {
  if (!segment) return null;
  try {
    const checksum = new URL(segment.url).searchParams.get("sha256");
    if (!checksum) return null;
    const cached = decoded.get(checksum);
    if (cached) return cached;
    const packed = AUDIO_WAVEFORM_PACK[checksum];
    if (!packed) return null;
    const values = Array.from(atob(packed), (character) => character.charCodeAt(0));
    decoded.set(checksum, values);
    return values;
  } catch {
    return null;
  }
}
