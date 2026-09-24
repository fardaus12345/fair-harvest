# Fair Harvest — Final Defense Documentation

`Fair_Harvest_Defense_Handbook.pdf` — 146-page A4 handbook written primarily in Bangla with
English technical terminology. It documents the whole project from the audited source code:
architecture, every module, the full API surface, the database design, deployment, known
limitations, and 60+ viva questions with answers.

Everything in it was verified against the repository at branch
`feature/marketplace-completion`, and every screenshot was captured from the app running
against a live PostgreSQL database.

## Rebuilding the PDF

The document is generated from HTML by headless Chromium, in two passes so the table of
contents can carry real page numbers.

```
cd docs/defense/source

python3 mkdiagrams.py          # regenerate the 11 SVG diagrams
python3 mkerd.py               # regenerate the ERD (overwrites d8-erd.svg)

python3 build.py               # assemble index.html with placeholder TOC page numbers
D=$PWD node render.mjs pass1.pdf
python3 pages.py pass1.pdf     # map chapter markers -> page numbers (needs pdftotext)
python3 build.py --pass2       # rebuild index.html with the real page numbers
D=$PWD node render.mjs ../Fair_Harvest_Defense_Handbook.pdf
```

Requirements: Python 3 with Pillow, Node with Playwright (Chromium), poppler-utils
(`pdftotext`, `pdfinfo`), and a Bengali font installed (`fonts-noto-core` provides
Noto Sans Bengali).

## Editing the content

| Path | What it holds |
|---|---|
| `source/parts/*.html` | The chapters, in filename order. Each chapter heading carries an invisible `[[Cn]]` marker that the TOC pass uses to find its page. |
| `source/style.css` | Print stylesheet — A4 page setup, typography, tables, callouts, figures. |
| `source/build.py` | Assembles the parts, generates the table of contents, resolves image extensions. |
| `source/render.mjs` | Chromium print-to-PDF, including the running header and footer. |
| `source/mkdiagrams.py`, `source/mkerd.py` | Generate the SVG diagrams. |
| `source/diagrams/` | The 11 generated diagrams. |
| `source/shots/` | The 29 UI screenshots used as figures. |

Adding a chapter: create a new file under `parts/` (ordering follows the filename), give the
heading the same shape as the existing ones — `<h1 class="chapter" id="chNN"><span class="num">NN</span>Title<span class="mk">[[CNN]]</span></h1>` — and the table of contents picks it up automatically.
