package m.azkar.com;

import com.getcapacitor.Bridge;

/** Release APKs contain no diagnostic asset, listeners, script evaluation or logging. */
final class WindowInsetsDiagnostics implements AutoCloseable {
    WindowInsetsDiagnostics(MainActivity activity, Bridge bridge) {}
    void capture(String event) {}
    void resume() {}
    void pause() {}
    @Override public void close() {}
}
