"""Inspect saved PDFs, not only the DOM used to print them.

Run with the bundled Python runtime (pypdf). Evidence is written under output/.
This is a structural check, not a claim of PDF-UA or screen-reader acceptance.
"""

import json
from collections import Counter
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output/pdf/book-improvements-2026-11-25/evidence"
OUTPUT.mkdir(parents=True, exist_ok=True)
report = []


def roles_in(node, roles):
    if node is None:
        return
    if isinstance(node, list):
        for child in node:
            roles_in(child, roles)
    elif hasattr(node, "get_object"):
        node = node.get_object()
        if isinstance(node, dict):
            if node.get("/S"):
                roles[str(node["/S"])] += 1
            roles_in(node.get("/K"), roles)


def count_outline(items):
    return sum(count_outline(x) if isinstance(x, list) else 1 for x in items)


for file in sorted((ROOT / "docs/external-sources").glob("book*/*.pdf")):
    reader = PdfReader(file)
    catalog = reader.trailer["/Root"]
    assert catalog.get("/Lang") == "ar", f"Missing Arabic language: {file}"
    assert catalog.get("/MarkInfo", {}).get("/Marked"), f"Not marked: {file}"
    assert catalog.get("/StructTreeRoot"), f"Missing semantic tags: {file}"
    assert count_outline(reader.outline) >= 12, f"Incomplete outline: {file}"
    roles = Counter()
    roles_in(catalog["/StructTreeRoot"], roles)
    for role in ["/H1", "/H2", "/P", "/Link", "/L", "/LI"]:
        assert roles[role] > 0, f"Missing semantic role {role}: {file}"
    destinations = reader.named_destinations
    links = 0
    for page in reader.pages:
        assert 418 <= float(page.mediabox.width) <= 421, f"Unexpected A5 width: {file}"
        assert 594 <= float(page.mediabox.height) <= 597, f"Unexpected A5 height: {file}"
        for item in page.get("/Annots", []):
            annotation = item.get_object()
            if annotation.get("/Subtype") != "/Link":
                continue
            links += 1
            destination = annotation.get("/Dest", annotation.get("/A", {}).get("/D"))
            assert destination is not None, f"Missing link destination: {file}"
            if isinstance(destination, str):
                name = destination if destination in destinations else destination.lstrip("/")
                assert name in destinations, f"Unknown destination {name}: {file}"
                target = reader.get_destination_page_number(destinations[name])
                assert target is not None and 0 <= target < len(reader.pages)
        if file.stem.endswith("light"):
            text = page.extract_text()
            assert text.strip(), f"Empty text layer: {file}"
            assert "\x00" not in text, f"Unmapped combined Arabic marks: {file}"
            assert not any("\ue000" <= c <= "\uf8ff" or c == "\ufffd" for c in text), f"Private-use/replacement text: {file}"
    result = {
        "edition": file.name,
        "pages": len(reader.pages),
        "bookmarks": count_outline(reader.outline),
        "links": links,
        "language": catalog["/Lang"],
        "roles": dict(roles),
        "bytes": file.stat().st_size,
    }
    report.append(result)
    print(f"PASS {file.name}: {len(reader.pages)} pages, {result['bookmarks']} bookmarks, {links} resolved links", flush=True)

assert len(report) == 9, "Expected all nine editions"
(OUTPUT / "pdf-verification.json").write_text(json.dumps(report, indent=2), encoding="utf8")
