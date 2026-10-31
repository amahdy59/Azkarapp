package m.azkar.com;

/** Web patterns start on; Android waveform timings start off. */
final class HapticPattern {
    private HapticPattern() {}

    static long[] toAndroidTimings(long[] pattern) {
        long[] timings = new long[pattern.length + 1];
        for (int i = 0; i < pattern.length; i++) {
            timings[i + 1] = Math.max(0, pattern[i]);
        }
        return timings;
    }
}
