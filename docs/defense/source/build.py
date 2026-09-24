# -*- coding: utf-8 -*-
import os, re, glob, io, json, sys

D = os.path.dirname(os.path.abspath(__file__))
PARTS = sorted(glob.glob(os.path.join(D, "parts", "*.html")))

def body():
    out = []
    for p in PARTS:
        out.append(io.open(p, encoding="utf-8").read())
    return "\n".join(out)

BODY = body()

_shots = json.load(io.open(os.path.join(D, "shots.json"), encoding="utf-8"))
def _fix(m):
    return 'src="shots/%s"' % _shots.get(m.group(1), m.group(1) + ".png")
BODY = re.sub(r'src="shots/([0-9a-z\-]+?)(?:\.png)?"', _fix, BODY)

# ---- build TOC spec ------------------------------------------------------
items = []   # (kind, label, marker)
token = re.compile(
    r'<!--PART:(?P<part>[^-]*?)-->'
    r'|<h1 class="chapter" id="ch(?P<id>\d+)"><span class="num">(?P<num>\d+)</span>(?P<title>.*?)<span class="mk">\[\[(?P<mk>C\d+)\]\]</span></h1>',
    re.S)
for m in token.finditer(BODY):
    if m.group("part"):
        items.append(("part", m.group("part").strip(), None))
    else:
        title = re.sub(r'<[^>]+>', '', m.group("title")).strip()
        items.append(("ch", (m.group("num"), title), m.group("mk")))

def toc_html(pages):
    rows = ['<section class="toc"><h1>সূচিপত্র  <span style="font-size:11pt;color:#5a6b62">(Table of Contents)</span></h1>']
    for kind, val, mk in items:
        if kind == "part":
            rows.append(f'<div class="tocRow part"><span class="t">{val}</span><span class="d"></span><span class="p"></span></div>')
        else:
            num, title = val
            pg = pages.get(mk, "—")
            rows.append(f'<div class="tocRow"><span class="t">{num}.&nbsp; {title}</span>'
                        f'<span class="d"></span><span class="p">{pg}</span></div>')
    rows.append('</section>')
    return "\n".join(rows)

def page(pages):
    css = io.open(os.path.join(D, "style.css"), encoding="utf-8").read()
    return ("<!doctype html><html lang=\"bn\"><head><meta charset=\"utf-8\">"
            "<title>Fair Harvest — Defense Documentation</title>"
            f"<style>{css}</style></head><body>"
            + BODY.split("<!--PART:", 1)[0]          # cover (before first part marker)
            + toc_html(pages)
            + "<!--PART:" + BODY.split("<!--PART:", 1)[1]
            + "</body></html>")

if __name__ == "__main__":
    pages = {}
    pf = os.path.join(D, "pages.json")
    if os.path.exists(pf) and "--pass2" in sys.argv:
        pages = json.load(io.open(pf, encoding="utf-8"))
    else:
        pages = {mk: "00" for _, _, mk in items if mk}
    io.open(os.path.join(D, "index.html"), "w", encoding="utf-8").write(page(pages))
    print("index.html written · chapters:", sum(1 for k, _, _ in items if k == "ch"))
