# Audio content mapping

Production assignments are currently empty. This is deliberate: the repository contains no reviewed recording bytes, duration/size/checksum metadata, licence evidence, or qualified human approvals. The application reports accurate zero coverage instead of playing guessed or incomplete audio.

`audioReviewCandidates.ts` records the required complete Qur'anic ranges for 2:255, 112:1–4, 113:1–5, 114:1–6, 2:285–286, 109:1–6, 32:1–30, and 67:1–30. It is review input, not a production manifest.

Generate the exhaustive current report with:

```sh
pnpm report:audio -- --write
```

The committed `generated-mapping-report.md` lists every unmatched instance and every shared canonical group. Morning/evening wording variants remain separate whenever their Arabic differs.
