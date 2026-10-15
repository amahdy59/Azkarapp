package com.wazaker.app;

import android.content.Context;
import android.content.Intent;
import com.capacitorjs.plugins.localnotifications.LocalNotification;
import com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver;
import com.capacitorjs.plugins.localnotifications.NotificationStorage;

/** Do not replay expired devotional reminders after a reboot. */
public class ReminderRestoreReceiver extends LocalNotificationRestoreReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        if (!context.getSystemService(android.os.UserManager.class).isUserUnlocked()) return;
        NotificationStorage storage = new NotificationStorage(context);
        for (String id : storage.getSavedNotificationIds()) {
            LocalNotification notification = storage.getSavedNotification(id);
            if (notification == null || notification.getSchedule() == null) continue;
            java.util.Date at = notification.getSchedule().getAt();
            if (at != null && at.getTime() <= System.currentTimeMillis()) {
                storage.deleteNotification(id);
            }
        }
        super.onReceive(context, intent);
        WidgetProvider.refreshAll(context);
    }
}
