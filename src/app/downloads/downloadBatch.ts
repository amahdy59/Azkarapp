export type DownloadCategory = "adhkar" | "recitations" | "mushaf";

export class DownloadBatchError extends Error {
  constructor(public readonly failures: readonly { id: DownloadCategory; error: unknown }[]) {
    super("Some download groups did not finish");
    this.name = "DownloadBatchError";
  }
}

/** One bounded queue; a group failure never rolls back verified files or skips other groups. */
export async function runDownloadBatch(
  tasks: readonly { id: DownloadCategory; run: () => Promise<unknown> }[],
  signal: AbortSignal,
  onGroup: (id: DownloadCategory, index: number, count: number) => void,
) {
  const failures: { id: DownloadCategory; error: unknown }[] = [];
  for (const [index, task] of tasks.entries()) {
    signal.throwIfAborted();
    onGroup(task.id, index, tasks.length);
    try {
      await task.run();
    } catch (error) {
      signal.throwIfAborted();
      failures.push({ id: task.id, error });
    }
  }
  signal.throwIfAborted();
  if (failures.length) throw new DownloadBatchError(failures);
}
