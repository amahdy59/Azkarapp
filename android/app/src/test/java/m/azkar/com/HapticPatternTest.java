package m.azkar.com;

import org.junit.Test;
import static org.junit.Assert.*;

public class HapticPatternTest {
    @Test public void preservesThreeCompletionPulsesWithoutAnInitialDelay() {
        assertArrayEquals(new long[]{0, 30, 50, 30, 50, 50},
            HapticPattern.toAndroidTimings(new long[]{30, 50, 30, 50, 50}));
    }

    @Test public void preservesSingleAndZeroDurationPulses() {
        assertArrayEquals(new long[]{0, 15}, HapticPattern.toAndroidTimings(new long[]{15}));
        assertArrayEquals(new long[]{0, 0, 20, 10},
            HapticPattern.toAndroidTimings(new long[]{0, 20, 10}));
    }
}
