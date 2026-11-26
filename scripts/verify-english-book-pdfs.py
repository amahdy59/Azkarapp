"""Inspect saved English review PDFs and render every page with Poppler."""

import json
import shutil
import subprocess
from collections import Counter
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/english-book-samples-2026-11-25"
EVIDENCE = OUTPUT / "evidence"
EVIDENCE.mkdir(parents=True, exist_ok=True)
report = []


def structure(node, roles, languages):
    if isinstance(node, list):
        for child in node:
            structure(child, roles, languages)
    elif hasattr(node, "get_object"):
        value = node.get_object()
        if isinstance(value, dict):
            if value.get("/S"):
                roles[str(value["/S"])] += 1
            if value.get("/Lang"):
                languages.add(str(value["/Lang"]))
            structure(value.get("/K"), roles, languages)


poppler = shutil.which("pdftoppm")
assert poppler, "Poppler is required for saved-PDF visual verification"
source_records = json.loads((OUTPUT / "source-comparison.json").read_text(encoding="utf-8"))["samples"]
for file in sorted(OUTPUT.glob("*-english-sample.pdf")):
    reader = PdfReader(file)
    catalog = reader.trailer["/Root"]
    assert catalog.get("/Lang") == "en", file.name
    assert catalog.get("/MarkInfo", {}).get("/Marked"), file.name
    roles, languages = Counter(), set()
    structure(catalog.get("/StructTreeRoot"), roles, languages)
    for role in ["/H1", "/H2", "/P", "/Link"]:
        assert roles[role] > 0, (file.name, role)
    assert "ar" in languages, (file.name, languages)
    assert reader.outline, file.name
    source = next(sample for sample in source_records if file.name == sample["id"] + "-english-sample.pdf")
    extracted = "".join("".join(page.extract_text().split()) for page in reader.pages)
    for section in source["sections"]:
        for pair in section["pairs"]:
            assert "".join(pair["english"].split()) in extracted, (file.name, pair["ref"])
    for number, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        assert text.strip(), (file.name, number)
        assert "\x00" not in text and "\ufffd" not in text, (file.name, number)
        assert not any("\ue000" <= char <= "\uf8ff" for char in text), (file.name, number)
        assert 418 <= float(page.mediabox.width) <= 421
        assert 594 <= float(page.mediabox.height) <= 597
    prefix = EVIDENCE / file.stem
    for previous in EVIDENCE.glob(file.stem + "-[0-9]*.png"):
        assert previous.resolve().parent == EVIDENCE.resolve()
        previous.unlink()
    subprocess.run([poppler, "-png", "-r", "110", str(file), str(prefix)], check=True)
    item = {"file": file.name, "pages": len(reader.pages), "roles": dict(roles), "languages": sorted(languages), "tagged": True}
    report.append(item)
    print(json.dumps(item))
(EVIDENCE / "pdf-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
