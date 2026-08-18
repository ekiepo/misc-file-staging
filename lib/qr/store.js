const crypto = require('crypto');
const { get, list, put } = require('@vercel/blob');
const seedRecords = require('../../qr/data/seed.json');

const REGISTRY_PATH = 'morpheus-qr/registry.json';
const SCAN_PREFIX = 'morpheus-qr/scans/';
const HISTORY_PREFIX = 'morpheus-qr/history/';
const ID_PATTERN = /^[A-Z0-9]+-QR-\d{3}$/;

function defaultTrackingBase(request) {
  if (process.env.TRACKING_BASE_URL) return process.env.TRACKING_BASE_URL.replace(/\/$/, '');
  return 'https://misc-file-staging.vercel.app';
}

function initialRegistry(request) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: {
      brandName: 'Dauer',
      productName: 'Morpheus',
      trackingBaseUrl: defaultTrackingBase(request),
      idPrefix: process.env.QR_ID_PREFIX || 'MOR-QR-',
      defaultCampaign: process.env.DEFAULT_CAMPAIGN || 'morpheus',
      defaultMedium: process.env.DEFAULT_MEDIUM || 'qr',
      defaultSource: process.env.DEFAULT_SOURCE || 'print',
    disabledRedirectUrl: process.env.DISABLED_REDIRECT_URL || `${defaultTrackingBase(request)}/`,
    },
    records: seedRecords.map((record) => ({ ...record })),
  };
}

async function streamToText(stream) {
  return new Response(stream).text();
}

async function loadRegistry(request) {
  const stored = await get(REGISTRY_PATH, { access: 'private', useCache: false });
  if (stored) return JSON.parse(await streamToText(stored.stream));

  const initial = initialRegistry(request);
  try {
    await put(REGISTRY_PATH, JSON.stringify(initial), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
    return initial;
  } catch (error) {
    const concurrent = await get(REGISTRY_PATH, { access: 'private', useCache: false });
    if (concurrent) return JSON.parse(await streamToText(concurrent.stream));
    throw error;
  }
}

async function saveRegistry(registry) {
  registry.updatedAt = new Date().toISOString();
  await put(REGISTRY_PATH, JSON.stringify(registry), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

async function listEvery(prefix, maxItems = 10000) {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: Math.min(1000, maxItems - blobs.length) });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < maxItems);
  return blobs;
}

async function scanSummary() {
  const blobs = await listEvery(SCAN_PREFIX);
  const summary = new Map();
  for (const blob of blobs) {
    const parts = blob.pathname.split('/');
    const id = parts[2];
    const visitorHash = parts[4]?.split('-')[0] || '';
    if (!ID_PATTERN.test(id)) continue;
    const current = summary.get(id) || { scans: 0, unique: new Set(), lastScannedAt: null };
    current.scans += 1;
    if (visitorHash) current.unique.add(visitorHash);
    if (!current.lastScannedAt || blob.uploadedAt > current.lastScannedAt) current.lastScannedAt = blob.uploadedAt;
    summary.set(id, current);
  }
  return summary;
}

async function recordsWithAnalytics(registry) {
  const summary = await scanSummary();
  return registry.records.map((record) => {
    const stats = summary.get(record.id);
    return {
      ...record,
      scanCount: stats?.scans || 0,
      uniqueVisitors: stats?.unique.size || 0,
      lastScannedAt: stats?.lastScannedAt?.toISOString() || null,
    };
  });
}

function validateUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function nextId(registry) {
  const max = registry.records.reduce((current, record) => {
    const suffix = Number(record.id.match(/(\d+)$/)?.[1] || 0);
    return Math.max(current, suffix);
  }, 0);
  return `${registry.settings.idPrefix}${String(max + 1).padStart(3, '0')}`;
}

function trackingUrl(registry, record) {
  return `${registry.settings.trackingBaseUrl.replace(/\/$/, '')}/${record.trackingSlug}`;
}

function visitorHash(request) {
  const ip = String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.VISITOR_HASH_SALT || 'local-development-only';
  return crypto.createHash('sha256').update(`${salt}:${day}:${ip}`).digest('hex').slice(0, 24);
}

function classifyUserAgent(userAgent) {
  const value = userAgent || '';
  return {
    isBot: /bot|crawler|spider|preview|headless|curl|wget/i.test(value),
    deviceType: /tablet|ipad/i.test(value) ? 'tablet' : /mobile|iphone|android/i.test(value) ? 'mobile' : 'desktop',
    browser: /edg/i.test(value) ? 'Edge' : /chrome|crios/i.test(value) ? 'Chrome' : /firefox|fxios/i.test(value) ? 'Firefox' : /safari/i.test(value) ? 'Safari' : 'Other',
    os: /iphone|ipad|ios/i.test(value) ? 'iOS' : /android/i.test(value) ? 'Android' : /windows/i.test(value) ? 'Windows' : /macintosh|mac os/i.test(value) ? 'macOS' : /linux/i.test(value) ? 'Linux' : 'Other',
  };
}

async function logScan(request, record) {
  const now = new Date();
  const hash = visitorHash(request);
  const ua = classifyUserAgent(request.headers['user-agent']);
  let referrerHost = null;
  try { referrerHost = new URL(request.headers.referer).hostname; } catch { /* no usable referrer */ }
  const event = {
    qrCodeId: record.id,
    scannedAt: now.toISOString(),
    visitorHash: hash,
    country: request.headers['x-vercel-ip-country'] || null,
    region: request.headers['x-vercel-ip-country-region'] || null,
    city: request.headers['x-vercel-ip-city'] || null,
    deviceType: ua.deviceType,
    browser: ua.browser,
    os: ua.os,
    referrerHost,
    isBot: ua.isBot,
  };
  const date = now.toISOString().slice(0, 10);
  const name = `${hash}-${now.getTime()}-${crypto.randomUUID()}.json`;
  await put(`${SCAN_PREFIX}${record.id}/${date}/${name}`, JSON.stringify(event), {
    access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
  });
}

async function logDestinationChange(id, previousDestination, newDestination) {
  const changedAt = new Date().toISOString();
  await put(`${HISTORY_PREFIX}${id}/${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify({
    qrCodeId: id, previousDestination, newDestination, changedAt, changedBy: 'admin',
  }), { access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 });
}

function requireAdmin(request, response) {
  const expected = process.env.QR_ADMIN_TOKEN;
  if (!expected) {
    response.status(503).json({ error: 'QR admin access is not configured.' });
    return false;
  }
  const supplied = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    response.setHeader('WWW-Authenticate', 'Bearer');
    response.status(401).json({ error: 'Invalid admin access token.' });
    return false;
  }
  return true;
}

module.exports = {
  ID_PATTERN,
  loadRegistry,
  logDestinationChange,
  logScan,
  nextId,
  recordsWithAnalytics,
  requireAdmin,
  saveRegistry,
  trackingUrl,
  validateUrl,
};
