"""Inspect saved English complete-edition PDFs and render every page with Poppler."""

import json
import re
import shutil
import subprocess
from collections import Counter
from pathlib import Path
from pypdf import PdfReader
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/english-book-editions-2026-11-25"
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
source_records = json.loads((OUTPUT / "source-comparison.json").read_text(encoding="utf-8"))
for file in sorted(OUTPUT.glob("*-english-*.pdf")):
    reader = PdfReader(file)
    assert reader.pdf_header == "%PDF-1.7", file.name
    catalog = reader.trailer["/Root"]
    assert catalog.get("/Lang") == "en", file.name
    assert catalog.get("/MarkInfo", {}).get("/Marked"), file.name
    roles, languages = Counter(), set()
    structure(catalog.get("/StructTreeRoot"), roles, languages)
    for role in ["/H1", "/H2", "/P", "/Link"]:
        assert roles[role] > 0, (file.name, role)
    assert "ar" in languages, (file.name, languages)
    assert reader.outline, file.name
    source = next(sample for sample in source_records if file.name.startswith(sample["id"] + "-english-"))
    # Printed footers interrupt paragraphs that continue on the next sheet.
    # Remove only the exact generated footer, retaining every reading word.
    extracted = ""
    for number, page in enumerate(reader.pages, 1):
        text = "".join(page.extract_text().split())
        footer = "".join((source["title"] + " · ENGLISH DRAFT " + str(number) + " / " + str(len(reader.pages))).split())
        assert text.endswith(footer), (file.name, number, "footer identity")
        extracted += text[:-len(footer)]
    def verify_text(value):
        if isinstance(value, str):
            assert "".join(value.split()) in extracted, (file.name, value[:80])
        elif isinstance(value, list):
            for item in value:
                verify_text(item)
        elif isinstance(value, dict):
            for key in ["text", "title", "wrong", "right", "items", "caption", "reference"]:
                if key in value:
                    verify_text(value[key])

    for unit in source["pages"]:
        verify_text(unit["title"])
        for block in unit["blocks"]:
            verify_text(block)
        if unit.get("image"):
            verify_text(unit["image"]["caption"])
    for pair in source["pairs"].values():
        assert "".join(pair["english"].split()) in extracted, (file.name, pair["ref"])
    actual_sources = {}
    for number, page in enumerate(reader.pages, 1):
        for source_page in re.findall(r"Arabic\s+source\s+p\.\s+(\d+)\b", page.extract_text()):
            actual_sources.setdefault(source_page, number)
    assert actual_sources == source["pdfPagination"]["sourcePages"], (file.name, "English contents pagination")
    assert len(reader.pages) == source["pdfPagination"]["pages"]
    assert all(str(page) in actual_sources for page in range(1, len(source["pages"]) + 1))
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
    if "-light.pdf" in file.name:
        subprocess.run([poppler, "-png", "-r", "90", str(file), str(prefix)], check=True)
    else:
        subprocess.run([poppler, "-png", "-r", "90", "-f", "8", "-l", "8", str(file), str(prefix)], check=True)
    appearance = file.stem.split("-")[-1]
    expected = {"light": (255, 255, 255), "dark": (23, 25, 22), "navy": (16, 26, 46)}[appearance]
    representative = EVIDENCE / (file.stem + "-08.png")
    with Image.open(representative) as saved_page:
        saved_page = saved_page.convert("RGB")
        for point in [(2, 2), (saved_page.width - 3, 2), (2, saved_page.height - 3)]:
            assert saved_page.getpixel(point) == expected, (file.name, "paper/margin color", point)
        def luminance(color):
            channels = [channel / 255 for channel in color]
            channels = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
            return sum(channel * weight for channel, weight in zip(channels, [0.2126, 0.7152, 0.0722]))

        paper_luminance = luminance(expected)
        pixels = Counter(saved_page.crop((20, int(saved_page.height * .955), saved_page.width - 20, int(saved_page.height * .99))).get_flattened_data())
        contrast = max((max(luminance(color), paper_luminance) + .05) / (min(luminance(color), paper_luminance) + .05) for color, count in pixels.items() if count >= 6)
        assert contrast >= 4.5, (file.name, "saved footer contrast", contrast)
    item = {"file": file.name, "pages": len(reader.pages), "roles": dict(roles), "languages": sorted(languages), "tagged": True, "footerRasterContrastOnPage8": round(contrast, 2), "paperColor": list(expected)}
    report.append(item)
    print(json.dumps(item))
(EVIDENCE / "pdf-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
