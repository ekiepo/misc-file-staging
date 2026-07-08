# Project Handoff Documentation: Morpheus Product Sheets & User Manual

Welcome! This workspace contains the high-end, responsive, and print-ready product documentation for the **Dauer Manufacturing Morpheus Smart Accent Fixtures** (Uplight and Downlight) and the **Morpheus User Manual**.

---

## 1. System Overview & Architecture

The workspace consists of three main pages and two stylesheets:

### Core Files
* **[uplight.html](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/uplight.html)**: The specification and ordering sheet for the Morpheus Smart Uplight fixture.
* **[downlight.html](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/downlight.html)**: The specification and ordering sheet for the Morpheus Smart Downlight fixture.
* **[manual.html](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/manual.html)**: The compiled, 11-page responsive and print-ready Morpheus User Manual.

### Stylesheets
* **[assets/spec-sheet.css](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/assets/spec-sheet.css)**: Holds the reset, navigation header, grid systems, and print media parameters shared by the Uplight and Downlight spec sheets.
* **[assets/manual.css](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/assets/manual.css)**: Contains custom overrides specifically tailored for the User Manual layout, pagination, print grids, and spacings.

### Compilation / Build Pipeline
* **[manual-clean.html](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/manual-clean.html)**: The source HTML document for the User Manual. Do not edit `manual.html` directly for content changes; make changes here instead.
* **[scratch/build_manual.js](file:///Users/dannysanchez/.gemini/antigravity-ide/brain/ef0ab7f6-56ae-4403-9247-24d1461b0bf2/scratch/build_manual.js)**: Node.js compiler script. Run `node build_manual.js` to split, label, clean, format, and generate the final `manual.html`.

---

## 2. Key Accomplishments & Resolutions

1. **Clean Codebase (Base64 QR Removal)**:
   * **Problem**: The raw HTML was bloated (200KB+) with heavy inline URL-encoded SVG vectors for the chapter QR codes.
   * **Solution**: Swapped base64 code references with path links pointing directly to local vector assets: `assets/img/manual/qr-cX.svg`. The HTML file compiled size is now **40KB** and human-readable.

2. **Unified Layout & Spacing**:
   * **Accordion summary tabs hidden on desktop**: Removed the grey collapsible accordion title bars (`.sheet-section__summary`) at screens `>= 900px` for all pages. They render as stacked sheets with paper shadows, scrolling fluidly just like a PDF print preview.
   * **Gap spacing consistency**: Synchronized space gaps between page sheets across Uplight, Downlight, and the Manual to `0.4in` for screen viewers on desktop.

3. **Page 1 Cover & Page 3 Specs Margin Fixes**:
   * **Problem**: When clicking print, the bottom of Page 1 (dimensions drawing) and Page 3 (riser grid and accessory pictures) overflowed and collided with footer lines.
   * **Solution**: Set a max-height limit of `1.05in` on the dimension drawing. Shrunk Page 3 accessory pictures to `70px` x `50px`, tightened table cell paddings to `3.5px`, and reduced section headings.

4. **Page 2 QR Code Size Reduction**:
   * **Problem**: The large store app download badges and QR codes pushed the download text title down into the bottom margin.
   * **Solution**: Shrunk the QR codes from `1.35in` to `1.05in` and badges from `1.2in` to `1.0in` wide, lifting the entire block by `60px` to clear the footer margins.

---

## 3. Developer Guidelines & Lessons Learned

> [!IMPORTANT]
> **Content Modifications**: 
> Always make manual layout/content updates inside [manual-clean.html](file:///Users/dannysanchez/Projects/Morpheus/spec-sheets%20-%201/manual-clean.html). Once completed, execute the compiler script using:
> ```bash
> node build_manual.js
> # Note: Run from inside the scratch/ directory
> ```

> [!TIP]
> **Layout & Print Syncing**:
> To ensure screen display and print output remain perfectly synchronized, write layout-wide CSS globally inside `assets/spec-sheet.css` or `assets/manual.css`, and use print-specific overrides inside the `@media print` query blocks only when scaling elements for the physical page boundaries.
