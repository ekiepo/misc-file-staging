const { put } = require('@vercel/blob');
const {
  createLeadRecord,
  getLeadBlobAuthOptions,
  isAllowedOrigin,
  jsonResponse,
  leadPathname,
  loadLocalEnv,
  readJsonBody,
  validateLeadPayload,
} = require('../lib/gie-leads');

loadLocalEnv();

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return jsonResponse(response, 405, { error: 'Method Not Allowed' });
  }

  if (!isAllowedOrigin(request)) {
    return jsonResponse(response, 403, { error: 'Request origin is not allowed.' });
  }

  const contentType = request.headers['content-type'] || '';

  if (!contentType.toLowerCase().startsWith('application/json')) {
    return jsonResponse(response, 415, { error: 'Content-Type must be application/json.' });
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch (error) {
    return jsonResponse(response, error.statusCode || 400, { error: 'Invalid request body.' });
  }

  const validation = validateLeadPayload(body);

  if (validation.spam) {
    return jsonResponse(response, 200, { ok: true });
  }

  if (!validation.ok) {
    return jsonResponse(response, 400, {
      error: 'Validation failed.',
      errors: validation.errors,
    });
  }

  const blobAuthOptions = getLeadBlobAuthOptions(request);

  if (!blobAuthOptions) {
    return jsonResponse(response, 503, { error: 'Lead storage is not configured.' });
  }

  const record = createLeadRecord({
    lead: validation.lead,
    source_page: body.source_page,
  });

  try {
    await put(leadPathname(record), JSON.stringify(record, null, 2), {
      ...blobAuthOptions,
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
    });

    return jsonResponse(response, 201, {
      ok: true,
      id: record.id,
    });
  } catch (error) {
    console.error('Failed to store GIE lead submission:', error);
    return jsonResponse(response, 500, { error: 'Unable to store lead submission.' });
  }
};
