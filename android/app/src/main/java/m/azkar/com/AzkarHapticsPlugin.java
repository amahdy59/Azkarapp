package m.azkar.com;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.provider.Settings;
import android.view.HapticFeedbackConstants;
import android.view.View;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AzkarHaptics")
public class AzkarHapticsPlugin extends Plugin {

    private static final AudioAttributes FEEDBACK_ATTRIBUTES = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build();

    private Vibrator getVibrator() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager manager = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return manager != null ? manager.getDefaultVibrator() : null;
        } else {
            return (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        }
    }

    @PluginMethod
    public void tap(PluginCall call) {
        if (getActivity() == null) {
            call.resolve();
            return;
        }
        getActivity().runOnUiThread(() -> {
            if (getActivity() != null) {
                View view = getActivity().getWindow().getDecorView();
                // A false result may mean feedback is disabled by the device.
                // Never bypass that policy with a second raw vibration.
                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void vibrate(PluginCall call) {
        if (Settings.System.getInt(getContext().getContentResolver(), Settings.System.HAPTIC_FEEDBACK_ENABLED, 1) == 0) {
            call.resolve();
            return;
        }
        JSArray patternArray = call.getArray("pattern");
        Vibrator vibrator = getVibrator();
        if (vibrator != null && vibrator.hasVibrator()) {
            if (patternArray != null && patternArray.length() > 0) {
                long[] pattern = new long[patternArray.length()];
                for (int i = 0; i < pattern.length; i++) {
                    pattern[i] = Math.max(0, patternArray.optLong(i, 0));
                }
                long[] timings = HapticPattern.toAndroidTimings(pattern);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(timings, -1), FEEDBACK_ATTRIBUTES);
                } else {
                    vibrator.vibrate(timings, -1, FEEDBACK_ATTRIBUTES);
                }
            } else {
                long duration = call.getInt("duration", 12);
                if (duration <= 0) {
                    vibrator.cancel();
                    call.resolve();
                    return;
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE), FEEDBACK_ATTRIBUTES);
                } else {
                    vibrator.vibrate(duration, FEEDBACK_ATTRIBUTES);
                }
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        cancelFeedback();
        call.resolve();
    }

    private void cancelFeedback() {
        Vibrator vibrator = getVibrator();
        if (vibrator != null) vibrator.cancel();
    }

    @Override
    protected void handleOnPause() {
        cancelFeedback();
    }

    @Override
    protected void handleOnDestroy() {
        cancelFeedback();
    }
}
