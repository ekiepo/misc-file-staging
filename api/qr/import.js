const {
  ID_PATTERN, loadRegistry, logDestinationChange, requireAdmin, saveRegistry, validateUrl,
} = require('../../lib/qr/store');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(request, response)) return;
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
    if (!Array.isArray(body.records) || body.records.length === 0) return response.status(400).json({ error: 'No records supplied.' });
    const registry = await loadRegistry(request);
    const history = [];
    for (const incoming of body.records) {
      const id = String(incoming.id || '').trim().toUpperCase();
      if (!ID_PATTERN.test(id) || !validateUrl(incoming.finalDestination)) {
        return response.status(400).json({ error: `Invalid registry record: ${id || 'missing ID'}.` });
      }
      const current = registry.records.find((record) => record.id === id);
      const next = {
        id,
        trackingSlug: current?.trackingSlug || id,
        label: String(incoming.label || current?.label || id),
        useCase: String(incoming.useCase || current?.useCase || 'Uncategorized'),
        placement: String(incoming.placement || current?.placement || ''),
        finalDestination: incoming.finalDestination,
        destinationType: String(incoming.destinationType || current?.destinationType || ''),
        notes: String(incoming.notes || current?.notes || ''),
        status: current?.status || 'active',
        campaign: String(incoming.campaign || current?.campaign || registry.settings.defaultCampaign),
        medium: String(incoming.medium || current?.medium || registry.settings.defaultMedium),
        source: String(incoming.source || current?.source || registry.settings.defaultSource),
      };
      if (current) {
        if (current.finalDestination !== next.finalDestination) history.push([id, current.finalDestination, next.finalDestination]);
        Object.assign(current, next);
      } else {
        registry.records.push(next);
      }
    }
    registry.records.sort((a, b) => Number(a.id.match(/\d+$/)[0]) - Number(b.id.match(/\d+$/)[0]));
    await saveRegistry(registry);
    await Promise.all(history.map((entry) => logDestinationChange(...entry)));
    return response.status(200).json({ imported: body.records.length });
  } catch (error) {
    console.error('QR import failed:', error);
    return response.status(500).json({ error: 'Unable to import the registry.' });
  }
};
