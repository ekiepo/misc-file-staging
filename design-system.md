# Dauer Manufacturing: Morpheus Design System & Migration Guide

This document serves as the master specification for the Dauer Manufacturing Morpheus product documentation ecosystem. It defines the design system tokens, core layout patterns, and step-by-step instructions for converting legacy web designs or printed spec-sheets into this premium, responsive, and print-ready digital identity.

---

## 1. Design System Tokens

These tokens represent the source of truth for the Dauer Morpheus visual identity. All styles are defined locally using CSS custom variables to ensure portability.

### 🎨 Color Palette
The colors are split between base scales and semantic mappings. 

| Token Variable | Hex Value | Purpose / Semantic Mapping |
| :--- | :--- | :--- |
| `--dauer-orange-500` | `#f7941d` | **Brand Orange (PMS 138C)**. Used for accent details, links, buttons, and focused borders. |
| `--dauer-orange-600` | `#dd7f0e` | Darker hover state for brand orange interactions. |
| `--dauer-charcoal-950` | `#1c1b1a` | Ultra-dark grey/black background for dark mode headers or KLE widgets. |
| `--dauer-charcoal-900` | `#2b2b2b` | **Deep Grey (90%K)**. The primary text color (ink) and dark headers. |
| `--dauer-charcoal-500` | `#6f6f6f` | Muted charcoal neutral, secondary copy / labels. |
| `--dauer-charcoal-400` | `#8a8a8a` | Light Grey (40%K), used for metadata values or secondary captions. |
| `--dauer-charcoal-300` | `#9a9a9a` | Tertiary placeholders and inactive text elements. |
| `--dauer-paper-0` | `#ffffff` | **Sheet Base**. Pure white, used exclusively for the document pages (`.sheet`). |
| `--dauer-paper-50` | `#f1efea` | Slightly tinted warm neutral. Used for image slots, borders, or table row alternation. |
| `--dauer-paper-100` | `#e2dfd8` | Hairline dividers, light borders, and outlines. |
| `--dauer-paper-200` | `#d8d6cf` | **Deskpad Background**. The warm neutral backing layer that floats the pages. |

---

## 2. Typography Standards
Due to web licensing constraints, the design system utilizes high-quality Google Fonts stand-ins that match the proportions of the physical print faces.

*   **Display Font (`--font-display`)**: `'Archivo Expanded', Helvetica, Arial, sans-serif` (Stand-in for *HelveticaNeue 73 Bold Extended Oblique*)
*   **Body Font (`--font-body`)**: `'Archivo', Helvetica, Arial, sans-serif` (Stand-in for *HelveticaNeue 63 Medium Extended*)
*   **Data Font Setting (`--text-data-variant`)**: `tabular-nums` (Enforces uniform spacing for numbers in spec tables)

### Typography Scale
The hierarchy is specified in typographic points (`pt`) for direct print-scaling, but maps 1-to-1 with pixels in digital-first contexts.

*   **Product Headline (Hero)**: `46pt` (`--text-display-hero`) - Extra bold / Black (`800` or `900`), all-caps.
*   **Section Title**: `22pt` (`--text-display-lg`) - Bold (`700`), all-caps.
*   **Subsection Heading**: `13pt` (`--text-display-sm`) - Semibold/Bold (`600` or `700`).
*   **Body Text (Default)**: `8pt` (`--text-body-md`) - Regular (`400`). Minimum size limit is **`8px`** on digital screens to preserve readability.
*   **Captions / Footnotes**: `6.5pt` (`--text-caption`) - Muted color (`--dauer-charcoal-400`).
*   **Eyebrow Labels**: `7.5pt` (`--text-eyebrow-size`), weight `700`, tracking `0.22em`. Always capitalized.

---

## 3. Spacing & Page Geometry
Every document page simulates a standard physically printed sheet, which requires exact margins and padding structures.

*   **Print Page Width**: `8.5in` (`--page-size-letter-w`)
*   **Print Page Height**: `11in` (`--page-size-letter-h`)
*   **Page Margin (Safety Gutter)**: `0.5in` (`--page-margin`)
*   **Deskpad Padding**: `0.55in` (`--page-deskpad-padding`) - The desktop spacing gap between sheets is strictly synchronized to **`0.4in`**.
*   **Corner Radii**: Stay square. Small radii are only allowed on card corners (`4px` / `6px` / `8px`), never pill-shaped.
*   **Drop Shadows**: Sheets on screen float with `0 2px 14px rgba(0,0,0,.13)` (`--page-sheet-shadow`).

---

## 4. Core Layout Patterns

To achieve consistency when converting old code, you must build components around these structural patterns:

### A. The Dual-State (Screen vs. Print) Layout
A cornerstone of this design system is the use of the same HTML source code to render two entirely different visual representations:

1.  **Digital Screen State (Desktop/Tablet)**:
    *   Documents are rendered inside a warm page wrapper (`.deskpad`) representing the physical workspace.
    *   Sections stack on top of each other. In screen state, they behave like interactive accordion panels (`<details>` tags).
    *   On desktop (`>= 900px`), the accordion headers (`.sheet-section__summary`) are hidden via CSS, and they render as fully expanded sheet blocks.
2.  **Physical Print State (`@media print`)**:
    *   All deskpad colors, background wrappers, header bars, and print action buttons are hidden (`display: none !important`).
    *   The pages break naturally using `page-break-after: always;`.
    *   The document floats onto the pure white paper page with `0.5in` margins.

### B. Interactive Form Fields (Type/Model/Project)
Spec sheets feature form blocks that allow input on screen without disrupting the print layout.

*   **Editable Elements**: Use `<span>` elements configured with `contenteditable="plaintext-only"` and `spellcheck="false"`.
*   **Prevent Line Breaks**: Prevent enter-keys from adding newlines or wrapping content by catching the keystroke via: `onkeydown="if(event.key === 'Enter') event.preventDefault()"`.
*   **Styling Consistency**: Ensure fields have `outline: none;` on focus, and text is aligned to the bottom border (`border-bottom: 1px solid var(--color-text-primary)`).

### C. Writable Form CSS Pattern
```css
.fill-field__line {
  flex: 1;
  border-bottom: 1px solid var(--color-text-primary);
  height: 14px;
  outline: none;
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1;
  padding: 0 4px;
  cursor: text;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
}
```

### D. Video Showcase Section
If featuring hardware videos or tutorials, place them in a dedicated container at the bottom of the portal page:

*   **HTML Structure**:
    ```html
    <section class="video-showcase-section">
      <h3 class="video-showcase-section__title">Showcase Title</h3>
      <div class="video-container">
        <video class="video-element" controls loop muted playsinline>
          <source src="assets/videos/video.mov" type="video/quicktime">
          <source src="assets/videos/video.mp4" type="video/mp4">
        </video>
      </div>
    </section>
    ```
*   **CSS Rules**:
    *   The container has `border-radius: 12px`, `overflow: hidden`, `background-color: #000`, and a soft shadow.
    *   The video element inside should have `width: 100%` and `height: auto` to naturally adapt to its aspect ratio without layout shifts.

### E. The How-To Grid (Fixed 16-Slot Page)

Step-by-step chapters are laid out on a **rigid 4 × 4 grid — 16 slots per page**, enforced on desktop screens and again in print so both states break identically.

```css
.figure-grid {
  grid-template-columns: repeat(4, 1fr) !important;
  grid-template-rows: repeat(4, 1fr) !important;
  gap: 0.15in !important;   /* 0.12in in @media print */
  flex: 1;
  min-height: 0;
}
```

*   **One cell, one slot.** Chapter lead cards (`.chapter-lead-card`) and figure cells (`.figure-cell`) are equal grid children. Nothing spans, so a chapter card consumes a slot exactly like a figure does.
*   **The document is one continuous stream.** Page wrappers are containers, not chapter boundaries. A chapter is expected to begin mid-page and flow across a page break — that is the intended reading rhythm, and forcing every chapter to start on a fresh page would leave large holes.
*   **Cell count is load-bearing.** Because the stream is continuous, inserting or deleting a single cell shifts everything after it and cascades to the last page. Any content change must either preserve a multiple of 16 per page or be followed by a manual repack of every downstream page.
*   **Short pages are allowed only at the end of a chapter.** Trailing empty slots read as a deliberate section break when the chapter also ends there. A short page in the middle of a chapter reads as a layout bug.
*   Whitespace and blank lines inside the grid container do not generate grid items — never count them as spacers.

#### Chapter & Figure Numbering Contract

Three things must agree at all times, and none of them update automatically:

| Element | Location | Must match |
| :--- | :--- | :--- |
| `id="chapter-N"` | on `.chapter-lead-card` | the eyebrow text `CHAPTER N` |
| `FIG N.n` | `.figure-cell__fig` | the chapter its cell sits under, numbered from 1 |
| TOC row | `href="#chapter-N"` + `Chapter N:` label + page number | the `sheet-section` the card actually lands in |

> **Reordering rule.** When a chapter is *moved* rather than inserted, it vacates its old slot and that vacancy absorbs the shift. Only chapters between the destination and the origin are renumbered; everything after the origin keeps its number. Moving Chapter 7 to position 3 renumbers old 3–6 to 4–7 and leaves 8–11 untouched. Assuming "everything after shifts by one" produces a numbering gap.

> **Label parsing warning.** Some `.figure-cell__fig` values are wrapped in an inline `<span style="letter-spacing">`. Strip tags before matching figure numbers — a naive `[^<]*` capture reports those labels as empty and hides real gaps.

---

## 5. Step-by-Step Legacy Conversion Guide

When handed a legacy spec-sheet or manual page, follow these steps to refactor it to the modern Morpheus standard:

### Step 1: Initialize Tokens and Viewports
1.  Import the three token sheets (`colors.css`, `typography.css`, `spacing.css`) at the top of your stylesheet using `@import`.
2.  Set up the global box-sizing rule (`box-sizing: border-box;`) for all elements.
3.  Add the standard meta viewport tag in the `<head>` of your HTML document:
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ```

### Step 2: Establish Page Geometry and Deskpad Wrapper
1.  Wrap the sheets or manual pages inside a `main` or `body` wrapper that inherits the deskpad styling:
    ```css
    body {
      background: var(--color-surface-page);
      font-family: var(--font-body);
      color: var(--color-text-primary);
    }
    ```
2.  Configure each `.sheet` element to have a width of `8.5in` and a height of `11in` on desktop screens. Set margins, paddings, and background properties:
    ```css
    .sheet {
      width: var(--page-size-letter-w);
      height: var(--page-size-letter-h);
      padding: var(--page-margin);
      background: var(--color-surface-sheet);
      box-shadow: var(--page-sheet-shadow);
      margin: 0.4in auto;
      position: relative;
    }
    ```

### Step 3: Refactor the Title Block & Headings
1.  Structure the title block with a standardized layout. Insert the brand logo on the top left and the page number on the top right.
2.  Use the `Archivo Expanded` font face for the fixture name and uppercase subtitle.
3.  Add a capitalized, tracked eyebrow label above secondary sections:
    ```css
    .eyebrow {
      font-family: var(--font-body);
      font-size: var(--text-eyebrow-size);
      font-weight: var(--text-eyebrow-weight);
      letter-spacing: var(--text-eyebrow-tracking);
      color: var(--color-text-accent);
      text-transform: uppercase;
    }
    ```

### Step 4: Configure Writable Areas
1.  Locate metadata inputs (Type, Model, Project) at the top of the sheets.
2.  Convert them from standard static lines or empty input boxes to `contenteditable="plaintext-only"` spans as shown in the layout patterns section.
3.  Verify that no outline flashes or border changes occur during editing, and that pressing "Enter" is ignored.

### Step 5: Structure and Compress Tables
1.  Format all specification tables to use a compact layout with cell paddings between `3.5px` and `5px`.
2.  Enforce `font-variant-numeric: tabular-nums` to ensure numbers align cleanly.
3.  Keep borders thin and clean (`border-bottom: 1px solid var(--color-border)`).
4.  Remove heavy gradients or thick dark borders inside the tables.

### Step 6: Create Print Overrides
1.  At the bottom of the stylesheet, add a `@media print` block.
2.  Strip all box shadows, background properties, page gaps, and header wrappers.
3.  Force pages to break precisely:
    ```css
    @media print {
      body, html {
        background: none;
        color: #000;
      }
      .sheet {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always;
        page-break-inside: avoid;
        width: 100% !important;
        height: 100% !important;
      }
      .print-button, .floating-toc-btn {
        display: none !important;
      }
    }
    ```

---

## 6. Verification Checklist for Agents

Before completing the design system transformation, perform these checks:

*   [ ] **Viewport Check**: Shrink the viewport to `320px` width. Ensure no horizontal scrollbar appears.
*   [ ] **Font Size Threshold**: Ensure no body text on digital screens renders below `8px` (captions can scale smaller for print only).
*   [ ] **Print Margins**: Trigger print preview (`Ctrl+P` / `Cmd+P`). Check that elements on Page 1 (dimensions) and Page 3 (accessories) do not collide with footer lines or spill over onto extra pages.
*   [ ] **Input Stability**: Focus the editable text lines. Verify no active blue outlines appear and that typing text does not shift adjacent layouts.

After any chapter reorder, figure insertion, or content change to the how-to pages, also run:

*   [ ] **Slot Count**: Every how-to page holds exactly 16 grid cells, except pages whose short count coincides with the end of a chapter. No empty slots mid-chapter.
*   [ ] **Figure Sequence**: Strip inline tags, then confirm the `FIG n.n` labels run unbroken from the first chapter to the last — no gaps, no duplicates, no chapter restarting at anything but `.1`.
*   [ ] **Anchor Integrity**: Each `id="chapter-N"` matches its own `CHAPTER N` eyebrow, and each TOC row's `href`, label number, and printed page number all agree with where the card physically sits.
*   [ ] **Cross-References**: Grep the captions for phrases like "see chapter N" — prose references do not renumber themselves and will silently point at the wrong chapter.
*   [ ] **Media Links**: Confirm every `data-video` path resolves on disk, and scan-test the printed QR codes separately (see §7 — the vector and the click target are independent).

---

## 7. Assets & File Naming Conventions

To maintain a clean and reliable asset library, adhere to these guidelines for all images, screenshots, and diagrams added to documentation pages:

*   **Format & Compression**: Store all raster graphics (like app screenshot figures) in **WebP format** (`-q 95` quality threshold) to keep the project lightweight while preserving text readability. Use SVG vectors for diagrams, logos, and QR codes.
*   **Unique Chapter Prefixes**: Always prefix figures with their exact chapter or topic identifier to avoid overwrite collisions (e.g. use `slot-c4-fX.webp` for Chapter 4 Astronomical Timer screens, and `slot-c11-fY.webp` for Chapter 11 Network Diagnosis screens). Never reuse names or placeholder ranges across files.
*   **Decoupling Shared Assets**: When updating spec sheets or manual files, check if an asset (such as `dimension-drawing.png`) is referenced by multiple distinct document types (like both `downlight.html` and `uplight.html`). If the visual change is specific to only one fixture, decouple it by creating a new unique asset (e.g. `downlight-dimension-drawing.webp`) and updating the HTML file rather than overwriting the shared path.
*   **Git Asset Recovery**: If a binary asset is accidentally overwritten, retrieve the previous version from git history by referencing the parent commit:
    ```bash
    git show <commit_hash>^:morpheus/assets/img/manual/slot-colliding-name.webp > morpheus/assets/img/manual/slot-new-name.webp
    ```
*   **Filenames Are Identifiers, Not Descriptions**: Once chapters have been reordered, the `cX` in `slot-cX-fY.webp` and `qr-cX.svg` records where the asset *originated*, not where it renders now. Treat these names as opaque ids. **Do not rename an asset to realign it with a new chapter number** — that is precisely the action that causes the overwrite collisions described above. Find figures by their `FIG n.n` label instead.

### QR Codes vs. Click Targets

A card that offers a how-to video carries **two independent links**, and a reorder only moves one of them:

| Path | Where it lives | Survives a reorder? |
| :--- | :--- | :--- |
| `data-video="…"` | attribute inside the card markup, read by a delegated click handler in `spec-sheet.js` | **Yes** — it travels with the card |
| The QR vector | the URL is baked into the SVG path data at generation time | **No** — and it cannot be checked by reading the HTML |

*   Verify `data-video` by resolving the path on disk. Verify the QR **only** by scanning the rendered code — no amount of source inspection will catch a stale vector.
*   Never reuse one QR vector across two chapters. Sharing a file guarantees the scan is wrong for at least one of them, and produces duplicate `id` attributes (invalid HTML) as a side effect.
*   Avoid literal spaces in media filenames. Browsers tolerate them in a local `src`, but some CDNs and static hosts reject the unencoded URL — prefer hyphens or percent-encoding.
