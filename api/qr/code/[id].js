const QRCode = require('qrcode');
const { ID_PATTERN, loadRegistry, trackingUrl } = require('../../../lib/qr/store');

module.exports = async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).send('Method not allowed');
  }
  const id = String(request.query.id || '').toUpperCase();
  if (!ID_PATTERN.test(id)) return response.status(400).send('Invalid QR ID');
  try {
    const registry = await loadRegistry(request);
    const record = registry.records.find((item) => item.id === id);
    if (!record) return response.status(404).send('QR code not found');
    const svg = await QRCode.toString(trackingUrl(registry, record), {
      type: 'svg', errorCorrectionLevel: 'M', margin: 2,
      color: { dark: '#20201f', light: '#ffffff' },
    });
    response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    response.setHeader('Content-Disposition', `inline; filename="${id}.svg"`);
    response.setHeader('Cache-Control', 'public, max-age=300');
    return response.status(200).send(request.method === 'HEAD' ? '' : svg);
  } catch (error) {
    console.error('QR image generation failed:', error);
    return response.status(500).send('Unable to generate QR code');
  }
};
