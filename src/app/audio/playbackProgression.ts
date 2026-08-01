import type { PlaybackPlan } from "./audioTypes";

export interface PlaybackPosition {
  entryIndex: number;
  segmentIndex: number;
  repetitionIndex: number;
}

export type PlaybackProgression =
  { complete: true } | { complete: false; position: PlaybackPosition; repetitionCompleted: boolean };

export function getNextPlaybackPosition(
  plan: PlaybackPlan,
  position: PlaybackPosition,
  voiceId: string,
): PlaybackProgression {
  const entry = plan.entries[position.entryIndex];
  const segments = entry?.segmentsByVoice[voiceId];
  if (!entry || !segments) return { complete: true };

  if (position.segmentIndex + 1 < segments.length) {
    return {
      complete: false,
      position: { ...position, segmentIndex: position.segmentIndex + 1 },
      repetitionCompleted: false,
    };
  }

  if (entry.repetitionUnit === "ritual-round" && entry.ritualGroupId) {
    const nextEntry = plan.entries[position.entryIndex + 1];
    if (nextEntry?.ritualGroupId === entry.ritualGroupId) {
      return {
        complete: false,
        position: { entryIndex: position.entryIndex + 1, segmentIndex: 0, repetitionIndex: position.repetitionIndex },
        repetitionCompleted: false,
      };
    }
    if (position.repetitionIndex + 1 < entry.repetitions) {
      let groupStart = position.entryIndex;
      while (groupStart > 0 && plan.entries[groupStart - 1]?.ritualGroupId === entry.ritualGroupId) groupStart -= 1;
      return {
        complete: false,
        position: { entryIndex: groupStart, segmentIndex: 0, repetitionIndex: position.repetitionIndex + 1 },
        repetitionCompleted: true,
      };
    }
  } else if (position.repetitionIndex + 1 < entry.repetitions) {
    return {
      complete: false,
      position: { entryIndex: position.entryIndex, segmentIndex: 0, repetitionIndex: position.repetitionIndex + 1 },
      repetitionCompleted: true,
    };
  }

  return position.entryIndex + 1 < plan.entries.length
    ? {
        complete: false,
        position: { entryIndex: position.entryIndex + 1, segmentIndex: 0, repetitionIndex: 0 },
        repetitionCompleted: false,
      }
    : { complete: true };
}
