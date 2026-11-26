# Book export assets

`holy-site-1.jpg`, `holy-site-2.jpg` and `holy-site-3.jpg` are the byte-identical photographs already embedded in the previous Umrah HTML editions: Kaaba, Safa/Marwa and the Prophet's Mosque. Keeping them here removes the generator's dependency on another agent's private scratch folder. The fourth embedded photograph duplicated the third. This phase adds no new downloaded photography or new attribution claim.

`font-unicode-map.json` records source-font glyph identities for PDF extraction metadata. Its SHA-256 pins the exact `../fonts_base64.json` input. The map is generated from Unicode cmap entries, glyph names and reverse GSUB substitutions by `../prepare-book-font-map.py`; normal exports need only the checked map and pypdf. Updating fonts requires regenerating/reviewing the map and repeating saved-PDF text/rendering checks.

The book renderer obtains interface icons through the application's existing icon export layer. Umrah stage drawings and the cover motif are decorative vector illustrations inside `../book-presentation.mjs`, accompanied by the complete existing text.
