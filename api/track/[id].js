const { ID_PATTERN, loadRegistry, logScan } = require('../../lib/qr/store');

module.exports = async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).send('Method not allowed');
  }
  const id = String(request.query.id || '').toUpperCase();
  if (!ID_PATTERN.test(id)) return response.status(404).send('QR code not found');

  try {
    const registry = await loadRegistry(request);
    const record = registry.records.find((item) => item.id === id || item.trackingSlug === id);
    if (!record) return response.status(404).send('QR code not found');
    if (record.status !== 'active') return response.redirect(302, registry.settings.disabledRedirectUrl);

    const destination = new URL(record.finalDestination);
    if (record.campaign && !destination.searchParams.has('utm_campaign')) destination.searchParams.set('utm_campaign', record.campaign);
    if (record.medium && !destination.searchParams.has('utm_medium')) destination.searchParams.set('utm_medium', record.medium);
    if (record.source && !destination.searchParams.has('utm_source')) destination.searchParams.set('utm_source', record.source);
    destination.searchParams.set('utm_content', record.id);

    if (request.method === 'GET') {
      try { await logScan(request, record); } catch (error) { console.error('Scan logging failed:', error); }
    }
    response.setHeader('Cache-Control', 'no-store');
    return response.redirect(302, destination.toString());
  } catch (error) {
    console.error('QR redirect failed:', error);
    return response.redirect(302, process.env.DISABLED_REDIRECT_URL || 'https://misc-file-staging.vercel.app/');
  }
};
