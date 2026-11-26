"""Paint an artifact background across the saved page, retaining tags and links.

Chromium clips HTML backgrounds to the print content box. A page-sized PDF
artifact supplies the chosen paper color in the margins too. It introduces no
text or image and leaves every original reading stream and structure intact.
"""

import os
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DecodedStreamObject, NameObject

COLORS = {"light": "ffffff", "dark": "171916", "navy": "101a2e"}


def finalize(file, appearance):
    color = COLORS[appearance]
    channels = " ".join(f"{int(color[index:index + 2], 16) / 255:.8f}" for index in [0, 2, 4])
    writer = PdfWriter()
    writer.clone_document_from_reader(PdfReader(file))
    writer.pdf_header = "%PDF-1.7"
    for page in writer.pages:
        box = page.mediabox
        background = DecodedStreamObject()
        background.set_data(
            (f"/Artifact BMC q {channels} rg {float(box.left):.4f} {float(box.bottom):.4f} "
             f"{float(box.width):.4f} {float(box.height):.4f} re f Q EMC\n").encode("ascii")
        )
        previous = page.raw_get("/Contents")
        streams = previous.get_object()
        if not isinstance(streams, ArrayObject):
            streams = [previous]
        page[NameObject("/Contents")] = ArrayObject([writer._add_object(background), *streams])
    temporary = file.with_suffix(".pdf.pending")
    with temporary.open("wb") as stream:
        writer.write(stream)
    os.replace(temporary, file)


if __name__ == "__main__":
    file = Path(sys.argv[1])
    assert file.is_file() and file.suffix == ".pdf"
    finalize(file, sys.argv[2])
