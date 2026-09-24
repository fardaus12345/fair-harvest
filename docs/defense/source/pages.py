# -*- coding: utf-8 -*-
import subprocess, re, json, io, sys, os
D = os.path.dirname(os.path.abspath(__file__))
pdf = sys.argv[1]
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
pages = {}
for i in range(1, n+1):
    t = subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), pdf, "-"],
                       capture_output=True, text=True).stdout
    for mk in re.findall(r"\[\[(C\d+)\]\]", t):
        pages.setdefault(mk, i)
json.dump(pages, io.open(os.path.join(D, "pages.json"), "w", encoding="utf-8"))
print("pages mapped:", len(pages), "of", n, "pdf pages")
