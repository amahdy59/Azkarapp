# Seamless light — actual local application evidence

These are screenshots of the locally built application, not the earlier design concepts. Phone images explicitly simulate a 32px Android status inset; tablet and desktop images use ordinary browser geometry with no simulated inset. Browser images contain no Android system icons; native icon appearance requires device acceptance.

| Interface | Phone                            | Tablet                           | Desktop                            |
| --------- | -------------------------------- | -------------------------------- | ---------------------------------- |
| Arabic    | [390px](reader-light-ar-390.png) | [768px](reader-light-ar-768.png) | [1440px](reader-light-ar-1440.png) |
| English   | [390px](reader-light-en-390.png) | [768px](reader-light-en-768.png) | [1440px](reader-light-en-1440.png) |

The two phone captures retain one 32px shell inset. All four wide-browser captures have zero top padding and their reader/hero starts at y=0. None has document horizontal overflow. Existing wide reader artwork/navigation is preserved. The compact reader remains one continuous warm surface.

The first wide captures incorrectly simulated an Android status inset at every width. This created the 32px strip the owner identified. They were replaced with ordinary browser captures and backed by six passing Arabic/English 768px/1440px regressions across Chromium, Firefox and WebKit. Genuine Android safe areas were not removed to compensate for that evidence mistake.

The feature suite separately covers Arabic/English, Light paper/Glass/Dark/Midnight/high contrast, normal phone and 320px/200% text, 44px header actions, protected menu opacity/geometry and Escape/focus return. The original 30 cases passed across Chromium, Firefox and WebKit. Final live Forced Colors and wide-browser checks are recorded in the phase report; generated logs and JSON are in ignored output/system-bars-* paths.

Additional isolated-context checks confirm plain paper, Reduce Transparency and Forced Colors resolve to the plain light ground. Removing supported backdrop-filter branches confirms the CSS fallback ground; that simulation does not establish actual unsupported-engine or native acceptance. See the [phase report](../../reports/SEAMLESS_LIGHT_SYSTEM_BARS_LOCAL_2026_11_25_REPORT.md).
