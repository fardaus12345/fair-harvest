import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
const D = process.env.D;
const out = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage();
await p.goto("file://" + D + "/index.html", { waitUntil: "networkidle" });
await p.emulateMedia({ media: "print" });
await p.waitForTimeout(1200);
await p.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  margin: { top: "20mm", bottom: "18mm", left: "16mm", right: "16mm" },
  headerTemplate: `<div style="font-family:'Noto Sans',sans-serif;font-size:7pt;color:#7b8a83;width:100%;
    padding:0 16mm;display:flex;justify-content:space-between;border-bottom:0.5px solid #d8e2dc;padding-bottom:3px;">
    <span>Fair Harvest — Final Defense Documentation</span><span>AI-Enabled Agricultural Marketplace</span></div>`,
  footerTemplate: `<div style="font-family:'Noto Sans',sans-serif;font-size:7pt;color:#7b8a83;width:100%;
    padding:0 16mm;display:flex;justify-content:space-between;">
    <span>github.com/fardaus12345/fair-harvest</span>
    <span>পৃষ্ঠা <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`
});
await b.close();
console.log("pdf:", out);
