import { useEffect, useState } from "react";

/** A lazy load may finish after navigation, or before its provider mounts. */
export function useQueuedAudioAction({
  context,
  ready,
  loading,
  error,
  requestLoad,
  perform,
}: {
  context: string;
  ready: boolean;
  loading: boolean;
  error: boolean;
  requestLoad: () => void;
  perform: () => void;
}) {
  const [intent, setIntent] = useState<{ context: string; failed: boolean } | null>(null);
  const current = intent?.context === context ? intent : null;

  useEffect(() => {
    if (!intent) return;
    if (intent.context !== context) {
      setIntent(null);
    } else if (!intent.failed && ready) {
      setIntent(null);
      perform();
    } else if (!intent.failed && error && !loading) {
      setIntent({ ...intent, failed: true });
    }
  }, [context, error, intent, loading, perform, ready]);

  const start = () => {
    if (ready) {
      setIntent(null);
      perform();
    } else {
      setIntent({ context, failed: false });
      requestLoad();
    }
  };

  return { start, pending: Boolean(current && !current.failed), failed: Boolean(current?.failed) };
}
