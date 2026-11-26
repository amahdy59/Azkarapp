package m.azkar.com;

import org.junit.Test;
import static org.junit.Assert.*;

public class SystemBarAppearanceTest {
    @Test public void lightPaperUsesDarkIcons() {
        for (String color : new String[]{"#F8F5F0", "#f2f0eb", "#ffffff"}) {
            assertTrue(color, SystemBarAppearance.usesDarkIcons(SystemBarAppearance.parseColor(color)));
        }
    }

    @Test public void darkGlassAndHighContrastUseLightIcons() {
        for (String color : new String[]{"#0A1228", "#0D0D0D", "#020617", "#02050D", "#000000"}) {
            assertFalse(color, SystemBarAppearance.usesDarkIcons(SystemBarAppearance.parseColor(color)));
        }
    }

    @Test public void iconChoiceUsesLuminanceRatherThanAnAverageChannelOrThemeName() {
        assertTrue(SystemBarAppearance.usesDarkIcons(SystemBarAppearance.parseColor("#00ff00")));
        assertFalse(SystemBarAppearance.usesDarkIcons(SystemBarAppearance.parseColor("#0000ff")));
    }

    @Test public void rejectsTransparentMalformedOrNonColorInputs() {
        for (String color : new String[]{null, "", "#fff", "#ffffff00", "transparent", "red", "#gggggg"}) {
            assertThrows(IllegalArgumentException.class, () -> SystemBarAppearance.parseColor(color));
        }
        assertEquals(0xfff8f5f0, SystemBarAppearance.parseColor("#F8F5F0"));
    }

    @Test public void legacyNavigationButtonsKeepADarkGroundUntilDarkIconsAreSupported() {
        int paper = SystemBarAppearance.parseColor("#F8F5F0");
        assertEquals(SystemBarAppearance.DEFAULT_COLOR, SystemBarAppearance.navigationColor(paper, 24));
        assertEquals(SystemBarAppearance.DEFAULT_COLOR, SystemBarAppearance.navigationColor(paper, 25));
        assertEquals(paper, SystemBarAppearance.navigationColor(paper, 26));
        assertEquals(paper, SystemBarAppearance.navigationColor(paper, 36));
        int dark = SystemBarAppearance.parseColor("#020617");
        assertEquals(dark, SystemBarAppearance.navigationColor(dark, 24));
    }
}
