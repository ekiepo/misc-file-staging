# Agent Onboarding — Morpheus Docs & QR Platform

Start here. This repo is **static, print-ready product documentation** for the Dauer Manufacturing Morpheus Smart Accent Fixtures — the Uplight and Downlight spec sheets, and an 11-chapter User Manual. Plain HTML you edit directly; there is no build step.

A QR scan-tracking platform used to live here too. **That functionality has been moved off this site.** The serverless code left behind is dead — see §1.

---

## 1. Current state — read before you touch anything

This repo is documentation only. There is no build step and no test suite.

The one piece of server-side code is `api/upload.js`, a Blob upload-token endpoint used by the dev-only `upload.html`. Everything else is static HTML, CSS, and assets.

> [!NOTE]
> **The QR scan-tracking platform used to live here and has been fully removed.** If you find references to it in old commits, issues, or stale notes, they are historical — the feature was migrated off this site and is not coming back. Do not reconstruct it.
> Removed: `api/qr/`, `api/track/`, `lib/qr/`, `tests/`, `docs/qr-platform/`, the `/MOR-QR-*` and `/qr/` rules in `vercel.json`, and the `qrcode` / `papaparse` / `lucide` dependencies.

## 2. Repo map

| Path | What it is |
|---|---|
| `index.html` | Public landing portal; links the spec sheets and manual. Embeds the optimized KLE Reveal animation. |
| `launch-hub.html` | Morpheus Launch Toolkit. Replaced the old `qr/index.html` staging UI. Internal tool — do not link it from `index.html`. |
| `morpheus/uplight.html`<br>`morpheus/downlight.html` | Fixture spec + ordering sheets. Near-identical structure; keep them in sync. |
| `morpheus/manual.html` | The 11-chapter User Manual. Standard static HTML, edited directly — the old `build_manual.js` pipeline is gone. |
| `morpheus/assets/spec-sheet.css` | Reset, header, grid, print rules shared by both spec sheets. |
| `morpheus/assets/manual.css` | Manual-only overrides: pagination, print grids, spacing. |
| `morpheus/assets/spec-sheet.js` | Delegated click handlers — video modal (`data-video`) and image zoom. |
| `api/upload.js` | Blob upload-token endpoint, used by `upload.html`. The only serverless route. |
| `vercel.json` | Intentionally empty (`{}`). Its only rules served the removed QR platform. |
| `package.json` | One dependency (`@vercel/blob`). No scripts — there is no test suite. |
| `upload.html` | Dev-only Blob upload utility. Keep unlinked from public pages. |

---

## 3. Running and verifying

```bash
npx vercel dev        # localhost:3000 — serve the docs the way the user does
```

> [!IMPORTANT]
> **Test on `vercel dev`, not a plain static server.** `python3 -m http.server` and the production CDN are both more permissive about URL encoding than `vercel dev` is. A bug can be invisible on one and fatal on another — this exact gap cost a full debugging cycle (see §5).

---

## 4. Rules that constrain edits

> [!IMPORTANT]
> **The 16-slot page grid (manual how-to pages 5–10).**
> Each page is a `.figure-grid` locked to **4 columns × 4 rows = 16 slots**. Chapter lead cards (`.chapter-lead-card`) and figure cells (`.figure-cell`) are each plain grid children occupying **exactly one slot** — no spanning.
> * The manual is one continuous 91-cell stream chopped into `<div class="sheet-section">` wrappers. Chapters routinely start mid-page and run across page boundaries. That is normal.
> * **Adding or removing one cell shifts every following cell to the end of the guide.** Change cells in multiples that keep each page at 16, or manually repack every downstream page.
> * A short page renders visible empty slots. Acceptable only where a chapter break coincides with a page end — currently pages 9 (13 cells) and 10 (14 cells). Never leave a short page mid-chapter.
> * Blank lines inside a `.figure-grid` are whitespace, not grid items. Don't count them as spacers.

> [!CAUTION]
> **Asset filenames do not track chapter numbers.**
> After the Chapter 7 → Chapter 3 reorder, `slot-cX-fY` and `qr-cX` filenames no longer match the chapter that displays them — Chapter 6 renders `slot-c7-*.webp`, Chapter 4 renders `qr-c12.svg`. **Never infer a chapter from a filename, and never rename these assets to "fix" the mismatch** — renaming is what causes silent binary overwrites. Locate figures by their `Fig n.n` label or by reading surrounding markup.

> [!IMPORTANT]
> **No spaces in asset filenames.** All video assets are now hyphenated and lowercase. Keep it that way — see §5 for why this is non-negotiable.

### Verifying a manual reorder

Confirm mechanically, never by eye:

```bash
# Cells per page — pages 5–8 must read 16 (9 and 10 end chapters)
awk '/sheet-section" id=/{split($0,a,"id=\"");split(a[2],b,"\"");p=b[1]}
     /class="figure-cell"|class="chapter-lead-card"/{c[p]++}
     END{for(k in c) print c[k], k}' morpheus/manual.html | sort -k2

# Figure labels must run Fig 1.1 → 11.7, no gaps or repeats.
# Some labels are wrapped in <span style="letter-spacing"> (Fig 2.5–2.7),
# so strip tags first — a plain grep reports those as blank.
python3 -c "import re;s=open('morpheus/manual.html').read();print(' '.join(re.sub(r'<[^>]*>','',m).strip() for m in re.findall(r'<div class=\"figure-cell__fig\">(.*?)</div>',s,re.S)))"
```

Also confirm every TOC `href="#chapter-N"` matches the `Chapter N:` label in its row, and that each row's page number matches the `sheet-section` the card actually landed in.

---

## 5. Lessons learned

> [!CAUTION]
> **`vercel dev` 404s on any path containing an encoded space.**
> Six video files originally had spaces in their names (`Morpheus Shorts - Manual X,Y.mp4`). They served fine from `python3 -m http.server` and fine from the production CDN, but returned **404 on `localhost:3000`** — so every demo link appeared broken in local dev while testing clean everywhere else.
> * Fixed by renaming all six to hyphenated lowercase and updating 11 references across `uplight.html`, `downlight.html`, and `manual.html`.
> * **Diagnostic lesson:** when something "works" in your check but the user still sees breakage, confirm you are testing the same host they are. Verifying against the wrong server produced a confident all-clear on a genuinely broken page.

> [!CAUTION]
> **Bulk "update the video sources" edits have flattened distinct links before.**
> Commit `b571c34` replaced five individually-chosen `data-video` URLs in both spec sheets with a single placeholder (`main-promo-voice.mp4`), so every feature card opened the same clip. It went unnoticed for many commits.
> * Recover prior values by walking history rather than guessing:
>   ```bash
>   for c in $(git log --format=%h -20 -- morpheus/uplight.html); do
>     echo "== $c"; git show $c:morpheus/uplight.html | grep -o 'data-video="[^"]*"' | sort -u
>   done
>   ```
> * After any link edit, assert every target actually resolves — on `vercel dev`, not on disk alone.

> [!CAUTION]
> **A failing endpoint is not automatically a bug. Confirm the feature is still wanted before repairing it.**
> The QR platform removal was done in two stages: the `qr/` UI directory went first, leaving serverless routes, a lib, a test, docs, `vercel.json` rules, and `package.json` deps all pointing at deleted paths. Those routes returned `500` in production.
> * Reading only the code, this looked like an urgent regression with printed QR codes dead in the field, and the obvious fix was to restore the deleted seed data. **That would have resurrected a platform that was deliberately retired.** The feature had been moved off the site entirely; the 500s were the intended end state, not a fault.
> * **Before repairing anything that looks broken, establish that it is still supposed to exist.** Check whether anything actually calls it — `grep` for the routes across HTML and client JS. Zero callers is a strong signal you are looking at a corpse, not a patient.
> * **When you do remove a feature, sweep the whole footprint in one pass** — routes, libs, tests, docs, `vercel.json`, and `package.json` deps and scripts. A partial removal leaves exactly the ambiguous wreckage described above.

> [!TIP]
> **Spec sheets are near-duplicates.** Any change to a shared section of `uplight.html` almost always belongs in `downlight.html` too. Their feature-card blocks sit at identical line numbers. Diff them after editing either.

> [!TIP]
> **Table mapping.** When syncing values across sheets, don't assume identical column indices — check header mappings (`Delivered Lumens @ 50%` vs `Output ~32%`).

> [!TIP]
> **Layout and print stay in sync** by writing layout-wide CSS in `spec-sheet.css` / `manual.css`, using `@media print` overrides only for physical page scaling.

> [!TIP]
> **Replacing manual figures.** Convert to WebP (`cwebp -q 95 new.png -o morpheus/assets/img/manual/slot-cX-fY.webp`). If `cwebp` errors on `libtiff.6.dylib`, run `brew install libtiff`. No HTML edit needed if the filename is unchanged.

> [!CAUTION]
> **Never reuse a screenshot filename across chapters** (e.g. `slot-c11-f1.webp` in both Ch4 and Ch11) — it causes silent overwrites on commit. Recover an overwritten binary from its parent commit:
> ```bash
> git show <hash>^:morpheus/assets/img/manual/slot-name.webp > morpheus/assets/img/manual/slot-new.webp
> ```

---

## 6. Open items

* **Video payload:** `morpheus/assets/videos/` is **752 MB on disk with only 17 files referenced.** The rest are unreferenced legacy clips (`0720.mp4`, `MORPHEUS_06-small.mov`, and others). Prune or move to Blob before this becomes a deploy problem.
* **`MORPHEUS_06-small.mov`** is 45 MB of QuickTime and is the downlight page-1 hero demo. Chrome and Firefox cannot decode it — re-encode to MP4.
* **Uplight hero and card 02 both point at `morpheus-shorts-down-lighting.mp4`** — same clip twice on one page, and it's a downlight clip. Restored as-found; may want a distinct hero.

### Retired concerns

*Kept briefly so they aren't rediscovered as new.*

* **QR vectors with baked-in URLs.** Previously flagged as a print blocker: three vectors (`qr-c5`, `qr-c11`, `qr-c12`) are each used by two chapters in `manual.html`, and their scan destinations are frozen into the vector art. **No longer this repo's concern** — QR destinations are handled by the tracking service that was moved off this site. The duplicate `id` attributes remain in the markup (invalid HTML, nothing depends on them).
  * If a print run is ever prepared from this repo again, confirm with the owner where those codes should resolve before trusting the existing art.
