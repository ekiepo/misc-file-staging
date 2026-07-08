# Project Handoff Documentation: Morpheus Product Sheets & User Manual

Welcome! This workspace contains the high-end, responsive, and print-ready product documentation for the **Dauer Manufacturing Morpheus Smart Accent Fixtures** (Uplight and Downlight) and the **Morpheus User Manual**.

---

## 1. System Overview & Architecture

The workspace consists of three main pages and two stylesheets:

### Core Files
* **[uplight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/uplight.html)**: The specification and ordering sheet for the Morpheus Smart Uplight fixture.
* **[downlight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/downlight.html)**: The specification and ordering sheet for the Morpheus Smart Downlight fixture.
* **[manual.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual.html)**: The compiled, 11-page responsive and print-ready Morpheus User Manual.

### Stylesheets
* **[assets/spec-sheet.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/spec-sheet.css)**: Holds the reset, navigation header, grid systems, and print media parameters shared by the Uplight and Downlight spec sheets.
* **[assets/manual.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/manual.css)**: Contains custom overrides specifically tailored for the User Manual layout, pagination, print grids, and spacings.

### Compilation / Build Pipeline
* **[manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html)**: The source HTML document for the User Manual. Do not edit `manual.html` directly for content changes; make changes here instead.
* **[build_manual.js](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/build_manual.js)**: Node.js compiler script. Run `node build_manual.js` to compile and generate the final `manual.html`.

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

4. **Mobile Layout Viewport Overflow Fixes**:
   * **Problem**: Large padding sizes, cover hero image properties (`width: 340px` inline override), info header elements, and QR footer wrappers caused horizontal scrolls on mobile breakpoints.
   * **Solution**: Stripped inline image widths, hid the print action button under `< 480px`, wrapped info layouts vertically, and reduced viewport margins to match narrow screens down to `320px` width cleanly.

5. **Precise Scroll Offset Clearance**:
   * **Problem**: Jumping to chapter or topic anchors scrolled content directly under the sticky header navigation bar, clipping title slots.
   * **Solution**: Configured all targeted container classes and IDs (`.sheet-section`, `.chapter-lead-card`, `.topic-row`, `#beam-angle`, `#ordering-info`) with `scroll-margin-top: 86px` to maintain a clean clearance gap below the header.

6. **Expanded Mobile Pages & Return Button (Manual Only)**:
   * **Problem**: Having collapsible accordions on mobile forced users to open tabs one by one, reducing readability of the user manual.
   * **Solution**: Modified `build_manual.js` to compile the user manual sheets inside simple `div` wrapper containers rather than `<details>` accordions. Pages stack open by default on mobile. Added a fixed floating back-to-TOC button (`.floating-toc-btn`) with `opacity: 0.4` at the bottom-right corner for quick navigation.

7. **Centered Widescreen Desktop Viewport (90% Width / 1150px Max Width)**:
   * **Problem**: Desktop pages were limited to a narrow `8.5in` width on wide screens, creating excessive empty side margins.
   * **Solution**: Changed sheet widths to `90%` of the viewport with a max-width limit of `1150px` on desktop viewports. Flex centered the parent wrappers to prevent shrink-wrap layout collapsing. Set page heights to `auto` on screen view to allow the wider columns to align naturally.

---

## 3. Developer Guidelines & Lessons Learned

> [!IMPORTANT]
> **Content Modifications**: 
> Always make manual layout/content updates inside [manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html). Once completed, execute the compiler script inside the spec-sheets directory:
> ```bash
> node build_manual.js
> ```

> [!TIP]
> **Layout & Print Syncing**:
> To ensure screen display and print output remain perfectly synchronized, write layout-wide CSS globally inside `assets/spec-sheet.css` or `assets/manual.css`, and use print-specific overrides inside the `@media print` query blocks only when scaling elements for the physical page boundaries.
