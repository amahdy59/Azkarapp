import waveforms from "./audioWaveforms.json";
import type { ResolvedAudioSegment } from "./audioTypes";

/** The checksum binds peaks to exact approved bytes, even after an asset replacement. */
export function getAudioWaveform(segment: ResolvedAudioSegment | null): readonly number[] | null {
  if (!segment) return null;
  try {
    const checksum = new URL(segment.url).searchParams.get("sha256");
    return checksum ? ((waveforms as Record<string, number[]>)[checksum] ?? null) : null;
  } catch {
    return null;
  }
}
