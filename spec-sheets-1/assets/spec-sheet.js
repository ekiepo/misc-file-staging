/* ============================================================
   MORPHEUS SPEC SHEET — shared behavior
   Used by uplight.html and downlight.html.

   - Default accordion state: expanded on wide viewports (reads like a
     normal page), collapsed except the first section on narrow/mobile
     viewports (so the visitor isn't handed 5 printed pages of scroll).
   - Sticky nav: hamburger toggle on mobile, anchor links that open the
     target section and scroll to it on any viewport width.
   - Print button triggers the browser print dialog, where the
     @media print stylesheet takes over and forces every section open.
   ============================================================ */

(() => {
  const MOBILE_QUERY = '(max-width: 759px)';
  const sections = Array.from(document.querySelectorAll('.sheet-section'));
  const navLinks = Array.from(document.querySelectorAll('.site-nav__links a'));
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.querySelector('.site-nav__links');
  const printBtn = document.getElementById('printBtn');
  let isPrinting = false;

  function applyDefaultOpenState() {
    if (isPrinting) return;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const hash = window.location.hash.slice(1);
    const hashTarget = hash ? document.getElementById(hash) : null;
    const activeSection = hashTarget ? (hashTarget.classList.contains('sheet-section') ? hashTarget : hashTarget.closest('.sheet-section')) : null;

    sections.forEach((section, i) => {
      if (isMobile) {
        if (section.id === 'contents') {
          section.open = true;
        } else {
          section.open = (activeSection && section === activeSection) || (!activeSection && i === 0);
        }
      } else {
        section.open = true;
      }
    });
  }
  applyDefaultOpenState();
  window.matchMedia(MOBILE_QUERY).addEventListener('change', applyDefaultOpenState);

  const allHashLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      const open = navLinksEl.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  allHashLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      const section = target.classList.contains('sheet-section') ? target : target.closest('.sheet-section');
      if (!section) return;
      event.preventDefault();
      section.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      if (navLinksEl) {
        navLinksEl.classList.remove('is-open');
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Highlight the nav link for whichever section is nearest the top.
  if ('IntersectionObserver' in window && sections.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = byId.get(entry.target.id);
          if (!link) return;
          link.classList.toggle('is-active', entry.isIntersecting);
        });
      },
      { rootMargin: '-96px 0px -70% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Closed <details> content is skipped by the browser's print/paginate
  // pass even when CSS forces it to `display: block` — the only reliable
  // fix is to actually open every section (via the DOM `open` property,
  // not just CSS) before printing, then restore whatever the visitor had
  // before once the print dialog closes.
  let openBeforePrint = null;
  window.addEventListener('beforeprint', () => {
    isPrinting = true;
    openBeforePrint = sections.map((section) => section.open);
    sections.forEach((section) => { section.open = true; });
  });
  window.addEventListener('afterprint', () => {
    isPrinting = false;
    if (!openBeforePrint) return;
    sections.forEach((section, i) => { section.open = openBeforePrint[i]; });
    openBeforePrint = null;
  });

  // --- Video Demo Popup Modal ---
  const dialog = document.createElement('dialog');
  dialog.className = 'video-dialog';
  dialog.id = 'videoDemoDialog';

  const container = document.createElement('div');
  container.className = 'video-dialog-container';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'video-dialog-close';
  closeBtn.setAttribute('aria-label', 'Close video demo');

  const video = document.createElement('video');
  video.className = 'video-dialog-video';
  video.controls = true;
  video.playsInline = true;

  container.appendChild(closeBtn);
  container.appendChild(video);
  dialog.appendChild(container);
  document.body.appendChild(dialog);

  // Close triggers
  closeBtn.addEventListener('click', () => dialog.close());
  
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  // Cleanup on close
  dialog.addEventListener('close', () => {
    video.pause();
    video.src = '';
  });

  // Global click event delegation for data-video triggers
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-video]');
    if (!trigger) return;

    const videoSrc = trigger.getAttribute('data-video');
    if (!videoSrc) return;

    event.preventDefault();
    video.src = videoSrc;
    video.load();

    dialog.showModal();
    video.play().catch((err) => {
      console.warn('Playback prevented or failed:', err);
    });
  });

  // Align scroll to targeted hash after load
  window.addEventListener('load', () => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        const section = target.classList.contains('sheet-section') ? target : target.closest('.sheet-section');
        if (section) {
          section.open = true;
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
          }, 50);
        }
      }
    }
  });

  // --- IES Data Modal ---
  // Map table beam labels to IES filename convention
  const BEAM_MAP = {
    '16°': '15',
    '25°': '25',
    '35°': '35',
    '45°': '45',
    '70°': '70',
    'Horizontal': 'X',
    'Vertical': 'Y',
  };

  // CCT folder mapping
  const CCT_FOLDER = {
    '2700K': '2700K-25-100pct_IESNA2002',
    '3000K': '3000K-35-100pct_IESNA2002',
  };

  // Level suffix per CCT
  const LEVEL_SUFFIX = {
    '2700K': '33',
    '3000K': '32',
  };

  const iesDialog = document.createElement('dialog');
  iesDialog.className = 'ies-dialog';
  iesDialog.id = 'iesDataDialog';

  const iesContainer = document.createElement('div');
  iesContainer.className = 'ies-dialog-container';

  const iesClose = document.createElement('button');
  iesClose.className = 'ies-dialog-close';
  iesClose.setAttribute('aria-label', 'Close');

  const iesTitle = document.createElement('div');
  iesTitle.className = 'ies-dialog-title';

  const iesBody = document.createElement('div');
  iesBody.className = 'ies-dialog-body';

  iesContainer.appendChild(iesClose);
  iesContainer.appendChild(iesTitle);
  iesContainer.appendChild(iesBody);
  iesDialog.appendChild(iesContainer);
  document.body.appendChild(iesDialog);

  // Close triggers
  iesClose.addEventListener('click', () => iesDialog.close());

  iesDialog.addEventListener('click', (event) => {
    if (event.target === iesDialog) {
      iesDialog.close();
    }
  });

  iesDialog.addEventListener('close', () => {
    iesTitle.textContent = '';
    iesBody.innerHTML = '';
  });

  // Helper: build the IES section HTML for a given level
  function buildIesSection(label, pdfUrl, iesUrl) {
    const section = document.createElement('div');
    section.className = 'ies-dialog-section';

    const labelEl = document.createElement('div');
    labelEl.className = 'ies-dialog-section-label';
    labelEl.textContent = label;

    const actions = document.createElement('div');
    actions.className = 'ies-dialog-actions';

    const pdfBtn = document.createElement('a');
    pdfBtn.className = 'ies-dialog-btn ies-dialog-btn--primary';
    // Route through in-site PDF viewer keeping Morpheus header/layout.
    // Use only hash params with already-once-encoded, relative URLs to avoid double-encoding.
    const viewerUrl = new URL('view-pdf.html', window.location.href);
    viewerUrl.search = '';
    viewerUrl.hash = 'src=' + pdfUrl + '&ies=' + iesUrl;
    pdfBtn.href = viewerUrl.toString();
    pdfBtn.target = '_blank';
    pdfBtn.rel = 'noopener noreferrer';
    pdfBtn.textContent = 'View PDF';
    // Ensure new tab open with full query string preserved
    pdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(pdfBtn.href, '_blank', 'noopener');
    });

    const iesBtn = document.createElement('button');
    iesBtn.className = 'ies-dialog-btn ies-dialog-btn--secondary';
    iesBtn.textContent = 'Download IES FILE';
    iesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIesFile(iesUrl);
    });

    actions.appendChild(pdfBtn);
    actions.appendChild(iesBtn);
    section.appendChild(labelEl);
    section.appendChild(actions);

    return section;
  }

  // Helper: Download IES file — fetch + Blob (HTTP) or direct link (file://)
  function downloadIesFile(url) {
    // Use decoded filename so saved file name doesn't contain %25
    const filename = decodeURIComponent(url.split('/').pop() || 'file');

    // Try fetch + Blob (works when served via HTTP, e.g. VS Code Live Preview)
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        // Fallback for file:// — open in new tab so the user can save manually.
        // Chrome blocks the `download` attribute on file:// URLs, so a direct
        // download is not possible without serving via HTTP. The file opens in
        // a new tab showing its content; the user can press Ctrl+S to save.
        window.open(url, '_blank');
      });
  }

  // Global click delegation on data-table rows
  document.addEventListener('click', (event) => {
    const row = event.target.closest('.data-table tbody tr');
    if (!row) return;
    // Ignore group-header rows
    if (row.classList.contains('data-table__group')) return;

    const beamText = row.querySelector('td:first-child')?.textContent?.trim();
    if (!beamText) return;
    const beam = BEAM_MAP[beamText];
    if (!beam) return;

    // Find the CCT from the nearest preceding data-table__group row
    let prev = row.previousElementSibling;
    let cct = null;
    while (prev) {
      if (prev.classList.contains('data-table__group')) {
        const text = prev.textContent;
        if (text.includes('3000K')) { cct = '3000K'; break; }
        if (text.includes('2700K')) { cct = '2700K'; break; }
      }
      prev = prev.previousElementSibling;
    }
    if (!cct) return;

    const folder = CCT_FOLDER[cct];
    const levelSuffix = LEVEL_SUFFIX[cct];

    // Build encoded URLs to safely handle reserved characters like % in filenames
    const folderEnc = encodeURIComponent(folder);
    const stem = `${cct}-${beam}`; // e.g., "3000K-25"
    const baseEnc = `assets/ies_files/${folderEnc}`;

    // Filenames now avoid "%" characters to prevent double-encoding issues
    const file100Pdf = encodeURIComponent(`${stem}-100pct.pdf`);
    const file100Ies = encodeURIComponent(`${stem}-100pct_IESNA2002.IES`);
    const fileLvlPdf = encodeURIComponent(`${stem}-${levelSuffix}pct.pdf`);
    const fileLvlIes = encodeURIComponent(`${stem}-${levelSuffix}pct_IESNA2002.IES`);

    // Build modal content
    iesTitle.innerHTML = `IES Data <small>— ${beamText} · ${cct}</small>`;

    iesBody.innerHTML = '';

    // 100% level
    iesBody.appendChild(buildIesSection(
      '100% Output',
      `${baseEnc}/${file100Pdf}`,
      `${baseEnc}/${file100Ies}`
    ));

    // Reduced level (33% for 2700K, 32% for 3000K)
    iesBody.appendChild(buildIesSection(
      `${levelSuffix}% Output`,
      `${baseEnc}/${fileLvlPdf}`,
      `${baseEnc}/${fileLvlIes}`
    ));

    event.preventDefault();
    iesDialog.showModal();
  });
})();
