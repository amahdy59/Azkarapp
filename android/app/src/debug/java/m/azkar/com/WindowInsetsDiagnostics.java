package m.azkar.com;

import android.content.pm.PackageInfo;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.WebViewListener;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONArray;
import org.json.JSONObject;

/** Debug APK only. Event-driven geometry, never page text, routes or saved data. */
final class WindowInsetsDiagnostics implements AutoCloseable {
    private final MainActivity activity;
    private final Bridge bridge;
    private final View decor;
    private final String script;
    private boolean active = true;
    private boolean closed;
    private String reason = "launch";
    private String lastGeometry = "";
    private final Runnable pending = this::record;
    private final ViewTreeObserver.OnGlobalLayoutListener layout = () -> {
        String geometry = geometryKey();
        if (!geometry.equals(lastGeometry)) {
            lastGeometry = geometry;
            capture("geometry");
        }
    };
    private final WebViewListener pageListener = new WebViewListener() {
        @Override public void onPageCommitVisible(WebView view, String url) {
            // A new document loses the injected CSS values. Let Capacitor's
            // existing listener supply them again; do not install another one.
            ViewCompat.requestApplyInsets(decor);
            capture("page");
        }
    };

    WindowInsetsDiagnostics(MainActivity activity, Bridge bridge) {
        this.activity = activity;
        this.bridge = bridge;
        decor = activity.getWindow().getDecorView();
        String source = "({error:'diagnostic asset unavailable'})";
        try (InputStream input = activity.getAssets().open("insets-diagnostics.js")) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int count;
            while ((count = input.read(buffer)) != -1) bytes.write(buffer, 0, count);
            source = new String(bytes.toByteArray(), StandardCharsets.UTF_8);
        } catch (Exception error) {
            Log.w("AzkarInsets", "Diagnostic asset unavailable");
        }
        script = source;
        decor.getViewTreeObserver().addOnGlobalLayoutListener(layout);
        bridge.addWebViewListener(pageListener);
        capture("launch");
    }

    void capture(String event) {
        if (!active || closed) return;
        reason = event;
        decor.removeCallbacks(pending);
        // Coalesce a layout/IME burst; no polling while stable or backgrounded.
        decor.postDelayed(pending, 200);
    }

    void resume() {
        active = true;
        capture("resume");
    }

    void pause() {
        active = false;
        decor.removeCallbacks(pending);
    }

    @Override public void close() {
        closed = true;
        pause();
        if (decor.getViewTreeObserver().isAlive()) decor.getViewTreeObserver().removeOnGlobalLayoutListener(layout);
        bridge.removeWebViewListener(pageListener);
    }

    private String geometryKey() {
        WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(decor);
        if (insets == null) return decor.getWidth() + ":" + decor.getHeight();
        return decor.getWidth() + ":" + decor.getHeight() + ":"
                + insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout())
                + ":" + insets.getInsets(WindowInsetsCompat.Type.ime());
    }

    private void record() {
        if (!active || closed || bridge.getWebView() == null) return;
        try {
            JSONObject snapshot = new JSONObject();
            snapshot.put("event", reason);
            snapshot.put("sdk", Build.VERSION.SDK_INT);
            snapshot.put("android", Build.VERSION.RELEASE);
            snapshot.put("manufacturer", Build.MANUFACTURER);
            snapshot.put("model", Build.MODEL);
            PackageInfo app = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
            snapshot.put("apkVersion", app.versionName);
            snapshot.put("apkCode", Build.VERSION.SDK_INT >= 28 ? app.getLongVersionCode() : app.versionCode);
            PackageInfo webView = Build.VERSION.SDK_INT >= 26 ? WebView.getCurrentWebViewPackage() : null;
            snapshot.put("webView", webView == null ? "unknown" : webView.packageName + "/" + webView.versionName);
            snapshot.put("density", activity.getResources().getDisplayMetrics().density);
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(decor);
            if (insets != null) {
                snapshot.put("systemPx", edges(insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout())));
                snapshot.put("imePx", edges(insets.getInsets(WindowInsetsCompat.Type.ime())));
                snapshot.put("keyboard", insets.isVisible(WindowInsetsCompat.Type.ime()));
            }
            View web = bridge.getWebView();
            int[] position = new int[2];
            web.getLocationOnScreen(position);
            snapshot.put("webViewPx", new JSONArray(new int[]{position[0], position[1], web.getWidth(), web.getHeight()}));
            snapshot.put("decorPaddingPx", new JSONArray(new int[]{decor.getPaddingLeft(), decor.getPaddingTop(), decor.getPaddingRight(), decor.getPaddingBottom()}));
            bridge.getWebView().evaluateJavascript(script, result -> {
                if (!active || closed) return;
                try {
                    snapshot.put("web", new JSONObject(result));
                    Log.i("AzkarInsets", snapshot.toString());
                } catch (Exception error) {
                    Log.w("AzkarInsets", "Web geometry unavailable");
                }
            });
        } catch (Exception error) {
            Log.w("AzkarInsets", "Native geometry unavailable");
        }
    }

    private static JSONArray edges(Insets insets) {
        return new JSONArray().put(insets.left).put(insets.top).put(insets.right).put(insets.bottom);
    }
}
