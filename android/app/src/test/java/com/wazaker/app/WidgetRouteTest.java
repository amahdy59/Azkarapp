package com.wazaker.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class WidgetRouteTest {
    @Test public void permitsOnlyTheFourWidgetDestinations() {
        for (String route : new String[]{"#/home", "#/azkar", "#/counter", "#/quran/1", "#/quran/604"}) {
            assertTrue(route, WidgetProvider.validRoute(route));
        }
        for (String route : new String[]{"https://example.com", "javascript:alert(1)", "#/quran/0", "#/quran/605", "#/quran/01", "#/settings/account", "#/quran/1?token=secret"}) {
            assertFalse(route, WidgetProvider.validRoute(route));
        }
        assertFalse(WidgetProvider.validRoute(null));
    }
}
