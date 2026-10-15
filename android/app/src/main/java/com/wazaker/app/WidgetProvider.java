package com.wazaker.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

/** Read-only projections. Counting remains in the app's normalized durable state. */
public abstract class WidgetProvider extends AppWidgetProvider {
    protected abstract int cardIndex();

    static boolean validRoute(String route) {
        return route != null && (route.equals("#/home") || route.equals("#/azkar")
                || route.equals("#/counter") || route.matches("#/quran/([1-9]|[1-9][0-9]|[1-5][0-9]{2}|60[0-4])"));
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) render(context, manager, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        render(context, manager, id);
    }

    private void render(Context context, AppWidgetManager manager, int id) {
        String title = context.getString(R.string.app_name);
        String body = context.getString(R.string.widget_open);
        String action = body;
        String route = "#/home";
        boolean arabic = context.getResources().getConfiguration().getLocales().get(0).getLanguage().equals("ar");
        try {
            String raw = context.getSharedPreferences("azkar_widgets", 0).getString("snapshot", "{}");
            JSONObject snapshot = new JSONObject(raw);
            if (snapshot.optInt("version") == 1) {
                arabic = snapshot.optString("language").equals("ar");
                action = arabic ? "افتح التطبيق" : "Open app";
                JSONObject card = snapshot.getJSONArray("cards").getJSONObject(cardIndex());
                title = card.getString("title");
                route = card.getString("route");
                boolean expired = cardIndex() == 0 && snapshot.optLong("validUntil") <= System.currentTimeMillis();
                body = expired ? (arabic ? "افتح لتحديث المواقيت" : "Open to refresh prayer times") : card.getString("body");
            }
        } catch (Exception ignored) {
            // A missing/corrupt projection never affects the application's durable data.
        }
        if (!validRoute(route)) route = "#/home";
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.azkar_widget);
        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_body, body);
        views.setTextViewText(R.id.widget_action, action);
        views.setInt(R.id.widget_root, "setLayoutDirection", arabic ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);
        int height = manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 180);
        views.setInt(R.id.widget_body, "setMaxLines", height < 180 ? 2 : 6);
        Intent launch = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .putExtra("azkarRoute", route);
        views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(context, id, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        manager.updateAppWidget(id, views);
    }

    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        WidgetProvider[] providers = {new PrayerWidget(), new AzkarWidget(), new QuranWidget(), new TasbihWidget()};
        for (WidgetProvider provider : providers) provider.onUpdate(context, manager,
                manager.getAppWidgetIds(new ComponentName(context, provider.getClass())));
    }
}
