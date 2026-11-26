"""Read physical English PDF pages from preserved Arabic source-page labels."""

import json
import re
import sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
source_pages = {}
for number, page in enumerate(reader.pages, 1):
    for source in re.findall(r"Arabic\s+source\s+p\.\s+(\d+)\b", page.extract_text()):
        source_pages.setdefault(source, number)
print(json.dumps({"pages": len(reader.pages), "sourcePages": source_pages}))
