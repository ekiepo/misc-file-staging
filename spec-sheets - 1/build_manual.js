const fs = require('fs');

const srcPath = '/Users/dannysanchez/Temp Share Repo/misc-file-staging/spec-sheets - 1/manual-clean.html';
const destPath = '/Users/dannysanchez/Temp Share Repo/misc-file-staging/spec-sheets - 1/manual.html';

const html = fs.readFileSync(srcPath, 'utf8');

const parts = html.split('<div data-sheet=""');

const head = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Morpheus — User Manual</title>
<meta name="description" content="Dauer Manufacturing Morpheus Smart Accent Fixture — user manual: setup, safety, and step-by-step how-to guides for the Dauer Smart App.">
<link rel="stylesheet" href="assets/spec-sheet.css">
<link rel="stylesheet" href="assets/manual.css">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-nav">
  <div class="site-nav__brand">
    <img class="site-nav__logo" src="assets/img/logo-mark.png" alt="">
    <span class="site-nav__title"><span class="site-nav__title-main">MORPHEUS</span><small>User Manual</small></span>
  </div>
  <nav class="site-nav__links" aria-label="Section navigation">
    <a href="#cover">Overview</a>
    <a href="#contents">Table of Contents</a>
  </nav>
  <div class="site-nav__actions">
    <button type="button" class="btn-print" id="printBtn">Print / Save PDF</button>
    <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks">
      <span></span><span></span><span></span>
      <span class="sr-only">Menu</span>
    </button>
  </div>
</header>

<main id="main" class="sheet-stack">
`;

const foot = `</main>

<a href="#contents" class="floating-toc-btn" aria-label="Go to Table of Contents">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
</a>

<script src="assets/spec-sheet.js"></script>
</body>
</html>
`;

// Define the 11 page configurations
const pageConfigs = [
  { id: "cover", num: "01", title: "Overview", headerText: "Patent Pending" },
  { id: "contents", num: "02", title: "Table of Contents", headerText: "Contents" },
  { id: "specs-ordering", num: "03", title: "Specs &amp; Ordering", headerText: "Specification Sheet" },
  { id: "safety", num: "04", title: "Safety", headerText: "Safety Information" },
  { id: "page-5", num: "05", title: "How-To Guide · Chapter 1", headerText: "How-To Guide" },
  { id: "page-6", num: "06", title: "How-To Guide · Chapters 2–3", headerText: "How-To Guide" },
  { id: "page-7", num: "07", title: "How-To Guide · Chapters 4–5", headerText: "How-To Guide" },
  { id: "page-8", num: "08", title: "How-To Guide · Chapters 6–8", headerText: "How-To Guide" },
  { id: "page-9", num: "09", title: "How-To Guide · Chapter 9", headerText: "How-To Guide" },
  { id: "page-10", num: "10", title: "How-To Guide · Chapter 10", headerText: "How-To Guide" },
  { id: "additional-topics", num: "11", title: "Additional Topics", headerText: "Additional Topics" }
];

const tocMapping = [
  { text: 'Specifications & Ordering', target: '#specs-ordering', num: '1' },
  { text: 'Beam Angle & Lumen Output', target: '#beam-angle', num: '3' },
  { text: 'Safety Information', target: '#safety', num: '4' },
  { text: 'Chapter 1: Programming the Smart Fixture', target: '#chapter-1', num: '5' },
  { text: 'Chapter 2: Add an Administrator', target: '#chapter-2', num: '6' },
  { text: 'Chapter 3: Share a fixture', target: '#chapter-3', num: '6' },
  { text: 'Chapter 4: Astronomical Timer', target: '#chapter-4', num: '7' },
  { text: 'Chapter 5: Managing Groups', target: '#chapter-5', num: '7' },
  { text: 'Chapter 6: Scheduling', target: '#chapter-6', num: '8' },
  { text: 'Chapter 7: Control Panel Overview', target: '#chapter-7', num: '8' },
  { text: 'Chapter 8: Create a Static Preset', target: '#chapter-8', num: '8' },
  { text: 'Chapter 9: Kinetic Lighting Effect (KLE) Loops', target: '#chapter-9', num: '9' },
  { text: 'Chapter 10: Advanced - Tap-and-Run Presets', target: '#chapter-10', num: '10' },
  { text: '15: Wi-Fi + Bluetooth Pairing', target: '#topic-16', num: '11' },
  { text: '16: Voice Control Setup', target: '#topic-13', num: '11' },
  { text: '17: OTA Firmware Updates', target: '#topic-14', num: '11' },
  { text: '18: Download Dauer Mobile App', target: '#topic-15', num: '11' },
  { text: '19: Placeholder', target: '#topic-19', num: '11' }
];

let bodyHtml = '';

for (let i = 1; i <= 11; i++) {
  const config = pageConfigs[i - 1];
  const pageStr = parts[i];
  const firstCloseIndex = pageStr.indexOf('>');
  const bodyAndFooter = pageStr.slice(firstCloseIndex + 1);
  
  // Find footer using the brand domain marker
  const footerMarker = 'DauerManufacturing.com';
  const footerTextIndex = bodyAndFooter.indexOf(footerMarker);
  const footerStartIndex = bodyAndFooter.lastIndexOf('<div ', footerTextIndex);
  
  // The page body content (excluding footer)
  let pageBody = bodyAndFooter.slice(0, footerStartIndex).trim();
  
  // Clean up the running header at the top using lookahead for the body wrapper start
  pageBody = pageBody.replace(/<div style="flex:none;display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:6px;border-bottom:2px solid #f7941d;">[\s\S]*?(?=<div style="flex:1;min-height:0;)/, '').trim();
  
  // Replace wrapping divs based on page config
  if (i === 1) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:0\.16in;">/g, '<div class="cover-body">');
  } else if (i === 2) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;padding-top:0\.2in;">/g, '<div class="toc-body">');
  } else if (i === 3) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;padding-top:0\.18in;display:flex;flex-direction:column;gap:0\.15in;">/g, '<div class="specs-body">');
  } else if (i === 4) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;padding-top:0\.2in;">/g, '<div class="safety-body">');
  } else if (i >= 5 && i <= 10) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat\(4,1fr\);grid-template-rows:repeat\(4,1fr\);gap:0\.15in;padding-top:0\.14in;">/g, '<div class="figure-grid">');
  } else if (i === 11) {
    pageBody = pageBody.replace(/<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:0\.1in;padding-top:0\.2in;">/g, '<div class="topic-list">');
  }

  // Clean up custom tags `<image-slot id="..." src="..." ...>` -> `<img id="..." src="..." ...>`
  pageBody = pageBody.replace(/<image-slot([^>]*)>/g, (match, attrs) => {
    const srcMatch = attrs.match(/src="([^"]*)"/);
    const styleMatch = attrs.match(/style="([^"]*)"/);
    const idMatch = attrs.match(/id="([^"]*)"/);
    const videoMatch = attrs.match(/data-video="([^"]*)"/);
    
    let res = '<img';
    if (idMatch) res += ` id="${idMatch[1]}"`;
    if (srcMatch) res += ` src="${srcMatch[1]}"`;
    if (videoMatch) res += ` data-video="${videoMatch[1]}"`;
    
    let classes = '';
    if (idMatch && idMatch[1].startsWith('slot-c')) {
      classes = 'figure-cell__img';
    } else if (idMatch && idMatch[1].startsWith('qr-c')) {
      classes = 'qr qr-clickable';
    } else if (idMatch && idMatch[1].startsWith('app-qr-')) {
      classes = 'qr';
    } else if (idMatch && idMatch[1].startsWith('app-badge-')) {
      classes = 'badge';
    } else if (idMatch && idMatch[1] === 'cover-hero') {
      classes = 'cover-hero-img';
    } else if (idMatch && idMatch[1] === 'cover-hero-2') {
      classes = 'cover-hero-img';
    } else if (idMatch && idMatch[1].startsWith('slot-mount-')) {
      classes = 'mount-photo-img';
    } else if (idMatch && (idMatch[1].startsWith('slot-additional-img') || idMatch[1].startsWith('slot-add-'))) {
      classes = 'topic-row-img';
    }
    
    if (classes) res += ` class="${classes}"`;
    res += ` alt=""`;
    
    if (styleMatch) {
      // Strip base64, background/placeholder styles, and fixed 340px width of cover-hero
      let style = styleMatch[1]
        .replace(/background-color:\s*#[a-fA-F0-9]+;?/g, '')
        .replace(/background:\s*#[a-fA-F0-9]+;?/g, '')
        .replace(/width:\s*340px;?/g, '')
        .trim();
      if (style) res += ` style="${style}"`;
    }
    res += '>';
    return res;
  });
  pageBody = pageBody.replace(/<\/image-slot>/g, '');

  // Page 1: Cover Page layout adjustments
  if (i === 1) {
    // Integrated LED eyebrow
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:8\.5pt;font-weight:700;letter-spacing:\.28em;color:#f7941d;text-transform:uppercase;">/g, '<div class="eyebrow">');
    
    // MORPHEUS USER MANUAL title card + Dauer Logo
    pageBody = pageBody.replace(/<div style="display:flex;align-items:center;gap:0\.3in;">[\s\S]*?<img src="assets\/img\/logo-dauer\.png" style="height:\s*0\.9in; object-fit:\s*contain; padding-left:\s*60px; padding-bottom:\s*10px">[\s\S]*?<\/div>/g, 
    `<div class="title-block">
      <div>
        <h1 class="title-block__product">MORPHEUS</h1>
        <div class="title-block__subtitle">User Manual</div>
      </div>
      <img src="assets/img/logo-dauer.png" class="brand-logo" alt="Dauer logo">
    </div>`);

    // Two-column layout grid on Cover
    pageBody = pageBody.replace(/<div style="display:flex;gap:0\.34in;margin-top:0\.34in;flex:1;min-height:0;">/g, '<div class="cover-grid">');
    pageBody = pageBody.replace(/<div style="flex:\s*1\.25;\s*min-width:\s*0;\s*display:\s*flex;\s*flex-direction:\s*column;\s*gap:\s*0\.15in">/g, '<div class="cover-col-media">');
    pageBody = pageBody.replace(/<div style="flex:1;display:flex;flex-direction:column;">/g, '<div class="cover-col-info">');

    // Remove remaining cover page inline styles to prevent overflows
    pageBody = pageBody.replace(/<div style="background:#2b2b2b;border-radius:8px;padding:15px 17px;color:#fff;">/g, '<div class="cover-info__card">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:7\.5pt;font-weight:700;letter-spacing:\.25?em;color:#f7941d;text-transform:uppercase;margin:15px 0 8px;">Specifications<\/div>/g, '<div class="cover-info__title">Specifications</div>');
    pageBody = pageBody.replace(/<div style="display:flex;flex-direction:column;gap:6px;">/g, '<div class="cover-info__list">');
    pageBody = pageBody.replace(/<div style="display:flex;gap:10px;border-bottom:1px solid #e2dfd8;padding-bottom:5px;">/g, '<div class="cover-info__row">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:7\.5pt;font-weight:700;color:#2b2b2b;letter-spacing:\.05em;text-transform:uppercase;width:0\.86in;flex:none;">/g, '<div class="cover-info__label">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:8pt;color:#3a3a3a;line-height:1\.3;">/g, '<div class="cover-info__value">');
    
    // Dimension drawing
    pageBody = pageBody.replace(/<img src="assets\/img\/dimension-drawing\.png" style="width:\s*100%;\s*margin-top:\s*42px;\s*object-fit:\s*contain">/g, '<img src="assets/img/dimension-drawing.png" class="cover-info__drawing" alt="">');
    
    // QR/logos footer
    pageBody = pageBody.replace(/<div style="display:\s*flex;\s*gap:\s*0\.15in;\s*margin-top:\s*auto;\s*align-items:\s*flex-end;\s*justify-content:\s*flex-end">/g, '<div class="cover-info__footer">');
  }

  // Page 2: Table of Contents adjustments
  if (i === 2) {
    let tocHtml = '<div class="toc-list">';
    tocMapping.forEach(item => {
      const isSub = item.text.includes('Chapter ') || item.text.match(/^\d+:/);
      const labelClass = isSub ? 'toc-row__label toc-row__label--sub' : 'toc-row__label';
      tocHtml += `
      <a class="toc-row" href="${item.target}">
        <span class="${labelClass}">${item.text}</span>
        <span class="toc-row__leader"></span>
        <span class="toc-row__num">${item.num}</span>
      </a>`;
    });
    tocHtml += '\n</div>';

    // Swap old TOC text list with classes & anchor links
    pageBody = pageBody.replace(/<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:20pt;font-weight:800;color:#2b2b2b;letter-spacing:\.02em;margin-bottom:0\.16in;">Table of Contents<\/div>[\s\S]*?<div style="margin-top:0\.3in;padding-top:0\.24in;/g, 
    `<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:20pt;font-weight:800;color:#2b2b2b;letter-spacing:.02em;margin-bottom:0.16in;">Table of Contents</div>
    ${tocHtml}
    <div class="toc-appblock" style="margin-top:0.3in;padding-top:0.24in;`);

    // Swap App download buttons with responsive layout block
    pageBody = pageBody.replace(/border-top:1px solid #e2dfd8;display:flex;flex-direction:column;align-items:center;">[\s\S]*?<div style="font-family:\s*'Archivo Expanded',Helvetica,Arial,sans-serif;\s*font-size:\s*17pt;\s*font-weight:\s*400;\s*color:\s*#2b2b2b;\s*letter-spacing:\s*\.01em;\s*text-align:\s*center;\s*margin-top:\s*0\.22in">Download The Dauer App<\/div>/g,
    `border-top: 1px solid #e2dfd8; display: flex; flex-direction: column; align-items: center;">
      <div class="toc-appblock__codes">
        <div class="toc-appblock__col">
          <img id="app-qr-android" class="qr" src="assets/img/manual/app-qr-android.webp" alt="Google Play QR code">
          <img id="app-badge-google-play" class="badge" src="assets/img/manual/app-badge-google-play.webp" alt="Get it on Google Play badge">
        </div>
        <div class="toc-appblock__col">
          <img id="app-qr-ios" class="qr" src="assets/img/manual/app-qr-ios.webp" alt="App Store QR code">
          <img id="app-badge-app-store" class="badge" src="assets/img/manual/app-badge-app-store.webp" alt="Download on the App Store badge">
        </div>
      </div>
      <div class="toc-appblock__title">Download The Dauer App</div>`);
  }

  // Page 3: Specs & Ordering table & lists
  if (i === 3) {
    pageBody = pageBody.replace(/<table style="width:100%;border-collapse:collapse;border:1px solid #e2dfd8;border-radius:6px;overflow:hidden;">/g, '<div class="table-scroll"><table class="data-table">');
    pageBody = pageBody.replace(/<\/table>/, '</table></div>');
    
    // Add IDs to spec sheet content titles
    pageBody = pageBody.replace(
      /<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:18pt;font-weight:800;color:#2b2b2b;letter-spacing:\.02em;">Beam Angle &amp; Lumen Output<\/div>/g,
      '<div id="beam-angle" style="font-family:\'Archivo Expanded\',Helvetica,Arial,sans-serif;font-size:18pt;font-weight:800;color:#2b2b2b;letter-spacing:.02em;">Beam Angle &amp; Lumen Output</div>'
    );
    pageBody = pageBody.replace(
      /<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:18pt;font-weight:800;color:#2b2b2b;letter-spacing:\.02em;">Ordering Information<\/div>/g,
      '<div id="ordering-info" style="font-family:\'Archivo Expanded\',Helvetica,Arial,sans-serif;font-size:18pt;font-weight:800;color:#2b2b2b;letter-spacing:.02em;">Ordering Information</div>'
    );
    
    // Ordering Info Titles
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',\s*Helvetica,\s*Arial,\s*sans-serif;\s*font-size:\s*8pt;\s*font-weight:\s*700;\s*letter-spacing:\s*\.16em;\s*color:\s*#f7941d;\s*text-transform:\s*uppercase;\s*margin-bottom:\s*7px;\s*margin-top:\s*5px">Fixture Ordering\s*—\s*Uplight Mounting[^<]*<\/div>/g, 
      '<div class="specs-section-title">Fixture Ordering — Uplight Mounting (ordered separately)</div>');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',\s*Helvetica,\s*Arial,\s*sans-serif;\s*font-size:\s*8pt;\s*font-weight:\s*700;\s*letter-spacing:\s*\.16em;\s*color:\s*#f7941d;\s*text-transform:\s*uppercase;\s*margin-bottom:\s*7px;">Fixture Ordering\s*—\s*Downlight Mounting[^<]*<\/div>/g, 
      '<div class="specs-section-title">Fixture Ordering — Downlight Mounting (ordered separately)</div>');

    // Ordering Grids and cells (using global replace to capture both grids)
    pageBody = pageBody.replace(/<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 22px;">/g, '<div class="specs-ref-grid">');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;\s*font-size:\s*7\.8pt;\s*color:\s*#3a3a3a;\s*padding:\s*3px\s*0;\s*border-bottom:\s*1px\s*solid\s*#e2dfd8;">/g, '<div class="specs-ref-cell">');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;\s*font-size:\s*7\.8pt;\s*color:\s*#3a3a3a;\s*padding:\s*3px\s*0;">/g, '<div class="specs-ref-cell empty-cell">');

    // Headers in the reference grids
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;font-size:7pt;font-weight:700;letter-spacing:\.1em;color:#2b2b2b;text-transform:uppercase;padding:5px 0 3px;border-bottom:1px solid #2b2b2b;background:#f1efea;grid-column:1\/-1;">MOUNTING<\/div>/g, '<div class="specs-ref-header">Mounting</div>');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;font-size:7pt;font-weight:700;letter-spacing:\.1em;color:#2b2b2b;text-transform:uppercase;padding:5px 0 3px;border-bottom:1px solid #2b2b2b;background:#f1efea;">MOUNTING<\/div>/g, '<div class="ref-table__title">Mounting</div>');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;font-size:7pt;font-weight:700;letter-spacing:\.1em;color:#2b2b2b;text-transform:uppercase;padding:5px 0 3px;border-bottom:1px solid #2b2b2b;background:#f1efea;">RISER<\/div>/g, '<div class="ref-table__title">Riser</div>');
    
    // Accessory Grid bottom block (replace style instead of classes)
    pageBody = pageBody.replace(/<div style="display:grid;grid-template-columns:1fr auto 1fr auto;gap:5px 8px;margin-top:6px;align-items:center;">/g, '<div class="mount-photos-grid">');
    
    // Accessory text labels
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;\s*font-size:\s*7\.8pt;\s*color:\s*#3a3a3a;\s*padding:\s*3px\s*0;\s*border-bottom:\s*1px\s*solid\s*#e2dfd8;\s*width:\s*200px;\s*text-align:\s*right">/g, '<div class="mount-photo-label">');
    pageBody = pageBody.replace(/<div style="font-family:\s*'Archivo',Helvetica,Arial,sans-serif;\s*font-size:\s*7\.8pt;\s*color:\s*#3a3a3a;\s*padding:\s*3px\s*0;\s*border-bottom:\s*1px\s*solid\s*#e2dfd8;\s*width:\s*200px;\s*text-align:\s*right"\s*>/g, '<div class="mount-photo-label">');
  }

  // Page 4: Safety Information list
  if (i === 4) {
    pageBody = pageBody.replace(/<div style="display:flex;flex-direction:column;gap:13px;">/g, '<div class="safety-list">');
    pageBody = pageBody.replace(/<div style="display:flex;gap:14px;align-items:flex-start;">/g, '<div class="safety-item">');
    pageBody = pageBody.replace(/<div style="flex:none;width:26px;height:26px;border-radius:50%;background:#2b2b2b;color:#fff;font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-weight:700;font-size:11pt;display:flex;align-items:center;justify-content:center;">(\d+)<\/div>/g, '<div class="safety-item__num">$1</div>');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:10pt;line-height:1\.45;color:#3a3a3a;padding-top:3px;text-wrap:pretty;">/g, '<div class="safety-item__text">');
  }

  // Pages 5 to 10: How-To grids
  if (i >= 5 && i <= 10) {
    pageBody = pageBody.replace(/<div style="display:flex;flex-direction:column;border:1px solid #e2dfd8;border-radius:5px;overflow:hidden;background:#fff;break-inside:avoid;min-height:0;">/g, '<div class="figure-cell">');
    pageBody = pageBody.replace(/<div style="padding:5px 7px 6px;flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;">/g, '<div class="figure-cell__body">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:6pt;font-weight:700;letter-spacing:\.12em;color:#f7941d;text-transform:uppercase;margin-bottom:2px;">/g, '<div class="figure-cell__fig">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:var\(--text-fs,6\.5pt\);line-height:1\.28;color:#3a3a3a;text-wrap:pretty;overflow:hidden;">/g, '<div class="figure-cell__caption">');
    
    // Chapter Title Cards inside grid (injecting their ID programmatically)
    pageBody = pageBody.replace(/<div style="display:\s*(?:flex|none);[^>]*?(?:background:#f1efea|#f1efea)[^>]*?">([\s\S]*?<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:6pt;font-weight:700;letter-spacing:\.22em;color:#f7941d;text-transform:uppercase;">CHAPTER\s*(\d+)(?:\s*[a-zA-Z]+)?<\/div>)/gi, (match, inner, num) => {
      return `<div class="chapter-lead-card" id="chapter-${num}">${inner}`;
    });
    
    // Fallback replace for any lead cards that do not match the above regex
    pageBody = pageBody.replace(/<div style="display:\s*none;\s*flex-direction:\s*column;\s*align-items:\s*center;\s*justify-content:\s*center;\s*gap:\s*5px;\s*border-radius:\s*5px;\s*background:\s*#f1efea;\s*padding:\s*9px\s*7px;\s*break-inside:\s*avoid;\s*text-align:\s*center;\s*min-height:\s*0;\s*overflow:\s*hidden">/g, 
      '<div class="chapter-lead-card">');
    pageBody = pageBody.replace(/<div style="display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*center;\s*justify-content:\s*center;\s*gap:\s*5px;\s*border-radius:\s*5px;\s*background:\s*#f1efea;\s*padding:\s*9px\s*7px;\s*break-inside:\s*avoid;\s*text-align:\s*center;\s*min-height:\s*0;\s*overflow:\s*hidden">/g, 
      '<div class="chapter-lead-card">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:6pt;font-weight:700;letter-spacing:\.22em;color:#f7941d;text-transform:uppercase;">/g, '<div class="chapter-lead-card__eyebrow">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:9pt;font-weight:700;color:#2b2b2b;line-height:1\.12;letter-spacing:\.01em;">/g, '<div class="chapter-lead-card__title">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:5\.2pt;font-weight:700;letter-spacing:\.1em;color:#6a6a6a;text-transform:uppercase;white-space:nowrap;">/g, '<div class="chapter-lead-card__caption">');
  }

  // Page 11: Additional Topics
  if (i === 11) {
    // Replaces topic row containers and injects IDs based on the topic number
    pageBody = pageBody.replace(/<div style="display:flex;gap:14px;align-items:flex-start;padding:11px 0;border-top:1px solid #ece9e1;">([\s\S]*?<div style="flex:none;width:0\.36in;font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:14pt;font-weight:800;color:#f7941d;line-height:1;padding-top:1px;">(\d+)<\/div>)/gi, (match, inner, num) => {
      return `<div class="topic-row" id="topic-${num}">${inner}`;
    });
    // Replaces topic number wrapper class
    pageBody = pageBody.replace(/<div style="flex:none;width:0\.36in;font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:14pt;font-weight:800;color:#f7941d;line-height:1;padding-top:1px;">/g, '<div class="topic-row__num">');
    pageBody = pageBody.replace(/<div style="flex:1;min-width:0;">/g, '<div class="topic-row__body">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:6\.5pt;font-weight:700;letter-spacing:\.12em;color:#9a9a9a;text-transform:uppercase;margin-top:3px;">/g, '<div class="topic-row__eyebrow">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo Expanded',Helvetica,Arial,sans-serif;font-size:11pt;font-weight:700;color:#2b2b2b;line-height:1\.18;">/g, '<div class="topic-row__title">');
    pageBody = pageBody.replace(/<div style="font-family:'Archivo',Helvetica,Arial,sans-serif;font-size:9pt;line-height:1\.4;color:#3a3a3a;margin-top:5px;">/g, '<div class="topic-row__text">');
    
    // Wraps topic images
    pageBody = pageBody.replace(/<img id="slot-add-(\d+)" class="topic-row-img"([^>]*)>/g, (match, num, rest) => {
      return `<div class="topic-row__shot"><img id="slot-add-${num}" class="topic-row-img"${rest}></div>`;
    });
  }

  // Replace heavy inline QR code SVGs with clean external SVG files
  // Supports chapter codes with alphanumeric suffixes (like qr-c9b)
  pageBody = pageBody.replace(/<img id="([^"]*qr-[a-zA-Z0-9_-]+)" src="[^"]+"([^>]*)>/g, (match, id, rest) => {
    return `<img id="${id}" src="assets/img/manual/${id}.svg"${rest}>`;
  });

  // Header and Footer formatting
  const middleText = (i === 3) ? 'Morpheus Smart Accent Fixture - page 3' : 'Morpheus Smart Accent Fixture';
  
  const headerHtml = `        <header class="sheet-header">
          <div class="sheet-header__brand">
            <img class="sheet-header__logo" src="assets/img/logo-mark.png" alt="Dauer logo mark">
            <div class="sheet-header__product">MORPHEUS<small>User Manual</small></div>
          </div>
          <div class="sheet-header__section">${config.headerText}</div>
        </header>`;

  const footerHtml = `        <footer class="sheet-footer">
          <div>DauerManufacturing.com&nbsp;·&nbsp;888.DAUER.LED</div>
          <div class="sheet-footer__doc">${middleText}</div>
          <div class="sheet-footer__page">${i}</div>
        </footer>`;

  bodyHtml += `  <div class="sheet-section" id="${config.id}">
    <div class="sheet-section__body">
      <section class="sheet">
${headerHtml}
        <div class="sheet-body">
${pageBody}
        </div>
${footerHtml}
      </section>
    </div>
  </div>
\n`;
}

fs.writeFileSync(destPath, head + bodyHtml + foot);
console.log('Build complete! Wrote manual.html successfully.');
