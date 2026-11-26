"""Repair source-font Unicode maps while preserving the painted glyphs and tags.

Skia maps a few combined shadda/vowel glyphs to U+0000. The checked glyph map
comes from the exact embedded source fonts, not from interpreting a passage.
Only text extraction metadata changes. The existing font programs, glyph IDs,
page content, semantic tags and destinations remain intact.
"""

import hashlib
import json
import os
import re
import sys
import unicodedata
from pathlib import Path
from pypdf import PdfReader, PdfWriter

BASE = Path(__file__).resolve().parent
mapping = json.loads((BASE / "assets/font-unicode-map.json").read_text())
assert hashlib.sha256((BASE / "fonts_base64.json").read_bytes()).hexdigest() == mapping["sourceSha256"], "Source fonts changed; regenerate and review the glyph map"


def finalize(file):
    reader = PdfReader(file)
    seen = set()
    repaired = 0
    for page in reader.pages:
        for value in page["/Resources"].get("/Font", {}).values():
            font = value.get_object()
            if value.idnum in seen or "/ToUnicode" not in font:
                continue
            seen.add(value.idnum)
            name = str(font.get("/BaseFont", "")).split("+")[-1]
            if name not in mapping["fonts"]:
                continue
            descendant = font["/DescendantFonts"][0].get_object()
            assert descendant.get("/CIDToGIDMap") == "/Identity", f"Non-identity glyph map: {name}"
            cmap = font["/ToUnicode"].get_object()
            original = cmap.get_data().decode("ascii")

            def entry(match):
                nonlocal repaired
                cid, output = match.groups()
                if output == "0000":
                    glyph = mapping["fonts"][name].get(str(int(cid, 16)))
                    assert glyph, f"Unmapped composite glyph {name}/{cid}"
                    repaired += 1
                    return f"<{cid}> <{glyph}>"
                # Presentation forms are glyph encodings, not the characters
                # users type into search. Decode only those compatibility
                # characters; do not normalize any authored Quran content.
                text = bytes.fromhex(output).decode("utf-16-be")
                if any("\ufb50" <= c <= "\ufdff" or "\ufe70" <= c <= "\ufeff" for c in text):
                    text = unicodedata.normalize("NFKC", text)
                    return f"<{cid}> <{text.encode('utf-16-be').hex().upper()}>"
                return match.group(0)

            def section(match):
                return match.group(1) + re.sub(r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", entry, match.group(2)) + match.group(3)

            updated = re.sub(r"(\d+ beginbfchar\s*)(.*?)(\s*endbfchar)", section, original, flags=re.S)
            if updated != original:
                cmap.set_data(updated.encode("ascii"))
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    temporary = file.with_suffix(".pdf.pending")
    with temporary.open("wb") as stream:
        writer.write(stream)
    os.replace(temporary, file)
    return repaired


if __name__ == "__main__":
    for name in sys.argv[1:]:
        file = Path(name)
        print(f"{file.name}: repaired {finalize(file)} composite Unicode mappings", flush=True)
