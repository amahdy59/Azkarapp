package m.azkar.com;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.plugin.WebView;

public class MainActivity extends BridgeActivity {
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

    private void configureSystemBars() {
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.getDecorView().setBackgroundColor(Color.rgb(7, 17, 41));
        window.setStatusBarColor(Color.rgb(7, 17, 41));
        window.setNavigationBarColor(Color.rgb(15, 29, 59));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(true);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.show(WindowInsets.Type.statusBars());
                controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        }
        window.getDecorView().setSystemUiVisibility(
                window.getDecorView().getSystemUiVisibility()
                        & ~(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR)
        );
    }
}
