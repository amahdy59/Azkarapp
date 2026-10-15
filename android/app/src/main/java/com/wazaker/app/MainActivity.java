package com.wazaker.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AzkarWidgetsPlugin.class);
        registerPlugin(AzkarFilesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
