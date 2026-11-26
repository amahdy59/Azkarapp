package m.azkar.com;

/** Opaque system-bar ground and icon contrast; independent of Android for unit tests. */
final class SystemBarAppearance {
    static final int DEFAULT_COLOR = 0xff0a1228;

    private SystemBarAppearance() {}

    static int parseColor(String color) {
        if (color == null || !color.matches("#[0-9a-fA-F]{6}")) {
            throw new IllegalArgumentException("Expected an opaque six-digit hex color");
        }
        return (int) Long.parseLong(color.substring(1), 16) | 0xff000000;
    }

    static boolean usesDarkIcons(int color) {
        double luminance = 0.2126 * linear((color >> 16) & 255)
                + 0.7152 * linear((color >> 8) & 255)
                + 0.0722 * linear(color & 255);
        // Choose the larger contrast ratio: black or white against this ground.
        return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05);
    }

    static int navigationColor(int color, int apiLevel) {
        // Android 7 cannot draw dark navigation buttons. Keep its native
        // navigation ground dark rather than putting white buttons on paper.
        return apiLevel < 26 && usesDarkIcons(color) ? DEFAULT_COLOR : color;
    }

    private static double linear(int channel) {
        double value = channel / 255.0;
        return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    }
}
