# Reading reliability — physical-device checks

Status: **Pending human verification**. Browser emulation cannot establish touch comfort, haptic delivery, screen-reader speech, notch clearance or device frame rate.

Record date, device/OS/browser or installed-PWA version, running release, language/settings, result and trace/recording for each row.

| Check            | Procedure and expected result                                                                                                                                                                                                                                      | Status  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Rapid navigation | Phone/landscape tablet: repeated Next/Previous, direction reversal, return to partial counts. Latest text matches selection/counter; counts remain. Repeat keyboard/reduced motion.                                                                                | Pending |
| Counting comfort | Rapid 33/100-count sessions; exactly one increment per accepted tap, subtle ordinary feedback, single stronger completion. Reset during completion must cancel advance. Test sound/haptics off and OS/in-app reduced motion. Capture a device trace if lag occurs. | Pending |
| Update deferral  | Later; navigate, background/resume, close/reopen, reload. Same release quiet for 24h; About permits review; newer release independently eligible.                                                                                                                  | Pending |
| Sharing          | Arabic/English, 200% text, portrait/landscape, actual cutout hardware. Footer/close reachable; focused settings scroll above actions. Share/Save/Copy use selected payload.                                                                                        | Pending |
| Screen readers   | TalkBack/VoiceOver and NVDA: entry changes, milestone counts, completion, help, update review, sharing status. No duplicate outgoing reading text or announcement on every tap.                                                                                    | Pending |
| Audio            | Approved Arabic/English from Reader/expanded player, rapid navigation, background/resume, slow/offline loading/retry. Truthful voice identity, latest text and accessible loading/error/control states.                                                            | Pending |
| Comfort/targets  | Landscape tablet/phone/200% text/all themes: both ends of long text, 44px targets, keyboard focus/help, contrast and safe-area clearance.                                                                                                                          | Pending |

Do not mark these rows Passed based on automation. Record failures with reproduction steps for a scoped follow-up.
