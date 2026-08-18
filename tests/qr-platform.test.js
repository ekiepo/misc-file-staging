const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const seed = require('../qr/data/seed.json');
const { ID_PATTERN, nextId, trackingUrl, validateUrl } = require('../lib/qr/store');

test('authoritative registry preserves 30 unique Morpheus IDs', () => {
  assert.equal(seed.length, 30);
  assert.equal(new Set(seed.map((record) => record.id)).size, seed.length);
  assert.ok(seed.every((record) => ID_PATTERN.test(record.id)));
  assert.ok(seed.every((record) => record.trackingSlug === record.id));
  assert.ok(seed.every((record) => validateUrl(record.finalDestination)));
});

test('new IDs continue after the highest preserved suffix', () => {
  const registry = { settings: { idPrefix: 'MOR-QR-' }, records: seed };
  assert.equal(nextId(registry), 'MOR-QR-037');
});

test('tracking URL is independent from the editable destination', () => {
  const registry = { settings: { trackingBaseUrl: 'https://misc-file-staging.vercel.app/' } };
  const record = { trackingSlug: 'MOR-QR-001', finalDestination: 'https://example.com/manual' };
  assert.equal(trackingUrl(registry, record), 'https://misc-file-staging.vercel.app/MOR-QR-001');
});

test('Vercel routes keep registry and public redirects separate', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  assert.deepEqual(config.rewrites, [
    { source: '/qr', destination: '/qr/index.html' },
    { source: '/MOR-QR-:suffix', destination: '/api/track/MOR-QR-:suffix' },
  ]);
});
