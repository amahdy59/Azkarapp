# Phase 10 system-state matrix

| Flow                                  | Loading / pending                               | Success / empty                           | Failure and recovery                                                                       | Blocking?                            | Offline-safe behavior                                      |
| ------------------------------------- | ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| Screen chunk                          | Visible text, spinner, `aria-busy`              | Screen renders                            | Retry, then update-aware Refresh app; Go to Azkar remains available                        | Only the requested screen            | Local state remains mounted and unchanged                  |
| Lazy collection                       | Screen fallback                                 | Collection renders                        | Focused alert with Retry and Go to Azkar                                                   | Only category/reader                 | Other bundled collections remain available                 |
| Friday supplemental duas              | Disable card while loading                      | Counts render                             | Inline alert and Retry                                                                     | No                                   | Friday checklist, Kahf entry, and Salawat remain available |
| Connectivity                          | Full transition notice                          | Brief reconnect confirmation              | Collapses after five seconds to expandable Offline indicator                               | No                                   | Reading, counting, and progress continue locally           |
| Account hydration/sync                | Polite syncing status                           | Settings reports last success             | Safe localized error, Retry, Dismiss                                                       | No after initial callback resolution | Local state remains the render source                      |
| Email/OAuth/profile auth              | Disable duplicate action, `aria-busy`           | Advance to next auth state                | Stable-code localized error on the active screen                                           | Auth flow only                       | Guest use remains available                                |
| Notification permission               | Disable request while pending                   | Granted status                            | Denied/unsupported browser-settings guidance; attempted toggle announces why it stayed off | No                                   | Reminder settings remain unchanged                         |
| Geolocation                           | Disable Detect action                           | Updated location or local-fallback notice | Reason-specific denial, timeout, unavailable, unsupported, or generic guidance             | No                                   | Saved location and local prayer calculation remain active  |
| Prayer refresh/method                 | Non-blocking background request                 | Updated timezone when available           | Method stays saved; local calculation status is shown in Settings                          | No                                   | Cached/astronomical times continue                         |
| PWA update/install                    | Disable duplicate action; narrow pending status | Browser/reload outcome                    | Bounded update timeout and retryable alert; install dismissal reported                     | No                                   | Existing app version keeps running                         |
| Offline-audio status/download/removal | Loading text, labelled progress, cancel         | Localized completion/removal status       | Localized actionable error and retry                                                       | No                                   | Bundled text content remains available                     |
| Completion/progress sharing           | Disable duplicate action                        | Shared/copied status                      | Cancellation is neutral; failure is an alert and action becomes available again            | No                                   | No progress mutation                                       |
| Reader reference copy                 | Existing copy acknowledgement                   | Copied status                             | Clipboard failure is announced                                                             | No                                   | Reading remains available                                  |
| Destructive confirmation              | Dialog remains open and busy                    | Reload follows completed clear/delete     | Localized inline alert; retry remains available                                            | Yes for the action only              | Failure never clears unrelated state                       |

## Announcement and focus rules

- Static empty states have no live-region role.
- Newly occurring failures use a scoped alert.
- Non-urgent progress, success, cancellation, and reconnect messages use a scoped polite status.
- Blocking route recovery focuses its heading; non-blocking banners and inline outcomes do not steal focus.
- Interactive containers are never themselves live regions.

## Preservation rules

- No retry changes persisted-state shape or merge behavior.
- Screen and collection retries do not reload until a user explicitly chooses Refresh after a failed retry.
- Account, prayer, download, and sharing failures never remove local reading or progress.
- Remote/backend error strings are reported only through privacy-safe observability metadata and are not rendered.
