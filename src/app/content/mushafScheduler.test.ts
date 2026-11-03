import { expect, it, vi } from "vitest";
import { promoteMushafRequest, scheduleMushafRequest, trimMushafPrefetch } from "./mushafScheduler";

it("reserves a reading slot during downloads and discards obsolete queued speculation", async () => {
  vi.stubGlobal("navigator", { hardwareConcurrency: 2 });
  let finish!: () => void;
  const download = scheduleMushafRequest(
    "download",
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    "download",
  );
  const speculative = vi.fn(async () => "speculative");
  const discarded = scheduleMushafRequest("page:5", speculative, "prefetch");
  const promoted = scheduleMushafRequest("page:6", async () => "visible", "next");
  try {
    const rejected = expect(discarded).rejects.toMatchObject({ name: "AbortError" });
    promoteMushafRequest("page:6", "foreground");
    trimMushafPrefetch([]);
    await rejected;
    await expect(promoted).resolves.toBe("visible");
    expect(speculative).not.toHaveBeenCalled();
  } finally {
    finish();
    await download;
    vi.unstubAllGlobals();
  }
});
