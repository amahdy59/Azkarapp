package m.azkar.com;

import android.os.Build;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.plugin.WebView;

public class MainActivity extends BridgeActivity {
    private int systemBarColor = SystemBarAppearance.DEFAULT_COLOR;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // The launch theme is also used by AppCompat before BridgeActivity
        // switches to its no-action-bar theme. Request the feature early so
        // the activity label cannot create a native bar above the WebView.
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        resetLiveUpdateBundleOnNativeUpgrade();
        registerPlugin(AzkarWidgetsPlugin.class);
        registerPlugin(AzkarFilesPlugin.class);
        registerPlugin(NativeSharingPlugin.class);
        registerPlugin(AzkarHapticsPlugin.class);
        registerPlugin(AzkarSystemBarsPlugin.class);
        systemBarColor = getSharedPreferences("azkarapp.native", MODE_PRIVATE)
                .getInt("system-bars-background", SystemBarAppearance.DEFAULT_COLOR) | 0xff000000;
        super.onCreate(savedInstanceState);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        configureSystemBars();
    }

    /**
     * Capacitor chooses a live-update bundle while the Bridge is being created,
     * before the web app can run JavaScript. Clear that path on a native APK
     * upgrade so an older cached web shell cannot mask the newly packaged UI.
     */
    private void resetLiveUpdateBundleOnNativeUpgrade() {
        long versionCode = 0L;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = getPackageManager().getPackageInfo(getPackageName(), 0).getLongVersionCode();
            } else {
                versionCode = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
            }
        } catch (Exception ignored) {
            return;
        }

        SharedPreferences versionPreferences = getSharedPreferences("azkarapp.native", MODE_PRIVATE);
        long previousVersionCode = versionPreferences.getLong("live-update-version-code", -1L);
        if (previousVersionCode == versionCode) return;

        getSharedPreferences(WebView.WEBVIEW_PREFS_NAME, MODE_PRIVATE)
                .edit()
                .putString(WebView.CAP_SERVER_PATH, "")
                .apply();
        versionPreferences.edit().putLong("live-update-version-code", versionCode).apply();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) configureSystemBars();
    }

    void setSystemBarColor(int color) {
        if (systemBarColor != color) {
            systemBarColor = color;
            // Presentation only: never copy progress, account or reading data.
            getSharedPreferences("azkarapp.native", MODE_PRIVATE).edit()
                    .putInt("system-bars-background", color).apply();
        }
        configureSystemBars();
    }

    @SuppressWarnings("deprecation")
    private void configureSystemBars() {
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.getDecorView().setBackgroundColor(systemBarColor);
        // Legacy Android paints these colors. Enforced edge-to-edge uses the
        // matching protected web inset instead; it ignores statusBarColor.
        window.setStatusBarColor(systemBarColor);
        window.setNavigationBarColor(SystemBarAppearance.navigationColor(systemBarColor, Build.VERSION.SDK_INT));
        WindowCompat.setDecorFitsSystemWindows(window, true);
        window.getDecorView().setSystemUiVisibility(
                window.getDecorView().getSystemUiVisibility()
                        & ~(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
        );
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        controller.show(WindowInsetsCompat.Type.statusBars());
        boolean darkIcons = SystemBarAppearance.usesDarkIcons(systemBarColor);
        controller.setAppearanceLightStatusBars(darkIcons);
        controller.setAppearanceLightNavigationBars(darkIcons);
    }
}
