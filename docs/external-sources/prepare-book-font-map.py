"""Rebuild glyph-to-Unicode evidence from the exact embedded WOFF2 fonts.

Maintenance-only dependencies: fonttools and brotli. The normal export needs
only pypdf and this checked map. GSUB reverse mappings recover combined marks
without guessing their meaning from the surrounding Arabic text.
"""

import base64
import hashlib
import json
import unicodedata
from io import BytesIO
from pathlib import Path
from fontTools.agl import toUnicode
from fontTools.ttLib import TTFont

BASE = Path(__file__).resolve().parent
raw = (BASE / "fonts_base64.json").read_bytes()
mapping = {}
for data in json.loads(raw).values():
    font = TTFont(BytesIO(base64.b64decode(data)))
    known = {}
    for code, glyph in sorted(font.getBestCmap().items(), key=lambda item: (0xFB50 <= item[0] <= 0xFEFF, item[0])):
        known.setdefault(glyph, unicodedata.normalize("NFKC", chr(code)))
    for glyph in font.getGlyphOrder():
        text = toUnicode(glyph)
        if text:
            known.setdefault(glyph, unicodedata.normalize("NFKC", text))
    lookups = font["GSUB"].table.LookupList.Lookup if "GSUB" in font else []
    for _ in range(12):
        previous = len(known)
        for lookup in lookups:
            for table in lookup.SubTable:
                table = getattr(table, "ExtSubTable", table)
                for source, target in getattr(table, "mapping", {}).items():
                    if isinstance(target, str) and source in known:
                        known.setdefault(target, known[source])
                for source, ligatures in getattr(table, "ligatures", {}).items():
                    for ligature in ligatures:
                        parts = [source] + ligature.Component
                        if all(glyph in known for glyph in parts):
                            known.setdefault(ligature.LigGlyph, "".join(known[glyph] for glyph in parts))
        if len(known) == previous:
            break
    mapping[font["name"].getDebugName(6)] = {
        str(index): known[glyph].encode("utf-16-be").hex().upper()
        for index, glyph in enumerate(font.getGlyphOrder())
        if glyph in known and "\x00" not in known[glyph]
    }
(BASE / "assets/font-unicode-map.json").write_text(json.dumps({"sourceSha256": hashlib.sha256(raw).hexdigest(), "fonts": mapping}, indent=2) + "\n", encoding="utf8")
