/** Temporary interaction protection, shared with routing; never persisted or synchronized. */
const locks = new Set<symbol>();
export function acquireAudioControlLock() {
  const token = Symbol();
  locks.add(token);
  return () => {
    locks.delete(token);
  };
}
export function isAudioControlLocked() {
  return locks.size > 0;
}
