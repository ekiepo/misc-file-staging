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
})();
