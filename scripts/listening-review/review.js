const { document, URL, Blob, fetch, requestAnimationFrame, cancelAnimationFrame } = globalThis;
const element = (id) => document.getElementById(id);
let jobs = [],
  draft = null,
  candidate = null,
  selected = null,
  generation = 0;
const audio = element("audio");
const status = (message) => {
  element("status").textContent = message;
};
function selectWord(word) {
  if (selected) selected.button.tabIndex = -1;
  else if (candidate?.words[0]) candidate.words[0].button.tabIndex = -1;
  selected = word;
  word.button.tabIndex = 0;
  element("edit").disabled = false;
  element("selected").textContent = `Selected word: ${word.text} (occurrence ${word.occurrence + 1})`;
  element("start").value = word.startMs;
  element("end").value = word.endMs;
  element("unspoken").checked = Boolean(word.unspoken);
  element("flags").textContent =
    `Acoustic score: ${word.acousticScore}. ${word.flags.join(", ") || "No model flags; human check still required."}`;
  if (Number.isInteger(word.startMs)) audio.currentTime = word.startMs / 1000;
}
function download(value, suffix) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + "\n"], { type: "application/json" }));
  link.href = url;
  link.download = `${draft.sha256}-${suffix}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function chooseCandidate() {
  candidate = draft?.candidates[Number(element("candidate").value)] ?? null;
  selected = null;
  element("edit").disabled = true;
  element("selected").textContent = "Selected word";
  element("start").value = "";
  element("end").value = "";
  element("flags").textContent = "";
  element("unspoken").checked = false;
  element("confirmed").checked = false;
  const transcript = element("transcript");
  transcript.replaceChildren();
  if (!candidate) return;
  transcript.dir = draft.language === "ar" ? "rtl" : "ltr";
  transcript.lang = draft.language;
  let occurrence = -1,
    offset = 0;
  for (const word of candidate.words) {
    if (occurrence !== word.occurrence) {
      if (occurrence >= 0)
        transcript.append(document.createTextNode(candidate.transcript.slice(offset)), document.createElement("br"));
      occurrence = word.occurrence;
      offset = 0;
    }
    transcript.append(document.createTextNode(candidate.transcript.slice(offset, word.startOffset)));
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = candidate.transcript.slice(word.startOffset, word.endOffset);
    button.dataset.flagged = String(Boolean(word.flags.length));
    button.tabIndex = word === candidate.words[0] ? 0 : -1;
    button.addEventListener("click", () => selectWord(word));
    button.addEventListener("keydown", (event) => {
      const index = candidate.words.indexOf(word);
      let next;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = candidate.words.length - 1;
      else if (event.key === "ArrowLeft" || event.key === "ArrowRight")
        next = index + ((event.key === "ArrowRight") === (draft.language === "en") ? 1 : -1);
      else return;
      event.preventDefault();
      const target = candidate.words[Math.max(0, Math.min(candidate.words.length - 1, next))];
      selectWord(target);
      target.button.focus();
    });
    word.button = button;
    transcript.append(button);
    offset = word.endOffset;
  }
  transcript.append(document.createTextNode(candidate.transcript.slice(offset)));
  element("coverage").textContent =
    `${candidate.alignedOccurrences}/${candidate.expectedOccurrences} word occurrences; ${candidate.flaggedOccurrences} flagged. ${draft.durationNeedsReview ? "Recording duration needs resolution before approval." : ""}`;
  element("evidence").textContent = JSON.stringify(
    { concerns: candidate.concerns, recognition: draft.recognizedEvidence },
    null,
    2,
  );
}
async function load() {
  const serial = ++generation;
  audio.pause();
  draft = candidate = selected = null;
  element("edit").disabled = true;
  element("transcript").replaceChildren();
  element("confirmed").checked = false;
  element("export-status").textContent = "";
  status("Loading draft…");
  const job = jobs.find((item) => item.sha256 === element("recording").value);
  if (!job) return;
  try {
    const response = await fetch(`/draft/${job.sha256}`);
    if (!response.ok) throw new Error("Draft not ready; refresh after the alignment batch finishes.");
    const result = await response.json();
    if (serial !== generation) return;
    draft = result;
    if (draft.sha256 !== job.sha256 || draft.durationMs !== job.durationMs || draft.language !== job.language)
      throw new Error("Draft recording metadata differs from the current approved inventory.");
    draft.variants = job.variants;
    // Older cached drafts may lack unresolved words. Restore exact source slots, never invented times.
    for (const value of draft.candidates ?? []) {
      const input = job.candidates.find((item) => item.textSha256 === value.textSha256);
      if (
        !input ||
        value.transcript !== input.text ||
        value.expectedOccurrences !== input.tokens.length * job.embeddedRepetitions
      )
        throw new Error("Draft transcript differs from the current inventory.");
      const found = new Map(value.words.map((word) => [`${word.occurrence}:${word.index}`, word]));
      value.words = Array.from({ length: job.embeddedRepetitions }, (_, occurrence) =>
        input.tokens.map((token) =>
          found.has(`${occurrence}:${token.index}`)
            ? { ...found.get(`${occurrence}:${token.index}`), ...token, occurrence }
            : {
                ...token,
                occurrence,
                startMs: null,
                endMs: null,
                acousticScore: null,
                flags: ["unresolved-boundary"],
              },
        ),
      ).flat();
    }
    audio.src = `/audio/${job.sha256}`;
    element("identity").textContent =
      `${job.variants.map((v) => v.variantId).join(", ")} · ${job.language} · SHA-256 ${job.sha256}`;
    if (draft.status === "failed") throw new Error(`Alignment failed: ${draft.error}`);
    element("candidate").replaceChildren(
      ...draft.candidates.map((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${index + 1}: ${value.sources.join(", ")}`;
        return option;
      }),
    );
    chooseCandidate();
    status("Unreviewed draft loaded. Compare the complete recording before approval.");
  } catch (error) {
    if (serial === generation) status(error.message);
  }
}
element("recording").addEventListener("change", load);
element("refresh").addEventListener("click", load);
element("candidate").addEventListener("change", chooseCandidate);
element("save").addEventListener("click", () => {
  const first = Number(element("start").value),
    last = Number(element("end").value);
  if (
    !selected ||
    (!element("unspoken").checked &&
      (!Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last <= first || last > draft.durationMs))
  ) {
    status("Enter valid increasing millisecond boundaries inside the recording.");
    return;
  }
  selected.startMs = first;
  selected.endMs = last;
  selected.unspoken = element("unspoken").checked;
  selected.manuallyReviewed = true;
  element("confirmed").checked = false;
  status("Boundary updated. Check neighbouring words before exporting.");
});
element("replay").addEventListener("click", async () => {
  if (selected && !selected.unspoken && Number.isInteger(selected.startMs)) {
    audio.currentTime = selected.startMs / 1000;
    try {
      await audio.play();
    } catch (error) {
      status(error.message);
    }
  }
});
let activeWord = null;
function paintCue() {
  const ms = audio.currentTime * 1000;
  const next =
    candidate?.words.find(
      (word) => !word.unspoken && Number.isInteger(word.startMs) && ms >= word.startMs && ms < word.endMs,
    ) ?? null;
  if (activeWord === next) return;
  activeWord?.button.removeAttribute("aria-current");
  next?.button.setAttribute("aria-current", "true");
  activeWord = next;
}
let frame = 0;
const animate = () => {
  paintCue();
  if (!audio.paused && !audio.ended && document.visibilityState !== "hidden") frame = requestAnimationFrame(animate);
};
audio.addEventListener("playing", () => {
  cancelAnimationFrame(frame);
  animate();
});
audio.addEventListener("pause", () => {
  cancelAnimationFrame(frame);
  paintCue();
});
audio.addEventListener("timeupdate", paintCue);
document.addEventListener("visibilitychange", () => {
  cancelAnimationFrame(frame);
  animate();
});
const clean = (word) => {
  const { button, ...value } = word;
  void button;
  return value;
};
element("draft").addEventListener("click", () => {
  if (draft)
    download(
      {
        ...draft,
        reviewStatus: "unreviewed",
        candidates: draft.candidates.map((value) => ({ ...value, words: value.words.map(clean) })),
      },
      "draft-edited",
    );
});
element("export").addEventListener("click", () => {
  try {
    if (!candidate || !element("confirmed").checked || !element("reviewer").value.trim() || !element("date").value)
      throw new Error("An independent named reviewer, date and complete-recording confirmation are required.");
    if (
      draft.durationNeedsReview ||
      candidate.words.length !== candidate.expectedOccurrences ||
      !candidate.words.length
    )
      throw new Error("Resolve incomplete coverage, duration and alignment concerns before approval.");
    let end = 0;
    for (const occurrence of new Set(candidate.words.map((word) => word.occurrence))) {
      if (!candidate.words.some((word) => word.occurrence === occurrence && !word.unspoken))
        throw new Error("Each embedded repetition must contain spoken words.");
    }
    for (const word of candidate.words) {
      if (word.unspoken) {
        if (!word.manuallyReviewed || word.verseKey)
          throw new Error("Quran semantic words require spoken alignment; other omissions require explicit review.");
        continue;
      }
      if (
        !Number.isInteger(word.startMs) ||
        !Number.isInteger(word.endMs) ||
        word.startMs < end ||
        word.endMs <= word.startMs ||
        word.endMs > draft.durationMs
      )
        throw new Error("Word intervals overlap or exceed the recording.");
      end = word.endMs;
    }
    const metadata = {
      sha256: draft.sha256,
      durationMs: draft.durationMs,
      unit: "milliseconds",
      source: `${draft.model.id}@${draft.model.revision}; independently checked against original recording`,
      authoredBy: "Offline alignment authoring",
      reviewedBy: element("reviewer").value.trim(),
      reviewedAt: element("date").value,
      reviewStatus: "approved",
    };
    if (metadata.reviewedBy === metadata.authoredBy) throw new Error("Reviewer must be independent of authoring.");
    const isQuran = candidate.words.every((word) => word.verseKey && word.position);
    if (isQuran) {
      const verses = [];
      for (const word of candidate.words) {
        let verse = verses.at(-1);
        if (verse?.verseKey !== word.verseKey) {
          verse = { verseKey: word.verseKey, startMs: word.startMs, endMs: word.endMs, words: [] };
          verses.push(verse);
        }
        verse.endMs = word.endMs;
        verse.words.push({ position: word.position, startMs: word.startMs, endMs: word.endMs });
      }
      download(
        draft.variants.map((v) => ({ ...metadata, variantId: v.variantId, verses })),
        "quran-reviewed",
      );
    } else
      download(
        {
          ...metadata,
          variantIds: draft.variants.map((v) => v.variantId),
          language: draft.language,
          transcript: candidate.transcript,
          textSha256: candidate.textSha256,
          unspokenWords: candidate.words
            .filter((word) => word.unspoken)
            .map(({ startOffset, endOffset, occurrence }) => ({ startOffset, endOffset, occurrence })),
          words: candidate.words
            .filter((word) => !word.unspoken)
            .map(({ startOffset, endOffset, occurrence, startMs, endMs }) => ({
              startOffset,
              endOffset,
              occurrence,
              startMs,
              endMs,
            })),
        },
        "listening-reviewed",
      );
    element("export-status").textContent =
      "Reviewed annotation exported. Structural/content checks and a code review are still required before production registration.";
  } catch (error) {
    element("export-status").textContent = error.message;
  }
});
try {
  jobs = await (await fetch("/jobs")).json();
  element("recording").replaceChildren(
    ...jobs.map((job) => {
      const option = document.createElement("option");
      option.value = job.sha256;
      option.textContent = `${job.language} · ${job.variants[0].variantId} · ${(job.durationMs / 1000).toFixed(1)}s`;
      return option;
    }),
  );
  await load();
} catch (error) {
  status(`Cannot load recording inventory: ${error.message}`);
}
