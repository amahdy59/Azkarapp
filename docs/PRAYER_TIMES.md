# Prayer times, location, timezone, and DST

This document is the source of truth for Azkarapp's prayer-time pipeline. It explains how times are calculated on the device, how daylight saving is applied, and how maintainers can verify or extend the feature safely.

## User-visible behavior

The Home prayer header displays the next prayer and a live countdown. Settings → Prayer Times & Location allows the user to:

- Detect the current location
- Review the effective IANA timezone and current UTC offset
- See whether daylight saving or standard time is active
- Select a calculation authority
- Search and select a built-in city without sharing GPS data; the preset coordinates and IANA timezone remain available offline
- Enter a manual city, timezone, latitude, and longitude when the built-in list does not include the required location
- Apply a minute adjustment to each prayer
- Enable one reminder before every daily prayer and choose a 10- or 15-minute lead time

The five calculated prayers are Fajr, Dhuhr, Asr, Maghrib, and Isha.

Prayer reminders are opt-in and use the same locally calculated times and adjustments shown on Home. While the PWA is open or backgrounded, one timer sleeps until the next due reminder and the app reconciles on focus/visibility; it does not poll continuously. The active service worker displays the notification where supported. Browser suspension means reliable delivery after the PWA is completely closed still requires a connected server Push API service, so Settings states this limitation rather than promising closed-app alarms.

Home also uses the same calculated boundaries for its featured collection: Morning from Fajr to Asr, Evening from Asr to Isha, and Before Sleep from Isha to the following Fajr. The preferred Evening reading window is communicated as after Asr until Maghrib.

## Resolution flow

```mermaid
flowchart TD
  Request["Date + location settings"] --> Offline["Astronomical offline calculation"]
  Offline --> TZ["Resolve UTC offset from IANA timezone for requested date"]
  TZ --> Adjust["Apply manual minute adjustments"]
  Adjust --> Result["PrayerTimes HH:MM"]
```

`getPrayerTimes()` is synchronous so Home always has an immediate value, and it is calculated on the device every time.

There is no network path and no daily cache. Prayer times were once fetched from `api.aladhan.com`, with the device calculation as a fallback; DEC-152 removed that call because it sent untruncated coordinates to a third party while the privacy page read as a promise that they never leave the device. The cached timings and the cached coordinate timezone went with it, and their storage keys are cleared on startup.

## How automatic DST works

The offline engine does not hard-code a `+2` or `+3` offset. It calls `getTimeZoneOffsetHours(date, timeZone)`, which uses `Intl.DateTimeFormat` and the IANA timezone database provided by the browser/runtime. The same timezone therefore returns different offsets on standard-time and DST dates when local law requires it.

For Cairo in 2026:

| Date       | Timezone       | Effective offset | Status                 |
| ---------- | -------------- | ---------------- | ---------------------- |
| January 15 | `Africa/Cairo` | `UTC+02:00`      | Standard time          |
| July 29    | `Africa/Cairo` | `UTC+03:00`      | Daylight saving active |

`getTimeZoneStatus()` samples the selected timezone across the calendar year. If offsets vary, the zone observes a seasonal change. The current date's offset is compared with the standard offset to display the active status in Settings.

### Automatic timezone source priority

When the user selects **Detect My Location**:

1. The browser Geolocation API returns latitude and longitude after permission.
2. `Intl.DateTimeFormat().resolvedOptions().timeZone` supplies the device timezone. Nothing is asked of the network, and the coordinates do not leave the device.
3. The selected timezone is persisted in `UserSettingsState.location`.

The Settings status card makes the effective timezone and UTC offset auditable. If a device is configured with the wrong timezone and the app is offline during detection, the user can correct the IANA timezone manually.

The built-in city selector is a convenience catalogue, not an online geocoder. Selecting a result immediately persists its representative city-centre coordinates and IANA timezone through the same `LocationSettings` boundary as manual entry. Search compares English names, Arabic names, countries, and common aliases without changing displayed text. Locations outside the catalogue remain supported through the manual fields.

## Calculation methods

|  ID | Authority                               |  Fajr |                     Isha |
| --: | --------------------------------------- | ----: | -----------------------: |
|   5 | Egyptian General Authority of Survey    | 19.5° |                    17.5° |
|   4 | Umm Al-Qura University, Makkah          | 18.5° | 90 minutes after Maghrib |
|   3 | Muslim World League                     |   18° |                      17° |
|   2 | Islamic Society of North America        |   15° |                      15° |
|   1 | University of Islamic Sciences, Karachi |   18° |                      18° |

Method definitions live in `CALCULATION_METHODS`. IDs follow the numbering Aladhan established, which is the convention users recognise from other apps, but nothing is sent there. Adding a method requires Arabic/English names, offline parameters, UI coverage, and parsing/calculation tests.

## Offline calculation

`calculateOfflinePrayerTimes()` derives:

- Solar declination and equation of time from the requested Gregorian date
- Solar noon from longitude and the date-specific timezone offset
- Fajr and Isha from the method's depression angles
- Dhuhr from solar noon with a small safety margin
- Standard-school Asr from shadow factor 1
- Maghrib from sunset at 0.833° below the horizon

High-latitude cases where the sun reaches sunset but not the selected Fajr or Isha angle use the angle-based portion of the night: `angle / 60 × night duration`. This preserves the normal calculation method on ordinary days and keeps Fajr before Dhuhr and Isha after Maghrib. Polar-day and polar-night results still need comparison with the user's local authority.

## Manual adjustments

Each prayer accepts an integer adjustment from -120 to +120 minutes. Adjustments are applied after the calculation. Values wrap safely across midnight.

Manual adjustments do not change the calculation-method parameters or timezone.

## Caching

There is none, and there is nothing to cache: the calculation is local, synchronous and cheap, so a cached copy could only ever be a slower way to get the same answer.

Two key families were written by the removed network path and are now swept on startup by `pruneExpiredPrayerTimes`:

```text
azkarapp.prayer_times_cache.<local-date>_<lat>_<lng>_<method>
azkarapp.prayer_time_zone.<lat>_<lng>
```

They are cleared rather than left to expire because their key names embed the coordinates of whoever last used the device.

## Failure and privacy behavior

Geolocation failure is classified as unsupported, permission denied, unavailable, timeout, or unknown. Settings gives reason-specific recovery guidance and keeps the previously saved location and prayer settings unchanged. Permission denial points to the browser's site settings; unsupported detection keeps manual latitude, longitude, city, and IANA timezone entry available.

Changing the calculation method is a local operation: the selected method is saved and the astronomical calculation uses it immediately.

| Condition                         | Behavior                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| Geolocation denied/unavailable    | Keep existing/default location and show an actionable message |
| No network at all                 | Unaffected — every time is calculated on the device           |
| Invalid manual coordinates        | Reject the save and retain the previous settings              |
| Invalid/unavailable IANA timezone | Fall back to the device offset                                |
| `localStorage` unavailable        | Continue without caching                                      |

The API timeout is bounded. Geolocation is user-initiated and requires HTTPS or localhost. Coordinates are used for prayer timing and are not needed by Supabase account synchronization.

## Code map

| File                                              | Responsibility                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/content/prayerCalculation.ts`            | Timezone/DST, astronomical calculation, adjustments, geolocation   |
| `src/app/content/prayerTimes.ts`                  | Current/next prayer selection and countdown formatting             |
| `src/app/screens/HomeScreen.tsx`                  | Immediate fallback rendering and background refresh                |
| `src/app/screens/settings/NotificationsPanel.tsx` | Location, timezone status, methods, and adjustments UI             |
| `src/app/hooks/useForegroundReminders.ts`         | Exact next-due routine/prayer scheduling and notification delivery |
| `src/app/types.ts`                                | `LocationSettings` persistence contract                            |
| `src/app/state.ts`                                | Defaults, validation, merge, and persistence                       |
| `src/app/content/prayerCalculation.test.ts`       | Parser, timezone/DST, offline, adjustment, and fallback unit tests |
| `e2e/narrow-layout.spec.ts`                       | Narrow prayer-header overflow regression                           |
| `e2e/responsive.spec.ts`                          | Arabic RTL prayer-header fit                                       |

## Verification

Run:

```bash
pnpm test:run
pnpm check
pnpm exec playwright test e2e/narrow-layout.spec.ts
pnpm exec playwright test e2e/responsive.spec.ts --grep "Arabic Home"
```

For a manual location verification:

1. Open Settings → Prayer Times & Location.
2. Select Detect My Location and grant permission.
3. Confirm the displayed IANA timezone matches the location.
4. Confirm the displayed UTC offset matches the current civil time.
5. Check whether Settings reports DST or standard time.
6. Compare the five times with a trusted local authority using the same calculation method.
7. Disable the network, reload, and confirm the countdown is unchanged — it never depended on the network.
8. Test a date on each side of a known DST transition through unit tests rather than changing the device clock.
9. Enable prayer reminders, select 10 or 15 minutes, reload Settings, and confirm the choice persists.

When local authorities differ by a few minutes, confirm the selected calculation method first, then use manual adjustments only when required.
