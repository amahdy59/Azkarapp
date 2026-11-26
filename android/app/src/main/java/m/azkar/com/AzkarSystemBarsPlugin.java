package m.azkar.com;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AzkarSystemBars")
public class AzkarSystemBarsPlugin extends Plugin {
    @PluginMethod
    public void setBackground(PluginCall call) {
        final int color;
        try {
            color = SystemBarAppearance.parseColor(call.getString("color"));
        } catch (IllegalArgumentException error) {
            call.reject(error.getMessage());
            return;
        }
        if (!(getActivity() instanceof MainActivity)) {
            call.resolve();
            return;
        }
        getActivity().runOnUiThread(() -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).setSystemBarColor(color);
            }
            call.resolve();
        });
    }
}
