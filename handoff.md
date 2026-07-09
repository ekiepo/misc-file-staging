# Project Handoff Documentation: Morpheus Product Sheets & User Manual

Welcome! This workspace contains the high-end, responsive, and print-ready product documentation for the **Dauer Manufacturing Morpheus Smart Accent Fixtures** (Uplight and Downlight) and the **Morpheus User Manual**.

---

## 1. System Overview & Architecture

The workspace consists of a central landing page portal, three main document pages, two custom stylesheets, and a compilation script:

### Core Portal & Sheets
* **[index.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/index.html)**: The main landing portal linking to the spec sheets and user manual. It includes the integrated, responsive KLE Reveal animation widget.
* **[spec-sheets - 1/uplight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/uplight.html)**: The specification and ordering sheet for the Morpheus Smart Uplight fixture.
* **[spec-sheets - 1/downlight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/downlight.html)**: The specification and ordering sheet for the Morpheus Smart Downlight fixture.
* **[spec-sheets - 1/manual.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual.html)**: The compiled, 11-page responsive and print-ready Morpheus User Manual.

### Stylesheets
* **[assets/spec-sheet.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/spec-sheet.css)**: Holds the reset, navigation header, grid systems, and print media parameters shared by the Uplight and Downlight spec sheets.
* **[assets/manual.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/manual.css)**: Contains custom overrides specifically tailored for the User Manual layout, pagination, print grids, and spacings.

### Compilation / Build Pipeline
* **[spec-sheets - 1/manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html)**: The source HTML document for the User Manual. **Do not edit `manual.html` directly** for content changes; make changes here instead.
* **[spec-sheets - 1/build_manual.js](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/build_manual.js)**: Node.js compiler script. Run `node build_manual.js` to compile and generate the final `manual.html`.

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

7. **Reversion of Manual Sheet Sizing**:
   * **Problem**: Manual sheets resized to `90%` width on desktop caused layouts to align differently than Uplight and Downlight.
   * **Solution**: Restored manual desktop sheet sizing to match Uplight and Downlight (`width: 8.5in !important` and `height: 11in !important`), preserving the exact letter-size print-preview boundaries.

8. **Synchronized Beam Angle Tables**:
   * **Problem**: The "Beam Angle & Lumen Output" table values in `uplight.html` and `downlight.html` did not match the master values defined in `manual.html`.
   * **Solution**: Mapped the table values from `manual.html` to both spec sheets. Because the column layout differs (with current and output columns shifted), values were mapped columns-by-columns. Also updated the load calculation wattage to `32.28 VA` to be mathematically consistent.

9. **Page 4 Smart Features Synchronization**:
   * **Problem**: Page 4 features card titles, descriptions, and demo video source links diverged between `uplight.html` and `downlight.html`.
   * **Solution**: Synchronized all features cards on page 4 of `downlight.html` (e.g., Optics, Dimming, and Scenes video URLs and descriptions) to match the edits made on `uplight.html`.

10. **KLE Animation Optimization & Portal Integration**:
    * **Problem**: The standalone "KLE Reveal" animation page was heavily bloated (258KB) due to raw `588x588` base64 image assets and woff2 font packages embedded inside the page manifest.
    * **Solution**: Resized the fixture-head image asset to its actual rendering size (`44x44` pixels, reducing it from 98KB to 3.9KB) and replaced base64 fonts with a Google Fonts CDN import. This reduced the standalone page size to **16KB** (a **93.7% size reduction**). The optimized animation was then embedded as a premium dark card directly on [index.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/index.html).

11. **Card Image Tuning (index.html)**:
    * **Problem**: Fixture hero images in the portal cards were cropped and parts were cut off.
    * **Solution**: Configured the document card images (`.doc-card__image`) to use `object-fit: contain` to prevent any image cropping.

12. **Print-only Visibility Adjustments**:
    * **Problem**: The floating print button on the user manual remained visible on paper prints.
    * **Solution**: Configured print stylesheets to completely hide the floating action button (`@media print { .print-button { display: none !important; } }`) to keep print pages clean.

13. **Smallest Font Constraint**:
    * **Problem**: Captions and subtexts were set too small on screens (6.5px), which was unreadable.
    * **Solution**: Enforced an 8px minimum size threshold for screen viewports (e.g., in `.figure-cell_caption` and sub-captions) without altering the layout properties on physical print media.

---

## 3. Developer Guidelines & Lessons Learned

> [!IMPORTANT]
> **Content Modifications**: 
> Always make manual layout/content updates inside [manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html). Once completed, execute the compiler script inside the spec-sheets directory:
> ```bash
> node build_manual.js
> ```

> [!IMPORTANT]
> **Regex Compilation Safety**:
> When editing headers or structural tags in `manual-clean.html`, note that the build script [build_manual.js](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/build_manual.js) uses regex replacement patterns. Make sure replacements support variable spacing (`\s*`) and closing elements, as minor format changes can cause regex mismatches.

> [!TIP]
> **Table Mapping**:
> When syncing table values across spec sheets and manuals, do not assume identical column indices. Check header mappings carefully (e.g. `Delivered Lumens @ 50%` vs `Output ~32%` current levels).

> [!TIP]
> **Layout & Print Syncing**:
> To ensure screen display and print output remain perfectly synchronized, write layout-wide CSS globally inside `assets/spec-sheet.css` or `assets/manual.css`, and use print-specific overrides inside the `@media print` query blocks only when scaling elements for the physical page boundaries.
