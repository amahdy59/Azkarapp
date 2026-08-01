# Content review workflow

1. Start the development app and open `?audio-review=1`.
2. Compare the displayed Arabic, source transcript, canonical key, asset ID, source, voice, duration, and normalized-match result.
3. Listen with headphones to every segment in order. Automated matching is only a hint.
4. Record notes as Unreviewed, Manually reviewed, Approved in review notes, Rejected, or Needs new recording.
5. A qualified reviewer independently confirms exact wording, pronunciation, complete Qur'anic ranges, and the absence of extra introductions, translations, explanations, omissions, or embedded repetition.
6. Transfer the signed-off decision into reviewed manifest metadata (`reviewedBy`, `reviewedAt`, notes) and the exact assignment registry through code review.

Local review-screen decisions never enable production playback. Only a schema-valid approved manifest plus an exact assignment can do so.
