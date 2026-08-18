const { loadRegistry, requireAdmin, saveRegistry, validateUrl } = require('../../lib/qr/store');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(request, response)) return;
  if (request.method !== 'PATCH') {
    response.setHeader('Allow', 'PATCH');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
    if (body.trackingBaseUrl && !validateUrl(body.trackingBaseUrl)) return response.status(400).json({ error: 'A valid tracking base URL is required.' });
    if (body.disabledRedirectUrl && !validateUrl(body.disabledRedirectUrl)) return response.status(400).json({ error: 'A valid disabled-code fallback URL is required.' });
    const registry = await loadRegistry(request);
    const allowed = ['brandName', 'productName', 'trackingBaseUrl', 'disabledRedirectUrl'];
    for (const key of allowed) {
      if (typeof body[key] !== 'string' || !body[key].trim()) continue;
      registry.settings[key] = key === 'trackingBaseUrl' ? body[key].trim().replace(/\/$/, '') : body[key].trim();
    }
    await saveRegistry(registry);
    return response.status(200).json(registry.settings);
  } catch (error) {
    console.error('QR settings update failed:', error);
    return response.status(500).json({ error: 'Unable to update platform settings.' });
  }
};
