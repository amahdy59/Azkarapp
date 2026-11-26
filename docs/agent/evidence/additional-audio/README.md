# Additional audio pilot — actual local evidence

Captured 2026-11-25 from the running development app. These images show pending review inputs, not an activated production reciter. Synthetic browser-test notes remain unreviewed and were cleared after verification.

| Evidence                                                | Actual state                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Arabic desktop comparison](ar-desktop-comparison.png)  | 1440×1000; retained MP3 selected, current/source text and measured media duration |
| [Arabic enlarged menu](ar-320-text200-menu.png)         | 320×800, 200% root text; complete wrapping labels and opaque bounded menu         |
| [English desktop Light](en-desktop-light-menu.png)      | 1440×1000, solid material, actual sample menu                                     |
| [Arabic tablet Glass](ar-tablet-glass-menu.png)         | 768×1024, Midnight/Glass, protected menu over actual text                         |
| [English enlarged Glass](en-320-text200-glass-menu.png) | 320×800, 200% root text, Dark/Glass; native option scrolling remains available    |
| [Arabic phone Light](ar-phone-light-menu.png)           | 390×844, solid material; narrow text reflow and actual menu                       |

[Browser matrix](browser-matrix.json) retains all 12 passing scenarios across the repository-pinned Chromium, Firefox and WebKit engines. Each checks pointer sample selection, recording source, separate checksum-bound notes, pending-only export, menu viewport geometry, topmost hit-testing, Escape focus recovery, zero horizontal overflow and zero axe WCAG A/AA violations in the review dialog. The main three-file Chromium check additionally verifies actual MP3 metadata, successful play/time advancement and no autoplay on selection. Exact source-bound measurements are retained in [the pilot evidence](../../../audio/opendua-pilot/measurements.json).

The initial native-dialog/portalled-menu failure and intrinsic narrow-grid overflow were reproduced and repaired before these endpoint captures. The external CLI's Firefox protocol mismatch was resolved by using the repository's matched Playwright runtime/engine revisions, without changing dependencies or assertions. Test seed data is applied before application startup so old-page persistence cannot overwrite the next scenario's language.

Browser emulation and axe do not establish human pronunciation, independent religious-content acceptance, real-device media behavior or complete accessibility compliance. See [the phase report](../../reports/ADDITIONAL_AUDIO_PILOT_2026_11_25_REPORT.md).

[Production isolation scan](production-isolation.json) records 1,159 inspected files and 11 pilot-specific markers with no matches in the isolated Pages build. Production catalogue/defaults and hosted audio are unchanged; this scan does not replace the coordinator's final aggregate gates.
