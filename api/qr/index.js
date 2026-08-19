const {
  loadRegistry, nextId, recordsWithAnalytics, requireAdmin, saveRegistry, validateAnalyticsRange, validateUrl,
} = require('../../lib/qr/store');

function bodyOf(request) {
  return typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
}

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(request, response)) return;

  try {
    const registry = await loadRegistry(request);
    if (request.method === 'GET') {
      const from = String(request.query.from || '');
      const to = String(request.query.to || '');
      if (!validateAnalyticsRange({ from, to })) {
        return response.status(400).json({ error: 'Invalid analytics date range.' });
      }
      const records = await recordsWithAnalytics(registry, { from, to });
      return response.status(200).json({ records, settings: registry.settings, updatedAt: registry.updatedAt });
    }

    if (request.method === 'POST') {
      const body = bodyOf(request);
      if (!String(body.label || '').trim()) return response.status(400).json({ error: 'A label is required.' });
      if (!validateUrl(body.finalDestination)) return response.status(400).json({ error: 'A valid HTTP(S) final destination is required.' });
      const id = nextId(registry);
      registry.records.push({
        id,
        trackingSlug: id,
        label: String(body.label).trim(),
        useCase: String(body.useCase || 'Uncategorized'),
        placement: String(body.placement || ''),
        finalDestination: body.finalDestination,
        destinationType: String(body.destinationType || ''),
        notes: String(body.notes || ''),
        status: 'active',
        campaign: String(body.campaign || registry.settings.defaultCampaign),
        medium: String(body.medium || registry.settings.defaultMedium),
        source: String(body.source || registry.settings.defaultSource),
      });
      await saveRegistry(registry);
      return response.status(201).json({ id });
    }

    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('QR registry API failed:', error);
    return response.status(500).json({ error: 'The QR registry is temporarily unavailable.' });
  }
};
