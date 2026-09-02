const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_BODY_BYTES = 16 * 1024;
const LEAD_BLOB_PREFIX = 'gie-leads/';

const FIELD_DEFINITIONS = [
  { key: 'first_name', label: 'First Name', required: true, min: 2, max: 60, pattern: /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u },
  { key: 'last_name', label: 'Last Name', required: true, min: 2, max: 60, pattern: /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u },
  { key: 'company_name', label: 'Company Name', required: true, min: 1, max: 120, pattern: /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9'.,&()/# -]*$/u },
  { key: 'title', label: 'Title', required: true, min: 1, max: 100, pattern: /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9'.,&()/# -]*$/u },
  { key: 'phone', label: 'Phone Number', required: true, min: 7, max: 24, pattern: /^[0-9+().\s-]+$/ },
  { key: 'street_address', label: 'Street Address', required: true, min: 4, max: 160, pattern: /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9'.,&()/# -]*$/u },
  { key: 'email', label: 'E-mail Address', required: true, min: 6, max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ },
  { key: 'reporting_distributor', label: 'Reporting Distributor', required: false, min: 0, max: 120, pattern: /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9'.,&()/# -]*$/u },
  { key: 'heard_about', label: 'How Did You Hear About Us?', required: true, min: 1, max: 40 },
];

const HEARD_ABOUT_VALUES = new Set([
  'gie-expo',
  'dauer-representative',
  'distributor',
  'contractor-designer',
  'web-search',
  'social-media',
  'referral',
  'other',
]);

function loadLocalEnv() {
  if (process.env.LEADS_BLOB_READ_WRITE_TOKEN && process.env.LEADS_BLOB_STORE_ID && process.env.LEADS_EXPORT_TOKEN) {
    return;
  }

  const envPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || process.env[match[1]]) {
      return;
    }

    let value = match[2] || '';

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  });
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return typeof value === 'string' ? value : '';
}

function getLeadBlobAuthOptions(request) {
  const staticToken = process.env.LEADS_BLOB_READ_WRITE_TOKEN;

  if (staticToken) {
    return { token: staticToken };
  }

  const oidcToken = firstHeaderValue(request && request.headers && request.headers['x-vercel-oidc-token']) ||
    process.env.VERCEL_OIDC_TOKEN;
  const storeId = process.env.LEADS_BLOB_STORE_ID || process.env.BLOB_STORE_ID;

  if (!oidcToken || !storeId) {
    return null;
  }

  return {
    oidcToken,
    storeId,
  };
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim();
}

function validateLeadPayload(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const errors = {};
  const lead = {};

  if (normalizeString(source.website)) {
    return { ok: false, spam: true, errors: {}, lead: null };
  }

  FIELD_DEFINITIONS.forEach((field) => {
    let value = normalizeString(source[field.key]);

    if (field.key === 'email') {
      value = value.toLowerCase();
    }

    if (!value) {
      if (field.required) {
        errors[field.key] = `${field.label} is required.`;
      }

      lead[field.key] = '';
      return;
    }

    if (value.length < field.min || value.length > field.max) {
      errors[field.key] = `${field.label} has an invalid length.`;
      lead[field.key] = value;
      return;
    }

    if (field.pattern && !field.pattern.test(value)) {
      errors[field.key] = `${field.label} contains unsupported characters.`;
      lead[field.key] = value;
      return;
    }

    if (field.key === 'phone') {
      const digits = value.replace(/\D/g, '');

      if (digits.length < 7 || digits.length > 15) {
        errors[field.key] = 'Phone Number must include 7 to 15 digits.';
      }
    }

    if (field.key === 'heard_about' && !HEARD_ABOUT_VALUES.has(value)) {
      errors[field.key] = 'Choose a valid referral source.';
    }

    lead[field.key] = value;
  });

  return {
    ok: Object.keys(errors).length === 0,
    spam: false,
    errors,
    lead,
  };
}

function normalizeSourcePage(value) {
  const sourcePage = normalizeString(value);

  if (!sourcePage || sourcePage.length > 120 || !sourcePage.startsWith('/')) {
    return '/morpheus-GIE.html';
  }

  return sourcePage;
}

function createLeadRecord(payload) {
  const submittedAt = new Date().toISOString();
  const id = crypto.randomUUID();

  return {
    schema_version: 1,
    id,
    submitted_at: submittedAt,
    source_page: normalizeSourcePage(payload.source_page),
    lead: payload.lead,
  };
}

function leadPathname(record) {
  const month = record.submitted_at.slice(0, 7);
  const timestamp = record.submitted_at.replace(/[:.]/g, '-');
  return `${LEAD_BLOB_PREFIX}${month}/${timestamp}-${record.id}.json`;
}

function jsonResponse(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin;

  if (!origin) {
    return true;
  }

  const host = request.headers.host;
  const configuredOrigins = (process.env.LEADS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch (error) {
    return false;
  }
}

function isAuthorizedExport(request) {
  const configuredToken = process.env.LEADS_EXPORT_TOKEN;

  if (!configuredToken) {
    return false;
  }

  const authHeader = firstHeaderValue(request.headers.authorization);
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const headerToken = firstHeaderValue(request.headers['x-export-token']);
  const submittedToken = bearerToken || headerToken;

  if (!submittedToken || submittedToken.length !== configuredToken.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(submittedToken), Buffer.from(configuredToken));
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers['content-length'] || 0);

  if (contentLength > MAX_BODY_BYTES) {
    const error = new Error('Request body is too large.');
    error.statusCode = 413;
    throw error;
  }

  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === 'string' || Buffer.isBuffer(request.body)) {
    const rawBody = request.body.toString('utf8');

    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }

    return JSON.parse(rawBody);
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }

    chunks.push(buffer);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function recordToCsvRow(record) {
  const lead = record.lead || {};
  const values = [
    record.submitted_at,
    record.id,
    record.source_page,
    ...FIELD_DEFINITIONS.map((field) => lead[field.key] || ''),
  ];

  return values.map(csvEscape).join(',');
}

function csvHeader() {
  return [
    'Submitted At',
    'Submission ID',
    'Source Page',
    ...FIELD_DEFINITIONS.map((field) => field.label),
  ].map(csvEscape).join(',');
}

module.exports = {
  FIELD_DEFINITIONS,
  LEAD_BLOB_PREFIX,
  createLeadRecord,
  csvHeader,
  getLeadBlobAuthOptions,
  isAllowedOrigin,
  isAuthorizedExport,
  jsonResponse,
  leadPathname,
  loadLocalEnv,
  readJsonBody,
  recordToCsvRow,
  validateLeadPayload,
};
