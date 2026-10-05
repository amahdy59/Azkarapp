import { describe, expect, it } from "vitest";
import { collectionPanelBounds, COLLECTION_PANEL_GUTTER, COLLECTION_READING_MIN } from "./useCollectionPanelSize";

describe("collection panel workspace limits", () => {
  it("uses the available workspace and protects the reading pane", () => {
    for (const workspace of [800, 944, 1104, 1600]) {
      const bounds = collectionPanelBounds(workspace);
      expect(bounds.canDock).toBe(true);
      expect(bounds.maximum).toBeLessThanOrEqual(480);
      expect(bounds.maximum).toBeLessThanOrEqual(workspace * 0.4);
      expect(workspace - bounds.maximum - COLLECTION_PANEL_GUTTER).toBeGreaterThanOrEqual(COLLECTION_READING_MIN);
    }
  });
  it("falls back to a drawer when the minimum two-pane layout cannot fit", () => {
    expect(collectionPanelBounds(779).canDock).toBe(false);
    expect(collectionPanelBounds(780).canDock).toBe(true);
    expect(collectionPanelBounds(0).canDock).toBe(false);
  });
});
