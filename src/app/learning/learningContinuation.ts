import type { LearningState } from "./learningState";
import { learningEditionId, type LearningResource } from "./types";

/** Only the supplied available catalogue may turn a saved record into a link. */
export function getLearningContinuation(available: readonly LearningResource[], state: LearningState) {
  let selected: { resource: LearningResource; unitId: string; lastReadAt: number } | undefined;
  for (const resource of available) {
    const saved = state[learningEditionId(resource)];
    if (!saved?.position) continue;
    const lastReadAt = saved.lastReadAt ?? 0;
    // Legacy records have no recency. Keep their stable catalogue order until
    // an actual reader visit supplies one, without rewriting old records.
    if (!selected || lastReadAt > selected.lastReadAt)
      selected = { resource, unitId: saved.position.unitId, lastReadAt };
  }
  return selected;
}
