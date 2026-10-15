package com.wazaker.app;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "AzkarWidgets")
public class AzkarWidgetsPlugin extends Plugin {
    @PluginMethod
    public void publish(PluginCall call) {
        JSObject snapshot = call.getObject("snapshot");
        JSONArray cards = snapshot == null ? null : snapshot.optJSONArray("cards");
        if (snapshot == null || snapshot.optInt("version") != 1 || cards == null || cards.length() != 4
                || snapshot.toString().length() > 8192) {
            call.reject("Invalid widget snapshot");
            return;
        }
        for (int i = 0; i < cards.length(); i++) {
            JSONObject card = cards.optJSONObject(i);
            if (card == null || !WidgetProvider.validRoute(card.optString("route"))) {
                call.reject("Invalid widget route");
                return;
            }
        }
        getContext().getSharedPreferences("azkar_widgets", 0).edit()
                .putString("snapshot", snapshot.toString()).apply();
        WidgetProvider.refreshAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void consumeRoute(PluginCall call) {
        String route = getActivity().getIntent().getStringExtra("azkarRoute");
        getActivity().getIntent().removeExtra("azkarRoute");
        JSObject result = new JSObject();
        if (WidgetProvider.validRoute(route)) result.put("route", route);
        call.resolve(result);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        String route = intent.getStringExtra("azkarRoute");
        if (!WidgetProvider.validRoute(route)) return;
        JSObject data = new JSObject();
        data.put("route", route);
        notifyListeners("route", data, true);
    }
}
