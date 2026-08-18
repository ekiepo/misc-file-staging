(() => {
  const state = { token: sessionStorage.getItem('morpheusQrAdminToken') || '', records: [], settings: {}, query: '', filter: 'All', detailId: null };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const shortUrl = (value) => String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const trackingUrl = (record) => `${String(state.settings.trackingBaseUrl || location.origin).replace(/\/$/, '')}/${record.trackingSlug}`;
  const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { Authorization: `Bearer ${state.token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
    });
    let body = {};
    try { body = await response.json(); } catch { /* response has no JSON body */ }
    if (response.status === 401) {
      sessionStorage.removeItem('morpheusQrAdminToken');
      state.token = '';
      showLogin('The administrator token was not accepted.');
      throw new Error(body.error || 'Unauthorized');
    }
    if (!response.ok) throw new Error(body.error || 'Request failed.');
    return body;
  }

  function showLogin(message = '') {
    $('#app').hidden = true;
    $('#login-view').hidden = false;
    $('#login-error').textContent = message;
    $('#login-token').value = '';
    setTimeout(() => $('#login-token').focus(), 0);
  }

  function showApp() {
    $('#login-view').hidden = true;
    $('#app').hidden = false;
  }

  async function loadRegistry() {
    const data = await api('/api/qr');
    state.records = data.records;
    state.settings = data.settings;
    showApp();
    render();
  }

  function notice(message) {
    const element = $('#notice');
    $('span', element).textContent = message;
    element.hidden = false;
    refreshIcons();
  }

  function filteredRecords() {
    const needle = state.query.trim().toLowerCase();
    return state.records.filter((record) => {
      const inFilter = state.filter === 'All' || record.useCase === state.filter;
      const haystack = [record.id, record.label, record.useCase, record.placement, record.finalDestination, record.notes].join(' ').toLowerCase();
      return inFilter && (!needle || haystack.includes(needle));
    });
  }

  function badgeClass(record) {
    if (record.useCase === 'Packaging') return 'badge-orange';
    if (record.useCase === 'User Manual') return 'badge-green';
    return 'badge-blue';
  }

  function renderMetrics() {
    const scans = state.records.reduce((sum, record) => sum + Number(record.scanCount || 0), 0);
    const unique = state.records.reduce((sum, record) => sum + Number(record.uniqueVisitors || 0), 0);
    const active = state.records.filter((record) => record.status === 'active').length;
    const top = [...state.records].sort((a, b) => Number(b.scanCount || 0) - Number(a.scanCount || 0))[0];
    $('#metric-scans').textContent = scans.toLocaleString();
    $('#metric-unique').textContent = unique.toLocaleString();
    $('#metric-active').textContent = active;
    $('#metric-active-note').textContent = `${state.records.length ? Math.round(active / state.records.length * 100) : 0}% of registry`;
    $('#metric-top').textContent = top?.id || '-';
    $('#metric-top-note').textContent = `${Number(top?.scanCount || 0).toLocaleString()} scans`;
    $('#entry-count').textContent = `${state.records.length} entries`;
    $('#health-records').textContent = `${state.records.length} codes`;
  }

  function renderFilters() {
    const values = ['All', ...new Set(state.records.map((record) => record.useCase))];
    const icon = '<i data-lucide="sliders-horizontal"></i>';
    $('#filters').innerHTML = icon + values.map((value) => `<button class="filter-button${state.filter === value ? ' active' : ''}" data-filter="${esc(value)}">${esc(value)}</button>`).join('');
  }

  function renderTable() {
    const records = filteredRecords();
    $('#registry-body').innerHTML = records.map((record) => `
      <tr>
        <td><button class="id-link" data-detail="${esc(record.id)}">${esc(record.id)}</button></td>
        <td><span class="badge ${badgeClass(record)}">${esc(record.useCase)}</span></td>
        <td>${esc(record.placement)}</td>
        <td><strong>${esc(record.label)}</strong></td>
        <td><button class="url-button" data-copy="${esc(trackingUrl(record))}">${esc(shortUrl(trackingUrl(record)))}<i data-lucide="copy"></i></button></td>
        <td><a class="destination-link" href="${esc(record.finalDestination)}" target="_blank" rel="noreferrer">${esc(shortUrl(record.finalDestination))}<i data-lucide="external-link"></i></a></td>
        <td class="align-right scan-count">${Number(record.scanCount || 0).toLocaleString()}</td>
        <td><span class="status ${esc(record.status)}"><i></i>${esc(record.status)}</span></td>
        <td><button class="row-menu" data-edit="${esc(record.id)}" title="Edit ${esc(record.id)}" aria-label="Edit ${esc(record.id)}"><i data-lucide="pencil"></i></button></td>
      </tr>`).join('');
    $('#showing-count').textContent = `Showing ${records.length} of ${state.records.length} codes`;
  }

  function renderAnalytics() {
    const ranked = [...state.records].sort((a, b) => Number(b.scanCount || 0) - Number(a.scanCount || 0)).slice(0, 10);
    const max = Math.max(1, ...ranked.map((record) => Number(record.scanCount || 0)));
    $('#bar-list').innerHTML = ranked.map((record) => `<div class="bar-row"><span>${esc(record.id)}</span><div><i style="width:${Math.max(2, Number(record.scanCount || 0) / max * 100)}%"></i></div><strong>${Number(record.scanCount || 0)}</strong></div>`).join('');
  }

  function render() {
    $('#brand-label').textContent = `${state.settings.brandName || 'Dauer'} / ${state.settings.productName || 'Morpheus'}`.toUpperCase();
    renderMetrics(); renderFilters(); renderTable(); renderAnalytics(); refreshIcons();
  }

  function closeModals() { $$('.modal-backdrop').forEach((modal) => { modal.hidden = true; }); }

  function openEditor(record) {
    const form = $('#editor-form');
    const source = record || { label: '', useCase: 'Packaging', placement: '', finalDestination: '', destinationType: '', notes: '', campaign: state.settings.defaultCampaign || 'morpheus', medium: state.settings.defaultMedium || 'qr', source: state.settings.defaultSource || 'print', status: 'active' };
    ['id', 'label', 'useCase', 'placement', 'finalDestination', 'destinationType', 'notes', 'campaign', 'medium', 'source', 'status'].forEach((key) => { form.elements[key].value = source[key] || ''; });
    $('#editor-eyebrow').textContent = record?.id || 'NEW RECORD';
    $('#editor-title').textContent = record ? 'Edit QR code' : 'Create QR code';
    $('#editor-save').textContent = record ? 'Save changes' : 'Create QR code';
    $('#editor-modal').hidden = false;
    setTimeout(() => form.elements.label.focus(), 0);
  }

  function openDetail(record) {
    state.detailId = record.id;
    $('#detail-title').textContent = record.id;
    $('#detail-label').textContent = record.label;
    $('#detail-placement').textContent = record.placement;
    $('#detail-qr').src = `/api/qr/code/${encodeURIComponent(record.id)}`;
    $('#detail-qr').alt = `QR code for ${record.id}`;
    const url = trackingUrl(record);
    $('#detail-tracking').innerHTML = `${esc(url)}<i data-lucide="copy"></i>`;
    $('#detail-tracking').dataset.copy = url;
    $('#detail-destination').href = record.finalDestination;
    $('#detail-destination').innerHTML = `${esc(record.finalDestination)}<i data-lucide="external-link"></i>`;
    $('#detail-scans').textContent = Number(record.scanCount || 0).toLocaleString();
    $('#detail-unique').textContent = Number(record.uniqueVisitors || 0).toLocaleString();
    $('#detail-status').textContent = record.status;
    $('#detail-download').href = `/api/qr/code/${encodeURIComponent(record.id)}`;
    $('#detail-download').download = `${record.id}.svg`;
    $('#detail-modal').hidden = false;
    refreshIcons();
  }

  function openSettings() {
    const form = $('#settings-form');
    ['brandName', 'productName', 'trackingBaseUrl', 'disabledRedirectUrl'].forEach((key) => { form.elements[key].value = state.settings[key] || ''; });
    $('#settings-modal').hidden = false;
  }

  async function copy(value) {
    await navigator.clipboard.writeText(value);
    notice('Tracking URL copied.');
  }

  function exportCsv() {
    const output = state.records.map((record) => ({
      'QR ID': record.id, 'Use Case': record.useCase, Placement: record.placement,
      'Label / Intent': record.label, 'Tracking URL': trackingUrl(record),
      'Final Destination': record.finalDestination, 'Destination Type': record.destinationType,
      Notes: record.notes, Status: record.status, Scans: record.scanCount || 0,
    }));
    const blob = new Blob([Papa.unparse(output)], { type: 'text/csv;charset=utf-8' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `morpheus-qr-registry-${new Date().toISOString().slice(0,10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function importCsv(file) {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data, errors }) => {
        if (errors.length) return notice(`Import stopped: ${errors[0].message}`);
        const records = data.map((row) => ({
          id: row['QR ID'], useCase: row['Use Case'], placement: row.Placement,
          label: row['Label / Intent'], finalDestination: row['Final Destination'] || row['Permanent URL'],
          destinationType: row['Destination Type'], notes: row.Notes,
        }));
        try {
          const result = await api('/api/qr/import', { method: 'POST', body: JSON.stringify({ records }) });
          notice(`${result.imported} registry records imported.`);
          await loadRegistry();
        } catch (error) { notice(error.message); }
        $('#import-file').value = '';
      },
    });
  }

  $('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    state.token = $('#login-token').value;
    sessionStorage.setItem('morpheusQrAdminToken', state.token);
    $('#login-error').textContent = '';
    try { await loadRegistry(); } catch (error) { if (state.token) $('#login-error').textContent = error.message; }
  });

  $('#logout-button').addEventListener('click', () => { sessionStorage.removeItem('morpheusQrAdminToken'); state.token = ''; showLogin(); });
  $('#notice button').addEventListener('click', () => { $('#notice').hidden = true; });
  $('#new-button').addEventListener('click', () => openEditor(null));
  $('#settings-button').addEventListener('click', openSettings);
  $('#export-button').addEventListener('click', exportCsv);
  $('#import-button').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', (event) => event.target.files[0] && importCsv(event.target.files[0]));
  $('#search').addEventListener('input', (event) => { state.query = event.target.value; renderTable(); refreshIcons(); });
  $('#filters').addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (!button) return; state.filter = button.dataset.filter; renderFilters(); renderTable(); refreshIcons(); });
  $('#registry-body').addEventListener('click', (event) => {
    const copyButton = event.target.closest('[data-copy]'); if (copyButton) return void copy(copyButton.dataset.copy);
    const detailButton = event.target.closest('[data-detail]'); if (detailButton) return openDetail(state.records.find((record) => record.id === detailButton.dataset.detail));
    const editButton = event.target.closest('[data-edit]'); if (editButton) return openEditor(state.records.find((record) => record.id === editButton.dataset.edit));
  });
  $$('.view-tabs button').forEach((button) => button.addEventListener('click', () => {
    $$('.view-tabs button').forEach((item) => item.classList.toggle('active', item === button));
    $('#registry-view').hidden = button.dataset.view !== 'registry';
    $('#analytics-view').hidden = button.dataset.view !== 'analytics';
  }));
  $$('.modal-close').forEach((button) => button.addEventListener('click', closeModals));
  $$('.modal-backdrop').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModals(); }));
  $('#detail-tracking').addEventListener('click', (event) => copy(event.currentTarget.dataset.copy));
  $('#detail-edit').addEventListener('click', () => { const record = state.records.find((item) => item.id === state.detailId); closeModals(); openEditor(record); });

  $('#editor-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const id = values.id; delete values.id;
    const button = $('#editor-save'); button.disabled = true; button.textContent = 'Saving...';
    try {
      const result = await api(id ? `/api/qr/${encodeURIComponent(id)}` : '/api/qr', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(values) });
      closeModals(); notice(id ? `${id} updated.` : `${result.id} created.`); await loadRegistry();
    } catch (error) { notice(error.message); }
    finally { button.disabled = false; button.textContent = id ? 'Save changes' : 'Create QR code'; }
  });

  $('#settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { state.settings = await api('/api/qr/settings', { method: 'PATCH', body: JSON.stringify(values) }); closeModals(); notice('Platform settings updated.'); render(); }
    catch (error) { notice(error.message); }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModals();
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
  });

  refreshIcons();
  if (state.token) loadRegistry().catch(() => {}); else showLogin();
})();
