const { get, list } = require('@vercel/blob');
const {
  LEAD_BLOB_PREFIX,
  csvHeader,
  getLeadBlobAuthOptions,
  isAuthorizedExport,
  jsonResponse,
  loadLocalEnv,
  recordToCsvRow,
} = require('../lib/gie-leads');

loadLocalEnv();

async function streamToText(stream) {
  return new Response(stream).text();
}

async function listAllLeadBlobs(blobAuthOptions) {
  const blobs = [];
  let cursor;

  do {
    const page = await list({
      ...blobAuthOptions,
      cursor,
      limit: 1000,
      prefix: LEAD_BLOB_PREFIX,
    });

    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
}

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return jsonResponse(response, 405, { error: 'Method Not Allowed' });
  }

  if (!process.env.LEADS_EXPORT_TOKEN) {
    return jsonResponse(response, 503, { error: 'Lead export is not configured.' });
  }

  if (!isAuthorizedExport(request)) {
    return jsonResponse(response, 401, { error: 'Unauthorized.' });
  }

  const blobAuthOptions = getLeadBlobAuthOptions(request);

  if (!blobAuthOptions) {
    return jsonResponse(response, 503, { error: 'Lead storage is not configured.' });
  }

  try {
    const blobs = await listAllLeadBlobs(blobAuthOptions);
    const rows = [csvHeader()];

    for (const blob of blobs) {
      const result = await get(blob.pathname, {
        ...blobAuthOptions,
        access: 'private',
        useCache: false,
      });

      if (!result || result.statusCode !== 200) {
        throw new Error(`Unable to read ${blob.pathname}`);
      }

      rows.push(recordToCsvRow(JSON.parse(await streamToText(result.stream))));
    }

    const today = new Date().toISOString().slice(0, 10);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="gie-leads-${today}.csv"`);
    response.end(`${rows.join('\n')}\n`);
  } catch (error) {
    console.error('Failed to export GIE lead submissions:', error);
    jsonResponse(response, 500, { error: 'Unable to export lead submissions.' });
  }
};
