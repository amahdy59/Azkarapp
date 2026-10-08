"""Offline draft authoring. Never writes production annotations or approves a timing."""

import argparse
import datetime
import difflib
import hashlib
import json
import pathlib
import re
import subprocess
import time
import urllib.request
import unicodedata
import wave
import zipfile

MODELS = {
    "en": ("english", "facebook/wav2vec2-base-960h", "22aad52d435eb6dbaf354bdad9b0da84ce7d6156"),
    "ar": ("arabic", "jonatasgrosman/wav2vec2-large-xlsr-53-arabic", "af46c2d8531b8dcbb5e23b952f739b372c2e5d2d"),
}
RATE = 16000
PIPELINE_VERSION = 3


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def wait_if_paused(cache):
    while (cache / "pause").exists():
        time.sleep(1)


def verified_audio(job, cache, base):
    suffix = pathlib.PurePosixPath(job["relativePath"]).suffix
    original = cache / "audio" / (job["sha256"] + suffix)
    original.parent.mkdir(parents=True, exist_ok=True)
    if not original.exists():
        temporary = original.with_suffix(original.suffix + ".download")
        request = urllib.request.Request(base.rstrip("/") + "/" + job["relativePath"])
        with urllib.request.urlopen(request, timeout=60) as response, temporary.open("wb") as target:
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
        temporary.replace(original)
    with original.open("rb") as source:
        digest = hashlib.file_digest(source, "sha256").hexdigest()
    if digest != job["sha256"] or original.stat().st_size != job["byteSize"]:
        raise ValueError("Original recording checksum or byte size differs from the approved manifest")
    return original


def decode_audio(original, cache, digest):
    import imageio_ffmpeg

    decoded = cache / "pcm" / (digest + "-16k.wav")
    decoded.parent.mkdir(parents=True, exist_ok=True)
    if not decoded.exists():
        subprocess.run(
            [imageio_ffmpeg.get_ffmpeg_exe(), "-nostdin", "-hide_banner", "-loglevel", "error", "-i", str(original),
             "-vn", "-ac", "1", "-ar", str(RATE), "-c:a", "pcm_s16le", "-y", str(decoded)],
            check=True, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    with wave.open(str(decoded), "rb") as source:
        if (source.getframerate(), source.getnchannels(), source.getsampwidth()) != (RATE, 1, 2):
            raise ValueError("Working PCM format is invalid")
        duration = source.getnframes() / RATE
    return decoded, duration


def emissions(decoded, model, processor, job, cache, revision):
    import numpy as np
    import torch

    cached = cache / "emissions" / (job["sha256"] + "-" + revision + ".npz")
    if cached.exists():
        try:
            with np.load(cached) as saved:
                values, grid = saved["probabilities"], saved["times"]
                if values.ndim != 2 or grid.ndim != 1 or len(values) != len(grid):
                    raise ValueError("Cached acoustic dimensions differ")
                return torch.from_numpy(values), grid
        except (ValueError, OSError, KeyError, zipfile.BadZipFile):
            cached.replace(cached.with_suffix(".invalid.npz"))
    parts, times = [], []
    stride = model.config.inputs_to_logits_ratio
    with wave.open(str(decoded), "rb") as source:
        total = source.getnframes()
        window, context = 30 * RATE, 2 * RATE
        for central in range(0, total, window):
            wait_if_paused(cache)
            start, end = max(0, central - context), min(total, central + window + context)
            source.setpos(start)
            samples = np.frombuffer(source.readframes(end - start), dtype="<i2").astype(np.float32) / 32768
            values = processor(samples, sampling_rate=RATE, return_tensors="pt").input_values
            with torch.inference_mode():
                values = model(values).logits[0].log_softmax(-1)
            grid = (start + np.arange(values.shape[0]) * stride) / RATE
            mask = (grid >= central / RATE) & (grid < min(total, central + window) / RATE)
            parts.append(values[torch.from_numpy(mask)])
            times.append(grid[mask])
            print(f"  acoustic window {min(total, central + window) / total:.0%}", flush=True)
    probabilities, grid = torch.cat(parts), np.concatenate(times)
    cached.parent.mkdir(parents=True, exist_ok=True)
    temporary = cached.with_suffix(".tmp.npz")
    np.savez_compressed(temporary, probabilities=probabilities.numpy(), times=grid)
    temporary.replace(cached)
    return probabilities, grid


def alignment_spelling(text, language):
    text = unicodedata.normalize("NFC", text)
    if language == "ar":
        return "".join(character for character in text if not unicodedata.category(character).startswith("M")).replace("ـ", "").replace("ٱ", "ا")
    return text.replace("’", "'").replace("-", "").upper()


def greedy_words(probabilities, vocabulary, blank, delimiter, language):
    inverse = {value: key for key, value in vocabulary.items()}
    words, text, start, end = [], "", None, None
    previous = blank
    for frame, value in enumerate(probabilities.argmax(-1).tolist()):
        if value != blank and value != previous:
            character = inverse[value]
            if character == delimiter:
                if text:
                    words.append({"text": text, "alignmentText": alignment_spelling(text, language), "start": start, "end": end})
                text, start, end = "", None, None
            elif len(character) == 1:
                if start is None:
                    start = frame
                text += character
                end = frame + 1
        elif value != blank and text:
            end = frame + 1
        previous = value
    if text:
        words.append({"text": text, "alignmentText": alignment_spelling(text, language), "start": start, "end": end})
    return words


def draft_candidate(candidate, job, probabilities, grid, tokenizer, greedy):
    import torch
    import torchaudio

    vocabulary = tokenizer.get_vocab()
    blank = tokenizer.pad_token_id
    delimiter = tokenizer.word_delimiter_token
    words = [dict(token, occurrence=occurrence) for occurrence in range(job["embeddedRepetitions"]) for token in candidate["tokens"]]
    boundaries = [(0, 0)]
    if len(grid) > 180 * 50:
        matcher = difflib.SequenceMatcher(None, [w["alignmentText"] for w in words], [w["alignmentText"] for w in greedy], autojunk=False)
        for block in matcher.get_matching_blocks():
            if block.size >= 3 and block.a > boundaries[-1][0]:
                frame = greedy[block.b]["start"]
                if frame > boundaries[-1][1] + 10 * 50:
                    boundaries.append((block.a, max(0, frame - 4)))
    boundaries.append((len(words), len(grid)))
    aligned, concerns = [], []
    if len(greedy) > max(len(words) * 2, len(words) + 12):
        concerns.append({"reason": "possible-extra-spoken-content", "recognizedWords": len(greedy), "suppliedWords": len(words)})
    frame_duration = 0.02
    for (word_start, frame_start), (word_end, frame_end) in zip(boundaries, boundaries[1:]):
        if frame_end <= frame_start or word_end <= word_start:
            continue
        if frame_end - frame_start > 180 * 50:
            concerns.append({"reason": "needs-reviewed-anchor", "fromWord": word_start, "toWord": word_end})
            continue
        targets, ranges = [], []
        for index in range(word_start, word_end):
            spelling = words[index]["alignmentText"]
            if not spelling or any(character not in vocabulary for character in spelling):
                concerns.append({"reason": "unsupported-model-token", "word": index})
                continue
            if targets:
                targets.append(vocabulary[delimiter])
            begin = len(targets)
            targets.extend(vocabulary[c] for c in spelling)
            ranges.append((index, begin, len(targets)))
        if not targets:
            continue
        try:
            path, scores = torchaudio.functional.forced_align(
                probabilities[frame_start:frame_end].unsqueeze(0), torch.tensor([targets], dtype=torch.int64), blank=blank,
            )
            spans = torchaudio.functional.merge_tokens(path[0], scores[0].exp(), blank=blank)
            if [span.token for span in spans] != targets:
                raise ValueError("CTC path does not cover the supplied token sequence")
            for index, begin, end in ranges:
                first, last = spans[begin], spans[end - 1]
                start_ms = max(0, round(float(grid[frame_start + first.start]) * 1000))
                end_ms = min(job["durationMs"], round((float(grid[frame_start + last.end - 1]) + frame_duration) * 1000))
                score = sum(span.score for span in spans[begin:end]) / (end - begin)
                if end_ms <= start_ms:
                    concerns.append({"reason": "invalid-interval", "word": index})
                    continue
                flags = []
                if score < 0.5:
                    flags.append("low-acoustic-score")
                if end_ms - start_ms < 60 or end_ms - start_ms > 5000:
                    flags.append("unusual-duration")
                if len(boundaries) > 2 and (index < word_start + 2 or index >= word_end - 2):
                    flags.append("anchor-seam")
                aligned.append({**words[index], "startMs": start_ms, "endMs": end_ms, "acousticScore": round(score, 5), "flags": flags})
        except (RuntimeError, ValueError) as error:
            concerns.append({"reason": "alignment-failed", "fromWord": word_start, "toWord": word_end, "detail": str(error)})
    found = {(word["index"], word["occurrence"]): word for word in aligned}
    complete = [found.get((word["index"], word["occurrence"]), {**word, "startMs": None, "endMs": None, "acousticScore": None, "flags": ["unresolved-boundary"]}) for word in words]
    return {"textSha256": candidate["textSha256"], "transcript": candidate["text"], "sources": candidate["sources"],
            "expectedOccurrences": len(words), "alignedOccurrences": len(aligned), "flaggedOccurrences": sum(bool(w["flags"]) for w in aligned),
            "concerns": concerns, "words": complete}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--jobs", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--cache", required=True)
    parser.add_argument("--model-root", required=True)
    parser.add_argument("--language", choices=["ar", "en"], required=True)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--variant", help="Optional exact recording variant pilot")
    parser.add_argument("--threads", type=int, default=2)
    parser.add_argument("--background", action="store_true", help="Use idle Windows process priority during local authoring")
    parser.add_argument("--base-url", default="https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev")
    args = parser.parse_args()
    if args.background:
        import ctypes
        import os
        if os.name == "nt":
            kernel = ctypes.windll.kernel32
            kernel.GetCurrentProcess.restype = ctypes.c_void_p
            kernel.SetPriorityClass.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
            if not kernel.SetPriorityClass(kernel.GetCurrentProcess(), 0x40):
                raise OSError("Could not lower authoring process priority")
    import torch
    from transformers import AutoModelForCTC, AutoProcessor

    torch.set_num_threads(args.threads)
    torch.set_num_interop_threads(1)
    output, cache = pathlib.Path(args.output), pathlib.Path(args.cache)
    name, model_id, revision = MODELS[args.language]
    local_model = pathlib.Path(args.model_root) / name
    model = AutoModelForCTC.from_pretrained(local_model, local_files_only=True).eval()
    processor = AutoProcessor.from_pretrained(local_model, local_files_only=True)
    jobs = [job for job in json.loads(pathlib.Path(args.jobs).read_text(encoding="utf-8"))["jobs"] if job["language"] == args.language]
    if args.variant:
        jobs = [job for job in jobs if any(variant["variantId"] == args.variant for variant in job["variants"])]
        if not jobs:
            raise ValueError("Pilot variant was not found in the approved language inventory")
    done = 0
    for job in jobs:
        if not re.fullmatch(r"[a-f0-9]{64}", job["sha256"]):
            raise ValueError("Invalid recording checksum")
        input_digest = hashlib.sha256(json.dumps(job, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
        target = output / (job["sha256"] + ".json")
        if target.exists():
            existing = json.loads(target.read_text(encoding="utf-8"))
            if existing.get("model", {}).get("revision") == revision and existing.get("jobSha256") == input_digest and existing.get("pipelineVersion") == PIPELINE_VERSION and existing.get("status") == "draft":
                continue
        wait_if_paused(cache)
        print(f"Aligning {job['variants'][0]['variantId']} ({job['durationMs'] / 1000:.1f}s)", flush=True)
        result = {"status": "draft", "sha256": job["sha256"], "durationMs": job["durationMs"], "language": job["language"], "pipelineVersion": PIPELINE_VERSION, "jobSha256": input_digest,
                  "variants": job["variants"], "model": {"id": model_id, "revision": revision, "dtype": "float32", "windowSeconds": 30, "contextSeconds": 2},
                  "inputDigests": [c["textSha256"] for c in job["candidates"]], "authoredAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  "reviewStatus": "unreviewed", "candidates": []}
        try:
            original = verified_audio(job, cache, args.base_url)
            decoded, duration = decode_audio(original, cache, job["sha256"])
            result["decodedDurationMs"] = round(duration * 1000)
            result["durationNeedsReview"] = abs(result["decodedDurationMs"] - job["durationMs"]) > 250
            probabilities, grid = emissions(decoded, model, processor, job, cache, revision)
            greedy = greedy_words(probabilities, processor.tokenizer.get_vocab(), processor.tokenizer.pad_token_id, processor.tokenizer.word_delimiter_token, job["language"])
            result["recognizedEvidence"] = greedy
            for candidate in job["candidates"]:
                result["candidates"].append(draft_candidate(candidate, job, probabilities, grid, processor.tokenizer, greedy))
            print("  draft coverage " + ", ".join(f"{c['alignedOccurrences']}/{c['expectedOccurrences']} ({c['flaggedOccurrences']} flags)" for c in result["candidates"]), flush=True)
        except Exception as error:
            result["status"] = "failed"
            result["error"] = str(error)
            print("  failed: " + str(error), flush=True)
        write_json(target, result)
        done += 1
        if args.limit and done >= args.limit:
            break


if __name__ == "__main__":
    main()
