# After-prayer content review

Reviewed: 2026-08-14

## Product outcome

The app uses one shared post-prayer sequence and derives five prayer-specific flows. The sequence is not presented as a uniquely mandatory order; it is a consistent product arrangement that begins with the remembrance reported immediately after the salām, then groups established Qur'anic recitation, remembrance, and supplication.

| Scope   | Included timing-specific items                                | Complete-mode total |
| ------- | ------------------------------------------------------------- | ------------------: |
| Fajr    | Tenfold tahlīl; beneficial knowledge/provision/accepted deeds |                  16 |
| Dhuhr   | None                                                          |                  14 |
| Asr     | None                                                          |                  14 |
| Maghrib | Tenfold tahlīl                                                |                  15 |
| Isha    | None                                                          |                  14 |

Core mode excludes the timing-specific additions and other optional complete-mode material.

## Reviewed evidence

- Seeking forgiveness three times followed by “Allahumma anta al-salām…” is established in [Sahih Muslim 591](https://sunnah.com/muslim%3A591).
- The shared tasbīḥ/tahmīd/takbīr sequence and completing one hundred with tahlīl is established in [Sahih Muslim 597](https://sunnah.com/muslim/5/189-190).
- “Allahumma aʿinnī ʿalā dhikrika…” after every prescribed prayer is graded Sahih in [Sunan Abi Dawud 1522](https://sunnah.com/abudawud%3A1522). The previous `Rabbi` display wording was corrected to the wording carried by this cited report.
- Reciting the protecting surahs after every prayer is graded Sahih in [Sunan Abi Dawud 1523](https://sunnah.com/abudawud%3A1523). This flow uses one repetition; the separate morning/evening collections retain their own reviewed counts.
- Ayat al-Kursi after each prescribed prayer is accepted here under the authenticated report summarized by [Dorar's fiqh encyclopedia](https://dorar.net/feqhia/1064/%D8%A7%D9%84%D9%85%D8%B7%D9%84%D8%A8-%D8%A7%D9%84%D8%A3%D9%88%D9%84-%D9%82%D8%B1%D8%A7%D8%A1%D8%A9-%D8%A2%D9%8A%D8%A9-%D8%A7%D9%84%D9%83%D8%B1%D8%B3%D9%8A).
- The comprehensive supplication beginning “Allahumma innī as'aluka fiʿla al-khayrāt…” is recorded after prayer in [Jamiʿ at-Tirmidhi 3233](https://sunnah.com/tirmidhi%3A3233), graded Hasan by Darussalam. The app now records that grade rather than “Sahih at-Tirmidhi.”
- The beneficial-knowledge supplication is specifically reported after the morning prayer in [Sunan Ibn Majah 925](https://sunnah.com/ibnmajah%3A925), graded Sahih by Darussalam, and therefore appears only in the Fajr flow.
- The tenfold tahlīl is retained for Fajr and Maghrib from the existing Tirmidhi/Nasa'i references and is not shown after Dhuhr, Asr, or Isha.

## Conservative exclusion

`ap-ref-11` (“Allahumma ajirnī min al-nār” seven times after Fajr/Maghrib) remains filtered from shipped content. Abu Dawud 5079 has differing scholarly assessments; the repository's existing review rule follows al-Albani's weak grading and does not present its special count as established practice.

## Implementation invariants

- Exact Qur'anic text comes from `QURAN_PASSAGES`; prayer-specific instances receive stable canonical keys.
- Timing-specific items are filtered by stable IDs, never inferred from display copy.
- Stored completion IDs retain the existing `{prayer}:{zikrId}` prefix and daily ledger `subCategory`, so no persistence migration is required.
- Home and Progress consume the same five prayer completion keys.
