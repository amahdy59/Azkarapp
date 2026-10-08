# Phase 90 — first owner-reviewed word timing

## Objective and plan

The owner reviewed an audio sample and authorizes applying it. The exported annotation in Downloads identifies `friday-dua-18-abdullah-muhammad-v1`, authored by the offline model process and reviewed by Ahmed Mahdy on 2026-10-08. It passes exact recording/transcript, complete interval coverage and independent reviewer validation. Register that supplied annotation, verify real application loading/cues and opt-out, run normal release gates, and publish. Other draft recordings remain unapproved. No additional planning gate was requested.

## Scope completed

Register the immutable annotation file and its recording/transcript/annotation checksums in the existing lazy timing index. No change to audio bytes, reviewed devotional text, progress, storage schema or timing approval rules. The four source edits in the owner's main checkout are outside this release and remain untouched.

## Files and components

`public/data/listening-timings/` contains the owner's reviewed Arabic Friday dua annotation. `src/app/audio/reviewedTimingFiles.ts` registers it. Existing player, native clock and `ListeningWordText` consume it without presentation changes. The audio browser suite gains a deployed-registration integration case. Release notes, decision log and phase index identify the limited activation.

## User-visible behavior and accessibility

Arabic playback of “اللهم إني أسألك الثبات في الأمر” by Abdullah Muhammad can highlight each spoken word using the existing underline/outline and `aria-current`. Users can switch highlighting off without pausing. Other voices/translations retain their own recording identity and require separate review. Existing stable text DOM, keyboard actions, no playback-driven focus movement and no per-word live announcements remain intact.

## Tests and evidence

Pending targeted browser integration, timing validators, complete quality gate, pre-push smoke/Pages gates, exact-commit CI and production verification. Results are retained in `output/phase90-*` and will be recorded in the final release report. Human screen-reader/device verification remains separate.

## Documentation and decisions

The owner's sample review authorizes only the exported exact recording. The phase 89 review contract remains unchanged; sampling does not fabricate review approval for the other 242 recordings.

## Remaining risks and next phase

Subjective timing accuracy follows the owner's supplied review; structural validation does not prove linguistic accuracy. Optional annotation availability requires a first successful load before offline caching. Continue reviewing and registering additional recordings, including English and Quran, through the same authoring tool.
