const {
  ID_PATTERN, loadRegistry, logDestinationChange, requireAdmin, saveRegistry, validateUrl,
} = require('../../lib/qr/store');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(request, response)) return;
  if (request.method !== 'PATCH') {
    response.setHeader('Allow', 'PATCH');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const id = String(request.query.id || '').toUpperCase();
  if (!ID_PATTERN.test(id)) return response.status(400).json({ error: 'Invalid QR ID.' });

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
    const registry = await loadRegistry(request);
    const record = registry.records.find((item) => item.id === id);
    if (!record) return response.status(404).json({ error: 'QR code not found.' });
    const destination = body.finalDestination ?? record.finalDestination;
    if (!validateUrl(destination)) return response.status(400).json({ error: 'A valid HTTP(S) final destination is required.' });
    const previousDestination = record.finalDestination;
    Object.assign(record, {
      label: String(body.label ?? record.label),
      useCase: String(body.useCase ?? record.useCase),
      placement: String(body.placement ?? record.placement),
      finalDestination: destination,
      destinationType: String(body.destinationType ?? record.destinationType),
      notes: String(body.notes ?? record.notes),
      status: body.status === 'disabled' ? 'disabled' : 'active',
      campaign: String(body.campaign ?? record.campaign),
      medium: String(body.medium ?? record.medium),
      source: String(body.source ?? record.source),
    });
    await saveRegistry(registry);
    if (previousDestination !== record.finalDestination) {
      await logDestinationChange(id, previousDestination, record.finalDestination);
    }
    return response.status(200).json({ id });
  } catch (error) {
    console.error('QR update failed:', error);
    return response.status(500).json({ error: 'Unable to update the QR code.' });
  }
};
